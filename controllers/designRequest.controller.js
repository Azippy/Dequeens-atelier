import DesignRequest from "../models/designRequest.model.js";
import cloudinary from "../config/cloudinary.js";
import AppError from "../utils/appError.js";
import Conversation from "../models/conversation.model.js";
import generateRequestNumber from "../utils/generateRequestNumber.js";
import uploadToCloudinary from "../utils/uploadToCloudinary.js";

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
      });
    }

    await Conversation.create({
      customer: req.user._id,

      type: "bespoke",

      designRequest: designRequest._id,

      lastMessage: "Bespoke design request submitted",

      lastMessageAt: new Date(),
    });
    res.status(201).json({
      status: "success",

      message: "Custom design request submitted successfully",

      designRequest,
    });
  } catch (error) {
    // Remove images that were uploaded
    // before the request failed.

    for (const image of uploadedImages) {
      try {
        await cloudinary.uploader.destroy(image.publicId);
      } catch (cleanupError) {
        console.error("Cloudinary cleanup failed:", cleanupError);
      }
    }

    next(error);
  }
};

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

//admin

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

//admin review/qoute request

export const updateDesignRequest = async (req, res, next) => {
  try {
    const { status, quotedAmount, adminNote } = req.body;

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

    if (status && !allowedStatuses.includes(status)) {
      throw new AppError("Invalid design request status", 400);
    }

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

    res.status(200).json({
      status: "success",

      message: "Design request updated successfully",

      request,
    });
  } catch (error) {
    next(error);
  }
};

export const approveDesignQuote = async (req, res, next) => {
  try {
    const request = await DesignRequest.findOne({
      _id: req.params.id,

      user: req.user._id,
    });

    if (!request) {
      throw new AppError("Design request not found", 404);
    }

    if (request.status !== "quoted") {
      throw new AppError(
        "This design request does not have an active quote",
        400,
      );
    }

    if (request.quotedAmount === undefined || request.quotedAmount === null) {
      throw new AppError("No quote has been provided", 400);
    }

    request.status = "approved";

    request.quoteApprovedAt = new Date();

    await request.save();

    res.status(200).json({
      status: "success",

      message: "Design quote approved successfully",

      request,
    });
  } catch (error) {
    next(error);
  }
};
