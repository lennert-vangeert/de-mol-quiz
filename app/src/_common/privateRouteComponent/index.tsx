// PrivateRoute.tsx
import { refreshToken, TOKEN } from "@global/api/auth";
import { useTranslate } from "@global/localization";
import React from "react";

type PrivateRouteProps = {
  allowedRoles: Array<"ADMIN" | "REGULAR" | null>;
  children: JSX.Element;
};

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { tL } = useTranslate();
  const isActive = import.meta.env.VITE_ISACTIVE === "true";
  if (TOKEN) {
    refreshToken();
    return children;
  }
  if (!isActive) {
    window.location.href = tL("/inactive");
  } else {
    window.location.href = tL("/login");
  }
};

export default PrivateRoute;
