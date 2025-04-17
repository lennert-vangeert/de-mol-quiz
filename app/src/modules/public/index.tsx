import { RouteObject } from "react-router-dom";
import LoginPage from "./login";
import RegisterPage from "./register";

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
