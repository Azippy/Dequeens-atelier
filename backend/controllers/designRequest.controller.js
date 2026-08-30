import DesignRequest from "../models/designRequest.model.js";

import Conversation from "../models/conversation.model.js";

import cloudinary from "../config/cloudinary.js";

import AppError from "../utils/appError.js";

import generateRequestNumber from "../utils/generateRequestNumber.js";

import uploadToCloudinary from "../utils/uploadToCloudinary.js";

import sendEmail from "../services/email.service.js";

import { bespokeRequestEmail } from "../utils/emailTemplates.js";

// ============================================================
// CREATE BESPOKE DESIGN REQUEST
// ============================================================

export const createDesignRequest = async (req, res, next) => {
  const uploadedImages = [];

  try {
    const {
      customerName,
      phone,
      email,
      designType,
      gender,
      occasion,
      eventDate,
      preferredColor,
      preferredFabric,
      budget,
      description,
      measurements,
    } = req.body;

    // ----------------------------------------------------------
    // Validate required fields
    // ----------------------------------------------------------

    if (
      !customerName ||
      !phone ||
      !email ||
      !designType ||
      !gender ||
      !description
    ) {
      throw new AppError("Please provide all required fields", 400);
    }

    // ----------------------------------------------------------
    // Upload reference images to Cloudinary
    // ----------------------------------------------------------

    if (req.files?.length) {
      for (const file of req.files) {
        const result = await uploadToCloudinary(
          file.buffer,
          "dequeens/bespoke",
        );

        uploadedImages.push({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    }

    // ----------------------------------------------------------
    // Create design request
    // ----------------------------------------------------------

    const designRequest = await DesignRequest.create({
      requestNumber: generateRequestNumber(),

      user: req.user._id,

      customerName,

      phone,

      email,

      designType,

      gender,

      occasion,

      eventDate,

      preferredColor,

      preferredFabric,

      budget,

      description,

      measurements,

      referenceImages: uploadedImages,

      status: "pending",
    });

    // ----------------------------------------------------------
    // Send confirmation email
    // ----------------------------------------------------------

    try {
      await sendEmail({
        to: designRequest.email,

        subject: "DeQueens Atelier — Bespoke Request Received",

        html: bespokeRequestEmail({
          name: designRequest.customerName,

          requestNumber: designRequest.requestNumber,
        }),
      });
    } catch (emailError) {
      console.error("Bespoke email failed:", emailError.message);
    }

    // ----------------------------------------------------------
    // Create or find bespoke conversation
    // ----------------------------------------------------------

    let conversation = await Conversation.findOne({
      customer: req.user._id,

      type: "bespoke",

      designRequest: designRequest._id,
    });

    if (!conversation) {
      conversation = await Conversation.create({
        customer: req.user._id,

        type: "bespoke",

        designRequest: designRequest._id,

        lastMessage: "Bespoke design request submitted",

        lastMessageAt: new Date(),
      });
    } else {
      conversation.lastMessage = "Bespoke design request submitted";

      conversation.lastMessageAt = new Date();

      await conversation.save();
    }

    // ----------------------------------------------------------
    // Response
    // ----------------------------------------------------------

    res.status(201).json({
      status: "success",

      message: "Custom design request submitted successfully",

      designRequest,

      conversation,
    });
  } catch (error) {
    // ----------------------------------------------------------
    // Clean up Cloudinary images if request fails
    // ----------------------------------------------------------

    for (const image of uploadedImages) {
      try {
        await cloudinary.uploader.destroy(image.publicId);
      } catch (cleanupError) {
        console.error("Cloudinary cleanup failed:", cleanupError.message);
      }
    }

    next(error);
  }
};

// ============================================================
// GET MY BESPOKE DESIGN REQUESTS
// ============================================================

export const getMyDesignRequests = async (req, res, next) => {
  try {
    const requests = await DesignRequest.find({
      user: req.user._id,
    }).sort("-createdAt");

    res.status(200).json({
      status: "success",

      results: requests.length,

      requests,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET ONE BESPOKE DESIGN REQUEST
// ============================================================

export const getMyDesignRequest = async (req, res, next) => {
  try {
    const request = await DesignRequest.findOne({
      _id: req.params.id,

      user: req.user._id,
    });

    if (!request) {
      throw new AppError("Design request not found", 404);
    }

    res.status(200).json({
      status: "success",

      request,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// ADMIN - GET ALL BESPOKE DESIGN REQUESTS
// ============================================================

export const getAllDesignRequests = async (req, res, next) => {
  try {
    const requests = await DesignRequest.find()
      .populate("user", "name email phone")
      .sort("-createdAt");

    res.status(200).json({
      status: "success",

      results: requests.length,

      requests,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// ADMIN - UPDATE / REVIEW BESPOKE REQUEST
// ============================================================

export const updateDesignRequest = async (req, res, next) => {
  try {
    const { status, quotedAmount, adminNote } = req.body;

    // ----------------------------------------------------------
    // Allowed statuses
    // ----------------------------------------------------------

    const allowedStatuses = [
      "pending",
      "reviewing",
      "quoted",
      "approved",
      "in-production",
      "completed",
      "cancelled",
      "rejected",
    ];

    // ----------------------------------------------------------
    // Validate status
    // ----------------------------------------------------------

    if (status && !allowedStatuses.includes(status)) {
      throw new AppError("Invalid design request status", 400);
    }

    // ----------------------------------------------------------
    // Build updates
    // ----------------------------------------------------------

    const updates = {};

    if (status) {
      updates.status = status;
    }

    if (quotedAmount !== undefined) {
      updates.quotedAmount = quotedAmount;
    }

    if (adminNote !== undefined) {
      updates.adminNote = adminNote;
    }

    // ----------------------------------------------------------
    // Update request
    // ----------------------------------------------------------

    const request = await DesignRequest.findByIdAndUpdate(
      req.params.id,

      updates,

      {
        new: true,

        runValidators: true,
      },
    );

    if (!request) {
      throw new AppError("Design request not found", 404);
    }

    // ----------------------------------------------------------
    // Response
    // ----------------------------------------------------------

    res.status(200).json({
      status: "success",

      message: "Design request updated successfully",

      request,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// CUSTOMER - APPROVE BESPOKE QUOTE
// ============================================================

export const approveDesignQuote = async (req, res, next) => {
  try {
    const request = await DesignRequest.findOne({
      _id: req.params.id,

      user: req.user._id,
    });

    if (!request) {
      throw new AppError("Design request not found", 404);
    }

    // ----------------------------------------------------------
    // Make sure request has an active quote
    // ----------------------------------------------------------

    if (request.status !== "quoted") {
      throw new AppError(
        "This design request does not have an active quote",
        400,
      );
    }

    // ----------------------------------------------------------
    // Make sure quote amount exists
    // ----------------------------------------------------------

    if (request.quotedAmount === undefined || request.quotedAmount === null) {
      throw new AppError("No quote has been provided", 400);
    }

    // ----------------------------------------------------------
    // Approve quote
    // ----------------------------------------------------------

    request.status = "approved";

    request.quoteApprovedAt = new Date();

    await request.save();

    // ----------------------------------------------------------
    // Response
    // ----------------------------------------------------------

    res.status(200).json({
      status: "success",

      message: "Design quote approved successfully",

      request,
    });
  } catch (error) {
    next(error);
  }
};
