import Order from "../models/order.js";
import Product from "../models/product.model.js";
import fulfillPaidOrder from "../services/payment.service.js";
import AppError from "../utils/appError.js";
import paystackRequest from "../utils/paystack.js";

export const initializePayment = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findOne({
      _id: orderId,
      user: req.user._id,
    }).populate("user");

    if (!order) {
      throw new AppError("Order not found", 404);
    }

    if (order.paymentStatus === "paid") {
      throw new AppError("This order has already been paid for", 400);
    }

    if (order.orderStatus === "cancelled") {
      throw new AppError("This order has been cancelled", 400);
    }
    if (order.paymentReference && order.paymentStatus === "pending") {
      return res.status(200).json({
        status: "success",
        message: "Payment has already been initialized",
        payment: {
          reference: order.paymentReference,

          accessCode: order.paymentAccessCode,
        },
      });
    }

    const reference = `DQ-${order._id}-${Date.now()}`;

    const amountInKobo = Math.round(order.totalAmount * 100);

    const payment = await paystackRequest("/transaction/initialize", {
      method: "POST",

      body: JSON.stringify({
        email: order.user.email,

        amount: String(amountInKobo),

        currency: "NGN",

        reference,

        callback_url: process.env.PAYSTACK_CALLBACK_URL,

        metadata: {
          orderId: order._id.toString(),

          orderNumber: order.orderNumber,

          userId: req.user._id.toString(),
        },
      }),
    });

    order.paymentReference = payment.data.reference;

    order.paymentAccessCode = payment.data.access_code;

    await order.save();

    res.status(200).json({
      status: "success",

      message: "Payment initialized successfully",

      payment: {
        authorizationUrl: payment.data.authorization_url,

        accessCode: payment.data.access_code,

        reference: payment.data.reference,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const verifyPayment = async (req, res, next) => {
  try {
    const { reference } = req.params;

    const order = await Order.findOne({
      paymentReference: reference,
      user: req.user._id,
    });

    if (!order) {
      throw new AppError("Payment order not found", 404);
    }

    const result = await paystackRequest(
      `/transaction/verify/${encodeURIComponent(reference)}`,
      {
        method: "GET",
      },
    );

    const transaction = result.data;

    if (transaction.status !== "success") {
      return res.status(400).json({
        status: "fail",
        message: "Payment was not successful",
        paymentStatus: transaction.status,
      });
    }

    const updatedOrder = await fulfillPaidOrder({
      order,
      transaction,
    });

    res.status(200).json({
      status: "success",
      message: "Payment verified successfully",
      order: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

// export const verifyPayment = async (req, res, next) => {
//   try {
//     const { reference } = req.params;

//     const order = await Order.findOne({
//       paymentReference: reference,
//       user: req.user._id,
//     });

//     if (!order) {
//       throw new AppError("Payment order not found", 404);
//     }

//     const result = await paystackRequest(
//       `/transaction/verify/${encodeURIComponent(reference)}`,
//       {
//         method: "GET",
//       },
//     );

//     const transaction = result.data;

//     if (transaction.status !== "success") {
//       order.paymentStatus = "failed";

//       await order.save();

//       return res.status(400).json({
//         status: "fail",
//         message: "Payment was not successful",
//         paymentStatus: transaction.status,
//       });
//     }

//     // IMPORTANT:
//     // Never trust the frontend amount.
//     // Compare Paystack's amount with our order.

//     if (Number(transaction.amount) !== Math.round(order.totalAmount * 100)) {
//       throw new AppError("Payment amount does not match order amount", 400);
//     }

//     // Prevent duplicate processing
//     if (order.paymentStatus === "paid") {
//       return res.status(200).json({
//         status: "success",
//         message: "Payment already verified",
//         order,
//       });
//     }

//     // Convert reserved stock into sold stock
//     if (order.stockReserved) {
//       for (const item of order.items) {
//         const updatedProduct = await Product.findOneAndUpdate(
//           {
//             _id: item.product,
//             reservedStock: {
//               $gte: item.quantity,
//             },
//             stock: {
//               $gte: item.quantity,
//             },
//           },
//           {
//             $inc: {
//               stock: -item.quantity,
//               reservedStock: -item.quantity,
//             },
//           },
//           {
//             new: true,
//           },
//         );

//         if (!updatedProduct) {
//           throw new AppError(`Unable to finalize stock for ${item.name}`, 409);
//         }
//       }

//       order.stockReserved = false;
//     }

//     order.paymentStatus = "paid";

//     order.orderStatus = "confirmed";

//     order.paidAt = new Date();

//     await order.save();

//     res.status(200).json({
//       status: "success",
//       message: "Payment verified successfully",
//       order,
//     });
//   } catch (error) {
//     next(error);
//   }
// };
