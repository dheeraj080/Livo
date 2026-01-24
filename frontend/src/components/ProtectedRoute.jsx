import { Navigate, Outlet } from "react-router";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return null; // Or a spinner

  // If user exists, render the "Outlet" (the child routes), else go home
  return user ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProtectedRoute;
