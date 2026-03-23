import mongoose from "mongoose";
import validateModel from "../../validation/validateModel";
import { Quiz } from "./Quiz.types";

const quizSchema = new mongoose.Schema<Quiz>(
  {
    week: { type: Number, required: true },
    questions: [
      {
        questionId: { type: String, required: true },
        questionText: { type: String, required: true },
        points: { type: Number, required: true, default: 1, min: 0 },
        questionType: {
          type: String,
          enum: ["multiple-choice", "open"],
          required: true,
        },
        options: [
          {
            isCorrect: { type: String, required: true },
            optionText: { type: String, required: true },
          },
        ],
      },
    ],
  },
  {
    timestamps: true,
  }
);

//date format
// YYYY-MM-DD

quizSchema.pre("save", function (next) {
  validateModel(this);
  next();
});

quizSchema.pre("deleteOne", { document: true, query: false }, function (next) {
  // noteModel.deleteMany({ quizId: this._id }).exec();
  // expenseModel.deleteMany({ quizId: this._id }).exec();
  // activityModel.deleteMany({ quizId: this._id }).exec();

  next();
});

quizSchema.pre(["findOneAndDelete", "deleteMany"], function (next) {
  const id = this.getFilter()["_id"];
  // noteModel.deleteMany({ quizId: id }).exec();
  // expenseModel.deleteMany({ quizId: id }).exec();
  // activityModel.deleteMany({ quizId: id }).exec();
  next();
});
const Quizmodel = mongoose.model<Quiz>("Quiz", quizSchema);

export default Quizmodel;
