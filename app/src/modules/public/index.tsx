import { RouteObject } from "react-router-dom";
import Homepage from "./homepage";
import AboutUs from "./aboutUs";
import PageWrapper from "../sections/pageWrapper";

export const publicRoutes: RouteObject[] = [
  {
    path: "",
    element: <PageWrapper />,
    children: [
      {
        index: true,
        element: <Homepage />,
      },
      {
        path: "aboutus",
        element: <AboutUs />,
      },
    ],
  },
];
