import { Button, Group, Menu } from "@mantine/core";
import i18next from "i18next";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BelgiumFlag from "./_assets/belgium.svg?react";
import UKFlag from "./_assets/uk.svg?react";
import styles from "./languageSelect.module.css";

const LanguageSelect = () => {
  const [currentLanguage, setCurrentLanguage] = useState(i18next.language);
  const navigate = useNavigate();

  useEffect(() => {
    const handleLanguageChangeEvent = () => {
      setCurrentLanguage(i18next.language);
    };

    i18next.on("languageChanged", handleLanguageChangeEvent);
    return () => {
      i18next.off("languageChanged", handleLanguageChangeEvent);
    };
  }, []);

  const currentLanguageText = useCallback(() => {
    if (currentLanguage === "en") {
      return "English";
    }
    if (currentLanguage === "nl") {
      return "Nederlands";
    }
    return "Select Language"; // Fallback if needed
  }, [currentLanguage]);

  const handleLanguageChange = (lang: string) => {
    // Change language via i18next and update URL to reflect the new locale
    i18next.changeLanguage(lang);
    navigate(`/${lang}`);
  };

  return (
    <Group>
      <Menu shadow="md" width={200}>
        <Menu.Target>
          <Button>{currentLanguageText()}</Button>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item
            className={styles.menuItem}
            h="2rem"
            onClick={() => handleLanguageChange("en")}
            leftSection={<UKFlag height="2rem" width="3rem" />}
          >
            English
          </Menu.Item>
          <Menu.Item
            className={styles.menuItem}
            h="2rem"
            onClick={() => handleLanguageChange("nl")}
            leftSection={<BelgiumFlag height="2rem" width="3rem" />}
          >
            Nederlands
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Group>
  );
};

export default LanguageSelect;
