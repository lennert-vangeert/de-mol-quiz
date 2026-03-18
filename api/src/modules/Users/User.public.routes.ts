import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authLocal } from "../../middleware/auth/authMiddleware";
import {
  checkResetPasswordCredentials,
  confirmResetPassword,
  login,
  register,
  requestResetPassword,
} from "./User.controller";

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login attempts, please try again later." },
});

const resetRequestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many reset requests, please try again later." },
});

const resetConfirmLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts, please try again later." },
});

const userPublicRouter = Router();
userPublicRouter.post("/login", loginLimiter, authLocal, login);
userPublicRouter.post("/register", register);
userPublicRouter.post("/reset-password", resetRequestLimiter, requestResetPassword);
userPublicRouter.post("/confirm-reset-password", resetConfirmLimiter, confirmResetPassword);
userPublicRouter.post(
  "/check-reset-password-credentials",
  resetConfirmLimiter,
  checkResetPasswordCredentials
);

export default userPublicRouter;
