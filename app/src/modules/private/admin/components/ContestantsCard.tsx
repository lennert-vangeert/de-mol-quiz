import {
  ActionIcon,
  Button,
  Group,
  Paper,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { useState } from "react";
import {
  createContestant,
  deleteContestant,
  updateContestant,
  type Contestant,
} from "@global/api/requests";

type Props = {
  contestants: Contestant[];
  onChange: (contestants: Contestant[]) => void;
  onError: (message: string) => void;
};

const ContestantsCard = ({ contestants, onChange, onError }: Props) => {
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    const name = newName.trim();
    if (!name) return;
    setSaving(true);
    try {
      const created = await createContestant(name);
      onChange(
        [...contestants, created].sort((a, b) => a.name.localeCompare(b.name))
      );
      setNewName("");
    } catch {
      onError("Deelnemer toevoegen mislukt.");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (c: Contestant) => {
    setEditingId(c._id);
    setEditingName(c.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  const handleUpdate = async (id: string) => {
    const name = editingName.trim();
    if (!name) return;
    setSaving(true);
    try {
      const updated = await updateContestant(id, name);
      onChange(
        contestants
          .map((c) => (c._id === id ? updated : c))
          .sort((a, b) => a.name.localeCompare(b.name))
      );
      cancelEdit();
    } catch {
      onError("Deelnemer bijwerken mislukt.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (c: Contestant) => {
    modals.openConfirmModal({
      title: `${c.name} verwijderen?`,
      children: (
        <Text size="sm">
          Ben je zeker dat je {c.name} wilt verwijderen?
        </Text>
      ),
      labels: { confirm: "Verwijderen", cancel: "Annuleren" },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        try {
          await deleteContestant(c._id);
          onChange(contestants.filter((x) => x._id !== c._id));
        } catch {
          onError("Verwijderen mislukt.");
        }
      },
    });
  };

  return (
    <Paper withBorder p="md" mb="xl">
      <Title order={4} mb="md">
        Deelnemers
      </Title>

      <Group mb="md" align="flex-end">
        <TextInput
          label="Nieuwe deelnemer"
          value={newName}
          onChange={(e) => setNewName(e.currentTarget.value)}
          placeholder="Naam"
          style={{ flex: 1 }}
        />
        <Button
          onClick={handleAdd}
          loading={saving && editingId === null}
          disabled={!newName.trim()}
        >
          Toevoegen
        </Button>
      </Group>

      {contestants.length === 0 ? (
        <Text c="dimmed">Geen deelnemers gevonden.</Text>
      ) : (
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Naam</Table.Th>
              <Table.Th w={200} />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {contestants.map((c) => (
              <Table.Tr key={c._id}>
                <Table.Td>
                  {editingId === c._id ? (
                    <TextInput
                      value={editingName}
                      onChange={(e) =>
                        setEditingName(e.currentTarget.value)
                      }
                      autoFocus
                    />
                  ) : (
                    c.name
                  )}
                </Table.Td>
                <Table.Td>
                  <Group gap="xs" justify="flex-end">
                    {editingId === c._id ? (
                      <>
                        <Button
                          size="xs"
                          onClick={() => handleUpdate(c._id)}
                          loading={saving}
                          disabled={!editingName.trim()}
                        >
                          Opslaan
                        </Button>
                        <Button
                          size="xs"
                          variant="subtle"
                          onClick={cancelEdit}
                        >
                          Annuleren
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="xs"
                          variant="light"
                          onClick={() => startEdit(c)}
                        >
                          Bewerken
                        </Button>
                        <ActionIcon
                          color="red"
                          variant="light"
                          onClick={() => handleDelete(c)}
                        >
                          ×
                        </ActionIcon>
                      </>
                    )}
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}
    </Paper>
  );
};

export default ContestantsCard;
