import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "@mantine/core/styles.css";
import { MantineStyles } from "@global/style/mantineTheme/index.tsx";
import { HelmetProvider } from "react-helmet-async";
import { router } from "./modules/routes";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { initGA } from "@global/analytics/ga";
import { refreshToken, TOKEN } from "@global/api/auth";

if (document.cookie.split("; ").includes("ANALYTICAL_COOKIES_ENABLED=true")) {
  initGA(); // Initialize Google Analytics
}

// Refresh token once at app start to populate the user role in Zustand
if (TOKEN) {
  refreshToken();
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
