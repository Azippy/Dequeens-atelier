import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    assignedAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    type: {
      type: String,
      enum: ["general", "order", "bespoke"],
      default: "general",
    },

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },

    designRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DesignRequest",
      default: null,
    },

    lastMessage: {
      type: String,
      default: "",
    },

    lastMessageAt: {
      type: Date,
      default: Date.now,
    },

    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },
  },
  {
    timestamps: true,
  },
);

conversationSchema.index(
  {
    customer: 1,
    type: 1,
    status: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      type: "general",
      status: "open",
    },
  },
);

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;
