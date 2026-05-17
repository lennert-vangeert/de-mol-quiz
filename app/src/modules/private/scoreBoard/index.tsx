import {
  Anchor,
  Center,
  Paper,
  Skeleton,
  Table,
  Text,
  Title,
} from "@mantine/core";
import * as React from "react";
import Head from "@global/head";
import { getConfig, getScoreBoard, scoreBoardOutput } from "@global/api/requests";
import Confetti from "react-confetti";
import { logger } from "@global/utils/logger";

// Pull constant arrays/functions out of the component
const skeletonSizes = [40, 30, 25, 20, 20] as const;

const ScoreBoardPage = () => {
  const [scoreBoard, setScoreBoard] = React.useState<scoreBoardOutput[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  const [showWinner, setShowWinner] = React.useState(false);

  // Fetch logic memoized
  const fetchScoreBoard = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [response, config] = await Promise.all([
        getScoreBoard(),
        getConfig(),
      ]);
      setScoreBoard(response);
      setShowWinner(config.showWinner);
    } catch (err) {
      logger.error("Failed to fetch scoreboard", {
        error: err instanceof Error ? err.message : String(err),
      });
      setError("Er ging iets fout, probeer het opnieuw.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Run fetch on mount
  React.useEffect(() => {
    fetchScoreBoard();
  }, [fetchScoreBoard]);

  // Filter out anonymous or current-user entries
  const visibleEntries = React.useMemo(
    () =>
      scoreBoard.filter(
        (entry) => entry.name && entry.name !== "Lennert Van Geert"
      ),
    [scoreBoard]
  );

  // Sort by score descending
  const sortedEntries = React.useMemo(
    () => [...visibleEntries].sort((a, b) => b.score - a.score),
    [visibleEntries]
  );

  // Medal or number logic
  const getMedal = React.useCallback((rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return rank;
  }, []);

  // Dynamic font sizes for top positions
  const getFontSize = React.useCallback((rank: number) => {
    if (rank === 1) return "2rem";
    if (rank === 2) return "1.5rem";
    if (rank === 3) return "1.25rem";
    return "1rem";
  }, []);

  // Build rows once unless dependencies change, using dense ranking
  const rows = React.useMemo(() => {
    let lastScore: number | null = null;
    let currentRank = 0;

    return sortedEntries.map((entry) => {
      if (entry.score !== lastScore) {
        currentRank += 1;
        lastScore = entry.score;
      }

      return (
        <Table.Tr key={entry._id} h="2rem">
          <Table.Td style={{ fontSize: getFontSize(currentRank) }}>
            {getMedal(currentRank)}
          </Table.Td>
          <Table.Td>{entry.name}</Table.Td>
          <Table.Td>{entry.score}</Table.Td>
        </Table.Tr>
      );
    });
  }, [sortedEntries, getMedal, getFontSize]);

  // Identify winner for celebration
  const winner = sortedEntries[0];
  const width = window.innerWidth;
  const height = window.innerHeight;

  // If API error
  if (error) {
    return (
      <>
        <Head title="Scorebord" description="Bekijk de hoogste scores" />
        <Center h="100%" p="2rem">
          <Paper shadow="xl" withBorder p="md" w="100%" maw="37.5rem">
            <Text>{error}</Text>
            <Anchor component="button" onClick={() => window.location.reload()}>
              Refresh
            </Anchor>
          </Paper>
        </Center>
      </>
    );
  }

  return (
    <>
      <Head
        title="Scorebord"
        description="Bekijk de hoogste scores"
        SEODisabled
      />
      <Center h="100%" py="2rem">
        <Paper shadow="xl" withBorder p="md" w="100%" maw="37.5rem">
          <Title order={2} mb="md">
            Scorebord
          </Title>

          {loading && (
            <Table>
              <Table.Thead>
                <Table.Tr h="2rem">
                  <Table.Th />
                  <Table.Th>Naam</Table.Th>
                  <Table.Th>Score</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {skeletonSizes.map((size, i) => (
                  <Table.Tr key={i} h="2rem">
                    <Table.Td>
                      <Skeleton circle width={size} height={size} />
                    </Table.Td>
                    <Table.Td>
                      <Skeleton miw="8.7rem" w="100%" h={20} />
                    </Table.Td>
                    <Table.Td>
                      <Skeleton w="35%" h={20} />
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}

          {!loading && sortedEntries.length > 0 && (
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th />
                  <Table.Th>Naam</Table.Th>
                  <Table.Th>Score</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>{rows}</Table.Tbody>
            </Table>
          )}

          {!loading && sortedEntries.length === 0 && (
            <Text>Er zijn nog geen scores.</Text>
          )}

          {/* Winner celebration */}
          {showWinner && !loading && winner && (
            <Center mt="2rem">
              <Confetti
                style={{ position: "fixed", inset: 0, zIndex: 1 }}
                width={width}
                height={height}
                recycle
              />
              <Text size="xl" fw={700} ta="center">
                Proficiat {winner.name}! Jij bent de winnaar met {winner.score}{" "}
                punten! 🎉
              </Text>
            </Center>
          )}
        </Paper>
      </Center>
    </>
  );
};

export default ScoreBoardPage;
