import { Navigate, Outlet, useLocation } from "react-router-dom";
import { isAuthenticated } from "../services/auth";

export default function RequireAuth() {
  const loc = useLocation();
  return isAuthenticated()
    ? <Outlet />
    : <Navigate to="/login" replace state={{ from: loc }} />;
}
