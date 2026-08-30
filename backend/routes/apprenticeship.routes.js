import express from "express";

import {
  applyForApprenticeship,
  getMyApprenticeshipApplication,
  getAllApprenticeshipApplications,
  getApprenticeshipApplication,
  updateApprenticeshipApplication,
} from "../controllers/apprenticeship.controller.js";

import protect from "../middleware/auth.middleware.js";

import authorize from "../middleware/authorize.middleware.js";

import { uploadPortfolioImages } from "../middleware/upload.middleware.js";

const router = express.Router();

// CUSTOMER

router.post("/", protect, uploadPortfolioImages, applyForApprenticeship);

router.get("/my-application", protect, getMyApprenticeshipApplication);

// ADMIN

router.get("/", protect, authorize("admin"), getAllApprenticeshipApplications);

router.get("/:id", protect, authorize("admin"), getApprenticeshipApplication);

router.patch(
  "/:id",
  protect,
  authorize("admin"),
  updateApprenticeshipApplication,
);

export default router;
