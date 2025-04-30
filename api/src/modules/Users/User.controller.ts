import { NextFunction, Request, Response } from "express";
import User from "./User.model";
import { AuthRequest } from "../../middleware/auth/authMiddleware";
import { sendMail } from "../../mail/sendMail";
import { generateNewQuizEmail } from "../../mail/mails/newQuiz";

const login = async (req: Request, res: Response, next: NextFunction) => {
  const { user } = req as AuthRequest;
  const dataBaseUser = await User.findOne({ email: req.body.email });

  res.json({
    token: user.generateToken(),
    role: dataBaseUser?.role,
  });
};

const register = async (req: Request, res: Response, next: NextFunction) => {
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
  const users = await User.find().select("email name").lean();
  users.forEach((user) => {
    sendMail(user.email, `De nieuwe molquiz is er!`, generateNewQuizEmail("7"));
  });
};

const getCurrentUser = (req: Request, res: Response, next: NextFunction) => {
  const { user } = req as AuthRequest;
  res.json(user);
};
const refreshToken = (req: Request, res: Response, next: NextFunction) => {
  const { user } = req as AuthRequest;
  const newToken = user.generateToken();
  res.json({ token: newToken, role: [user.role], userId: user._id });
};

const unsubscribeFromEmails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log(req.body);
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
export {
  login,
  getCurrentUser,
  register,
  refreshToken,
  getScoreBoard,
  sendNewQuizEmailToAllUsers,
  unsubscribeFromEmails,
};
