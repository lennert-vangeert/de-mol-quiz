import Head from "@global/head";
import { Center } from "@mantine/core";
import { useTranslation } from "react-i18next";

const NotFoundPage = () => {
  const { t } = useTranslation();
  return (
    <>
    <Head title={t('404 - Not Found')} description={t('This page was not found')} />
      <Center h="100vh">
        <h1>{t('404 - Not Found')}</h1>
      </Center>
    </>
  );
};

export default NotFoundPage;
