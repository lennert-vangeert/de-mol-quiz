import { Anchor, AppShellHeader, Box, Group, Text } from "@mantine/core";
import AppIcon from "@common/appIcon/appIcon";
import { Link, useNavigate } from "react-router-dom";
import { useTranslate } from "@global/localization";
import { useCallback } from "react";

const Header = () => {
  const { tL } = useTranslate();
  const navigate = useNavigate();

  const handleLogout = useCallback(() => {
    window.localStorage.removeItem("token");
    navigate("/login");
  }, []);
  return (
    <AppShellHeader h={"10vh"} pl="2.5rem" pr="2.5rem">
      <Group justify="space-between" h="100%">
        <Box>
          <Link to={tL("/")}>
            <AppIcon />
          </Link>
        </Box>
        <Anchor onClick={() => handleLogout()}><Text size="1.25rem">Log uit</Text></Anchor>
      </Group>
    </AppShellHeader>
  );
};

export default Header;
