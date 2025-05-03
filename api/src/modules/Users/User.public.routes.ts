import { Router } from "express";
import { authLocal } from "../../middleware/auth/authMiddleware";
import {
  checkResetPasswordCredentials,
  confirmResetPassword,
  login,
  register,
  requestResetPassword,
  unsubscribeFromEmails,
} from "./User.controller";

const userPublicRouter = Router();
userPublicRouter.post("/login", authLocal, login);
userPublicRouter.post("/register", register);
userPublicRouter.post("/unsubscribe", unsubscribeFromEmails);
userPublicRouter.post("/reset-password", requestResetPassword);
userPublicRouter.post("/confirm-reset-password", confirmResetPassword);
userPublicRouter.post(
  "/check-reset-password-credentials",
  checkResetPasswordCredentials
);

export default userPublicRouter;
