import Head from "@global/head";
import { useTranslate } from "@global/localization";
import { Center, Title } from "@mantine/core";
import { Link } from "react-router-dom";

const Homepage = () => {
  const { t, tL } = useTranslate();
  return (
    <>
      <Head title="Homepage" description="This is the homepage" SEODisabled />
      <Center h="100vh">
        <Title order={1}>{t("Homepage")}</Title>
        <Link to={tL("/aboutus")}>About us</Link>
      </Center>
    </>
  );
};

export default Homepage;
