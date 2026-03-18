import { TOKEN } from "@global/api/auth";
import { useTranslate } from "@global/localization";
import useApp from "@global/hooks/useApp";
import React from "react";
import { Navigate } from "react-router-dom";

type PrivateRouteProps = {
  allowedRoles: Array<"ADMIN" | "REGULAR" | null>;
  children: JSX.Element;
};

const PrivateRoute: React.FC<PrivateRouteProps> = ({
  allowedRoles,
  children,
}) => {
  const { tL } = useTranslate();
  const isActive = import.meta.env.VITE_ISACTIVE === "true";
  const userRole = useApp((s) => s.userRole);

  if (!TOKEN) {
    window.location.href = isActive ? tL("/login") : tL("/inactive");
    return null;
  }

  // Only enforce role once it's known; null means token refresh is still in-flight
  if (userRole !== null && !allowedRoles.includes(userRole)) {
    return <Navigate to={tL("/")} replace />;
  }

  return children;
};

export default PrivateRoute;
