import { NextFunction, Request, Response } from "express";
import Quiz from "./Quiz.model";
import ConfigModel from "../Config/Config.model";
import { AuthRequest } from "../../middleware/auth/authMiddleware";
import notFoundError from "../../middleware/error/NothingFoundError";

const getCurrentQuiz = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const config = await ConfigModel.findOne({});
    const currentWeek = config?.week ?? 0;
    const quiz = await Quiz.findOne({ week: currentWeek });
    if (!quiz) {
      res.status(404).json({ message: "No quiz found" });
      return;
    }
    // if its between 20:00 and 23:59 ona sunday return no quiz found
    // const currentDate = new Date();
    // const currentDay = currentDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    // const currentHour = currentDate.getHours(); // 0-23
    // if (
    //   currentDay === 0 &&
    //   currentHour >= 20 &&
    //   process.env.ENVIRONMENT === "prd"
    // ) {
    //   res.status(404).json({ message: "No quiz found" });
    //   return;
    // }
    res.json(quiz);
  } catch (e) {
    next(e);
  }
};

const createQuiz = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req as AuthRequest;
    if (user.role !== "ADMIN")
      return res.status(403).json({ message: "Forbidden" });
    const quiz = new Quiz({ ...req.body });
    const result = await quiz.save();
    res.status(200).json(result);
  } catch (e) {
    next(e);
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

const getAllQuizzes = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { user } = req as AuthRequest;
    if (user.role !== "ADMIN")
      return res.status(403).json({ message: "Forbidden" });
    const quizzes = await Quiz.find({}).sort({ week: -1 });
    res.json(quizzes);
  } catch (e) {
    next(e);
  }
};

const updateQuiz = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req as AuthRequest;
    if (user.role !== "ADMIN")
      return res.status(403).json({ message: "Forbidden" });
    const { id } = req.params;
    const updated = await Quiz.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) {
      res.status(404).json({ message: "Quiz not found" });
      return;
    }
    res.json(updated);
  } catch (e) {
    next(e);
  }
};

const deleteQuiz = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req as AuthRequest;
    if (user.role !== "ADMIN")
      return res.status(403).json({ message: "Forbidden" });
    const { id } = req.params;
    const deleted = await Quiz.findByIdAndDelete(id);
    if (!deleted) {
      res.status(404).json({ message: "Quiz not found" });
      return;
    }
    res.status(200).json({ message: "Quiz deleted" });
  } catch (e) {
    next(e);
  }
};

export { createQuiz, getQuizById, getCurrentQuiz, getAllQuizzes, updateQuiz, deleteQuiz };
