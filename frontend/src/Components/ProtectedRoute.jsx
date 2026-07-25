import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute() {
  const token = localStorage.getItem("token");
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("loggedInUser"));
  } catch (err) {
    user = null;
  }

  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}