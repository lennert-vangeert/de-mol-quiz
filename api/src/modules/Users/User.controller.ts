import crypto from "crypto";
import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import User from "./User.model";
import { AuthRequest } from "../../middleware/auth/authMiddleware";
import { logger } from "../../utils/logger";
import { getActiveSeason } from "../Config/Config.controller";

// ————————————————————————
// Zod schemas for all request bodies
// ————————————————————————
const LoginSchema = z.object({
  email: z.string().email({ message: "Must be a valid email address" }),
});

const RegisterSchema = z.object({
  email: z.string().email({ message: "Must be a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  name: z.string().min(1, { message: "Name is required" }),
});

const UnsubscribeSchema = z.object({
  email: z.string().email({ message: "Must be a valid email address" }),
});

const RequestResetPasswordSchema = z.object({
  email: z.string().email({ message: "Must be a valid email address" }),
});

const ConfirmResetPasswordSchema = z.object({
  email: z.string().email({ message: "Must be a valid email address" }),
  code: z
    .string()
    .regex(/^\d{6}$/, { message: "Code must be a 6‑digit string" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
});

const CheckResetPasswordCredentialsSchema = z.object({
  email: z.string().email({ message: "Must be a valid email address" }),
  code: z
    .string()
    .regex(/^\d{6}$/, { message: "Code must be a 6‑digit string" }),
});

// ————————————————————————
// POST /login
// ————————————————————————
const login = async (req: Request, res: Response, next: NextFunction) => {
  // 1) Validate input
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.errors });
  }

  try {
    logger.debug("Logging in user", { email: parsed.data.email });
    const { user } = req as AuthRequest;
    const dataBaseUser = await User.findOne({ email: parsed.data.email });

    return res.json({
      token: user.generateToken(),
      role: dataBaseUser?.role,
    });
  } catch (e) {
    next(e);
  }
};

// ————————————————————————
// POST /register
// ————————————————————————
const register = async (req: Request, res: Response, next: NextFunction) => {
  // 1) Validate input
  const parsed = RegisterSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.errors });
  }
  const { email, password, name } = parsed.data;

  try {
    logger.debug("Registering user", { email });
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const type = email.endsWith("@codifly.be") ? "corporate" : "private";

    const newUser = new User({
      email,
      password,
      role: "REGULAR",
      type,
      score: 0,
      name,
    });
    await newUser.save();

    return res.status(200).json({ token: newUser.generateToken() });
  } catch (error) {
    next(error);
  }
};

// ————————————————————————
// GET /scoreboard
// ————————————————————————
const getScoreBoard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.debug("Getting scoreboard");
  try {
    const { user } = req as AuthRequest;
    const activeSeason = await getActiveSeason();
    const seasonKey = `$scoresBySeason.${activeSeason}`;
    const scoreBoard = await User.aggregate([
      { $match: { type: user.type, role: "REGULAR" } },
      { $addFields: { score: { $ifNull: [seasonKey, 0] } } },
      { $sort: { score: -1 } },
      { $limit: 10 },
      { $project: { name: 1, score: 1 } },
    ]);
    res.json(scoreBoard);
  } catch (error) {
    next(error);
  }
};



// ————————————————————————
// GET /me
// ————————————————————————
const getCurrentUser = (req: Request, res: Response, next: NextFunction) => {
  logger.debug("Getting current user");
  const { user } = req as AuthRequest;
  res.json(user);
};

// ————————————————————————
// POST /refresh-token
// ————————————————————————
const refreshToken = (req: Request, res: Response, next: NextFunction) => {
  const { user } = req as AuthRequest;
  const newToken = user.generateToken();
  res.json({ token: newToken, role: user.role, userId: user._id });
};

// ————————————————————————
// POST /unsubscribe
// ————————————————————————
const unsubscribeFromEmails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 1) Validate input
  const parsed = UnsubscribeSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.errors });
  }

  try {
    logger.debug("Unsubscribing user from emails", { email: parsed.data.email });
    const { user: authUser } = req as AuthRequest;
    if (authUser.email !== parsed.data.email) {
      return res.status(403).json({ message: "Forbidden" });
    }
    await User.findByIdAndUpdate(authUser._id, { receiveEmails: false });
    res.status(200).json({ message: "Unsubscribed from emails" });
  } catch (error) {
    next(error);
  }
};

// ————————————————————————
// POST /request-reset-password
// ————————————————————————
const requestResetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 1) Validate input
  const parsed = RequestResetPasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.errors });
  }

  try {
    const { email } = parsed.data;
    const user = await User.findOne({ email });

    // Always return 200 to avoid email enumeration
    if (!user) {
      return res.status(200).json({ message: "Reset password code sent" });
    }

    const resetCode = crypto.randomInt(100000, 1000000).toString();
    user.resetPasswordCode = resetCode;
    user.resetPasswordExpires = new Date(Date.now() + 300000); // 5 min
    await user.save();
    res.status(200).json({ message: "Reset password code sent" });
  } catch (error) {
    next(error);
  }
};

// ————————————————————————
// POST /confirm-reset-password
// ————————————————————————
const confirmResetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 1) Validate input
  const parsed = ConfirmResetPasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.errors });
  }
  const { email, code, password } = parsed.data;

  try {
    const user = await User.findOne({ email });
    if (
      !user ||
      !user.resetPasswordCode ||
      user.resetPasswordCode !== code ||
      !user.resetPasswordExpires ||
      user.resetPasswordExpires < new Date()
    ) {
      return res
        .status(400)
        .json({ message: "Invalid reset code or reset code expired" });
    }

    user.password = password;
    user.resetPasswordCode = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    next(error);
  }
};

// ————————————————————————
// POST /check-reset-credentials
// ————————————————————————
const checkResetPasswordCredentials = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 1) Validate input
  const parsed = CheckResetPasswordCredentialsSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.errors });
  }
  const { email, code } = parsed.data;

  try {
    const user = await User.findOne({ email });
    if (
      !user ||
      !user.resetPasswordCode ||
      user.resetPasswordCode !== code ||
      !user.resetPasswordExpires ||
      user.resetPasswordExpires < new Date()
    ) {
      return res
        .status(400)
        .json({ message: "Invalid reset code or reset code expired" });
    }

    res.status(200).json({ message: "Valid reset code" });
  } catch (error) {
    next(error);
  }
};

// ————————————————————————
// GET /scoreBoard/all (ADMIN only)
// ————————————————————————
const getFullScoreBoard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { user } = req as AuthRequest;
    if (user.role !== "ADMIN")
      return res.status(403).json({ message: "Forbidden" });
    const activeSeason = await getActiveSeason();
    const seasonKey = `$scoresBySeason.${activeSeason}`;
    const scoreBoard = await User.aggregate([
      { $match: { role: "REGULAR" } },
      { $addFields: { score: { $ifNull: [seasonKey, 0] } } },
      { $sort: { score: -1 } },
      { $project: { name: 1, score: 1, type: 1 } },
    ]);
    res.json(scoreBoard);
  } catch (error) {
    next(error);
  }
};

export {
  login,
  register,
  getScoreBoard,
  getFullScoreBoard,
  getCurrentUser,
  refreshToken,
  unsubscribeFromEmails,
  requestResetPassword,
  confirmResetPassword,
  checkResetPasswordCredentials,
};
