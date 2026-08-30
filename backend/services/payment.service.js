import Order from "../models/order.js";
import Product from "../models/product.model.js";
import AppError from "../utils/appError.js";

const fulfillPaidOrder = async ({ order, transaction }) => {
  // Already fulfilled
  if (order.paymentStatus === "paid") {
    return order;
  }

  // Verify transaction amount
  const expectedAmount = Math.round(order.totalAmount * 100);

  if (Number(transaction.amount) !== expectedAmount) {
    throw new AppError("Payment amount does not match order amount", 400);
  }

  // Verify currency
  if (transaction.currency && transaction.currency !== "NGN") {
    throw new AppError("Payment currency does not match order currency", 400);
  }

  // Finalize reserved inventory
  if (order.stockReserved) {
    for (const item of order.items) {
      const product = await Product.findOneAndUpdate(
        {
          _id: item.product,

          stock: {
            $gte: item.quantity,
          },

          reservedStock: {
            $gte: item.quantity,
          },
        },

        {
          $inc: {
            stock: -item.quantity,

            reservedStock: -item.quantity,
          },
        },

        {
          new: true,
        },
      );

      if (!product) {
        throw new AppError(`Unable to finalize stock for ${item.name}`, 409);
      }
    }

    order.stockReserved = false;
  }

  order.paymentStatus = "paid";

  order.orderStatus = "confirmed";

  order.paymentReference = transaction.reference;

  order.paidAt = transaction.paid_at
    ? new Date(transaction.paid_at)
    : new Date();

  await order.save();

  return order;
};

export default fulfillPaidOrder;
