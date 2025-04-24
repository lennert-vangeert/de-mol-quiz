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

const ScoreBoardPage = () => {
  const [scoreBoard, setScoreBoard] = React.useState<scoreBoardOutput[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchScoreBoard = async () => {
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
    };

    fetchScoreBoard();
  }, []);

  // Rows for the Mantine Table
  const rows = scoreBoard.map((entry) => (
    <React.Fragment key={entry._id}>
      {entry.name && entry.name !== "Lennert Van Geert" && (
        <Table.Tr h="2rem">
          <Table.Td>{entry.name}</Table.Td>
          <Table.Td>{entry.score}</Table.Td>
        </Table.Tr>
      )}
    </React.Fragment>
  ));

  // Loading or error state
  if (error) {
    return (
      <>
        <Head title="Scorebord" description="Bekijk de hoogste scores" />
        <Center mih="30rem" p="2rem">
          {error && (
            <Paper
              mih="60rem"
              shadow="xl"
              withBorder
              p="md"
              w="100%"
              maw="37.5rem"
            >
              <Text>{error}</Text>
              <Anchor
                component="button"
                onClick={() => window.location.reload()}
              >
                Refresh
              </Anchor>
            </Paper>
          )}
        </Center>
      </>
    );
  }

  // Main scoreboard view
  return (
    <>
      <Head
        title="Scorebord"
        description="Bekijk de hoogste scores"
        SEODisabled
      />
      <Center p="2rem" mih="75vh">
        <Paper mih="30rem" shadow="xl" withBorder p="md" w="100%" maw="37.5rem">
          <Title order={2} mb="md">
            Scorebord
          </Title>
          {loading && (
            <Table>
              <Table.Thead>
                <Table.Tr h="2rem">
                  <Table.Th>Naam</Table.Th>
                  <Table.Th>Score</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                <Table.Tr h="2rem">
                  <Table.Td>
                    <Skeleton miw="8.7rem" w="100%" h={20} />
                  </Table.Td>
                  <Table.Td>
                    <Skeleton w="35%" h={20} />
                  </Table.Td>
                </Table.Tr>
                <Table.Tr h="2rem">
                  <Table.Td>
                    <Skeleton miw="8.7rem" w="100%" h={20} />
                  </Table.Td>
                  <Table.Td>
                    <Skeleton w="35%" h={20} />
                  </Table.Td>
                </Table.Tr>
                <Table.Tr h="2rem">
                  <Table.Td>
                    <Skeleton miw="8.7rem" w="100%" h={20} />
                  </Table.Td>
                  <Table.Td>
                    <Skeleton w="35%" h={20} />
                  </Table.Td>
                </Table.Tr>
                <Table.Tr h="2rem">
                  <Table.Td>
                    <Skeleton miw="8.7rem" w="100%" h={20} />
                  </Table.Td>
                  <Table.Td>
                    <Skeleton w="35%" h={20} />
                  </Table.Td>
                </Table.Tr>
                <Table.Tr h="2rem">
                  <Table.Td>
                    <Skeleton miw="8.7rem" w="100%" h={20} />
                  </Table.Td>
                  <Table.Td>
                    <Skeleton w="35%" h={20} />
                  </Table.Td>
                </Table.Tr>
              </Table.Tbody>
            </Table>
          )}
          {scoreBoard.length > 0 && (
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Naam</Table.Th>
                  <Table.Th>Score</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>{rows}</Table.Tbody>
            </Table>
          )}
          {scoreBoard.length === 0 && !loading && (
            <Text>Er zijn nog geen scores.</Text>
          )}
        </Paper>
      </Center>
    </>
  );
};

export default ScoreBoardPage;
