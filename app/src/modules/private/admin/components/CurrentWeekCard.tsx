import {
  Button,
  Group,
  NumberInput,
  Paper,
  Stack,
  Switch,
  Title,
} from "@mantine/core";
import { useState } from "react";
import { updateConfig } from "@global/api/requests";

type Props = {
  initialWeek: number;
  initialSeason: number;
  initialShowWinner: boolean;
  onError: (message: string) => void;
};

const CurrentWeekCard = ({
  initialWeek,
  initialSeason,
  initialShowWinner,
  onError,
}: Props) => {
  const [week, setWeek] = useState(initialWeek);
  const [season, setSeason] = useState(initialSeason);
  const [showWinner, setShowWinner] = useState(initialShowWinner);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateConfig({ week, season, showWinner });
    } catch {
      onError("Config opslaan mislukt.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Paper withBorder p="md" mb="xl">
      <Title order={4} mb="md">
        Config
      </Title>
      <Stack>
        <NumberInput
          label="Week"
          value={week}
          onChange={(v) => setWeek(Number(v))}
          min={0}
          w={120}
        />
        <NumberInput
          label="Seizoen"
          value={season}
          onChange={(v) => setSeason(Number(v))}
          min={0}
          w={120}
        />
        <Switch
          label="Toon winnaar"
          checked={showWinner}
          onChange={(e) => setShowWinner(e.currentTarget.checked)}
        />
      </Stack>
      <Group justify="flex-end" mt="md">
        <Button onClick={handleSave} loading={saving}>
          Opslaan
        </Button>
      </Group>
    </Paper>
  );
};

export default CurrentWeekCard;
