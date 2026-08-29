import ApprenticeshipApplication from "../models/apprenticeshipApplication.model.js";

import AppError from "../utils/appError.js";

import generateApplicationNumber from "../utils/generateApplicationNumber.js";

import uploadToCloudinary from "../utils/uploadToCloudinary.js";

import cloudinary from "../config/cloudinary.js";

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

    // Prevent duplicate active applications
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

    res.status(201).json({
      status: "success",

      message: "Apprenticeship application submitted successfully",

      application,
    });
  } catch (error) {
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

//admin get all application

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

//admin get on application

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

// admin review application

export const updateApprenticeshipApplication = async (req, res, next) => {
  try {
    const { status, adminNote } = req.body;

    const allowedStatuses = [
      "pending",
      "reviewing",
      "accepted",
      "rejected",
      "withdrawn",
    ];

    if (status && !allowedStatuses.includes(status)) {
      throw new AppError("Invalid application status", 400);
    }

    const updates = {};

    if (status) {
      updates.status = status;
    }

    if (adminNote !== undefined) {
      updates.adminNote = adminNote;
    }

    if (["accepted", "rejected"].includes(status)) {
      updates.reviewedAt = new Date();
    }

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

    res.status(200).json({
      status: "success",

      message: "Apprenticeship application updated successfully",

      application,
    });
  } catch (error) {
    next(error);
  }
};
