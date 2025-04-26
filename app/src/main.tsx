import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "@mantine/core/styles.css";
import { MantineStyles } from "@global/style/mantineTheme/index.tsx";
import { HelmetProvider } from "react-helmet-async";
import { router } from "./modules/routes";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { initGA } from "@global/analytics/ga";

if (document.cookie.split("; ").includes("ANALYTICAL_COOKIES_ENABLED=true")) {
  initGA(); // Initialize Google Analytics
}

createRoot(document.getElementById("root")!).render(
  <>
    <SpeedInsights />
    <StrictMode>
      <HelmetProvider>
        <MantineStyles>
          <RouterProvider router={router} />
        </MantineStyles>
      </HelmetProvider>
    </StrictMode>
  </>
);
