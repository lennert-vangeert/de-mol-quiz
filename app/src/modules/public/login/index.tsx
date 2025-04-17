import {
  Anchor,
  Button,
  Center,
  Group,
  Paper,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import * as React from "react";
import { useForm } from "@mantine/form";
import { API } from "@global/api/auth";
import { Link } from "react-router-dom";
import { useTranslate } from "@global/localization";

const LoginPage = () => {
  const { tL } = useTranslate();

  const [generalError, setGeneralError] = React.useState("");
  const [loading, setLoading] = React.useState(false); // NEW loading state

  React.useEffect(() => {
    if (window.localStorage.getItem("token")) {
      window.location.href = tL("/");
    }
  }, []);

  const form = useForm({
    initialValues: {
      email: "",
      password: "",
    },

    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Ongeldige email"),
      password: (value) =>
        value.length < 1 ? "Je moet wel een wachtwoord invullen hé" : null,
    },
  });

  const handleLogin = React.useCallback(
    (formData: { email: string; password: string }) => {
      setGeneralError("");
      setLoading(true); // Start loading state

      API.post("/login", formData)
        .then((response) => {
          if (response.status === 200) {
            console.log(response.data);
            window.localStorage.setItem("token", response.data.token);
            window.location.href = tL("/");
          }
        })
        .catch(() => {
          setGeneralError("Ongeldige email of wachtwoord");
        })
        .finally(() => {
          setLoading(false); // Stop loading regardless of success/failure
        });
    },
    [tL]
  );

  return (
    <Center h="100vh">
      <Paper shadow="xl" withBorder miw="18rem" px="1.5rem" py="1rem">
        <Title mb="0.5rem" order={5}>
          Log in
        </Title>
        {loading && (
          <Text size="xs" mt="sm" mb=".5rem" c="dimmed">
            De server is waarschijnlijk aan het opstarten...
          </Text>
        )}
        {generalError && (
          <Text c="red" size="sm" mb="1.5rem">
            {generalError}
          </Text>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin(form.values);
          }}
        >
          <TextInput
            label="Email"
            placeholder="jouw@email.com"
            key={form.key("email")}
            {...form.getInputProps("email")}
          />
          <TextInput
            label="Password"
            type="password"
            key={form.key("password")}
            {...form.getInputProps("password")}
          />

          <Group justify="flex-end" mt="md">
            <Anchor component={Link} to="/register" size="sm">
              Nog geen account? Registreer hier
            </Anchor>
            <Button type="submit" loading={loading}>
              Log in
            </Button>
          </Group>
        </form>
      </Paper>
    </Center>
  );
};

export default LoginPage;
