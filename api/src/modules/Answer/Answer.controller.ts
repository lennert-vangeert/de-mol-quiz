import { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";
import { z } from "zod";
import { AuthRequest } from "../../middleware/auth/authMiddleware";
import notFoundError from "../../middleware/error/NothingFoundError";
import Quiz from "../Quiz/Quiz.model";
import answerModel from "./Answer.model";
import UserModel from "../Users/User.model";
import { sendMail } from "../../mail/sendMail";
import { generateNewSubmissionEmail } from "../../mail/mails/newSubmission";
import { generateConfirmSubmissionEmail } from "../../mail/mails/confirmSubmission";

// ——————————————
// Zod schema for incoming AnswerBody
// ——————————————
const AnswerBodySchema = z
  .object({
    quizId: z.string(),
    userId: z.string(),
    answers: z
      .array(
        z.object({
          questionId: z.string(),
          userAnswer: z.string(),
          isCorrect: z.boolean(),
          pointsAwarded: z.number().min(0, { message: "Must be ≥ 0" }),
        })
      )
      .min(1, { message: "At least one answer is required" }),
    totalScore: z.number().min(0, { message: "Must be ≥ 0" }),
  })
  .refine(
    (data) =>
      data.totalScore ===
      data.answers.reduce((sum, a) => sum + a.pointsAwarded, 0),
    {
      message: "totalScore must equal sum of pointsAwarded",
      path: ["totalScore"],
    }
  );
// ——————————————
// Controller: get a single answer detail
// ——————————————
const getAnswerDetail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { user } = req as AuthRequest;
    const { id } = req.params;
    const answer = await answerModel
      .findOne({ quizId: id })
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

// ——————————————
// Controller: create a new answer with Zod validation
// ——————————————
const createAnswer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1) Validate the incoming body
    const parseResult = AnswerBodySchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ errors: parseResult.error.errors });
    }
    const body = parseResult.data;

    // 2) Grab authenticated user
    const { user } = req as AuthRequest;

    // 3) Ensure the quiz exists
    const quiz = await Quiz.findOne({ _id: body.quizId });
    if (!quiz) {
      throw new notFoundError("Quiz not found");
    }

    // 4) Prevent duplicate submission
    const existingAnswer = await answerModel.findOne({
      quizId: body.quizId,
      userId: user._id,
    });
    if (existingAnswer) {
      return res.status(400).json({
        message: "You have already submitted an answer for this quiz",
      });
    }

    // 5) Persist the new answer
    const answer = new answerModel({
      ...body,
      userId: user._id, // override with auth user
      userName: user.name,
      closed: false,
    });
    const result = await answer.save();

    // 6) Update user's total score
    const dbUser = await UserModel.findById(user._id);
    if (!dbUser) {
      throw new notFoundError("User not found");
    }
    dbUser.score += body.totalScore;
    await dbUser.save();

    // 7) Respond & fire off emails
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

// ——————————————
// Controller: check if current user submitted this week
// ——————————————
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
    res.json({ hasUserSubmitted: Boolean(answer) });
  } catch (e) {
    next(e);
  }
};

// ——————————————
// Utility: close out past answers
// ——————————————
const closeOldAnswers = async () => {
  try {
    const currentWeekQuiz = await Quiz.findOne({
      week: process.env.CURRENTWEEK ?? 0,
    });
    if (!currentWeekQuiz) return;
    const answers = await answerModel.find({
      quizId: { $ne: currentWeekQuiz._id },
      closed: false,
    });
    for (const answer of answers) {
      console.log(`Closing answer with id ${answer._id}`);
      answer.closed = true;
      await answer.save();
    }
  } catch (e) {
    console.error("Failed to close old answers:", e);
  }
};

// ——————————————
// Utility: award bonus points & close remaining open answers
// ——————————————
const givePoints = async () => {
  const person = "Nimrod";
  const priceMoney = 20910;
  const priceMoneyPoints = 2;
  const eliminationPoints = 2;

  const answers = await answerModel.find({ closed: false });
  if (answers.length === 0) {
    console.log("No open answers to grade.");
    return;
  }

  const priceMoneyData = answers.map((ansDoc) => {
    const raw = ansDoc.answers[4].userAnswer || "";
    const numericString = raw.replace(/\D/g, "");
    const guess = parseInt(numericString, 10) || 0;
    return {
      ansDoc,
      elimGuess: ansDoc.answers[3].userAnswer,
      diff: Math.abs(guess - priceMoney),
    };
  });

  const minDiff = Math.min(...priceMoneyData.map((r) => r.diff));

  for (const { ansDoc, elimGuess, diff } of priceMoneyData) {
    let points = 0;
    const reasons: string[] = [];

    if (elimGuess === person) {
      points += eliminationPoints;
      reasons.push("correct elimination guess");
    }
    if (diff === minDiff) {
      points += priceMoneyPoints;
      reasons.push("closest prize‑money guess");
    }

    const user = await UserModel.findById(ansDoc.userId);
    if (!user) {
      console.warn(`User ${ansDoc.userId} not found for answer ${ansDoc._id}`);
      continue;
    }
    user.score = (user.score || 0) + points;
    await user.save();

    ansDoc.closed = true;
    await ansDoc.save();

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
