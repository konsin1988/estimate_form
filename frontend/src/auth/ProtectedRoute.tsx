import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthProvider";

export default function ProtectedRoute() {
  const { loading, isAuthorized } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthorized) {
    return <Navigate to="/access-denied" replace />;
  }

  return <Outlet />;
}
