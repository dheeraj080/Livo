import { Navigate } from "react-router";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null; // Or a nice minimalist loading spinner

  if (!user) {
    // If not logged in, send them to the landing/login page
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
