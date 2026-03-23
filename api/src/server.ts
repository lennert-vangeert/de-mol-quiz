import "dotenv/config";
import mongoose from "mongoose";
import app from "./app";
import { Server } from "http";
// import { transporter } from "./mail/sendMail";
import { dbState } from "./db/dbState";
import { logger } from "./utils/logger";

const port: number = parseInt(process.env.PORT ?? "9300");

if (!process.env.MONGO_CONNECTION) {
  throw new Error("MongoDB connection string not found");
}
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not set");
}

let retryInterval: ReturnType<typeof setInterval> | null = null;

const connectWithRetry = () => {
  mongoose
    .connect(process.env.MONGO_CONNECTION!)
    .then(() => {
      logger.info("Connected to MongoDB");
      dbState.isConnected = true;
      if (retryInterval) {
        clearInterval(retryInterval);
        retryInterval = null;
      }
    })
    .catch((err) => {
      logger.error("MongoDB connection error", { message: err.message });
      dbState.isConnected = false;
      if (!retryInterval) {
        retryInterval = setInterval(() => {
          logger.warn("Retrying MongoDB connection");
          connectWithRetry();
        }, 60_000);
      }
    });
};

// Start HTTP server immediately — don't wait for MongoDB
const server = app.listen(port, () => {
  logger.info("Server started", { url: `http://localhost:${port}` });
  // transporter
  //   .verify()
  //   .then(() => logger.info("Mail transporter ready"))
  //   .catch((err) => logger.error("Mail transporter error", { message: err?.message }));
});

server.on("SIGINT", () => stopServer(server));
server.on("SIGTERM", () => stopServer(server));

// Attempt initial connection
connectWithRetry();

const stopServer = (server: Server) => {
  if (retryInterval) clearInterval(retryInterval);
  mongoose.connection.close();
  server.close(() => {
    logger.info("Server closed");
    process.exit();
  });
};
