import express from 'express';
import { createQuiz, getQuizById, getCurrentQuiz, getAllQuizzes, updateQuiz, deleteQuiz } from './Quiz.controller';

const router = express.Router();
router.get("/quiz/all", getAllQuizzes)
router.get("/quiz", getCurrentQuiz)
router.get("/quiz/:id", getQuizById)
router.post("/quiz", createQuiz)
router.put("/quiz/:id", updateQuiz)
router.delete("/quiz/:id", deleteQuiz)

export default router;