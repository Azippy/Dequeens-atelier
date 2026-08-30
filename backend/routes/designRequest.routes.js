import express from "express";

import {
  createDesignRequest,
  getMyDesignRequests,
  getMyDesignRequest,
  approveDesignQuote,
  getAllDesignRequests,
  updateDesignRequest,
} from "../controllers/designRequest.controller.js";
import { uploadDesignImages } from "../middleware/upload.middleware.js";

import protect from "../middleware/auth.middleware.js";

import authorize from "../middleware/authorize.middleware.js";

const router = express.Router();

/// CUSTOMER

router.post("/", protect, uploadDesignImages, createDesignRequest);

router.get("/my-requests", protect, getMyDesignRequests);

router.get("/my-requests/:id", protect, getMyDesignRequest);

router.patch("/my-requests/:id/approve", protect, approveDesignQuote);

// ADMIN
router.get("/", protect, authorize("admin"), getAllDesignRequests);

router.patch("/:id", protect, authorize("admin"), updateDesignRequest);

export default router;
