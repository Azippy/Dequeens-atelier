import express from "express";
import { getMe, getAdminDashboard } from "../controllers/user.controller.js";
import protect from "../middleware/auth.middleware.js";
import authorize from "../middleware/authorize.middleware.js";

const router = express.Router();

router.get("/me", protect, getMe);
router.get("/admin-dashboard", protect, authorize("admin"), getAdminDashboard);

export default router;
