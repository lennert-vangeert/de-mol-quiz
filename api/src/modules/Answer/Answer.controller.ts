import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "../../middleware/auth/authMiddleware";
import notFoundError from "../../middleware/error/NotFoundError";
import Quiz from "../Quiz/Quiz.model";
import answerModel from "./Answer.model";
const getAnswerDetail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { user } = req as AuthRequest;
    const { id } = req.params;
    const answer = await answerModel
      .findOne({
        quizId: id,
      })
      .lean()
      .populate("quiz");

    if (!answer) {
      throw new notFoundError("answer not found");
    }
    res.json(answer);
  } catch (e) {
    next(e);
  }
};

const createAnswer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { user } = req as AuthRequest;

    const quiz = await Quiz.findOne({
      _id: req.body.quizId,
    });

    if (!quiz) {
      throw new notFoundError("Quiz not found");
    }

    const answer = new answerModel({
      ...req.body,
      userId: user._id,
    });
    const result = await answer.save();

    res.json(result);
  } catch (e) {
    next(e);
  }
};

const getCurrentUserAndWeekAnswer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { user } = req as AuthRequest;
    const currentWeekQuiz = await Quiz.findOne({
      week: process.env.CURRENTWEEK ?? 0,
    });
    const answer = await answerModel.findOne({
      userId: user._id,
      quizId: currentWeekQuiz?._id,
    });
    if (answer) {
      res.json({
        hasUserSubmitted: true,
      });
    } else {
      res.json({
        hasUserSubmitted: false,
      });
    }
  } catch (e) {
    next(e);
  }
};

export { createAnswer, getAnswerDetail, getCurrentUserAndWeekAnswer };
