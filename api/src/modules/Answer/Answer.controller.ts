import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "../../middleware/auth/authMiddleware";
import notFoundError from "../../middleware/error/notFoundError";
import Quizmodel from "../Quiz/Quiz.model";
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

    const quiz = await Quizmodel.findOne({
      _id: req.body.quizId,
    });

    if (!quiz) {
      throw new notFoundError("Quiz not found");
    }

    const answer = new answerModel({
      ...req.body,
    });
    const result = await answer.save();

    res.json(result);
  } catch (e) {
    next(e);
  }
};


export {
  createAnswer,
  getAnswerDetail,
};
