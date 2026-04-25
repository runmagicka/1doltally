import { Navigate, Outlet } from "react-router";
import { useSelector } from "react-redux";

export default function AuthLayout() {
  const token = useSelector((state) => state.auth.token);

  if (token) return <Navigate to="/" replace />;

  return <Outlet />;
}
