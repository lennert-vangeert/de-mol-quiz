import Head from "@global/head";
import {
  Button,
  Center,
  Group,
  Paper,
  Text,
  TextInput,
  Title,
  useMantineTheme,
} from "@mantine/core";
import * as React from "react";
import { useTranslate } from "@global/localization";
import { useMediaQuery } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import { API } from "@global/api/auth";

const RequestResetPasswordPage = () => {
  const { tL } = useTranslate();
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

  const [generalError, setGeneralError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const form = useForm({
    initialValues: {
      email: "",
    },

    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Ongeldige email"),
    },
  });

  const handleRequestResetPassword = React.useCallback(
    (formData: { email: string }) => {
      setGeneralError("");
      setLoading(true);

      API.post("/reset-password", formData)
        .then((response) => {
          if (response.status === 200) {
            setSuccess(true);
          } else {
            setGeneralError("Er ging iets fout");
          }
        })
        .catch((err) => {
          const serverMsg = err?.response?.data?.message;
          const status = err?.response?.status;
          setGeneralError(
            status === 429 && serverMsg ? serverMsg : "Er ging iets fout"
          );
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [tL]
  );
  return (
    <>
      <Head
        title="Wachtwoord reset"
        SEODisabled
        description="Reset je wachtwoord"
      />
      <Center h="100dvh">
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
          <Title mb="0.5rem" order={5}>
            Wachtwoord reset
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
          {success ? (
            <Text c="green" size="sm" mb="1.5rem">
              Je zou een mail moeten ontvangen met een link om je wachtwoord
              opnieuw in te stellen.
            </Text>
          ) : (
            <form>
              <TextInput
                label="Email"
                type="email"
                placeholder="jouw@email.com"
                key={form.key("email")}
                {...form.getInputProps("email")}
              />

              <Group justify="flex-end" mt="md">
                <Button
                  loading={loading}
                  onClick={(e) => {
                    e.preventDefault();
                    handleRequestResetPassword(form.values);
                  }}
                >
                  Reset wachtwoord
                </Button>
              </Group>
            </form>
          )}
        </Paper>
      </Center>
    </>
  );
};

export default RequestResetPasswordPage;
