import User from "../models/user.model.js";
import Product from "../models/product.model.js";
import Order from "../models/order.js";
import DesignRequest from "../models/designRequest.model.js";
import ApprenticeshipApplication from "../models/apprenticeshipApplication.model.js";

import AppError from "../utils/appError.js";
import AuditLog from "../models/auditlog.model.js";

export const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      pendingOrders,
      totalDesignRequests,
      pendingDesignRequests,
      totalApplications,
      pendingApplications,
    ] = await Promise.all([
      User.countDocuments(),

      Product.countDocuments(),

      Order.countDocuments(),

      Order.countDocuments({
        orderStatus: "pending",
      }),

      DesignRequest.countDocuments(),

      DesignRequest.countDocuments({
        status: {
          $in: ["pending", "reviewing"],
        },
      }),

      ApprenticeshipApplication.countDocuments(),

      ApprenticeshipApplication.countDocuments({
        status: {
          $in: ["pending", "reviewing"],
        },
      }),
    ]);

    const revenueResult = await Order.aggregate([
      {
        $match: {
          paymentStatus: "paid",
        },
      },

      {
        $group: {
          _id: null,

          totalRevenue: {
            $sum: "$totalAmount",
          },
        },
      },
    ]);

    const totalRevenue = revenueResult[0]?.totalRevenue || 0;

    res.status(200).json({
      status: "success",

      dashboard: {
        totalUsers,

        totalProducts,

        totalOrders,

        pendingOrders,

        totalDesignRequests,

        pendingDesignRequests,

        totalApplications,

        pendingApplications,

        totalRevenue,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getRecentOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort("-createdAt")
      .limit(10);

    res.status(200).json({
      status: "success",

      results: orders.length,

      orders,
    });
  } catch (error) {
    next(error);
  }
};

export const getRecentCustomers = async (req, res, next) => {
  try {
    const customers = await User.find()
      .select("name email phone role createdAt")
      .sort("-createdAt")
      .limit(10);

    res.status(200).json({
      status: "success",

      results: customers.length,

      customers,
    });
  } catch (error) {
    next(error);
  }
};

export const getLowStockProducts = async (req, res, next) => {
  try {
    const products = await Product.find({
      stock: {
        $lte: 5,
      },
    })
      .sort("stock")
      .limit(20);

    res.status(200).json({
      status: "success",

      results: products.length,

      products,
    });
  } catch (error) {
    next(error);
  }
};

export const getAuditLogs = async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);

    const limit = Math.min(Number(req.query.limit) || 20, 100);

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      AuditLog.find()
        .populate("admin", "name email")
        .sort("-createdAt")
        .skip(skip)
        .limit(limit),

      AuditLog.countDocuments(),
    ]);

    res.status(200).json({
      status: "success",

      results: logs.length,

      pagination: {
        page,

        limit,

        total,

        pages: Math.ceil(total / limit),
      },

      logs,
    });
  } catch (error) {
    next(error);
  }
};
