import { API, TOKEN } from "./auth";

export const getCurrentQuiz = async () => {
  try {
    const response = API.get("quiz", {
      headers: {
        authorization: `Bearer ${TOKEN}`,
      },
    });
    return response;
  } catch (e) {
    console.log(e);
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
  console.log(answer);
  try {
    API.post("answers", answer, {
      headers: {
        authorization: `Bearer ${TOKEN}`,
      },
    });
  } catch (e) {
    console.log(e);
  }
};

export const checkForAnswer = async (): Promise<{ hasUserSubmitted: boolean }> => {
  try {
    const response = await API.get("answers/check", {
      headers: {
        authorization: `Bearer ${TOKEN}`,
      },
    });

    return response.data; // THIS is the object with hasUserSubmitted
  } catch (error) {
    throw error; // Let the caller deal with the mess
  }
};
