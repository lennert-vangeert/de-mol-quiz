import { Box, Center, Divider, Loader, Text, Title } from "@mantine/core";
import { useCallback, useState, useEffect } from "react";
import {
  getAllQuizzes,
  getAdminScoreBoard,
  getContestants,
  getConfig,
  type AdminScoreBoardEntry,
  type Contestant,
} from "@global/api/requests";
import ConfigCard from "./components/configCard";
import ScoreboardsSection from "./components/ScoreboardsSection";
import ContestantsCard from "./components/ContestantsCard";
import QuizList from "./components/QuizList";
import QuizForm from "./components/QuizForm";
import MoleScoreCard from "./components/MoleScoreCard";
import type { QuizFromApi } from "./types";

const AdminPage = () => {
  const [quizzes, setQuizzes] = useState<QuizFromApi[]>([]);
  const [scoreBoard, setScoreBoard] = useState<AdminScoreBoardEntry[]>([]);
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [currentWeek, setCurrentWeek] = useState<number>(1);
  const [season, setSeason] = useState<number>(0);
  const [showWinner, setShowWinner] = useState<boolean>(false);
  const [isClosed, setIsClosed] = useState<boolean>(false);
  const [editingQuiz, setEditingQuiz] = useState<QuizFromApi | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
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
      setSeason(configRes.season);
      setShowWinner(configRes.showWinner);
      setIsClosed(configRes.isClosed);
    } catch {
      setError("Kon data niet laden.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <Center mih="80vh">
        <Loader />
      </Center>
    );
  }

  const handleQuizCreated = (quiz: QuizFromApi) => {
    setQuizzes((prev) => [quiz, ...prev]);
    setEditingQuiz(null);
  };

  const handleQuizUpdated = (quiz: QuizFromApi) => {
    setQuizzes((prev) => prev.map((q) => (q._id === quiz._id ? quiz : q)));
    setEditingQuiz(null);
  };

  const handleQuizDeleted = (quizId: string) => {
    setQuizzes((prev) => prev.filter((q) => q._id !== quizId));
  };

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

      <ConfigCard
        initialWeek={currentWeek}
        initialSeason={season}
        initialShowWinner={showWinner}
        initialClosed={isClosed}
        onSaved={fetchData}
        onError={setError}
      />

      <ScoreboardsSection entries={scoreBoard} />

      <ContestantsCard
        contestants={contestants}
        onChange={setContestants}
        onError={setError}
      />

      <Divider mb="xl" />

      <QuizList
        quizzes={quizzes}
        onEdit={setEditingQuiz}
        onDeleted={handleQuizDeleted}
        onError={setError}
      />

      <QuizForm
        editingQuiz={editingQuiz}
        contestants={contestants}
        onCreated={handleQuizCreated}
        onUpdated={handleQuizUpdated}
        onCancel={() => setEditingQuiz(null)}
        onError={setError}
      />

      <MoleScoreCard contestants={contestants} />
    </Box>
  );
};

export default AdminPage;
