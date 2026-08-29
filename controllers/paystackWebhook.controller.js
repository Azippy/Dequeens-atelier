import crypto from "crypto";
import fulfillPaidOrder from "../services/payment.service.js";
import Order from "../models/order.js";
import Product from "../models/product.model.js";

const verifyPaystackSignature = (req) => {
  const signature = req.headers["x-paystack-signature"];

  if (!signature) {
    return false;
  }

  const hash = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
    .update(req.body)
    .digest("hex");

  return hash === signature;
};

export const handlePaystackWebhook = async (req, res) => {
  try {
    if (!verifyPaystackSignature(req)) {
      return res.sendStatus(401);
    }

    const event = JSON.parse(req.body.toString());

    if (event.event !== "charge.success") {
      return res.sendStatus(200);
    }

    const transaction = event.data;

    const order = await Order.findOne({
      paymentReference: transaction.reference,
    });

    if (!order) {
      return res.sendStatus(200);
    }

    await fulfillPaidOrder({
      order,
      transaction,
    });

    return res.sendStatus(200);
  } catch (error) {
    console.error("Paystack webhook error:", error);

    return res.sendStatus(500);
  }
};

// export const handlePaystackWebhook = async (req, res) => {
//   try {
//     if (!verifyPaystackSignature(req)) {
//       return res.sendStatus(401);
//     }

//     const event = JSON.parse(req.body.toString());

//     if (event.event !== "charge.success") {
//       return res.sendStatus(200);
//     }

//     const transaction = event.data;

//     const order = await Order.findOne({
//       paymentReference: transaction.reference,
//     });

//     if (!order) {
//       return res.sendStatus(200);
//     }

//     if (Number(transaction.amount) !== Math.round(order.totalAmount * 100)) {
//       return res.sendStatus(400);
//     }

//     if (order.paymentStatus === "paid") {
//       return res.sendStatus(200);
//     }

//     if (order.stockReserved) {
//       for (const item of order.items) {
//         const updatedProduct = await Product.findOneAndUpdate(
//           {
//             _id: item.product,
//             stock: {
//               $gte: item.quantity,
//             },
//             reservedStock: {
//               $gte: item.quantity,
//             },
//           },
//           {
//             $inc: {
//               stock: -item.quantity,
//               reservedStock: -item.quantity,
//             },
//           },
//         );

//         if (!updatedProduct) {
//           return res.sendStatus(409);
//         }
//       }

//       order.stockReserved = false;
//     }

//     order.paymentStatus = "paid";

//     order.orderStatus = "confirmed";

//     order.paidAt = new Date();

//     await order.save();

//     return res.sendStatus(200);
//   } catch (error) {
//     console.error("Paystack webhook error:", error);

//     return res.sendStatus(500);
//   }
// };
