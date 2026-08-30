import mongoose from "mongoose";

const apprenticeshipApplicationSchema = new mongoose.Schema(
  {
    applicationNumber: {
      type: String,
      unique: true,
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    trainingArea: {
      type: String,
      required: true,
      enum: [
        "fashion-design",
        "tailoring",
        "pattern-making",
        "bridal-wear",
        "traditional-wear",
        "mens-fashion",
        "womens-fashion",
        "kids-fashion",
        "ready-to-wear",
        "other",
      ],
    },

    experienceLevel: {
      type: String,
      required: true,
      enum: ["beginner", "intermediate", "experienced"],
    },

    previousExperience: {
      type: String,
      trim: true,
      maxlength: 2000,
    },

    reasonForApplying: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

    availability: {
      type: String,
      required: true,
      trim: true,
    },

    preferredStartDate: {
      type: Date,
    },

    portfolioImages: [
      {
        url: {
          type: String,
          required: true,
        },

        publicId: {
          type: String,
        },
      },
    ],

    status: {
      type: String,
      enum: ["pending", "reviewing", "accepted", "rejected", "withdrawn"],
      default: "pending",
    },

    adminNote: {
      type: String,
      trim: true,
      maxlength: 2000,
    },

    reviewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

const ApprenticeshipApplication = mongoose.model(
  "ApprenticeshipApplication",
  apprenticeshipApplicationSchema,
);

export default ApprenticeshipApplication;
