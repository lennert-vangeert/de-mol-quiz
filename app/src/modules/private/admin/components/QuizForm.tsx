import {
  ActionIcon,
  Button,
  Divider,
  Flex,
  Group,
  NumberInput,
  Paper,
  Radio,
  SegmentedControl,
  Stack,
  Switch,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useEffect, useState } from "react";
import {
  createQuiz,
  updateQuiz,
  type Contestant,
  type QuizInput,
} from "@global/api/requests";
import {
  emptyQuestion,
  quizToForm,
  type QuestionDraft,
  type QuizFromApi,
} from "../types";

type Props = {
  editingQuiz: QuizFromApi | null;
  contestants: Contestant[];
  onCreated: (quiz: QuizFromApi) => void;
  onUpdated: (quiz: QuizFromApi) => void;
  onCancel: () => void;
  onError: (message: string) => void;
};

const QuizForm = ({
  editingQuiz,
  contestants,
  onCreated,
  onUpdated,
  onCancel,
  onError,
}: Props) => {
  const [week, setWeek] = useState<number>(1);
  const [questions, setQuestions] = useState<QuestionDraft[]>([emptyQuestion()]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editingQuiz) {
      const form = quizToForm(editingQuiz);
      setWeek(form.week);
      setQuestions(form.questions);
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    } else {
      setWeek(1);
      setQuestions([emptyQuestion()]);
    }
  }, [editingQuiz]);

  const handleSubmit = async () => {
    setSaving(true);
    const payload: QuizInput = {
      week,
      questions: questions.map((q) => ({
        ...q,
        options: q.questionType === "multiple-choice" ? q.options : [],
        isMoleQuestion: q.isMoleQuestion,
      })),
    };
    try {
      if (editingQuiz) {
        const res = await updateQuiz(editingQuiz._id, payload);
        onUpdated(res.data as QuizFromApi);
      } else {
        const res = await createQuiz(payload);
        onCreated(res.data as QuizFromApi);
      }
    } catch {
      onError("Opslaan mislukt. Controleer de velden.");
    } finally {
      setSaving(false);
    }
  };

  const updateQuestion = (idx: number, patch: Partial<QuestionDraft>) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === idx ? { ...q, ...patch } : q))
    );
  };

  const addQuestion = () => setQuestions((prev) => [...prev, emptyQuestion()]);

  const removeQuestion = (idx: number) =>
    setQuestions((prev) => prev.filter((_, i) => i !== idx));

  const updateOption = (qIdx: number, oIdx: number, text: string) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIdx
          ? {
            ...q,
            options: q.options.map((o, j) =>
              j === oIdx ? { ...o, optionText: text } : o
            ),
          }
          : q
      )
    );
  };

  const setCorrectOption = (qIdx: number, oIdx: number) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIdx
          ? {
            ...q,
            options: q.options.map((o, j) => ({
              ...o,
              isCorrect: j === oIdx ? "true" : "false",
            })),
          }
          : q
      )
    );
  };

  const addOption = (qIdx: number) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIdx
          ? {
            ...q,
            options: [...q.options, { optionText: "", isCorrect: "false" }],
          }
          : q
      )
    );
  };

  const prefillWithContestants = (qIdx: number) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIdx
          ? {
            ...q,
            options: contestants.map((c) => ({
              optionText: c.name,
              isCorrect: "false",
            })),
          }
          : q
      )
    );
  };

  const removeOption = (qIdx: number, oIdx: number) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIdx
          ? { ...q, options: q.options.filter((_, j) => j !== oIdx) }
          : q
      )
    );
  };

  return (
    <Paper withBorder p="md">
      <Title order={4} mb="md">
        {editingQuiz ? `Quiz bewerken — Week ${week}` : "Nieuwe quiz"}
      </Title>

      <NumberInput
        label="Week"
        value={week}
        onChange={(v) => setWeek(Number(v))}
        min={1}
        mb="lg"
        w={120}
      />

      <Stack gap="xl">
        {questions.map((q, qIdx) => (
          <Paper key={q.questionId} withBorder p="md">
            <Flex justify="space-between" align="center" mb="sm">
              <Text fw={600}>Vraag {qIdx + 1}</Text>
              {questions.length > 1 && (
                <ActionIcon
                  color="red"
                  variant="light"
                  onClick={() => removeQuestion(qIdx)}
                >
                  ×
                </ActionIcon>
              )}
            </Flex>

            <TextInput
              label="Vraagtekst"
              value={q.questionText}
              onChange={(e) =>
                updateQuestion(qIdx, { questionText: e.currentTarget.value })
              }
              mb="sm"
            />

            <NumberInput
              label="Punten bij correct antwoord"
              value={q.points}
              min={0}
              step={1}
              onChange={(value) =>
                updateQuestion(qIdx, { points: Number(value) || 0 })
              }
              mb="sm"
              w={200}
            />

            <SegmentedControl
              value={q.questionType}
              onChange={(v) =>
                updateQuestion(qIdx, {
                  questionType: v as "multiple-choice" | "open",
                })
              }
              data={[
                { label: "Multiple choice", value: "multiple-choice" },
                { label: "Open vraag", value: "open" },
              ]}
              mb="md"
            />

            <Switch
              label="Wie is de mol vraag"
              checked={q.isMoleQuestion}
              onChange={(e) => {
                const checked = e.currentTarget.checked;
                if (checked) {
                  updateQuestion(qIdx, {
                    isMoleQuestion: true,
                    points: 3,
                    questionType: "multiple-choice",
                    questionText: "Wie is volgens jou de mol?",
                    options: contestants.map((c) => ({
                      optionText: c.name,
                      isCorrect: "false",
                    })),
                  });
                } else {
                  updateQuestion(qIdx, {
                    isMoleQuestion: false,
                    questionText: "",
                    points: 1,
                    options: [
                      { optionText: "", isCorrect: "false" },
                      { optionText: "", isCorrect: "false" },
                    ],
                  });
                }
              }}
              mb="md"
            />

            {q.questionType === "multiple-choice" && (
              <Stack gap="xs">
                <Text size="sm" fw={500}>
                  Opties
                </Text>
                {q.options.map((opt, oIdx) => (
                  <Flex key={oIdx} gap="sm" align="center">
                    <Radio
                      checked={opt.isCorrect === "true"}
                      onChange={() => setCorrectOption(qIdx, oIdx)}
                      label=""
                      title="Correct antwoord"
                    />
                    <TextInput
                      placeholder={`Optie ${oIdx + 1}`}
                      value={opt.optionText}
                      onChange={(e) =>
                        updateOption(qIdx, oIdx, e.currentTarget.value)
                      }
                      style={{ flex: 1 }}
                    />
                    {q.options.length > 2 && (
                      <ActionIcon
                        color="red"
                        variant="light"
                        onClick={() => removeOption(qIdx, oIdx)}
                      >
                        ×
                      </ActionIcon>
                    )}
                  </Flex>
                ))}
                <Button
                  size="xs"
                  variant="subtle"
                  onClick={() => addOption(qIdx)}
                  mt="xs"
                >
                  + Optie toevoegen
                </Button>
                {contestants.length > 0 && (
                  <Button
                    size="xs"
                    variant="subtle"
                    onClick={() => prefillWithContestants(qIdx)}
                    mt="xs"
                  >
                    Vul deelnemers in
                  </Button>
                )}
              </Stack>
            )}
          </Paper>
        ))}
      </Stack>

      <Button variant="subtle" mt="md" onClick={addQuestion}>
        + Vraag toevoegen
      </Button>

      <Divider my="lg" />

      <Group>
        <Button onClick={handleSubmit} loading={saving}>
          {editingQuiz ? "Opslaan" : "Aanmaken"}
        </Button>
        {editingQuiz && (
          <Button variant="subtle" onClick={onCancel}>
            Annuleren
          </Button>
        )}
      </Group>
    </Paper>
  );
};

export default QuizForm;
