import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("loggedInUser"));

  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}