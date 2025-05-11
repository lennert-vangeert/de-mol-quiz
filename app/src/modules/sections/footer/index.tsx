import { Box, Center, Divider, Title } from "@mantine/core";

const Footer = () => {
  return (
    <Box w="100%" py="2rem">
      <Divider mb="2rem" />
      <Center px="1rem">
        <Title order={5}>
          Made with ❤️ by Lennert - {new Date().getFullYear()}
        </Title>
      </Center>
    </Box>
  );
};

export default Footer;
