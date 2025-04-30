import {
  Anchor,
  AppShellHeader,
  Box,
  Flex,
  Text,
  useMantineTheme,
  Drawer,
  Burger,
  Indicator,
} from "@mantine/core";
import AppIcon from "@common/appIcon/appIcon";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslate } from "@global/localization";
import { useCallback, useEffect, useState } from "react";
import { useMediaQuery } from "@mantine/hooks";
import { checkForAnswer } from "@global/api/requests";

const Header = () => {
  const { tL } = useTranslate();
  const navigate = useNavigate();
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.md})`);
  const { pathname } = useLocation();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleLogout = useCallback(() => {
    window.localStorage.removeItem("token");
    navigate(tL("/login"));
  }, [navigate, tL]);

  const [drawerOpened, setDrawerOpened] = useState(false);

  const closeDrawer = () => setDrawerOpened(false);
  const openDrawer = () => setDrawerOpened(true);

  useEffect(() => {
    const checkSubmissionStatus = async () => {
      try {
        const response = await checkForAnswer();
        if (response.hasUserSubmitted) {
          setIsSubmitted(true);
        }
      } catch {
        setIsSubmitted(false);
      }
    };

    checkSubmissionStatus();
  }, []);

  const MenuLinks = () => (
    <Flex
      mx="2rem"
      direction={isMobile ? "column" : "row"}
      gap={isMobile ? "xl" : "2rem"}
      align={isMobile ? "stretch" : "center"}
    >
      {pathname === tL("/") ? null : (
        <Indicator disabled={isSubmitted} size={12} color="red" processing>
          <Anchor component={Link} to={tL("/")} onClick={closeDrawer}>
            <Text size={isMobile ? "xl" : "1.25rem"}>Quiz</Text>
          </Anchor>
        </Indicator>
      )}
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
