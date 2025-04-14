import React from "react";
import {
  createBrowserRouter,
  Outlet,
  useRouteError,
  Navigate,
} from "react-router-dom";
import { I18nProvider, PushLocaleToRoute } from "@global/localization";
import { publicRoutes } from "./public";
import ErrorPage from "./misc/errorPage";
import { privateRoutes } from "./private";

function Root({ children }: { children?: React.ReactNode }) {
  return (
    <I18nProvider>
      {children ?? <Outlet />}
    </I18nProvider>
  );
}

// A simple error boundary that catches route errors and displays the NotFoundPage.
function RootErrorBoundary() {
  const error = useRouteError();
  console.error("Routing error:", error);

  // If error status is 404, you might choose to render a NotFoundPage or redirect.
  return (
    <Root>
      <ErrorPage />
    </Root>
  );
}

// Define our application routes
const appRoutes = [
  {
    path: "/:maybeLang?",
    element: <PushLocaleToRoute />,
    children: [
      ...publicRoutes,
      ...privateRoutes
      // If you had any private or other routes, they’d go here
    ],
  },
];

// Create the router using the new data APIs, adding an errorElement to handle errors
export const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <RootErrorBoundary />,
    children: appRoutes,
  },
  // Fallback route in case of invalid paths; feel free to customize the redirect destination
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
