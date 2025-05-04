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
    if (user.receiveEmails) {
      sendMail(
        user.email,
        "Je quiz inzending is ontvangen",
        generateConfirmSubmissionEmail(result, user.email)
      );
    }
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

const givePoints = async () => {
  const person = "Nimrod"; // expected elimination guess
  const priceMoney = 20910; // true prize‑money
  const priceMoneyPoints = 2; // points for closest guess
  const eliminationPoints = 2; // points for correct elimination guess. At the end of the season when the question is about who's the winner make this 5 points

  // 1. Grab all still-open answer docs
  const answers = await answerModel.find({ closed: false });
  if (answers.length === 0) {
    console.log("No open answers to grade.");
    return;
  }

  // 2. Precompute each guess’s distance from priceMoney
  const priceMoneyData = answers.map((ansDoc) => {
    const raw = ansDoc.answers[4].userAnswer || "";
    const numericString = raw.replace(/\D/g, "");
    const guess = parseInt(numericString, 10) || 0;

    return {
      ansDoc,
      elimGuess: ansDoc.answers[3].userAnswer,
      prizeGuess: guess,
      diff: Math.abs(guess - priceMoney),
    };
  });

  // 3. Find the minimal difference (this will be shared by all ties)
  const minDiff = Math.min(...priceMoneyData.map((r) => r.diff));

  // 4. Loop and award points + persist changes
  for (const { ansDoc, elimGuess, diff } of priceMoneyData) {
    let points = 0;
    const reasons = [];

    // 4a) 2 points for correct elimination‑guess
    if (elimGuess === person) {
      points += eliminationPoints;
      reasons.push("correct elimination guess");
    }

    // 4b) 2 points if tied for closest prize‑money guess
    //     everyone with diff === minDiff gets these 2 points
    if (diff === minDiff) {
      points += priceMoneyPoints;
      reasons.push("closest prize‑money guess");
    }

    // 4c) Load & update the user’s score
    const user = await UserModel.findById(ansDoc.userId);
    if (!user) {
      console.log(
        `⚠️  Couldn’t find user ${ansDoc.userId} for answer ${ansDoc._id}`
      );
      continue;
    }
    user.score = (user.score || 0) + points;
    await user.save();

    // 4d) Close out the answer
    ansDoc.closed = true;
    await ansDoc.save();

    // 4e) Log it with reasons
    const reasonText = reasons.length
      ? `(${reasons.join(" & ")})`
      : "(no points awarded)";
    console.log(`${user.name} got ${points} points ${reasonText}`);
  }

  console.log("✅ All open answers have been graded and closed.");
};
export {
  createAnswer,
  getAnswerDetail,
  getCurrentUserAndWeekAnswer,
  closeOldAnswers,
  givePoints,
};
