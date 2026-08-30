import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import productRoutes from "./routes/product.routes.js";
import cartRoutes from "./routes/cart.route.js";
import orderRoutes from "./routes/order.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import apprenticeshipRoutes from "./routes/apprenticeship.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import designRequestRoutes from "./routes/designRequest.routes.js";
import adminRoutes from "./routes/admin.routes.js";

import errorHandler from "./middleware/errorHandler.js";

const app = express();

app.use(cors());
import paystackWebhookRoutes from "./routes/paystackWebhook.routes.js";

app.use("/api/payments/webhook", paystackWebhookRoutes);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to DeQueens Atelier API",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/design-requests", designRequestRoutes);
app.use("/api/apprenticeships", apprenticeshipRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/admin", adminRoutes);

// Central error handler
app.use(errorHandler);

export default app;
