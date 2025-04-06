import express from 'express';
import { createQuiz, getQuizById } from './Quiz.controller';

const router = express.Router();

router.get("/quizs/:id", getQuizById)
router.post("/quizs", createQuiz)

export default router;