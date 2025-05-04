import { NextFunction, Request, Response } from "express";
import User from "./User.model";
import { AuthRequest } from "../../middleware/auth/authMiddleware";
import { sendMail } from "../../mail/sendMail";
import { generateNewQuizEmail } from "../../mail/mails/newQuiz";
import { generateResetPasswordEmail } from "../../mail/mails/resetPassword";

const login = async (req: Request, res: Response, next: NextFunction) => {
  console.debug("logging in user");
  const { user } = req as AuthRequest;
  const dataBaseUser = await User.findOne({ email: req.body.email });

  res.json({
    token: user.generateToken(),
    role: dataBaseUser?.role,
  });
};

const register = async (req: Request, res: Response, next: NextFunction) => {
  console.debug("registering user");
  const user = await User.findOne({ email: req.body.email });
  try {
    if (user) {
      res.status(400).json({ message: "user already exists" });
    } else {
      const newUser = new User({
        email: req.body.email,
        password: req.body.password,
        role: "REGULAR",
        score: 0,
        name: req.body.name,
      });
      await newUser.save();
      res.status(200).json({ token: newUser.generateToken() });
    }
  } catch (error) {
    next(error);
  }
};

const getScoreBoard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.debug("getting scoreboard");
  const { user } = req as AuthRequest;
  try {
    const scoreBoard = await User.find()
      .sort({ score: -1 })
      .limit(10)
      .select("name score");
    res.json(scoreBoard);
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
};

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

const getCurrentUser = (req: Request, res: Response, next: NextFunction) => {
  console.debug("getting current user");
  const { user } = req as AuthRequest;
  res.json(user);
};
const refreshToken = (req: Request, res: Response, next: NextFunction) => {
  console.debug("refreshing token");
  const { user } = req as AuthRequest;
  const newToken = user.generateToken();
  res.json({ token: newToken, role: [user.role], userId: user._id });
};

const unsubscribeFromEmails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.debug("unsubscribing user from emails");
  try {
    const email = req.body.email;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.receiveEmails = false;
    await user.save();
    res.status(200).json({ message: "Unsubscribed from emails" });
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
};

const requestResetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({
        message: "Reset password code sent",
      });
    }
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordCode = resetCode;
    user.resetPasswordExpires = new Date(Date.now() + 300000); // 5 min expiration
    await user.save();
    sendMail(
      email,
      "Reset Password",
      generateResetPasswordEmail(email, resetCode, user.name || "User")
    );
    res.status(200).json({
      message: "Reset password code sent",
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const confirmResetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, code, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ message: "Invalid reset code or reset code expired" });
    }

    if (!user.resetPasswordCode || !user.resetPasswordExpires) {
      return res
        .status(400)
        .json({ message: "Invalid reset code or reset code expired" });
    }

    if (user.resetPasswordCode !== code) {
      return res
        .status(400)
        .json({ message: "Invalid reset code or reset code expired" });
    }

    if (user.resetPasswordExpires && user.resetPasswordExpires < new Date()) {
      return res
        .status(400)
        .json({ message: "Invalid reset code or reset code expired" });
    }

    // Reset password logic here
    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }
    user.password = password;
    user.resetPasswordCode = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const checkResetPasswordCredentials = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, code } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ message: "Invalid reset code or reset code expired" });
    }

    if (user.resetPasswordCode !== code) {
      return res
        .status(400)
        .json({ message: "Invalid reset code or reset code expired" });
    }

    if (user.resetPasswordExpires && user.resetPasswordExpires < new Date()) {
      return res
        .status(400)
        .json({ message: "Invalid reset code or reset code expired" });
    }

    res.status(200).json({ message: "Valid reset code" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export {
  login,
  getCurrentUser,
  register,
  refreshToken,
  getScoreBoard,
  sendNewQuizEmailToAllUsers,
  unsubscribeFromEmails,
  requestResetPassword,
  confirmResetPassword,
  checkResetPasswordCredentials,
};
