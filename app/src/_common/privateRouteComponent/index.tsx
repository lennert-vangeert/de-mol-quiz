// PrivateRoute.tsx
import { refreshToken } from "@global/api/auth";
import React from "react";
import { Navigate } from "react-router-dom";

type PrivateRouteProps = {
  allowedRoles: Array<"ADMIN" | "REGULAR" | null>;
  children: JSX.Element;
};

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  // Get the current user role from Zustand.
  const token = window.localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" />;
  }
  refreshToken();
  // Otherwise, render the protected component.
  return children;
};

export default PrivateRoute;
