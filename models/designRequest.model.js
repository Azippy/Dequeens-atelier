import mongoose from "mongoose";

const designRequestSchema = new mongoose.Schema(
  {
    requestNumber: {
      type: String,
      unique: true,
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    customerName: {
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

    designType: {
      type: String,
      required: true,
      enum: [
        "wedding-gown",
        "traditional",
        "english-dress",
        "suit",
        "native-wear",
        "couple-outfit",
        "kids-wear",
        "other",
      ],
    },

    gender: {
      type: String,
      required: true,
      enum: ["male", "female", "unisex", "kids"],
    },

    occasion: {
      type: String,
      trim: true,
    },

    eventDate: {
      type: Date,
    },

    preferredColor: {
      type: String,
      trim: true,
    },

    preferredFabric: {
      type: String,
      trim: true,
    },

    budget: {
      type: Number,
      min: 0,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

    measurements: {
      height: Number,
      chest: Number,
      waist: Number,
      hip: Number,
      shoulder: Number,
      sleeve: Number,
      trouserLength: Number,
      dressLength: Number,
      neck: Number,
    },

    referenceImages: [
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
      enum: [
        "pending",
        "reviewing",
        "quoted",
        "approved",
        "in-production",
        "completed",
        "cancelled",
        "rejected",
      ],
      default: "pending",
    },

    quotedAmount: {
      type: Number,
      min: 0,
    },

    adminNote: {
      type: String,
      trim: true,
      maxlength: 2000,
    },

    customerNote: {
      type: String,
      trim: true,
      maxlength: 2000,
    },

    quoteApprovedAt: {
      type: Date,
    },

    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

const DesignRequest = mongoose.model("DesignRequest", designRequestSchema);

export default DesignRequest;
