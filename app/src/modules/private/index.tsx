import { RouteObject } from "react-router-dom";
import Homepage from "../private/homepage";
import PageWrapper from "../sections/pageWrapper";
import PrivateRoute from "@common/privateRouteComponent";
import ScoreBoardPage from "./scoreBoard";

export const privateRoutes: RouteObject[] = [
  {
    path: "",
    element: <PageWrapper />,
    children: [
      {
        index: true,
        element: (
          <PrivateRoute allowedRoles={["REGULAR"]}>
            <Homepage />
          </PrivateRoute>
        ),
      },
      {
        path: "scoreboard",
        element: (
          <PrivateRoute allowedRoles={["REGULAR"]}>
            <ScoreBoardPage />
          </PrivateRoute>
        ),
      },
    ],
  },
];
