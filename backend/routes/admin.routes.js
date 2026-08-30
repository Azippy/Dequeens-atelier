import express from "express";

import {
  getDashboardStats,
  getRecentOrders,
  getRecentCustomers,
  getLowStockProducts,
  getAuditLogs,
} from "../controllers/admin.controller.js";

import protect from "../middleware/auth.middleware.js";

import authorize from "../middleware/authorize.middleware.js";

const router = express.Router();

router.use(protect, authorize("admin"));

router.get("/dashboard", getDashboardStats);

router.get("/recent-orders", getRecentOrders);

router.get("/recent-customers", getRecentCustomers);

router.get("/low-stock", getLowStockProducts);
router.get("/audit-logs", getAuditLogs);

export default router;
