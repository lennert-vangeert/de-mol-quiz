import {
  Anchor,
  Button,
  Center,
  Group,
  Paper,
  PasswordInput,
  Text,
  Title,
  useMantineTheme,
} from "@mantine/core";
import * as React from "react";
import { useForm } from "@mantine/form";
import { API } from "@global/api/auth";
import { Link, useNavigate } from "react-router-dom";
import { useTranslate } from "@global/localization";
import { useMediaQuery } from "@mantine/hooks";
import Head from "@global/head";

const ConfirmResetPasswordPage = () => {
  const navigate = useNavigate();
  const { tL } = useTranslate();
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const [generalError, setGeneralError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  const email =
    new URLSearchParams(window.location.search).get("email") ?? "NULL";
  const code =
    new URLSearchParams(window.location.search).get("code") ?? "NULL";

  const form = useForm({
    initialValues: {
      password: "",
      confirmPassword: "",
    },

    validate: {
      password: (value) =>
        /^(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/.test(value)
          ? null
          : "Wachtwoord moet minstens 8 tekens zijn en een speciaal teken bevatten",
      confirmPassword: (value, values) =>
        value === values.password ? null : "Wachtwoorden komen niet overeen",
    },
  });

  const checkCredentials = React.useCallback(async () => {
    try {
      const response = await API.post("/check-reset-password-credentials", {
        email: email,
        code: code,
      });
      if (response.status !== 200) navigate(tL("/"));
    } catch (err) {
      navigate(tL("/"));
    }
  }, [email, code]);

  React.useEffect(() => {
    checkCredentials();
  }, []);

  const resetPassword = React.useCallback(
    async (values: typeof form.values) => {
      setGeneralError("");
      setLoading(true);
      try {
        const response = await API.post("/confirm-reset-password", {
          email: email,
          code: code,
          password: values.password,
        });

        if (response.status === 200) {
          setSuccess(true);
        }
      } catch (err) {
        console.error(err);
        setGeneralError(
          "Er is iets misgegaan bij het wijzigen van je wachtwoord."
        );
      } finally {
        setLoading(false);
      }
    },
    [navigate, tL]
  );

  return (
    <>
      <Head
        title="Wijzig wachtwoord"
        SEODisabled
        description="Wijzig je wachtwoord"
      />
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
            Wachtwoord wijzigen
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
          {success ? (
            <>
              <Text c="green" size="sm" mb="1.5rem">
                Je wachtwoord is gewijzigd. Je kan nu inloggen met je nieuwe
                wachtwoord.
              </Text>
              <Anchor component={Link} to={tL("/login")} size="sm">
                Log in
              </Anchor>
            </>
          ) : (
            <form onSubmit={form.onSubmit(resetPassword)}>
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
                  Herrinner je je wachtwoord?
                </Anchor>
                <Button type="submit" loading={loading}>
                  Wachtwoord wijzigen
                </Button>
              </Group>
            </form>
          )}
        </Paper>
      </Center>
    </>
  );
};

export default ConfirmResetPasswordPage;
