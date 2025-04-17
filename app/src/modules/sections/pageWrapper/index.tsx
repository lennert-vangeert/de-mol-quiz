import { AppShell, Box } from "@mantine/core";
import Header from "../header";
import Footer from "../footer";
import { ReactNode, useMemo } from "react";
import { useMediaQuery } from "@mantine/hooks";
import { Outlet } from "react-router-dom";
import style from "./pageWrapper.module.css";

type PageWrapperProps = {
  children?: ReactNode;
};

const PageWrapper = ({ children }: PageWrapperProps) => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(min-width: 769px) and (max-width: 1024px)");

  const margin = useMemo(() => {
    if (isMobile) {
      return "2rem";
    }
    if (isTablet) {
      return "3.5rem";
    }
    return "5rem";
  }, [isMobile, isTablet]);

  return (
    <AppShell>
      <Header />
      <Box className={style.main} ml={margin} mr={margin}>
        {/* Render direct children if provided, otherwise fallback to nested routes */}
        {children ?? <Outlet />}
      </Box>
      <Footer />
    </AppShell>
  );
};

export default PageWrapper;
