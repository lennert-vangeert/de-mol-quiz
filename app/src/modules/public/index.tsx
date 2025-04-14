import { RouteObject } from "react-router-dom";
import LoginPage from "./login";

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
        element: <div />, // placeholder for now
      },
    ],
  },
];
