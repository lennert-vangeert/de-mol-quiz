import express from 'express';
import { createQuiz, getQuizById, getCurrentQuiz } from './Quiz.controller';

const router = express.Router();
router.get("/quiz", getCurrentQuiz)
router.get("/quiz/:id", getQuizById)
router.post("/quiz", createQuiz)

export default router;