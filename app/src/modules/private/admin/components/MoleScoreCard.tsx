import { Contestant, getMoleCalculations, MoleCalculationOutput } from "@global/api/requests";
import { Button, Paper, Title, Table, Group, Select, Box } from "@mantine/core";
import { useCallback, useEffect, useMemo, useState } from "react";



type Props = {
  contestants: Contestant[];
};

const MoleScoreCard = ({ contestants }: Props) => {
  const [molCalculationOutput, setMoleCalculationOutput] = useState<MoleCalculationOutput[]>();
  const [mole, setMole] = useState<string | null>()

  const handleCalculation = useCallback(async () => {
    const output = await getMoleCalculations(mole ?? '')
    setMoleCalculationOutput(output)
  }, [mole])

  const handleSubmission = useCallback(async () => {
    return null;
  }, [])

  const dataForSelect = useMemo(() => {
    return contestants.map((contestant) => {
      return contestant.name
    })
  }, [contestants])

  useEffect(() => {
    setMole(contestants[0]?.name ?? null)
  }, [contestants])

  return (<Paper withBorder p="md" >
    <Title order={4} mb="md">
      Punten berekenen voor molvragen.
    </Title>
    <Box mb="1rem">
      <Select maw="20rem" data={dataForSelect} value={mole} onChange={setMole} />
    </Box>

    {molCalculationOutput != null && <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Naam</Table.Th>
          <Table.Th>Oude score</Table.Th>
          <Table.Th>Nieuwe score</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {molCalculationOutput.map((item) => (
          <Table.Tr key={item.user._id}>
            <Table.Td>{item.user.name}</Table.Td>
            <Table.Td>{item.oldScore}</Table.Td>
            <Table.Td>{item.newScore}</Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>}
    <Group justify="flex-end">
      <Button onClick={handleCalculation}>Berekenen</Button>
      {molCalculationOutput != null && <Button onClick={handleSubmission}>Toepassen</Button>}
    </Group>
  </Paper>)
};

export default MoleScoreCard;
