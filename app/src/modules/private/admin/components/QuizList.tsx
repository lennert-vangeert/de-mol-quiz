import {
  Accordion,
  Badge,
  Button,
  Center,
  Group,
  Loader,
  Paper,
  Select,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { useState } from "react";
import {
  deleteQuiz,
  getQuizAnswersForAdmin,
  type AdminQuizAnswer,
} from "@global/api/requests";
import type { QuizFromApi } from "../types";

type Props = {
  quizzes: QuizFromApi[];
  onEdit: (quiz: QuizFromApi) => void;
  onDeleted: (quizId: string) => void;
  onError: (message: string) => void;
};

const QuizList = ({ quizzes, onEdit, onDeleted, onError }: Props) => {
  const [answersByQuizId, setAnswersByQuizId] = useState<
    Record<string, AdminQuizAnswer[]>
  >({});
  const [loadingByQuizId, setLoadingByQuizId] = useState<
    Record<string, boolean>
  >({});
  const [errorByQuizId, setErrorByQuizId] = useState<
    Record<string, string | null>
  >({});
  const [selectedByQuizId, setSelectedByQuizId] = useState<
    Record<string, string | null>
  >({});
  const [openedQuizIds, setOpenedQuizIds] = useState<string[]>([]);

  const fetchAnswers = async (quizId: string) => {
    if (answersByQuizId[quizId] || loadingByQuizId[quizId]) return;

    setLoadingByQuizId((prev) => ({ ...prev, [quizId]: true }));
    setErrorByQuizId((prev) => ({ ...prev, [quizId]: null }));

    try {
      const answers = await getQuizAnswersForAdmin(quizId);
      setAnswersByQuizId((prev) => ({ ...prev, [quizId]: answers }));
      setSelectedByQuizId((prev) => ({
        ...prev,
        [quizId]: prev[quizId] ?? answers[0]?._id ?? null,
      }));
    } catch {
      setErrorByQuizId((prev) => ({
        ...prev,
        [quizId]: "Kon antwoorden voor deze quiz niet laden.",
      }));
    } finally {
      setLoadingByQuizId((prev) => ({ ...prev, [quizId]: false }));
    }
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
          onDeleted(quiz._id);
        } catch {
          onError("Verwijderen mislukt.");
        }
      },
    });
  };

  const getQuestionText = (quiz: QuizFromApi, questionId: string) =>
    quiz.questions.find((q) => q.questionId === questionId)?.questionText ??
    questionId;

  return (
    <Paper withBorder p="md" mb="xl">
      <Title order={4} mb="md">
        Bestaande quizzen
      </Title>
      {quizzes.length === 0 ? (
        <Text c="dimmed">Nog geen quizzen.</Text>
      ) : (
        <Accordion
          variant="separated"
          multiple
          value={openedQuizIds}
          onChange={(values) => {
            setOpenedQuizIds(values);
            values.forEach((quizId) => {
              void fetchAnswers(quizId);
            });
          }}
        >
          {quizzes.map((quiz) => {
            const quizAnswers = answersByQuizId[quiz._id] ?? [];
            const isAnswersLoading = loadingByQuizId[quiz._id];
            const answersError = errorByQuizId[quiz._id];

            return (
              <Accordion.Item key={quiz._id} value={quiz._id}>
                <Accordion.Control>
                  <Group justify="space-between" wrap="nowrap">
                    <Group gap="sm">
                      <Text fw={600}>Week {quiz.week}</Text>
                      <Badge variant="light">
                        {quiz.questions.length} vragen
                      </Badge>
                      <Badge variant="outline">
                        {quizAnswers.length} inzendingen
                      </Badge>
                    </Group>
                    <Group gap="xs">
                      <Button
                        size="xs"
                        variant="light"
                        onClick={(event) => {
                          event.stopPropagation();
                          onEdit(quiz);
                        }}
                      >
                        Bewerken
                      </Button>
                      <Button
                        size="xs"
                        color="red"
                        variant="light"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleDelete(quiz);
                        }}
                      >
                        Verwijderen
                      </Button>
                    </Group>
                  </Group>
                </Accordion.Control>

                <Accordion.Panel>
                  {isAnswersLoading ? (
                    <Center py="md">
                      <Loader size="sm" />
                    </Center>
                  ) : answersError ? (
                    <Text c="red">{answersError}</Text>
                  ) : quizAnswers.length === 0 ? (
                    <Text c="dimmed">Nog geen antwoorden voor deze quiz.</Text>
                  ) : (
                    <Stack gap="md">
                      <Group justify="space-between" align="flex-end">
                        <Select
                          label="Bekijk inzending van"
                          placeholder="Kies deelnemer"
                          data={quizAnswers.map((submission) => ({
                            value: submission._id,
                            label: submission.userName ?? "Onbekend",
                          }))}
                          value={selectedByQuizId[quiz._id] ?? null}
                          onChange={(value) =>
                            setSelectedByQuizId((prev) => ({
                              ...prev,
                              [quiz._id]: value,
                            }))
                          }
                          w={320}
                        />
                        <Text size="sm" c="dimmed">
                          {quizAnswers.length} totale inzendingen
                        </Text>
                      </Group>

                      {(() => {
                        const selectedSubmission =
                          quizAnswers.find(
                            (submission) =>
                              submission._id === selectedByQuizId[quiz._id]
                          ) ?? quizAnswers[0];

                        return (
                          <>
                            <Paper withBorder p="sm">
                              <Group justify="space-between">
                                <Group gap="sm">
                                  <Text fw={600}>
                                    {selectedSubmission.userName ?? "Onbekend"}
                                  </Text>
                                  <Badge variant="light">
                                    Score: {selectedSubmission.totalScore}
                                  </Badge>
                                </Group>
                                <Text size="sm" c="dimmed">
                                  {new Date(
                                    selectedSubmission.createdAt
                                  ).toLocaleString("nl-BE")}
                                </Text>
                              </Group>
                            </Paper>

                            <Table>
                              <Table.Thead>
                                <Table.Tr>
                                  <Table.Th>Vraag</Table.Th>
                                  <Table.Th>Antwoord</Table.Th>
                                  <Table.Th>Resultaat</Table.Th>
                                  <Table.Th>Punten</Table.Th>
                                </Table.Tr>
                              </Table.Thead>
                              <Table.Tbody>
                                {selectedSubmission.answers.map((answer) => (
                                  <Table.Tr
                                    key={`${selectedSubmission._id}-${answer.questionId}`}
                                  >
                                    <Table.Td>
                                      {getQuestionText(quiz, answer.questionId)}
                                    </Table.Td>
                                    <Table.Td>
                                      {answer.userAnswer || "—"}
                                    </Table.Td>
                                    <Table.Td>
                                      <Badge
                                        color={
                                          answer.isCorrect ? "teal" : "gray"
                                        }
                                        variant="light"
                                      >
                                        {answer.isCorrect ? "Correct" : "Fout"}
                                      </Badge>
                                    </Table.Td>
                                    <Table.Td>{answer.pointsAwarded}</Table.Td>
                                  </Table.Tr>
                                ))}
                              </Table.Tbody>
                            </Table>
                          </>
                        );
                      })()}
                    </Stack>
                  )}
                </Accordion.Panel>
              </Accordion.Item>
            );
          })}
        </Accordion>
      )}
    </Paper>
  );
};

export default QuizList;
