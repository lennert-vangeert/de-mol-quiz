import { TOKEN } from "@global/api/auth";
import { getConfig } from "@global/api/requests";
import { useTranslate } from "@global/localization";
import useApp from "@global/hooks/useApp";
import React from "react";
import { Navigate } from "react-router-dom";
import ClosedPage from "../../modules/misc/closedPage";

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
  const isQuizClosed = useApp((s) => s.isQuizClosed);
  const setIsQuizClosed = useApp((s) => s.setIsQuizClosed);

  React.useEffect(() => {
    if (!TOKEN) return;
    getConfig()
      .then((config) => setIsQuizClosed(config.isClosed))
      .catch(() => {
        // 423 interceptor already handled flipping the flag if applicable.
      });
  }, [setIsQuizClosed]);

  if (!TOKEN) {
    window.location.href = isActive ? tL("/login") : tL("/inactive");
    return null;
  }

  // Only enforce role once it's known; null means token refresh is still in-flight
  if (userRole !== null && !allowedRoles.includes(userRole)) {
    return <Navigate to={tL("/")} replace />;
  }

  if (isQuizClosed && userRole !== "ADMIN") {
    return <ClosedPage />;
  }

  return children;
};

export default PrivateRoute;
