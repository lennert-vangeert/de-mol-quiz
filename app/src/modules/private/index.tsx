import { RouteObject } from "react-router-dom";
import Homepage from "../private/homepage";
import PageWrapper from "../sections/pageWrapper";
import PrivateRoute from "@common/privateRouteComponent";

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
    ],
  },
];
