import { RouteObject } from "react-router-dom";
import Homepage from "../private/homepage";
import PageWrapper from "../sections/pageWrapper";
import PrivateRoute from "@common/privateRouteComponent";
import ScoreBoardPage from "./scoreBoard";
import AdminPage from "./admin";

export const privateRoutes: RouteObject[] = [
  {
    path: "",
    element: <PageWrapper />,
    children: [
      {
        index: true,
        element: (
          <PrivateRoute allowedRoles={["REGULAR", "ADMIN"]}>
            <Homepage />
          </PrivateRoute>
        ),
      },
      {
        path: "scoreboard",
        element: (
          <PrivateRoute allowedRoles={["REGULAR", "ADMIN"]}>
            <ScoreBoardPage />
          </PrivateRoute>
        ),
      },
      {
        path: "admin",
        element: (
          <PrivateRoute allowedRoles={["ADMIN"]}>
            <AdminPage />
          </PrivateRoute>
        ),
      },
    ],
  },
];
