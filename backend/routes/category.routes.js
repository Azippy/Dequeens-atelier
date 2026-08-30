import express from "express";

import {
  createCategory,
  getCategories,
} from "../controllers/category.contoller.js";

import protect from "../middleware/auth.middleware.js";
import authorize from "../middleware/authorize.middleware.js";

const router = express.Router();

router.get("/", getCategories);

router.post("/", protect, authorize("admin"), createCategory);

export default router;
