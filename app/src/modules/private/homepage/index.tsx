import {
  Anchor,
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
import { USERID } from "@global/api/auth";
import classes from "./homepage.module.css";

export type Quiz = {
  _id: string;
  week: number;
  questions: {
    questionId: string;
    questionText: string;
    questionType: "multiple-choice" | "open";
    options?: {
      optionText: string;
    }[];
  }[];
};
const Homepage = () => {
  const [quiz, setQuiz] = React.useState<Quiz | null>(null);
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Now keys are composite: `${questionId}-${index}`
  const answerKeyRef = React.useRef<{ [compositeKey: string]: string }>({}); // ← changed

  const form = useForm<{ [key: string]: string }>({
    initialValues: {},
  });

  React.useEffect(() => {
    const checkSubmissionStatus = async () => {
      try {
        const response = await checkForAnswer();
        if (response.hasUserSubmitted) {
          setIsSubmitted(true);
        }
      } catch {
        setError("Er ging iets fout, probeer het opnieuw.");
      }
    };

    const fetchQuiz = async () => {
      try {
        const res = await getCurrentQuiz().catch((e) => {
          if (e.status === 404) {
            setError("Er is nog geen quiz beschikbaar voor deze week.");
            return;
          }
          setError("Er ging iets fout, probeer het opnieuw.");
        });
        const rawQuiz: Quiz = res?.data;
        if (!rawQuiz) return;

        // Build a “safe” quiz + composite keys
        const safeQuiz = {
          _id: rawQuiz._id,
          week: rawQuiz.week,
          questions: rawQuiz.questions.map((q, idx) => {
            const compositeKey = `${q.questionId}-${idx}`; // ← changed

            // pull out the correct answer into answerKeyRef under compositeKey
            if (q.questionType === "multiple-choice" && q.options) {
              const correctOpt = (q as any).options.find(
                (o: any) => o.isCorrect === "true"
              );
              if (correctOpt) {
                answerKeyRef.current[compositeKey] = correctOpt.optionText; // ← changed
              }
              const safeOpts = q.options.map((o) => ({
                optionText: o.optionText,
              }));
              return {
                ...q,
                options: safeOpts,
                questionId: compositeKey, // ← changed (we overwrite questionId here!)
              };
            } else {
              // open question
              if ((q as any).correctAnswer) {
                answerKeyRef.current[compositeKey] = (q as any).correctAnswer; // ← changed
              }
              const { correctAnswer, ...rest } = q as any;
              return {
                ...rest,
                questionId: compositeKey, // ← changed
              };
            }
          }),
        };

        setQuiz(safeQuiz);

        // init form values under each composite key
        const initVals: { [k: string]: string } = {};
        safeQuiz.questions.forEach((q) => {
          initVals[q.questionId] = ""; // ← changed
        });
        form.setValues(initVals);
      } catch {
        setError("Er ging iets fout, probeer het opnieuw.");
      }
    };

    const loadData = async () => {
      await Promise.all([fetchQuiz(), checkSubmissionStatus()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const handleSubmit = form.onSubmit((values) => {
    setLoading(true);
    let totalScore = 0;

    const answers =
      quiz?.questions.map((q) => {
        const userAnswer = values[q.questionId] || "";
        const correctAnswer = answerKeyRef.current[q.questionId] || ""; // ← unchanged usage
        const isCorrect =
          userAnswer.trim().toLowerCase() ===
          correctAnswer.trim().toLowerCase();
        if (isCorrect) totalScore += 1;
        return {
          questionId: q.questionId,
          userAnswer,
          isCorrect,
          pointsAwarded: isCorrect ? 1 : 0,
        };
      }) || [];

    const answerPayload = {
      quizId: quiz!._id,
      userId: USERID,
      answers,
      totalScore,
    };

    sendAnswer(answerPayload)
      .then(() => {
        setIsSubmitted(true);
        setLoading(false);
      })
      .catch(() => {
        setError("Er ging iets fout, probeer het opnieuw.");
        setLoading(false);
      });
  });

  if (loading || error) {
    return (
      <Center mih="80vh" p="2rem" className={classes.background}>
        {loading && <Loader />}
        {error && (
          <Paper shadow="xl" withBorder p="md" style={{ maxWidth: 600 }}>
            <Text>{error}</Text>
            <Anchor component="button" onClick={() => window.location.reload()}>
              Refresh
            </Anchor>
          </Paper>
        )}
      </Center>
    );
  }

  return (
    <>
      <Head title="Quiz" description="Weekly quiz for De Mol" SEODisabled />
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
                    <Box key={q.questionId} mb="1.5rem">
                      <Title mt="2rem" mb="1rem" order={4}>
                        {q.questionText}
                      </Title>
                      {q.questionType === "multiple-choice" && q.options ? (
                        <Radio.Group
                          name={q.questionId} // ← composite key here
                          value={form.values[q.questionId]}
                          onChange={(val) =>
                            form.setFieldValue(q.questionId, val)
                          }
                        >
                          {q.options.map((opt, i) => (
                            <Radio
                              icon={CheckIcon}
                              mt="1rem"
                              key={i}
                              value={opt.optionText}
                              label={opt.optionText}
                              id={`${q.questionId}-opt-${i}`} // ← ensure unique input IDs
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
        <Center p="2rem">
          <Paper shadow="xl" withBorder p="md" style={{ maxWidth: 600 }}>
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
