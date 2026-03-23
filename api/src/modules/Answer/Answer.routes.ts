import { Router } from "express";
import {
  createAnswer,
  getAnswerDetail,
  getAnswersForQuiz,
  getCurrentUserAndWeekAnswer,
} from "./Answer.controller";

const router: Router = Router();

router.get("/answers/check", getCurrentUserAndWeekAnswer);
router.post("/answers", createAnswer);
router.get("/answers/quiz/:quizId", getAnswersForQuiz);
router.get("/answers/:id", getAnswerDetail);

export default router;
