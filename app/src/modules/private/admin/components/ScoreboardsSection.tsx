import { Paper, SimpleGrid, Table, Text, Title } from "@mantine/core";
import type { AdminScoreBoardEntry } from "@global/api/requests";

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

type Props = {
  entries: AdminScoreBoardEntry[];
};

const ScoreboardsSection = ({ entries }: Props) => {
  const privateEntries = entries.filter((e) => e.type === "private");
  const corporateEntries = entries.filter((e) => e.type === "corporate");

  return (
    <>
      <Title order={4} mb="md">
        Scoreborden
      </Title>
      <SimpleGrid cols={{ base: 1, md: 2 }} mb="xl">
        <ScoreTable title="Privé" entries={privateEntries} />
        <ScoreTable title="Codifly" entries={corporateEntries} />
      </SimpleGrid>
    </>
  );
};

export default ScoreboardsSection;
