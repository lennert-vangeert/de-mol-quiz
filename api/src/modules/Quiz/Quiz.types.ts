import { Document, ObjectId } from "mongoose";

export type Quiz = Document & {
  _id?: string;
  week: number;
  questions: [
    {
      questionId: string;
      questionText: string;
      points: number;
      questionType: "multiple-choice" | "open";
      options?: {
        isCorrect: string;
        optionText: string;
      }[];
      isMoleQuestion: boolean;
    }
  ];
};
