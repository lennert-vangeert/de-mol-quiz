import { RouteObject } from "react-router-dom";
import LoginPage from "./login";
import RegisterPage from "./register";
import { API } from "@global/api/auth";

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
    ],
  },
];

// trigger the api to start up on load
API.get("/health");
