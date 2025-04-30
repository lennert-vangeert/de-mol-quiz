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
import { getScoreBoard, scoreBoardOutput } from "@global/api/requests";

// Pull constant arrays/functions out of the component
const skeletonSizes = [40, 30, 25, 20, 20] as const;

const ScoreBoardPage = () => {
  const [scoreBoard, setScoreBoard] = React.useState<scoreBoardOutput[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  // Fetch logic memoized
  const fetchScoreBoard = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getScoreBoard();
      setScoreBoard(response);
    } catch (err) {
      console.error(err);
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

  // Build rows once unless dependencies change
  const rows = React.useMemo(
    () =>
      visibleEntries.map((entry, idx) => {
        const rank = idx + 1;
        return (
          <Table.Tr key={entry._id} h="2rem">
            <Table.Td style={{ fontSize: getFontSize(rank) }}>
              {getMedal(rank)}
            </Table.Td>
            <Table.Td>{entry.name}</Table.Td>
            <Table.Td>{entry.score}</Table.Td>
          </Table.Tr>
        );
      }),
    [visibleEntries, getMedal, getFontSize]
  );

  // If API error
  if (error) {
    return (
      <>
        <Head title="Scorebord" description="Bekijk de hoogste scores" />
        <Center mih="30rem" p="2rem">
          <Paper mih="60rem" shadow="xl" withBorder p="md" w="100%" maw="37.5rem">
            <Text>{error}</Text>
            <Anchor component="button" onClick={() => window.location.reload()}>
              Refresh
            </Anchor>
          </Paper>
        </Center>
      </>
    );
  }

  // Main render
  return (
    <>
      <Head title="Scorebord" description="Bekijk de hoogste scores" SEODisabled />
      <Center py="2rem" mih="75vh">
        <Paper mih="30rem" shadow="xl" withBorder p="md" w="100%" maw="37.5rem">
          <Title order={2} mb="md">
            Scorebord
          </Title>

          {/* Loading skeleton */}
          {loading && (
            <Table>
              <Table.Thead>
                <Table.Tr h="2rem">
                  <Table.Th /> {/* empty header cell for rank */}
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

          {/* Scoreboard data */}
          {!loading && visibleEntries.length > 0 && (
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th /> {/* empty header for rank */}
                  <Table.Th>Naam</Table.Th>
                  <Table.Th>Score</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>{rows}</Table.Tbody>
            </Table>
          )}

          {/* No scores yet */}
          {!loading && visibleEntries.length === 0 && (
            <Text>Er zijn nog geen scores.</Text>
          )}
        </Paper>
      </Center>
    </>
  );
};

export default ScoreBoardPage;
