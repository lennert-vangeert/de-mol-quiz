import "dotenv/config";
import mongoose from "mongoose";
import app from "./app";
import { Server } from "http";
import UserModel from "./modules/Users/User.model";
const port: number = parseInt(process.env.PORT ?? "9000");
export let startTime: Date;

if (process.env.MONGO_CONNECTION) {
  mongoose
    .connect(process.env.MONGO_CONNECTION)
    .then(() => {
      console.log("Connected to MongoDB");

      //start server
      const server = app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
        startTime = new Date();
      });
      addAdminUser();
      server.on("SIGINT", () => stopServer(server));
      server.on("SIGTERM", () => stopServer(server));
    })
    .catch((err) => console.log(err));
} else {
  throw new Error("MongoDB connection string not found");
}

const addAdminUser = async () => {
  if (
    (await UserModel.findOne({ email: "admin@test.com" })) ||
    process.env.ENVIRONMENT?.toString() == "development"
  ) {
    return;
  }
  const user = new UserModel({
    email: "admin@test.com",
    password: "secret123",
    firstName: "admin",
    lastName: "123",
  });
  user.save();
};

const stopServer = (server: Server) => {
  mongoose.connection.close();
  server.close(() => {
    console.log("Server closed");
    process.exit();
  });
};
