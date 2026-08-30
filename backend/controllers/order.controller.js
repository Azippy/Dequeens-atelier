import Cart from "../models/cart.js";
import Order from "../models/order.js";
import Product from "../models/product.model.js";

import AppError from "../utils/appError.js";
import generateOrderNumber from "../utils/generateOrderNumber.js";

export const createOrder = async (req, res, next) => {
  try {
    const { shippingAddress, notes } = req.body;

    if (
      !shippingAddress ||
      !shippingAddress.fullName ||
      !shippingAddress.phone ||
      !shippingAddress.address ||
      !shippingAddress.city ||
      !shippingAddress.state
    ) {
      throw new AppError("Complete shipping address is required", 400);
    }

    const cart = await Cart.findOne({
      user: req.user._id,
    }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      throw new AppError("Your cart is empty", 400);
    }

    const orderItems = [];
    let subtotal = 0;

    for (const item of cart.items) {
      const product = item.product;

      if (!product || !product.isActive) {
        throw new AppError(
          "One of the products in your cart is no longer available",
          400,
        );
      }

      if (!product.isReadyToWear) {
        throw new AppError(
          `${product.name} is not available for direct purchase`,
          400,
        );
      }

      const updatedProduct = await Product.findOneAndUpdate(
        {
          _id: product._id,
          isActive: true,
          isReadyToWear: true,

          $expr: {
            $gte: [
              {
                $subtract: ["$stock", "$reservedStock"],
              },
              item.quantity,
            ],
          },
        },
        {
          $inc: {
            reservedStock: item.quantity,
          },
        },
        {
          new: true,
        },
      );

      if (!updatedProduct) {
        throw new AppError(
          `${product.name} does not have enough available stock`,
          400,
        );
      }

      const itemTotal = product.price * item.quantity;

      subtotal += itemTotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        image: product.images?.[0]?.url || null,
      });
    }

    // Temporary shipping fee.
    const shippingFee = 0;

    const totalAmount = subtotal + shippingFee;

    const order = await Order.create({
      orderNumber: generateOrderNumber(),

      user: req.user._id,

      items: orderItems,

      shippingAddress,

      subtotal,

      shippingFee,

      totalAmount,

      paymentStatus: "pending",

      orderStatus: "pending",

      notes,
    });

    // Clear cart after creating order
    cart.items = [];

    await cart.save();

    res.status(201).json({
      status: "success",
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({
      user: req.user._id,
    })
      .sort("-createdAt")
      .populate("items.product", "name slug");

    res.status(200).json({
      status: "success",
      results: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await Order.findOne({
      _id: id,
      user: req.user._id,
    }).populate("items.product", "name slug");

    if (!order) {
      throw new AppError("Order not found", 404);
    }

    res.status(200).json({
      status: "success",
      order,
    });
  } catch (error) {
    next(error);
  }
};

//Admin get order
export const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .sort("-createdAt")
      .populate("user", "name email phone");

    res.status(200).json({
      status: "success",
      results: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { orderStatus, paymentStatus } = req.body;

    const allowedOrderStatuses = [
      "pending",
      "confirmed",
      "processing",
      "ready",
      "shipped",
      "delivered",
      "cancelled",
    ];

    const allowedPaymentStatuses = ["pending", "paid", "failed", "refunded"];

    if (orderStatus && !allowedOrderStatuses.includes(orderStatus)) {
      throw new AppError("Invalid order status", 400);
    }

    if (paymentStatus && !allowedPaymentStatuses.includes(paymentStatus)) {
      throw new AppError("Invalid payment status", 400);
    }

    const updates = {};

    if (orderStatus) {
      updates.orderStatus = orderStatus;
    }

    if (paymentStatus) {
      updates.paymentStatus = paymentStatus;
    }

    const order = await Order.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!order) {
      throw new AppError("Order not found", 404);
    }

    res.status(200).json({
      status: "success",
      message: "Order updated successfully",
      order,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelMyOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await Order.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!order) {
      throw new AppError("Order not found", 404);
    }

    if (!["pending", "confirmed"].includes(order.orderStatus)) {
      throw new AppError("This order can no longer be cancelled", 400);
    }

    if (order.stockReserved && order.paymentStatus === "pending") {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: {
            reservedStock: -item.quantity,
          },
        });
      }

      order.stockReserved = false;
    }

    order.orderStatus = "cancelled";

    await order.save();

    res.status(200).json({
      status: "success",
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    next(error);
  }
};
