import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import User from "./User.model";
import { AuthRequest } from "../../middleware/auth/authMiddleware";
import { sendMail } from "../../mail/sendMail";
import { generateNewQuizEmail } from "../../mail/mails/newQuiz";
import { generateResetPasswordEmail } from "../../mail/mails/resetPassword";
import { generateWinnerEmail } from "../../mail/mails/celebration";

// ————————————————————————
// Zod schemas for all request bodies
// ————————————————————————
const LoginSchema = z.object({
  email: z.string().email({ message: "Must be a valid email address" }),
});

const RegisterSchema = z.object({
  email: z.string().email({ message: "Must be a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
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
  password: z.string().min(1, { message: "Password is required" }),
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
    console.debug("logging in user");
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
    console.debug("registering user");
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
  console.debug("getting scoreboard");
  try {
    const { user } = req as AuthRequest;
    const scoreBoard = await User.find({ type: user.type, role: "REGULAR" })
      .sort({ score: -1 })
      .limit(10)
      .select("name score");
    res.json(scoreBoard);
  } catch (error) {
    next(error);
  }
};

// ————————————————————————
// POST /send-new-quiz-email
// (no input to validate)
// ————————————————————————
const sendNewQuizEmailToAllUsers = async () => {
  console.debug("sending new quiz email to all users");
  const users = await User.find({ receiveEmails: true });
  users.forEach((user) => {
    sendMail(
      user.email,
      `De nieuwe molquiz is er!`,
      generateNewQuizEmail("7", user.email)
    );
  });
};

// ————————————————————————
// POST /send-winner-email
// (no input to validate)
// ————————————————————————

export const sendWinnerEmail = async () => {
  console.debug("sending winner email to all users");
  const users = await User.find({ receiveEmails: true });
  // find user with highest score
  const winner = await User.findOne({ score: { $gt: 0 } }).sort({ score: -1 });
  users.forEach((user) => {
    sendMail(
      user.email,
      `De winnaar is bekend!`,
      generateWinnerEmail(winner?.name || "Laura Volkaert", user.email)
    );
  });
};

// ————————————————————————
// GET /me
// ————————————————————————
const getCurrentUser = (req: Request, res: Response, next: NextFunction) => {
  console.debug("getting current user");
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
    console.debug("unsubscribing user from emails");
    const user = await User.findOne({ email: parsed.data.email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.receiveEmails = false;
    await user.save();
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

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordCode = resetCode;
    user.resetPasswordExpires = new Date(Date.now() + 300000); // 5 min
    await user.save();

    sendMail(
      email,
      "Reset Password",
      generateResetPasswordEmail(email, resetCode, user.name || "User")
    );
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
    const scoreBoard = await User.find({ role: "REGULAR" })
      .sort({ score: -1 })
      .select("name score type");
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
  sendNewQuizEmailToAllUsers,
  getCurrentUser,
  refreshToken,
  unsubscribeFromEmails,
  requestResetPassword,
  confirmResetPassword,
  checkResetPasswordCredentials,
};
