import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { AuthRequest } from "../../middleware/auth/authMiddleware";
import notFoundError from "../../middleware/error/NothingFoundError";
import Quiz from "../Quiz/Quiz.model";
import ConfigModel from "../Config/Config.model";
import answerModel from "./Answer.model";
import UserModel from "../Users/User.model";
import { logger } from "../../utils/logger";

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

const getAnswersForQuiz = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { user } = req as AuthRequest;
    if (user.role !== "ADMIN") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { quizId } = req.params;

    const quiz = await Quiz.findById(quizId).select("_id").lean();
    if (!quiz) {
      throw new notFoundError("Quiz not found");
    }

    const answers = await answerModel
      .find({ quizId })
      .sort({ createdAt: -1 })
      .select("userId userName answers totalScore createdAt")
      .lean();

    res.json(answers);
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
    const scoredAnswers = body.answers.map((submitted, index) => {
      let question = quiz.questions.find(
        (q) => q.questionId === submitted.questionId
      );

      if (!question) {
        const indexSuffix = `-${index}`;
        if (submitted.questionId.endsWith(indexSuffix)) {
          const normalizedQuestionId = submitted.questionId.slice(
            0,
            -indexSuffix.length
          );
          question = quiz.questions.find(
            (q) => q.questionId === normalizedQuestionId
          );
        }
      }

      let isCorrect = false;
      let pointsAwarded = 0;

      if (question?.questionType === "multiple-choice") {
        const normalizedUserAnswer = submitted.userAnswer.trim().toLowerCase();
        const matched = question.options?.find(
          (o) => o.optionText.trim().toLowerCase() === normalizedUserAnswer
        );
        isCorrect = matched?.isCorrect === "true";
        pointsAwarded = isCorrect ? question.points ?? 1 : 0;
      }

      return {
        ...submitted,
        questionId: question?.questionId ?? submitted.questionId,
        isCorrect,
        pointsAwarded,
      };
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
      logger.info("Closing old answer", { answerId: String(answer._id) });
      answer.closed = true;
      await answer.save();
    }
  } catch (e) {
    logger.error("Failed to close old answers", {
      error: e instanceof Error ? e.message : String(e),
    });
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
    logger.info("No open answers to grade");
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
      logger.warn("User not found for answer", {
        userId: String(ansDoc.userId),
        answerId: String(ansDoc._id),
      });
      continue;
    }
    user.score = (user.score || 0) + points;
    await user.save();

    ansDoc.closed = true;
    await ansDoc.save();

    const reasonText = reasons.length
      ? `(${reasons.join(" & ")})`
      : "(no points awarded)";
    logger.info("Bonus points awarded", {
      userName: user.name,
      points,
      reason: reasonText,
    });
  }

  logger.info("All open answers have been graded and closed");
};
// givePoints()

export const checkMoleAnswers = async () => {
  const mole = "sarah";
  const points = 3;

  const answers = await answerModel.find({});
  if (answers.length === 0) {
    logger.info("No answers found for mole check");
    return;
  }

  for (const ansDoc of answers) {
    const moleGuess = ansDoc.answers[5]?.userAnswer.toLowerCase();
    if (moleGuess === mole) {
      const user = await UserModel.findById(ansDoc.userId);
      if (!user) {
        logger.warn("User not found for mole answer", {
          userId: String(ansDoc.userId),
          answerId: String(ansDoc._id),
        });
        continue;
      }
      user.score = (user.score || 0) + points;
      await user.save();
      logger.info("Mole bonus awarded", {
        userName: user.name,
        points,
      });
    }
  }

  logger.info("All mole-guesses have been checked");
};
// checkMoleAnswers();

export {
  createAnswer,
  getAnswerDetail,
  getAnswersForQuiz,
  getCurrentUserAndWeekAnswer,
  closeOldAnswers,
  givePoints,
};
