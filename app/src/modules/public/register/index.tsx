import {
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
import { useNavigate } from "react-router-dom";
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

  const form = useForm({
    initialValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },

    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Ongeldige email"),
      password: (value) =>
        value.length < 6 ? "Wachtwoord moet minstens 6 tekens zijn" : null,
      confirmPassword: (value, values) =>
        value !== values.password ? "Wachtwoorden komen niet overeen" : null,
    },
  });

  const handleRegister = React.useCallback(
    (formData: {
      email: string;
      password: string;
      confirmPassword: string;
    }) => {
      setGeneralError("");
      API.post("/register", {
        email: formData.email,
        password: formData.password,
      })
        .then((response) => {
          if (response.status === 200) {
            // assuming your register endpoint returns a token
            window.localStorage.setItem("token", response.data.token);
            navigate("/");
          }
        })
        .catch((err) => {
          console.error(err);
          setGeneralError(
            err.response?.data?.message ||
              "Er is iets misgegaan bij registratie"
          );
        });
    },
    [navigate]
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

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleRegister(form.values);
          }}
        >
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
            <Button type="submit">Registreren</Button>
          </Group>
        </form>
      </Paper>
    </Center>
  );
};

export default RegisterPage;
