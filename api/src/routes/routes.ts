import { Express, Router } from "express";
import quizRoutes from "../modules/Quiz/Quiz.routes";
import answerRoutes from "../modules/Answer/Answer.routes";
import healthRoutes from "../modules/Health/Health.routes";
import userPublicRoutes from "../modules/Users/User.public.routes";
import userPrivateRoutes from "../modules/Users/User.private.routes";
import { authJwt } from "../middleware/auth/authMiddleware";
import { errorHandler } from "../middleware/error/errorHandlerMiddleware";

const registerRoutes = (app: Express) => {
  app.use("/", userPublicRoutes);
  app.use("/", healthRoutes);

  const authRoutes = Router();
  authRoutes.use("/", userPrivateRoutes);
  authRoutes.use("/", quizRoutes);
  authRoutes.use("/", answerRoutes);

  app.use(authJwt, authRoutes);

  //AFTER ALL ROUTES
  app.use(errorHandler);
};

export { registerRoutes };
