import { AppShellHeader, Box, Group } from "@mantine/core";
import AppIcon from "@common/appIcon/appIcon";
import LanguageSelect from "@common/languageSelect";
import { Link } from "react-router-dom";
import { useTranslate } from "@global/localization";

const Header = () => {
  const { tL } = useTranslate();
  return (
    <AppShellHeader h={"10vh"} pl="2.5rem" pr="2.5rem">
      <Group justify="space-between" h="100%">
        <Box>
          <Link to={tL("/")}>
            <AppIcon />
          </Link>
        </Box>
        <LanguageSelect />
      </Group>
    </AppShellHeader>
  );
};

export default Header;
