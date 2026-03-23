import { Card, Center, Text, Title } from "@mantine/core";
import styles from "./inactive.module.css";
import { useMediaQuery } from "@mantine/hooks";
const InactivePage = () => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  return (
    <Center className={styles.box} h="100%">
      <Card withBorder={!isMobile}>
        <Title ta="center" order={2}>
          De "De Mol" quiz is momenteel inactief.
        </Title>
        <Text ta="center" mt="md">
          De quiz is op dit moment niet beschikbaar. Komt later terug wanneer
          het nieuwe seizoen van start gaat!
        </Text>
      </Card>
    </Center>
  );
};

export default InactivePage;
