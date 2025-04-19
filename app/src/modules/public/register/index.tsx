import {
  Anchor,
  Button,
  Center,
  Group,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
  useMantineTheme,
} from "@mantine/core";
import * as React from "react";
import { useForm } from "@mantine/form";
import { API } from "@global/api/auth";
import { Link, useNavigate } from "react-router-dom";
import { useTranslate } from "@global/localization";
import { useMediaQuery } from "@mantine/hooks";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { tL } = useTranslate();
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const [generalError, setGeneralError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (window.localStorage.getItem("token")) {
      navigate(tL("/"));
    }
  }, [navigate, tL]);

  const form = useForm({
    initialValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },

    validate: {
      name: (value) => (value.length > 0 ? null : "Naam is verplicht"),
      email: (value) =>
        /^\S+@\S+\.\S+$/.test(value) ? null : "Ongeldige email",
      password: (value) =>
        /^(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/.test(value)
          ? null
          : "Wachtwoord moet minstens 8 tekens zijn en een speciaal teken bevatten",
      confirmPassword: (value, values) =>
        value === values.password ? null : "Wachtwoorden komen niet overeen",
    },
  });

  const registerUser = React.useCallback(
    async (values: typeof form.values) => {
      setGeneralError("");
      setLoading(true);
      try {
        const response = await API.post("/register", {
          name: values.name,
          email: values.email,
          password: values.password,
        });

        if (response.status === 200) {
          window.localStorage.setItem("token", response.data.token);
          navigate(tL("/"));
        }
      } catch (err) {
        console.error(err);
        setGeneralError("Er is iets misgegaan bij registratie");
      } finally {
        setLoading(false);
      }
    },
    [navigate, tL]
  );

  return (
    <Center h="100vh">
      <Paper
        shadow="xl"
        withBorder={!isMobile}
        miw="18rem"
        px="1.5rem"
        py="1rem"
      >
        <Title ta="center" mb="0.5rem" order={4}>
          De mol quiz
        </Title>
        <Title mb="0.75rem" order={5}>
          Registreren
        </Title>

        {loading && (
          <Text size="xs" mt="sm" mb=".5rem" c="dimmed">
            De server is waarschijnlijk aan het opstarten...
          </Text>
        )}

        {generalError && (
          <Text c="red" size="sm" mb="1rem">
            {generalError}
          </Text>
        )}

        <form onSubmit={form.onSubmit(registerUser)}>
          <TextInput
            label="Naam"
            placeholder="jan jansens"
            mb="sm"
            {...form.getInputProps("name")}
          />
          <TextInput
            label="Email"
            placeholder="jouw@email.com"
            mb="sm"
            {...form.getInputProps("email")}
          />

          <PasswordInput
            label="Wachtwoord"
            placeholder="Wachtwoord"
            mb="sm"
            {...form.getInputProps("password")}
          />

          <PasswordInput
            label="Bevestig wachtwoord"
            placeholder="Bevestig wachtwoord"
            mb="md"
            {...form.getInputProps("confirmPassword")}
          />

          <Group mt="md">
            <Anchor component={Link} to={tL("/login")} size="sm">
              Heb je al een account? Log in
            </Anchor>
            <Button type="submit" loading={loading}>
              Registreren
            </Button>
          </Group>
        </form>
      </Paper>
    </Center>
  );
};

export default RegisterPage;
