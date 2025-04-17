// PrivateRoute.tsx
import { refreshToken, TOKEN } from "@global/api/auth";
import React from "react";

type PrivateRouteProps = {
  allowedRoles: Array<"ADMIN" | "REGULAR" | null>;
  children: JSX.Element;
};

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  if (TOKEN) {
    refreshToken();
    return children;
  }
  window.location.href = "/login";
};

export default PrivateRoute;
