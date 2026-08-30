import dotenv from "dotenv";

import http from "http";

import { Server } from "socket.io";

import app from "./app.js";

import connectDB from "./config/db.js";

import releaseExpiredReservations from "./services/orderExpiration.service.js";

import initializeChatSocket from "./socket/chat.socket.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
});

initializeChatSocket(io);

setInterval(
  async () => {
    try {
      const released = await releaseExpiredReservations();

      if (released > 0) {
        console.log(`Released stock from ${released} expired order(s)`);
      }
    } catch (error) {
      console.error("Reservation cleanup failed:", error);
    }
  },
  5 * 60 * 1000,
);

const startServer = async () => {
  try {
    await connectDB();

    server.listen(PORT, () => {
      console.log(`DeQueens Atelier server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);

    process.exit(1);
  }
};

startServer();
