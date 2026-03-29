import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ role, children }) {
  // get the user's role from localStorage
  const userRole = localStorage.getItem("role"); // stored as string

  // if no role/token, redirect to login
  if (!userRole) {
    return <Navigate to="/" />;
  }

  // if a role is required and doesn't match, redirect to login
  if (role && Number(userRole) !== Number(role)) {
    return <Navigate to="/" />;
  }

  // user is authenticated and authorized
  return children;
}