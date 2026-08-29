import express from "express";

import { handlePaystackWebhook } from "../controllers/paystackWebhook.controller.js";

const router = express.Router();

router.post(
  "/",
  express.raw({
    type: "application/json",
  }),
  handlePaystackWebhook,
);

export default router;
