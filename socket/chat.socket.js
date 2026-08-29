import jwt from "jsonwebtoken";

import User from "../models/user.model.js";

import Conversation from "../models/conversation.model.js";

import Message from "../models/message.model.js";

const initializeChatSocket = (io) => {
  // ==========================================
  // SOCKET AUTHENTICATION
  // ==========================================

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error("Authentication required"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id).select(
        "_id name email role",
      );

      if (!user) {
        return next(new Error("User no longer exists"));
      }

      socket.user = user;

      next();
    } catch (error) {
      next(new Error("Invalid or expired token"));
    }
  });

  // ==========================================
  // CONNECTION
  // ==========================================

  io.on("connection", (socket) => {
    console.log(`Chat connected: ${socket.user._id}`);

    // ========================================
    // JOIN CONVERSATION
    // ========================================

    socket.on("joinConversation", async (conversationId) => {
      try {
        const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
          return socket.emit("chatError", {
            message: "Conversation not found",
          });
        }

        const isCustomer =
          conversation.customer.toString() === socket.user._id.toString();

        const isAdmin = socket.user.role === "admin";

        if (!isCustomer && !isAdmin) {
          return socket.emit("chatError", {
            message: "You are not authorized to join this conversation",
          });
        }

        socket.join(`conversation:${conversationId}`);

        socket.emit("conversationJoined", {
          conversationId,
        });
      } catch (error) {
        console.error("Join conversation error:", error);

        socket.emit("chatError", {
          message: "Unable to join conversation",
        });
      }
    });

    // ========================================
    // SEND MESSAGE
    // ========================================

    socket.on("sendMessage", async ({ conversationId, message }) => {
      try {
        if (!message || !message.trim()) {
          return socket.emit("chatError", {
            message: "Message cannot be empty",
          });
        }

        const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
          return socket.emit("chatError", {
            message: "Conversation not found",
          });
        }

        const isCustomer =
          conversation.customer.toString() === socket.user._id.toString();

        const isAdmin = socket.user.role === "admin";

        if (!isCustomer && !isAdmin) {
          return socket.emit("chatError", {
            message: "You are not authorized to send messages here",
          });
        }

        if (conversation.status === "closed") {
          return socket.emit("chatError", {
            message: "This conversation is closed",
          });
        }

        const senderRole = isAdmin ? "admin" : "customer";

        const newMessage = await Message.create({
          conversation: conversationId,

          sender: socket.user._id,

          senderRole,

          message: message.trim(),
        });

        conversation.lastMessage = message.trim();

        conversation.lastMessageAt = new Date();

        await conversation.save();

        const populatedMessage = await newMessage.populate(
          "sender",
          "name role",
        );

        io.to(`conversation:${conversationId}`).emit(
          "newMessage",
          populatedMessage,
        );
      } catch (error) {
        console.error("Send message error:", error);

        socket.emit("chatError", {
          message: "Message could not be sent",
        });
      }
    });

    // ========================================
    // DISCONNECT
    // ========================================

    socket.on("disconnect", () => {
      console.log(`Chat disconnected: ${socket.user._id}`);
    });
  });
};

export default initializeChatSocket;
