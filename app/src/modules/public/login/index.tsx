import { Button, Center, Group, Paper, TextInput, Title } from "@mantine/core";
import * as React from "react";
import { useForm } from "@mantine/form";
import { API } from "@global/api/auth";
import { useNavigate } from "react-router-dom";
import { useTranslate } from "@global/localization";

const LoginPage = () => {
  const navigate = useNavigate();
  const { tL } = useTranslate();
  React.useEffect(() => {
    if (window.localStorage.getItem("token")) {
      navigate(tL("/"));
    }
  }, []);

  const form = useForm({
    initialValues: {
      email: "admin@test.com",
      password: "secret123",
    },

    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Ongeldige email"),
      password: (value) =>
        value.length < 1 ? "Je moet wel een wachtwoord invullen hé" : null,
    },
  });

  const handleLogin = React.useCallback(
    (formData: { email: string; password: string }) => {
      console.log(formData.email);
      console.log(formData);
      API.post("/login", formData)
        .then((response) => {
          if (response.status === 200) {
            console.log(response.data);
            window.localStorage.setItem("token", response.data.token);
            navigate("/");
          }
        })
        .catch(() => {
          form.setFieldError("email", "Ongeldige email of wachtwoord");
          form.setFieldError("password", "Ongeldige email of wachtwoord");
        });
    },
    []
  );
  return (
    <Center h="100vh">
      <Paper shadow="xl" withBorder miw="18rem" px="1.5rem" py="1rem">
        <Title mb="1.5rem" order={5}>
          Log in
        </Title>
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
            label="password"
            type="password"
            key={form.key("password")}
            {...form.getInputProps("password")}
          />

          <Group justify="flex-end" mt="md">
            <Button type="submit">Log in</Button>
          </Group>
        </form>
      </Paper>
    </Center>
  );
};

export default LoginPage;
