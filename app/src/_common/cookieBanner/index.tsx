import {
  Button,
  Dialog,
  Group,
  Text,
  Title,
} from "@mantine/core";
import { useCallback } from "react";

type CookieBannerProps = {
  opened: boolean;
  close: () => void;
};

const CookieBanner = ({ opened, close }: CookieBannerProps) => {
  const acceptAnalyticsCookies = useCallback(() => {
    document.cookie =
      "ANALYTICAL_COOKIES_ENABLED=true; path=/; max-age=2592000"; // 1 month
    window.location.reload(); // Reload the page to apply changes
  }, []);

  const rejectAnalyticsCookies = useCallback(() => {
    document.cookie =
      "ANALYTICAL_COOKIES_ENABLED=false; path=/; max-age=2592000"; // 1 month
    window.location.reload(); // Reload the page to apply changes
  }, []);

  return (
    <Dialog withBorder py="1rem" opened={opened} onClose={close} withCloseButton={false}>
      <Title>Cookies</Title>
      <Text>We gebruiken cookies om jouw ervaring te verbeteren.</Text>
      <Group justify="space-around" mt="2rem">
        <Button onClick={() => acceptAnalyticsCookies()}>Accepteren</Button>
        <Button color="red" onClick={() => rejectAnalyticsCookies()}>
          Weigeren
        </Button>
      </Group>
    </Dialog>
  );
};

export default CookieBanner;
