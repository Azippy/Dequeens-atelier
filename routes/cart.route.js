import express from "express";

import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../controllers/cart.contoller.js";

import protect from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protect, getCart);

router.post("/items", protect, addToCart);

router.patch("/items/:itemId", protect, updateCartItem);

router.delete("/items/:itemId", protect, removeFromCart);

router.delete("/", protect, clearCart);

export default router;
