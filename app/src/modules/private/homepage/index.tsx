import {
  Box,
  Button,
  Center,
  CheckIcon,
  Group,
  Loader,
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
import classes from "./homepage.module.css";

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

const Homepage = () => {
  const [quiz, setQuiz] = React.useState<Quiz | null>(null);
  const [isSubmitted, setIsSubmitted] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(true);
  // Store correct answers in a ref to keep them out of the rendered state.
  const answerKeyRef = React.useRef<{ [questionId: string]: string }>({});

  // Initialize the Mantine form with dynamic keys.
  const form = useForm<{ [key: string]: string }>({
    initialValues: {},
  });

  React.useEffect(() => {
    // Async function to check submission status.
    const checkSubmissionStatus = async () => {
      try {
        const response = await checkForAnswer();
        console.log("Submission response:", response);
        if (response.hasUserSubmitted === true) {
          setIsSubmitted(true);
        }
      } catch (error) {
        console.error("Error checking for answer submission:", error);
      }
    };

    // Async function to fetch quiz data.
    const fetchQuiz = async () => {
      try {
        const response = await getCurrentQuiz();
        const rawQuiz: Quiz = response?.data;
        if (rawQuiz) {
          const safeQuiz: Quiz = {
            _id: rawQuiz._id,
            week: rawQuiz.week,
            questions: rawQuiz.questions.map((q) => {
              if (q.questionType === "multiple-choice" && q.options) {
                // Identify the correct option and store it (without exposing it later).
                const correctOption = q.options.find(
                  (o) => o.isCorrect === "true"
                );
                if (correctOption) {
                  answerKeyRef.current[q.questionId] = correctOption.optionText;
                }
                // Remove the isCorrect property for display.
                const safeOptions = q.options.map((o) => ({
                  optionText: o.optionText,
                }));
                return { ...q, options: safeOptions };
              } else if (q.questionType === "open") {
                if (q.correctAnswer) {
                  answerKeyRef.current[q.questionId] = q.correctAnswer;
                }
                // Strip out correctAnswer before setting state.
                const { correctAnswer, ...rest } = q;
                return rest;
              }
              return q;
            }),
          };

          setQuiz(safeQuiz);

          // Initialize form values for each question as empty strings.
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

    // Wait for both the quiz and the submission status to finish loading.
    const loadData = async () => {
      await Promise.all([fetchQuiz(), checkSubmissionStatus()]);
      setLoading(false);
    };

    loadData();
    // Only run on mount.
  }, []);


  const handleSubmit = form.onSubmit((values) => {
    let totalScore = 0;
    const answers =
      quiz?.questions.map((q) => {
        const userAnswer = values[q.questionId] || "";
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

    // Build payload.
    const answerPayload = {
      quizId: quiz?._id,
      userId: USERID,
      answers,
      totalScore,
    };
    setIsSubmitted(true);
    sendAnswer(answerPayload);
  });

  // Render a loader until both data and submission status are loaded.
  if (loading) {
    return (
      <Center p="2rem">
        <Loader />
      </Center>
    );
  }
  return (
    <>
      <Head
        title="De Mol Quiz"
        description="Weekly quiz for De Mol"
        SEODisabled
      />
      {!isSubmitted ? (
        <Center mih="80vh" p="2rem" className={classes.background}>
          <Box p="md" w="100%" maw="45rem">
            {quiz ? (
              <>
                <Title className={classes.neontitle} order={2} mb="md">
                  De Mol Quiz - Week {quiz.week}
                </Title>
                <form onSubmit={handleSubmit}>
                  {quiz.questions.map((q) => (
                    <Box key={q.questionId} style={{ marginBottom: "1.5rem" }}>
                      <Title mt="2rem" mb="1rem" order={4}>
                        {q.questionText}
                      </Title>
                      {q.questionType === "multiple-choice" && q.options ? (
                        <Radio.Group
                          name={q.questionId}
                          value={form.values[q.questionId]}
                          onChange={(value) =>
                            form.setFieldValue(q.questionId, value)
                          }
                        >
                          {q.options.map((option, idx) => (
                            <Radio
                              icon={CheckIcon}
                              mt="1rem"
                              key={idx}
                              value={option.optionText}
                              label={option.optionText}
                            />
                          ))}
                        </Radio.Group>
                      ) : (
                        <TextInput {...form.getInputProps(q.questionId)} />
                      )}
                    </Box>
                  ))}
                  <Group>
                    <Button type="submit">Doorsturen</Button>
                  </Group>
                </form>
              </>
            ) : (
              <Text>No quiz available.</Text>
            )}
          </Box>
        </Center>
      ) : (
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
