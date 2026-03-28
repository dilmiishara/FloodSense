import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  // ❌ If no login → go to login page
  if (!token) {
    return <Navigate to="/" />;
  }

  // ❌ If role mismatch → block access
  if (role && userRole !== role) {
    return <Navigate to="/" />;
  }

  // ✅ Allow access
  return children;
}

export default ProtectedRoute;