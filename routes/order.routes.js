import express from "express";

import {
  createOrder,
  getMyOrders,
  getMyOrder,
  getAllOrders,
  updateOrderStatus,
  cancelMyOrder,
} from "../controllers/order.controller.js";

import protect from "../middleware/auth.middleware.js";
import authorize from "../middleware/authorize.middleware.js";

const router = express.Router();

// Customer
router.post("/", protect, createOrder);

router.get("/my-orders", protect, getMyOrders);

router.get("/my-orders/:id", protect, getMyOrder);
router.patch("/my-orders/:id/cancel", protect, cancelMyOrder);

// Admin
router.get("/", protect, authorize("admin"), getAllOrders);

router.patch("/:id/status", protect, authorize("admin"), updateOrderStatus);

export default router;
