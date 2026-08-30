import mongoose from "mongoose";

const shippingRateSchema = new mongoose.Schema(
  {
    country: {
      type: String,
      required: true,
      trim: true,
    },

    state: {
      type: String,
      trim: true,
    },

    fee: {
      type: Number,
      required: true,
      min: 0,
    },

    estimatedDays: {
      type: String,
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const ShippingRate = mongoose.model("ShippingRate", shippingRateSchema);

export default ShippingRate;
