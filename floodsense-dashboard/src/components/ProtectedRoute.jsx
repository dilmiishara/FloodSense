import { Navigate, useLocation } from "react-router-dom";
import { rolePages } from "../shared/permissions";

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const userRole = localStorage.getItem("role");

  if (!userRole) {
    return <Navigate to="/" replace />;
  }

  const allowedPages = rolePages[userRole] || [];

  const canAccess = allowedPages.some(
      (p) => p.path === location.pathname
  );

  if (!canAccess) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return children;
}