import express from "express";

import {
  initializePayment,
  verifyPayment,
} from "../controllers/payment.controller.js";

import protect from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/initialize", protect, initializePayment);

router.get("/verify/:reference", protect, verifyPayment);

export default router;
