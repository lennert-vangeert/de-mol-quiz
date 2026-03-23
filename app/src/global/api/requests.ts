import { API, TOKEN } from "./auth";

export const getCurrentQuiz = async () => {
  return await API.get("quiz", {
    headers: {
      authorization: `Bearer ${TOKEN}`,
    },
  });
}

type answerInput = {
  quizId: string | undefined;
  userId: string;
  answers: {
    questionId: string;
    userAnswer: string;
    isCorrect: boolean;
    pointsAwarded: number;
  }[];
  totalScore: number;
};

export type AdminQuizAnswer = {
  _id: string;
  userId: string;
  userName?: string;
  answers: {
    questionId: string;
    userAnswer: string;
    isCorrect: boolean;
    pointsAwarded: number;
  }[];
  totalScore: number;
  createdAt: string;
};

export const sendAnswer = async (answer: answerInput) => {
  await API.post("answers", answer, {
    headers: {
      authorization: `Bearer ${TOKEN}`,
    },
  });
};

export const checkForAnswer = async (): Promise<{
  hasUserSubmitted: boolean;
}> => {
  const response = (await API.get("answers/check", {
    headers: {
      authorization: `Bearer ${TOKEN}`,
    },
  })) as {
    data: { hasUserSubmitted: boolean };
  };

  return response.data; // THIS is the object with hasUserSubmitted
};

export type QuizInput = {
  week: number;
  questions: {
    questionId: string;
    questionText: string;
    points: number;
    questionType: "multiple-choice" | "open";
    options?: { optionText: string; isCorrect: string }[];
  }[];
};

export const getAllQuizzes = async () => {
  const response = await API.get("quiz/all", {
    headers: { authorization: `Bearer ${TOKEN}` },
  });
  return response;
};

export const createQuiz = async (data: QuizInput) => {
  const response = await API.post("quiz", data, {
    headers: { authorization: `Bearer ${TOKEN}` },
  });
  return response;
};

export const updateQuiz = async (id: string, data: QuizInput) => {
  const response = await API.put(`quiz/${id}`, data, {
    headers: { authorization: `Bearer ${TOKEN}` },
  });
  return response;
};

export const deleteQuiz = async (id: string) => {
  const response = await API.delete(`quiz/${id}`, {
    headers: { authorization: `Bearer ${TOKEN}` },
  });
  return response;
};

export type scoreBoardOutput = {
  _id: string;
  name: string;
  score: number;
};

export type AdminScoreBoardEntry = {
  _id: string;
  name: string;
  score: number;
  type: "private" | "corporate";
};

export const getAdminScoreBoard = async (): Promise<AdminScoreBoardEntry[]> => {
  const response = await API.get<AdminScoreBoardEntry[]>("scoreBoard/all", {
    headers: { authorization: `Bearer ${TOKEN}` },
  });
  return response.data;
};

export type Contestant = { _id: string; name: string };

export const getContestants = async (): Promise<Contestant[]> => {
  const response = await API.get<Contestant[]>("contestants", {
    headers: { authorization: `Bearer ${TOKEN}` },
  });
  return response.data;
};

export type AppConfig = { week: number; season: number };

export const getConfig = async (): Promise<AppConfig> => {
  const response = await API.get<AppConfig>("config", {
    headers: { authorization: `Bearer ${TOKEN}` },
  });
  return response.data;
};

export const getQuizAnswersForAdmin = async (
  quizId: string
): Promise<AdminQuizAnswer[]> => {
  const response = await API.get<AdminQuizAnswer[]>(`answers/quiz/${quizId}`, {
    headers: { authorization: `Bearer ${TOKEN}` },
  });
  return response.data;
};

export const updateConfig = async (data: Partial<AppConfig>): Promise<AppConfig> => {
  const response = await API.put<AppConfig>("config", data, {
    headers: { authorization: `Bearer ${TOKEN}` },
  });
  return response.data;
};

export const getScoreBoard = async (): Promise<scoreBoardOutput[]> => {
  const response = (await API.get("scoreboard", {
    headers: {
      authorization: `Bearer ${TOKEN}`,
    },
  })) as { data: scoreBoardOutput[] };
  return response.data;
};
