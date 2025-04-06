import mongoose from "mongoose";
import validateModel from "../../validation/validateModel";
import { Answer } from "./Answer.types";

const answerSchema = new mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    answers: [
      {
        questionId: {
          type: String,
          required: true,
        },
        userAnswer: {
          type: String,
          required: true,
        },
        isCorrect: {
          type: Boolean,
          required: true,
        },
        pointsAwarded: {
          type: Number,
          required: true,
        },
      },
    ],
    totalScore: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

answerSchema.pre("save", function (next) {
  validateModel(this);
  next();
});
const answerModel = mongoose.model<Answer>("Answer", answerSchema);

export default answerModel;
