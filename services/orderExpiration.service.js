import Order from "../models/order.js";
import Product from "../models/product.model.js";

const releaseExpiredReservations = async () => {
  const expiredOrders = await Order.find({
    paymentStatus: "pending",

    stockReserved: true,

    reservationExpiresAt: {
      $lte: new Date(),
    },

    orderStatus: {
      $in: ["pending", "confirmed"],
    },
  });

  for (const order of expiredOrders) {
    for (const item of order.items) {
      await Product.findOneAndUpdate(
        {
          _id: item.product,

          reservedStock: {
            $gte: item.quantity,
          },
        },
        {
          $inc: {
            reservedStock: -item.quantity,
          },
        },
      );
    }

    order.stockReserved = false;

    order.orderStatus = "cancelled";

    await order.save();
  }

  return expiredOrders.length;
};

export default releaseExpiredReservations;
