import { Image } from "@mantine/core";
import image from "./_assets/de-mol-logo.png";

const AppIcon = () => {
  return <Image fit="contain" src={image} h="5rem" w="5rem" />;
};

export default AppIcon;
