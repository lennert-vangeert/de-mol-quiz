import { RouteObject } from "react-router-dom";
import LoginPage from "./login";
import RegisterPage from "./register";
import { API } from "@global/api/auth";
import UnsubscribePage from "./unsubscribe";
import RequestResetPasswordPage from "./requestResetPassword";
import ConfirmResetPasswordPage from "./confirmResetPassword";

export const publicRoutes: RouteObject[] = [
  {
    path: "",
    children: [
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "register",
        element: <RegisterPage />,
      },
      {
        path: "unsubscribe",
        element: <UnsubscribePage />,
      },
      {
        path: "request-reset-password",
        element: <RequestResetPasswordPage />,
      },
      {
        path: "confirm-reset-password",
        element: <ConfirmResetPasswordPage />,
      },
    ],
  },
];

// trigger the api to start up on load
API.get("/health");
