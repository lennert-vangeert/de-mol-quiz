import {
  Anchor,
  AppShellHeader,
  Box,
  Flex,
  Text,
  useMantineTheme,
  Drawer,
  Burger,
} from "@mantine/core";
import AppIcon from "@common/appIcon/appIcon";
import { Link, useNavigate } from "react-router-dom";
import { useTranslate } from "@global/localization";
import { useCallback, useState } from "react";
import { useMediaQuery } from "@mantine/hooks";

const Header = () => {
  const { tL } = useTranslate();
  const navigate = useNavigate();
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.md})`);

  const handleLogout = useCallback(() => {
    window.localStorage.removeItem("token");
    navigate(tL("/login"));
  }, [navigate, tL]);

  const [drawerOpened, setDrawerOpened] = useState(false);

  const closeDrawer = () => setDrawerOpened(false);
  const openDrawer = () => setDrawerOpened(true);

  const MenuLinks = () => (
    <Flex
      mx="2rem"
      direction={isMobile ? "column" : "row"}
      gap={isMobile ? "xl" : "2rem"}
      align={isMobile ? "stretch" : "center"}
    >
      <Anchor component={Link} to={tL("/scoreboard")} onClick={closeDrawer}>
        <Text size={isMobile ? "xl" : "1.25rem"}>Scoreboard</Text>
      </Anchor>
      <Anchor
        onClick={() => {
          closeDrawer();
          handleLogout();
        }}
      >
        <Text size={isMobile ? "xl" : "1.25rem"}>Log uit</Text>
      </Anchor>
    </Flex>
  );

  return (
    <AppShellHeader h="10vh" pl="2.5rem" pr="2.5rem">
      <Flex align="center" justify="space-between" h="100%">
        <Box>
          <Link to={tL("/")}>
            <AppIcon />
          </Link>
        </Box>

        {isMobile ? (
          <>
            <Burger
              opened={drawerOpened}
              onClick={drawerOpened ? closeDrawer : openDrawer}
            />
            <Drawer
              opened={drawerOpened}
              onClose={closeDrawer}
              size="100%"
              padding="md"
            >
              <Box mt="2rem">
                <MenuLinks />
              </Box>
            </Drawer>
          </>
        ) : (
          <MenuLinks />
        )}
      </Flex>
    </AppShellHeader>
  );
};

export default Header;
