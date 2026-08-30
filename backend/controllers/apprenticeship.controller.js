import ApprenticeshipApplication from "../models/apprenticeshipApplication.model.js";

import AppError from "../utils/appError.js";

import generateApplicationNumber from "../utils/generateApplicationNumber.js";

import uploadToCloudinary from "../utils/uploadToCloudinary.js";

import cloudinary from "../config/cloudinary.js";

import sendEmail from "../services/email.service.js";

import {
  apprenticeshipReceivedEmail,
  apprenticeshipDecisionEmail,
} from "../utils/emailTemplates.js";
import createAuditLog from "../utils/createAuditlog.js";

// ============================================================
// APPLY FOR APPRENTICESHIP
// ============================================================

export const applyForApprenticeship = async (req, res, next) => {
  const uploadedImages = [];

  try {
    const {
      fullName,
      phone,
      email,
      location,
      trainingArea,
      experienceLevel,
      previousExperience,
      reasonForApplying,
      availability,
      preferredStartDate,
    } = req.body;

    // ----------------------------------------------------------
    // Validate required fields
    // ----------------------------------------------------------

    if (
      !fullName ||
      !phone ||
      !email ||
      !location ||
      !trainingArea ||
      !experienceLevel ||
      !reasonForApplying ||
      !availability
    ) {
      throw new AppError("Please provide all required fields", 400);
    }

    // ----------------------------------------------------------
    // Prevent duplicate active applications
    // ----------------------------------------------------------

    const existingApplication = await ApprenticeshipApplication.findOne({
      user: req.user._id,

      status: {
        $in: ["pending", "reviewing", "accepted"],
      },
    });

    if (existingApplication) {
      throw new AppError(
        "You already have an active apprenticeship application",
        400,
      );
    }

    // ----------------------------------------------------------
    // Upload portfolio images to Cloudinary
    // ----------------------------------------------------------

    if (req.files?.length) {
      for (const file of req.files) {
        const result = await uploadToCloudinary(
          file.buffer,
          "dequeens/apprenticeship",
        );

        uploadedImages.push({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    }

    // ----------------------------------------------------------
    // Create apprenticeship application
    // ----------------------------------------------------------

    const application = await ApprenticeshipApplication.create({
      applicationNumber: generateApplicationNumber(),

      user: req.user._id,

      fullName,

      phone,

      email,

      location,

      trainingArea,

      experienceLevel,

      previousExperience,

      reasonForApplying,

      availability,

      preferredStartDate,

      portfolioImages: uploadedImages,

      status: "pending",
    });

    // ----------------------------------------------------------
    // Send confirmation email
    // ----------------------------------------------------------

    try {
      await sendEmail({
        to: application.email,

        subject: "DeQueens Atelier — Apprenticeship Application Received",

        html: apprenticeshipReceivedEmail({
          name: application.fullName,

          applicationNumber: application.applicationNumber,
        }),
      });
    } catch (emailError) {
      console.error("Apprenticeship email failed:", emailError.message);
    }

    // ----------------------------------------------------------
    // Response
    // ----------------------------------------------------------

    res.status(201).json({
      status: "success",

      message: "Apprenticeship application submitted successfully",

      application,
    });
  } catch (error) {
    // ----------------------------------------------------------
    // Clean up Cloudinary images if something fails
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
// GET MY APPRENTICESHIP APPLICATION
// ============================================================

export const getMyApprenticeshipApplication = async (req, res, next) => {
  try {
    const application = await ApprenticeshipApplication.findOne({
      user: req.user._id,
    }).sort("-createdAt");

    if (!application) {
      throw new AppError("No apprenticeship application found", 404);
    }

    res.status(200).json({
      status: "success",

      application,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// ADMIN - GET ALL APPRENTICESHIP APPLICATIONS
// ============================================================

export const getAllApprenticeshipApplications = async (req, res, next) => {
  try {
    const applications = await ApprenticeshipApplication.find()
      .populate("user", "name email phone")
      .sort("-createdAt");

    res.status(200).json({
      status: "success",

      results: applications.length,

      applications,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// ADMIN - GET ONE APPRENTICESHIP APPLICATION
// ============================================================

export const getApprenticeshipApplication = async (req, res, next) => {
  try {
    const application = await ApprenticeshipApplication.findById(
      req.params.id,
    ).populate("user", "name email phone");

    if (!application) {
      throw new AppError("Application not found", 404);
    }

    res.status(200).json({
      status: "success",

      application,
    });
  } catch (error) {
    next(error);
  }
};

// // ============================================================
// ADMIN - UPDATE / REVIEW APPLICATION
// ============================================================

export const updateApprenticeshipApplication = async (req, res, next) => {
  try {
    const { status, adminNote } = req.body;

    // ----------------------------------------------------------
    // Allowed application statuses
    // ----------------------------------------------------------

    const allowedStatuses = [
      "pending",
      "reviewing",
      "accepted",
      "rejected",
      "withdrawn",
    ];

    // ----------------------------------------------------------
    // Validate status
    // ----------------------------------------------------------

    if (status && !allowedStatuses.includes(status)) {
      throw new AppError("Invalid application status", 400);
    }

    // ----------------------------------------------------------
    // Build update object
    // ----------------------------------------------------------

    const updates = {};

    if (status) {
      updates.status = status;
    }

    if (adminNote !== undefined) {
      updates.adminNote = adminNote;
    }

    // ----------------------------------------------------------
    // Set reviewedAt when application is accepted/rejected
    // ----------------------------------------------------------

    if (status === "accepted" || status === "rejected") {
      updates.reviewedAt = new Date();
    }

    // ----------------------------------------------------------
    // Update application
    // ----------------------------------------------------------

    const application = await ApprenticeshipApplication.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!application) {
      throw new AppError("Application not found", 404);
    }

    // ----------------------------------------------------------
    // Send decision email
    // ----------------------------------------------------------

    if (status === "accepted" || status === "rejected") {
      try {
        await sendEmail({
          to: application.email,

          subject: "DeQueens Atelier — Apprenticeship Application Update",

          html: apprenticeshipDecisionEmail({
            name: application.fullName,

            status: application.status,

            adminNote: application.adminNote,
          }),
        });
      } catch (emailError) {
        console.error(
          "Apprenticeship decision email failed:",
          emailError.message,
        );
      }
    }

    // ----------------------------------------------------------
    // CREATE AUDIT LOG
    // ----------------------------------------------------------

    await createAuditLog({
      admin: req.user._id,

      action: "UPDATE",

      resource: "ApprenticeshipApplication",

      resourceId: application._id,

      description: `Updated apprenticeship application ${application.applicationNumber}`,

      metadata: {
        status: application.status,
        adminNote: application.adminNote,
      },

      req,
    });

    // ----------------------------------------------------------
    // Response
    // ----------------------------------------------------------

    res.status(200).json({
      status: "success",

      message: "Apprenticeship application updated successfully",

      application,
    });
  } catch (error) {
    next(error);
  }
};
