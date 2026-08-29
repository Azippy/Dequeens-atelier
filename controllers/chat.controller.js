import Conversation from "../models/conversation.model.js";

import Message from "../models/message.model.js";

import AppError from "../utils/appError.js";

export const createConversation = async (req, res, next) => {
  try {
    const { type = "general", order, designRequest } = req.body;

    const allowedTypes = ["general", "order", "bespoke"];

    if (!allowedTypes.includes(type)) {
      throw new AppError("Invalid conversation type", 400);
    }

    // ========================================
    // GENERAL CHAT
    // ========================================

    if (type === "general") {
      const existingConversation = await Conversation.findOne({
        customer: req.user._id,
        type: "general",
        status: "open",
      });

      if (existingConversation) {
        return res.status(200).json({
          status: "success",
          message: "Existing conversation found",
          conversation: existingConversation,
        });
      }
    }

    // ========================================
    // ORDER CHAT
    // ========================================

    if (type === "order") {
      if (!order) {
        throw new AppError("Order ID is required", 400);
      }

      const existingConversation = await Conversation.findOne({
        customer: req.user._id,
        type: "order",
        order,
        status: "open",
      });

      if (existingConversation) {
        return res.status(200).json({
          status: "success",
          message: "Existing conversation found",
          conversation: existingConversation,
        });
      }
    }

    // ========================================
    // BESPOKE CHAT
    // ========================================

    if (type === "bespoke") {
      if (!designRequest) {
        throw new AppError("Design request ID is required", 400);
      }

      const existingConversation = await Conversation.findOne({
        customer: req.user._id,
        type: "bespoke",
        designRequest,
        status: "open",
      });

      if (existingConversation) {
        return res.status(200).json({
          status: "success",
          message: "Existing conversation found",
          conversation: existingConversation,
        });
      }
    }

    // ========================================
    // CREATE
    // ========================================

    const conversation = await Conversation.create({
      customer: req.user._id,

      type,

      order: type === "order" ? order : null,

      designRequest: type === "bespoke" ? designRequest : null,
    });

    res.status(201).json({
      status: "success",

      message: "Conversation created successfully",

      conversation,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({
      customer: req.user._id,
    })
      .populate("assignedAdmin", "name email")
      .sort("-lastMessageAt");

    res.status(200).json({
      status: "success",

      results: conversations.length,

      conversations,
    });
  } catch (error) {
    next(error);
  }
};

export const getConversationMessages = async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      throw new AppError("Conversation not found", 404);
    }

    const isCustomer =
      conversation.customer.toString() === req.user._id.toString();

    const isAdmin = req.user.role === "admin";

    if (!isCustomer && !isAdmin) {
      throw new AppError(
        "You are not authorized to access this conversation",
        403,
      );
    }

    const messages = await Message.find({
      conversation: conversation._id,
    })
      .populate("sender", "name role")
      .sort("createdAt");

    res.status(200).json({
      status: "success",

      results: messages.length,

      messages,
    });
  } catch (error) {
    next(error);
  }
};

//admin get all conversation

export const getAllConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find()
      .populate("customer", "name email phone")
      .populate("assignedAdmin", "name email")
      .sort("-lastMessageAt");

    res.status(200).json({
      status: "success",

      results: conversations.length,

      conversations,
    });
  } catch (error) {
    next(error);
  }
};
