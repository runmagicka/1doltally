import { Navigate, Outlet } from "react-router";
import { useSelector } from "react-redux";
import Navbar from "../components/Navbar";

export default function MainLayout() {
  const token = useSelector((state) => state.auth.token);

  if (!token) return <Navigate to="/login" replace />;

  return (
    <>
      <Navbar />
      <main className="page-content">
        <Outlet />
      </main>
    </>
  );
}
