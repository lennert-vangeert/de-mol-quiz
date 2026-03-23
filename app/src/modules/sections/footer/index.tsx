import { Box, Center, Divider, Text } from "@mantine/core";

const Footer = () => {
  return (
    <Box w="100%" py="1rem">
      <Divider mb="1rem" />
      <Center px="1rem">
        <Text size="md">
          Made with ❤️ by Lennert - {new Date().getFullYear()}
        </Text>
      </Center>
    </Box>
  );
};

export default Footer;
