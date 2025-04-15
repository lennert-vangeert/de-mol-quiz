import {
  Button,
  Center,
  Group,
  Paper,
  Radio,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import * as React from "react";
import { useForm } from "@mantine/form";
import Head from "@global/head";
import {
  getCurrentQuiz,
  sendAnswer,
  checkForAnswer,
} from "@global/api/requests";
import { TOKEN, USERID } from "@global/api/auth";

export type Quiz = {
  _id: string;
  week: number;
  questions: {
    questionId: string;
    questionText: string;
    questionType: "multiple-choice" | "open";
    // For multiple-choice questions we'll receive options with the secret isCorrect flag,
    // but we'll remove it before rendering.
    options?: {
      isCorrect?: string; // might be present in the raw quiz data
      optionText: string;
    }[];
    // For open questions, the raw quiz data might include a correctAnswer property which we will hide.
    correctAnswer?: string;
  }[];
};
console.log(TOKEN);
const Homepage = () => {
  const [quiz, setQuiz] = React.useState<Quiz | null>(null);
  const [isSubmitted, setIsSubmitted] = React.useState<boolean>(false);
  // We'll store the answer key in a ref so it doesn't appear in React state for rendering.
  const answerKeyRef = React.useRef<{ [questionId: string]: string }>({});

  // Initialize the Mantine form with dynamic keys.
  // We'll update these initial values once the quiz is loaded.
  const form = useForm<{ [key: string]: string }>({
    initialValues: {},
  });

  React.useEffect(() => {
    // Renamed the inner function to avoid collision with the imported checkForAnswer
    const checkSubmissionStatus = async () => {
      try {
        const response = await checkForAnswer();
        console.log(response);
        if (response.hasUserSubmitted === true) {
          setIsSubmitted(true);
        }
      } catch (error) {
        console.error("Error checking for answer submission:", error);
      }
    };
    checkSubmissionStatus();

    const fetchQuiz = async () => {
      try {
        const response = await getCurrentQuiz();
        const rawQuiz: Quiz = response?.data;
        if (rawQuiz) {
          // Process raw quiz data:
          // - Save the correct answers in answerKeyRef.
          // - Remove sensitive information from the quiz before setting state.
          const safeQuiz: Quiz = {
            _id: rawQuiz._id,
            week: rawQuiz.week,
            questions: rawQuiz.questions.map((q) => {
              if (q.questionType === "multiple-choice" && q.options) {
                // Find the correct answer in options.
                const correctOption = q.options.find(
                  (o) => o.isCorrect === "true"
                );
                if (correctOption) {
                  answerKeyRef.current[q.questionId] = correctOption.optionText;
                }
                // Remove the isCorrect property from options for display.
                const safeOptions = q.options.map((o) => ({
                  optionText: o.optionText,
                }));
                return { ...q, options: safeOptions };
              } else if (q.questionType === "open") {
                // For open questions, assume there's a hidden correctAnswer property.
                if (q.correctAnswer) {
                  answerKeyRef.current[q.questionId] = q.correctAnswer;
                }
                // Remove the correctAnswer property before sending to UI.
                const { correctAnswer, ...rest } = q;
                return rest;
              }
              return q;
            }),
          };

          // Set the quiz state with the safe version that doesn't expose answers.
          setQuiz(safeQuiz);

          // Initialize form values for each question with an empty string.
          const initValues: { [key: string]: string } = {};
          safeQuiz.questions.forEach((question) => {
            initValues[question.questionId] = "";
          });
          form.setValues(initValues);
        }
      } catch (error) {
        console.error("Error fetching quiz:", error);
      }
    };

    fetchQuiz();
    // Run this effect only once on mount.
  }, []);

  const handleSubmit = form.onSubmit((values) => {
    let totalScore = 0;
    // Map each question to an answer object.
    const answers =
      quiz?.questions.map((q) => {
        const userAnswer = values[q.questionId] || "";
        // Compare (case-insensitive, trimmed) with the correct answer stored in answerKeyRef.
        const correctAnswer = answerKeyRef.current[q.questionId] || "";
        const isCorrect =
          userAnswer.trim().toLowerCase() ===
          correctAnswer.trim().toLowerCase();
        const pointsAwarded = isCorrect ? 1 : 0;
        if (isCorrect) totalScore += 1;
        return {
          questionId: q.questionId,
          userAnswer,
          isCorrect,
          pointsAwarded,
        };
      }) || [];

    // Build the answer payload according to your Answer type.
    // Replace the placeholders with actual quiz and user id values if available.
    const answerPayload = {
      quizId: quiz?._id, // e.g., quiz._id if your API returns it
      userId: USERID, // substitute with the current logged in user id
      answers,
      totalScore,
    };
    setIsSubmitted(true);
    // Send the computed answers to the API.
    sendAnswer(answerPayload);
  });

  return (
    <>
      <Head
        title="De Mol Quiz"
        description="Weekly quiz for De Mol"
        SEODisabled
      />
      {!isSubmitted && (
        <Center style={{ padding: "2rem" }}>
          <Paper
            shadow="xl"
            withBorder
            p="md"
            style={{ width: "100%", maxWidth: 600 }}
          >
            <Title order={2} mb="md">
              De Mol Quiz - Week {quiz?.week}
            </Title>
            {quiz ? (
              <form onSubmit={handleSubmit}>
                {quiz.questions.map((q) => (
                  <div key={q.questionId} style={{ marginBottom: "1.5rem" }}>
                    <Title order={4}>{q.questionText}</Title>
                    {q.questionType === "multiple-choice" && q.options ? (
                      // Render a radio group for multiple-choice questions.
                      <Radio.Group
                        name={q.questionId}
                        value={form.values[q.questionId]}
                        onChange={(value) =>
                          form.setFieldValue(q.questionId, value)
                        }
                      >
                        {q.options.map((option, idx) => (
                          <Radio
                            key={idx}
                            value={option.optionText}
                            label={option.optionText}
                          />
                        ))}
                      </Radio.Group>
                    ) : (
                      // Render a text input for open questions.
                      <TextInput
                        placeholder="Your answer here"
                        {...form.getInputProps(q.questionId)}
                      />
                    )}
                  </div>
                ))}
                <Group>
                  <Button type="submit">Submit Answers</Button>
                </Group>
              </form>
            ) : (
              <div>Loading quiz...</div>
            )}
          </Paper>
        </Center>
      )}
      {isSubmitted && (
        <Center style={{ padding: "2rem" }}>
          <Paper
            shadow="xl"
            withBorder
            p="md"
            style={{ width: "100%", maxWidth: 600 }}
          >
            <Title order={2} mb="md">
              De Mol Quiz - Week {quiz?.week}
            </Title>
            <Text>De antwoorden zijn opgeslagen.</Text>
          </Paper>
        </Center>
      )}
    </>
  );
};

export default Homepage;
