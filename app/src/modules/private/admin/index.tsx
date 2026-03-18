import {
  Box,
  Button,
  Center,
  Flex,
  Group,
  Loader,
  NumberInput,
  Paper,
  Radio,
  SegmentedControl,
  SimpleGrid,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
  ActionIcon,
  Divider,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { useState, useEffect } from "react";
import {
  getAllQuizzes,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getAdminScoreBoard,
  getContestants,
  getConfig,
  updateConfig,
  type QuizInput,
  type AdminScoreBoardEntry,
  type Contestant,
} from "@global/api/requests";

type QuizFromApi = QuizInput & { _id: string };

type QuestionDraft = {
  questionId: string;
  questionText: string;
  questionType: "multiple-choice" | "open";
  options: { optionText: string; isCorrect: string }[];
};

const emptyQuestion = (): QuestionDraft => ({
  questionId: crypto.randomUUID(),
  questionText: "",
  questionType: "multiple-choice",
  options: [
    { optionText: "", isCorrect: "false" },
    { optionText: "", isCorrect: "false" },
  ],
});

const quizToForm = (
  quiz: QuizFromApi
): { week: number; questions: QuestionDraft[] } => ({
  week: quiz.week,
  questions: quiz.questions.map((q) => ({
    questionId: q.questionId,
    questionText: q.questionText,
    questionType: q.questionType,
    options:
      q.options && q.options.length > 0
        ? q.options
        : [
          { optionText: "", isCorrect: "false" },
          { optionText: "", isCorrect: "false" },
        ],
  })),
});

const getMedal = (rank: number): string | number => {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return rank;
};

type ScoreTableProps = {
  title: string;
  entries: AdminScoreBoardEntry[];
};

const ScoreTable = ({ title, entries }: ScoreTableProps) => {
  const sorted = [...entries].sort((a, b) => b.score - a.score);

  let lastScore: number | null = null;
  let currentRank = 0;

  return (
    <Paper withBorder p="md">
      <Title order={4} mb="md">
        {title}
      </Title>
      {sorted.length === 0 ? (
        <Text c="dimmed">Geen scores.</Text>
      ) : (
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th />
              <Table.Th>Naam</Table.Th>
              <Table.Th>Score</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {sorted.map((entry) => {
              if (entry.score !== lastScore) {
                currentRank += 1;
                lastScore = entry.score;
              }
              return (
                <Table.Tr key={entry._id}>
                  <Table.Td>{getMedal(currentRank)}</Table.Td>
                  <Table.Td>{entry.name}</Table.Td>
                  <Table.Td>{entry.score}</Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      )}
    </Paper>
  );
};

const AdminPage = () => {
  const [quizzes, setQuizzes] = useState<QuizFromApi[]>([]);
  const [scoreBoard, setScoreBoard] = useState<AdminScoreBoardEntry[]>([]);
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [currentWeek, setCurrentWeek] = useState<number>(1);
  const [savingWeek, setSavingWeek] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [week, setWeek] = useState<number>(1);
  const [questions, setQuestions] = useState<QuestionDraft[]>([
    emptyQuestion(),
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [quizRes, scoreRes, contestantRes, configRes] = await Promise.all([
          getAllQuizzes(),
          getAdminScoreBoard(),
          getContestants(),
          getConfig(),
        ]);
        setQuizzes((quizRes.data as QuizFromApi[]) ?? []);
        setScoreBoard(scoreRes);
        setContestants(contestantRes);
        setCurrentWeek(configRes.week);
      } catch {
        setError("Kon data niet laden.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSaveWeek = async () => {
    setSavingWeek(true);
    try {
      await updateConfig({ week: currentWeek });
    } catch {
      setError("Week opslaan mislukt.");
    } finally {
      setSavingWeek(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setWeek(1);
    setQuestions([emptyQuestion()]);
  };

  const handleEdit = (quiz: QuizFromApi) => {
    const form = quizToForm(quiz);
    setEditingId(quiz._id);
    setWeek(form.week);
    setQuestions(form.questions);
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  };

  const handleDelete = (quiz: QuizFromApi) => {
    modals.openConfirmModal({
      title: `Quiz week ${quiz.week} verwijderen?`,
      children: (
        <Text size="sm">
          Ben je zeker dat je de quiz voor week {quiz.week} wilt verwijderen?
          Dit kan niet ongedaan worden.
        </Text>
      ),
      labels: { confirm: "Verwijderen", cancel: "Annuleren" },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        try {
          await deleteQuiz(quiz._id);
          setQuizzes((prev) => prev.filter((q) => q._id !== quiz._id));
        } catch {
          setError("Verwijderen mislukt.");
        }
      },
    });
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    const payload: QuizInput = {
      week,
      questions: questions.map((q) => ({
        ...q,
        options: q.questionType === "multiple-choice" ? q.options : [],
      })),
    };
    try {
      if (editingId) {
        const res = await updateQuiz(editingId, payload);
        const updated = res.data as QuizFromApi;
        setQuizzes((prev) =>
          prev.map((q) => (q._id === editingId ? updated : q))
        );
      } else {
        const res = await createQuiz(payload);
        const created = res.data as QuizFromApi;
        setQuizzes((prev) => [created, ...prev]);
      }
      resetForm();
    } catch {
      setError("Opslaan mislukt. Controleer de velden.");
    } finally {
      setSaving(false);
    }
  };

  const updateQuestion = (idx: number, patch: Partial<QuestionDraft>) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === idx ? { ...q, ...patch } : q))
    );
  };

  const addQuestion = () =>
    setQuestions((prev) => [...prev, emptyQuestion()]);

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

  if (loading) {
    return (
      <Center mih="80vh">
        <Loader />
      </Center>
    );
  }

  const privateEntries = scoreBoard.filter((e) => e.type === "private");
  const corporateEntries = scoreBoard.filter((e) => e.type === "corporate");

  return (
    <Box p="2rem" maw="60rem" mx="auto">
      <Title order={2} mb="xl">
        Admin
      </Title>

      {error && (
        <Text c="red" mb="md">
          {error}
        </Text>
      )}

      {/* Current week */}
      <Paper withBorder p="md" mb="xl">
        <Title order={4} mb="md">
          Huidige week
        </Title>
        <Group align="flex-end">
          <NumberInput
            label="Week"
            value={currentWeek}
            onChange={(v) => setCurrentWeek(Number(v))}
            min={0}
            w={120}
          />
          <Button onClick={handleSaveWeek} loading={savingWeek}>
            Opslaan
          </Button>
        </Group>
      </Paper>

      {/* Scoreboards */}
      <Title order={4} mb="md">
        Scoreborden
      </Title>
      <SimpleGrid cols={{ base: 1, md: 2 }} mb="xl">
        <ScoreTable title="Privé" entries={privateEntries} />
        <ScoreTable title="Codifly" entries={corporateEntries} />
      </SimpleGrid>

      {/* Contestants */}
      <Paper withBorder p="md" mb="xl">
        <Title order={4} mb="md">
          Deelnemers
        </Title>
        {contestants.length === 0 ? (
          <Text c="dimmed">Geen deelnemers gevonden.</Text>
        ) : (
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Naam</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {contestants.map((c) => (
                <Table.Tr key={c._id}>
                  <Table.Td>{c.name}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Paper>

      <Divider mb="xl" />

      {/* Quiz list */}
      <Paper withBorder p="md" mb="xl">
        <Title order={4} mb="md">
          Bestaande quizzen
        </Title>
        {quizzes.length === 0 ? (
          <Text c="dimmed">Nog geen quizzen.</Text>
        ) : (
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Week</Table.Th>
                <Table.Th>Vragen</Table.Th>
                <Table.Th />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {quizzes.map((quiz) => (
                <Table.Tr key={quiz._id}>
                  <Table.Td>Week {quiz.week}</Table.Td>
                  <Table.Td>{quiz.questions.length} vragen</Table.Td>
                  <Table.Td>
                    <Group gap="xs" justify="flex-end">
                      <Button
                        size="xs"
                        variant="light"
                        onClick={() => handleEdit(quiz)}
                      >
                        Bewerken
                      </Button>
                      <Button
                        size="xs"
                        color="red"
                        variant="light"
                        onClick={() => handleDelete(quiz)}
                      >
                        Verwijderen
                      </Button>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Paper>

      {/* Quiz form */}
      <Paper withBorder p="md">
        <Title order={4} mb="md">
          {editingId ? `Quiz bewerken — Week ${week}` : "Nieuwe quiz"}
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
            {editingId ? "Opslaan" : "Aanmaken"}
          </Button>
          {editingId && (
            <Button variant="subtle" onClick={resetForm}>
              Annuleren
            </Button>
          )}
        </Group>
      </Paper>
    </Box>
  );
};

export default AdminPage;
