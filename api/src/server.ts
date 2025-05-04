import "dotenv/config";
import mongoose from "mongoose";
import app from "./app";
import { Server } from "http";
import { transporter } from "./mail/sendMail";
const port: number = parseInt(process.env.PORT ?? "9300");
if (process.env.MONGO_CONNECTION) {
  mongoose
    .connect(process.env.MONGO_CONNECTION)
    .then(() => {
      console.log("Connected to MongoDB");

      //start server
      const server = app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
        // Check if the mail transporter is ready
        transporter
          .verify()
          .then(() => {
            console.log("Mail transporter ready");
          })
          .catch((err) => {
            console.error("Mail transporter error", err);
          });
      });
      // Handle server shutdown gracefully
      server.on("SIGINT", () => stopServer(server));
      server.on("SIGTERM", () => stopServer(server));
    })
    .catch((err) => console.log(err));
} else {
  throw new Error("MongoDB connection string not found");
}

const stopServer = (server: Server) => {
  mongoose.connection.close();
  server.close(() => {
    console.log("Server closed");
    process.exit();
  });
};
