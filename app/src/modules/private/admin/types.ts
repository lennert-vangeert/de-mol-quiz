import type { QuizInput } from "@global/api/requests";

export type QuizFromApi = QuizInput & { _id: string };

export type QuestionDraft = {
  questionId: string;
  questionText: string;
  points: number;
  questionType: "multiple-choice" | "open";
  options: { optionText: string; isCorrect: string }[];
  isMoleQuestion: boolean;
};

export const emptyQuestion = (): QuestionDraft => ({
  questionId: crypto.randomUUID(),
  questionText: "",
  points: 1,
  questionType: "multiple-choice",
  options: [
    { optionText: "", isCorrect: "false" },
    { optionText: "", isCorrect: "false" },
  ],
  isMoleQuestion: false,
});

export const quizToForm = (
  quiz: QuizFromApi
): { week: number; questions: QuestionDraft[] } => ({
  week: quiz.week,
  questions: quiz.questions.map((q) => ({
    questionId: q.questionId,
    questionText: q.questionText,
    points: q.points ?? 1,
    questionType: q.questionType,
    options:
      q.options && q.options.length > 0
        ? q.options
        : [
          { optionText: "", isCorrect: "false" },
          { optionText: "", isCorrect: "false" },
        ],
    isMoleQuestion: q.isMoleQuestion ?? false,
  })),
});
