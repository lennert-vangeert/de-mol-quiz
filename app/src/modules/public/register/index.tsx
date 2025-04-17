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
} from "@mantine/core";
import * as React from "react";
import { useForm } from "@mantine/form";
import { API } from "@global/api/auth";
import { Link, useNavigate } from "react-router-dom";
import { useTranslate } from "@global/localization";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { tL } = useTranslate();
  const [generalError, setGeneralError] = React.useState("");

  // If already logged in, bounce back to home
  React.useEffect(() => {
    if (window.localStorage.getItem("token")) {
      navigate(tL("/"));
    }
  }, [navigate, tL]);

  // Set up your form with Mantine’s validation rules
  const form = useForm({
    initialValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },

    validate: {
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

  // This only runs **after** the form has passed validation
  const registerUser = React.useCallback(
    async (values: typeof form.values) => {
      setGeneralError("");
      try {
        const response = await API.post("/register", {
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
      }
    },
    [navigate, tL]
  );

  return (
    <Center h="100vh">
      <Paper shadow="xl" withBorder miw="20rem" px="1.5rem" py="1.5rem">
        <Title mb="0.75rem" order={5}>
          Registreren
        </Title>

        {generalError && (
          <Text c="red" size="sm" mb="1rem">
            {generalError}
          </Text>
        )}

        {/* <-- Notice: we hand Mantine the registerUser callback directly */}
        <form onSubmit={form.onSubmit(registerUser)}>
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
            <Anchor component={Link} to="/login" size="sm">
              Heb je al een account? Log in
            </Anchor>
            <Button type="submit">Registreren</Button>
          </Group>
        </form>
      </Paper>
    </Center>
  );
};

export default RegisterPage;
