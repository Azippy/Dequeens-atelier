import express from "express";

import {
  createConversation,
  getMyConversations,
  getConversationMessages,
  getAllConversations,
} from "../controllers/chat.controller.js";

import protect from "../middleware/auth.middleware.js";

import authorize from "../middleware/authorize.middleware.js";

const router = express.Router();

// CUSTOMER

router.post("/conversations", protect, createConversation);

router.get("/conversations/my", protect, getMyConversations);

router.get("/conversations/:id/messages", protect, getConversationMessages);

// ADMIN

router.get("/conversations", protect, authorize("admin"), getAllConversations);

export default router;
