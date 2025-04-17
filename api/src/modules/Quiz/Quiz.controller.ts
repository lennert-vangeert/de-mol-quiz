import { NextFunction, Request, Response } from "express";
import Quiz from "./Quiz.model";
import { AuthRequest } from "../../middleware/auth/authMiddleware";
import notFoundError from "../../middleware/error/NothingFoundError";

const getCurrentQuiz = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const quiz = await Quiz.findOne({
      week: process.env.CURRENTWEEK ?? 0,
    });
    if (!quiz) {
      res.status(404).json({ message: "No quiz found" });
      return;
    }
    res.json(quiz);
  } catch (e) {
    next(e);
    res.status(500).json({ message: "internal server error" });
  }
};

const createQuiz = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const quiz = new Quiz({ ...req.body });
    const result = await quiz.save();
    res.status(200).json(result);
  } catch (e) {
    next(e);
    res.status(500).json({ message: "internal server error" });
  }
};

const getQuizById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req as AuthRequest;
    const { id } = req.params;
    const quiz = await Quiz.findOne({
      _id: id,
      userId: user._id,
    });
    if (!quiz) {
      throw new notFoundError("Quiz not found");
    }
    res.json(quiz);
  } catch (err) {
    next(err);
  }
};

export { createQuiz, getQuizById, getCurrentQuiz };
