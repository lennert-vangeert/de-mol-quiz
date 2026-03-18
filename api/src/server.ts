import "dotenv/config";
import mongoose from "mongoose";
import app from "./app";
import { Server } from "http";
import { transporter } from "./mail/sendMail";
import { dbState } from "./db/dbState";

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
      console.log("Connected to MongoDB");
      dbState.isConnected = true;
      if (retryInterval) {
        clearInterval(retryInterval);
        retryInterval = null;
      }
    })
    .catch((err) => {
      console.error("MongoDB connection error:", err.message);
      dbState.isConnected = false;
      if (!retryInterval) {
        retryInterval = setInterval(() => {
          console.log("Retrying MongoDB connection...");
          connectWithRetry();
        }, 60_000);
      }
    });
};

// Start HTTP server immediately — don't wait for MongoDB
const server = app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  transporter
    .verify()
    .then(() => console.log("Mail transporter ready"))
    .catch((err) => console.error("Mail transporter error", err));
});

server.on("SIGINT", () => stopServer(server));
server.on("SIGTERM", () => stopServer(server));

// Attempt initial connection
connectWithRetry();

const stopServer = (server: Server) => {
  if (retryInterval) clearInterval(retryInterval);
  mongoose.connection.close();
  server.close(() => {
    console.log("Server closed");
    process.exit();
  });
};
