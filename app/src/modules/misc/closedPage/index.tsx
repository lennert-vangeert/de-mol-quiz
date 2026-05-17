import { Button, Center, Paper, Stack, Text, Title } from "@mantine/core";

const handleLogout = () => {
  window.localStorage.removeItem("token");
  window.location.href = "/login";
};

const ClosedPage = () => (
  <Center mih="80vh" p="2rem">
    <Paper withBorder p="xl" maw="32rem">
      <Stack align="center" gap="md">
        <Title order={2} ta="center">
          De quiz is gesloten
        </Title>
        <Text ta="center" c="dimmed">
          De quiz is momenteel niet beschikbaar. Kom later terug.
        </Text>
        <Button variant="subtle" onClick={handleLogout}>
          Uitloggen
        </Button>
      </Stack>
    </Paper>
  </Center>
);

export default ClosedPage;
