import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "../../middleware/auth/authMiddleware";
import notFoundError from "../../middleware/error/NothingFoundError";
import Quiz from "../Quiz/Quiz.model";
import answerModel from "./Answer.model";
import UserModel from "../Users/User.model";
import { sendMail } from "../../mail/sendMail";
import { generateNewSubmissionEmail } from "../../mail/mails/newSubmission";
import { generateConfirmSubmissionEmail } from "../../mail/mails/confirmSubmission";
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
      userName: user.name,
      closed: false,
    });
    const result = await answer.save();
    try {
      const dbUser = await UserModel.findById(user._id);
      if (!dbUser) {
        throw new notFoundError("User not found");
      }
      dbUser.score += req.body.totalScore;
      await dbUser.save();
    } catch (e) {
      throw new notFoundError("User not found");
    }

    res.json(result);
    sendMail(
      process.env.ADMIN_EMAIL ?? "",
      "New Quiz Submission",
      generateNewSubmissionEmail(result)
    );
    sendMail(
      user.email,
      "Je quiz inzending is ontvangen",
      generateConfirmSubmissionEmail(result)
    );
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

const closeOldAnswers = async () => {
  try {
    const currentWeekQuiz = await Quiz.findOne({
      week: process.env.CURRENTWEEK ?? 0,
    });
    if (!currentWeekQuiz) {
      return;
    }
    const answers = await answerModel.find({
      quizId: { $ne: currentWeekQuiz._id },
      closed: false,
    });
    answers.forEach(async (answer) => {
      try {
        console.log(`Closing answer with id ${answer._id}`);
        answer.closed = true;
        await answer.save();
      } catch (e) {
        console.error(`Failed to close answer with id ${answer._id}:`, e);
      }
    });
  } catch (e) {
    console.error("Failed to close old answers:", e);
  }
};

export {
  createAnswer,
  getAnswerDetail,
  getCurrentUserAndWeekAnswer,
  closeOldAnswers,
};
