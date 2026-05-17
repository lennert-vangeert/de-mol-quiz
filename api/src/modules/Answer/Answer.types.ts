import { Document, ObjectId } from "mongoose";

export type Answer = Document & {
  _id?: ObjectId;
  quizId: ObjectId;
  userId: ObjectId;
  userName?: string;
  answers: {
    questionId: string;
    userAnswer: string;
    isCorrect: boolean;
    pointsAwarded: number;
  }[];
  totalScore: number;
  closed: boolean;
  season: number;
};
