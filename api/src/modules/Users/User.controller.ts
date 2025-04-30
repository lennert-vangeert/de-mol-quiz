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
  const scoreBoard = await User.find()
    .sort({ score: -1 })
    .limit(10)
    .select("name score");
  res.json(scoreBoard);
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
export {
  login,
  getCurrentUser,
  register,
  refreshToken,
  getScoreBoard,
  sendNewQuizEmailToAllUsers,
};
