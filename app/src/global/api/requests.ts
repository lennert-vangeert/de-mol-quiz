import { API, TOKEN } from "./auth";

export const getCurrentQuiz = async () => {
  try {
    const response = await API.get("quiz", {
      headers: {
        authorization: `Bearer ${TOKEN}`,
      },
    });
    return response;
  } catch (error) {
    throw error;
  }
};

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

export const sendAnswer = async (answer: answerInput) => {
  try {
    await API.post("answers", answer, {
      headers: {
        authorization: `Bearer ${TOKEN}`,
      },
    });
  } catch (error) {
    throw error;
  }
};

export const checkForAnswer = async (): Promise<{
  hasUserSubmitted: boolean;
}> => {
  try {
    const response = (await API.get("answers/check", {
      headers: {
        authorization: `Bearer ${TOKEN}`,
      },
    })) as {
      data: { hasUserSubmitted: boolean };
    };

    return response.data; // THIS is the object with hasUserSubmitted
  } catch (error) {
    throw error;
  }
};

export type scoreBoardOutput = {
  _id: string;
  name: string;
  score: number;
};

export const getScoreBoard = async (): Promise<scoreBoardOutput[]> => {
  try {
    const response = (await API.get("scoreboard", {
      headers: {
        authorization: `Bearer ${TOKEN}`,
      },
    })) as { data: scoreBoardOutput[] };
    return response.data;
  } catch (error) {
    throw error;
  }
};
