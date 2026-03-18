import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { AuthRequest } from "../../middleware/auth/authMiddleware";
import notFoundError from "../../middleware/error/NothingFoundError";
import Quiz from "../Quiz/Quiz.model";
import ConfigModel from "../Config/Config.model";
import answerModel from "./Answer.model";
import UserModel from "../Users/User.model";
import { sendMail } from "../../mail/sendMail";
import { generateNewSubmissionEmail } from "../../mail/mails/newSubmission";
import { generateConfirmSubmissionEmail } from "../../mail/mails/confirmSubmission";

// ——————————————
// Helper: get the active week from Config DB
// ——————————————
const getActiveWeek = async (): Promise<number> => {
  const config = await ConfigModel.findOne({});
  return config?.week ?? 0;
};

// ——————————————
// Zod schema for incoming AnswerBody
// isCorrect / pointsAwarded / totalScore are NOT accepted from client — computed server-side
// ——————————————
const AnswerBodySchema = z.object({
  quizId: z.string(),
  userId: z.string(),
  answers: z
    .array(z.object({ questionId: z.string(), userAnswer: z.string() }))
    .min(1, { message: "At least one answer is required" }),
});

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
      .findOne({ quizId: id, userId: user._id })
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
// Controller: create a new answer with server-side scoring
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

    // 5) Compute scoring server-side
    const scoredAnswers = body.answers.map((submitted) => {
      const question = quiz.questions.find(
        (q) => q.questionId === submitted.questionId
      );
      let isCorrect = false;
      let pointsAwarded = 0;
      if (question?.questionType === "multiple-choice") {
        const matched = question.options?.find(
          (o) => o.optionText === submitted.userAnswer
        );
        isCorrect = matched?.isCorrect === "true";
        pointsAwarded = isCorrect ? 1 : 0;
      }
      return { ...submitted, isCorrect, pointsAwarded };
    });
    const totalScore = scoredAnswers.reduce(
      (sum, a) => sum + a.pointsAwarded,
      0
    );

    // 6) Persist the new answer
    const answer = new answerModel({
      quizId: body.quizId,
      userId: user._id,
      userName: user.name,
      answers: scoredAnswers,
      totalScore,
      closed: false,
    });
    const result = await answer.save();

    // 7) Update user's total score
    const dbUser = await UserModel.findById(user._id);
    if (!dbUser) {
      throw new notFoundError("User not found");
    }
    dbUser.score += totalScore;
    await dbUser.save();

    // 8) Respond & fire off emails
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
    const currentWeek = await getActiveWeek();
    const currentWeekQuiz = await Quiz.findOne({ week: currentWeek });
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
    const currentWeek = await getActiveWeek();
    const currentWeekQuiz = await Quiz.findOne({ week: currentWeek });
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
  const person = "Alexy";
  const priceMoney = 27910;
  const priceMoneyPoints = 2;
  const eliminationPoints = 5;

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
// givePoints()

export const checkMoleAnswers = async () => {
  const mole = "sarah";
  const points = 3;

  const answers = await answerModel.find({});
  if (answers.length === 0) {
    console.log("No answers found.");
    return;
  }

  for (const ansDoc of answers) {
    const moleGuess = ansDoc.answers[5]?.userAnswer.toLowerCase();
    if (moleGuess === mole) {
      const user = await UserModel.findById(ansDoc.userId);
      if (!user) {
        console.log(
          `⚠️  Couldn't find user ${ansDoc.userId} for answer ${ansDoc._id}`
        );
        continue;
      }
      user.score = (user.score || 0) + points;
      await user.save();
      console.log(`${user.name} got ${points} points (correct mole guess)`);
    }
  }

  console.log("✅  All mole-guesses have been checked.");
};
// checkMoleAnswers();

export {
  createAnswer,
  getAnswerDetail,
  getCurrentUserAndWeekAnswer,
  closeOldAnswers,
  givePoints,
};
