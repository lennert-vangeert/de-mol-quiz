import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "@mantine/core/styles.css";
import { MantineStyles } from "@global/style/mantineTheme/index.tsx";
import { HelmetProvider } from "react-helmet-async";
import { router } from "./modules/routes";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HelmetProvider>
      <MantineStyles>
        <RouterProvider router={router} />
      </MantineStyles>
    </HelmetProvider>
  </StrictMode>
);
