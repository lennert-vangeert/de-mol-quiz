import { Box, Center, Divider, Title } from "@mantine/core";

const Footer = () => {
  return (
    <Box  w="100%" py="2rem">
      <Divider mb="2rem" />
      <Center px="1rem">
        <Title order={5}>
          Made with ❤️ by Lennert - © 2025 All rights reserved.
        </Title>
      </Center>
    </Box>
  );
};

export default Footer;
