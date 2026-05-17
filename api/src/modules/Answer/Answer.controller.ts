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
// Zod schema for incoming AnswerBody
// isCorrect / pointsAwarded / totalScore are NOT accepted from client — computed server-side
// ——————————————
const MoleCalculationSchema = z.object({
  mole: z.string(),
  function: z.enum(['read', 'submit'])
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

const getMoleCalculation = async (
  req: Request,
  res: Response,
) => {
  const POINTS_AWARDED = 3
  // 1) Validate the incoming body
  const parseResult = MoleCalculationSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ errors: parseResult.error.errors });
  }
  const body = parseResult.data;
  const callFunction = body.function

  // 2) Grab authenticated user
  const { user } = req as AuthRequest;

  if (user.role !== "ADMIN")
    return res.status(403).json({ message: "Forbidden" });

  // 3) Get all users and their old scores

  const users = await UserModel.find({})

  const oldUserScores = users.map((user) => {
    return {
      _id: user._id,
      name: user.name,
      oldScore: user.score
    }
  }
  )

  // 4) Get all answers

  const answers = await answerModel.find({});
  if (answers.length === 0) {
    throw new notFoundError("No answers found")
  }

  // Batch-load every quiz referenced by these answers so we can resolve the
  // mole question per answer without N+1 round-trips.
  const quizIds = [...new Set(answers.map((a) => String(a.quizId)))];
  const quizzes = await Quiz.find({ _id: { $in: quizIds } }).lean();
  const quizById = new Map(quizzes.map((q) => [String(q._id), q]));

  const targetMole = body.mole.trim().toLowerCase();

  const quizzesWithMole = quizzes.filter((q) =>
    q.questions.some((qq) => qq.isMoleQuestion)
  ).length;
  logger.info("Mole calculation diagnostic", {
    targetMole,
    totalAnswers: answers.length,
    totalQuizzes: quizzes.length,
    quizzesWithMoleQuestion: quizzesWithMole,
  });

  const hitsByUserId = new Map<string, number>();
  let consideredAnswers = 0;
  let guessesSeen: string[] = [];

  for (const answer of answers) {
    const quiz = quizById.get(String(answer.quizId));
    if (!quiz) continue;

    const moleQuestion = quiz.questions.find((q) => q.isMoleQuestion);
    if (!moleQuestion) continue;

    const moleSubmission = answer.answers.find(
      (a) => a.questionId === moleQuestion.questionId
    );
    if (!moleSubmission) continue;

    consideredAnswers++;
    const guessed = moleSubmission.userAnswer.trim().toLowerCase();
    guessesSeen.push(guessed);
    if (guessed !== targetMole) continue;

    const userId = String(answer.userId);
    hitsByUserId.set(userId, (hitsByUserId.get(userId) ?? 0) + 1);
  }

  if (callFunction === "submit") {
    for (const [userId, hits] of hitsByUserId) {
      if (hits === 0) continue;
      await UserModel.updateOne(
        { _id: userId },
        { $inc: { score: hits * POINTS_AWARDED } }
      );
    }
  }

  logger.info("Mole calculation result", {
    consideredAnswers,
    matchedUsers: hitsByUserId.size,
    totalHits: [...hitsByUserId.values()].reduce((s, n) => s + n, 0),
    sampleGuesses: guessesSeen.slice(0, 10),
  });

  // 5) Formulate response array
  const response = oldUserScores.map((u) => {
    const hits = hitsByUserId.get(String(u._id)) ?? 0;
    return {
      user: {
        _id: u._id,
        name: u.name,
      },
      oldScore: u.oldScore,
      newScore: u.oldScore + hits * POINTS_AWARDED,
    };
  });

  res.json(response.filter((user) => user.oldScore !== 0 && user.newScore !== 0)
  );
}

export {
  createAnswer,
  getAnswerDetail,
  getAnswersForQuiz,
  getCurrentUserAndWeekAnswer,
  getMoleCalculation
};
