import express from 'express';
import { createQuiz, getQuizById } from './Quiz.controller';

const router = express.Router();

router.get("/quiz/:id", getQuizById)
router.post("/quiz", createQuiz)

export default router;