import { Express, Router } from "express";
import quizRoutes from "../modules/Quiz/Quiz.routes";
import answerRoutes from "../modules/Answer/Answer.routes";
import userPublicRoutes from "../modules/Users/User.public.routes";
import userPrivateRoutes from "../modules/Users/User.private.routes";
import contestantRoutes from "../modules/Contestant/Contestant.routes";
import configRoutes from "../modules/Config/Config.routes";
import { authJwt } from "../middleware/auth/authMiddleware";
import { errorHandler } from "../middleware/error/errorHandlerMiddleware";
import { logger } from "../utils/logger";

const registerRoutes = (app: Express) => {
  app.use("/", userPublicRoutes);

  const authRoutes = Router();
  authRoutes.use("/", quizRoutes);
  authRoutes.use("/", userPrivateRoutes);
  authRoutes.use("/", answerRoutes);
  authRoutes.use("/", contestantRoutes);
  authRoutes.use("/", configRoutes);

  app.use(authJwt, authRoutes);

  logger.info("Routes registered", {
    publicRoutes: ["users public"],
    protectedRouteGroups: ["quiz", "users private", "answers", "contestants", "config"],
  });

  //AFTER ALL ROUTES
  app.use(errorHandler);
};

export { registerRoutes };
