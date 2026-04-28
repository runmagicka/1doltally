import { Routes, Route, Navigate } from "react-router";
import AuthLayout from "./layouts/AuthLayout";
import MainLayout from "./layouts/MainLayout";
import LoginPage from "./views/LoginPage";
import RegisterPage from "./views/RegisterPage";
import HomePage from "./views/HomePage";
import IdolPage from "./views/IdolPage";
import LogPage from "./views/LogPage";
import StatsPage from "./views/StatsPage";
import IdolsPage from "./views/IdolsPage";
import GroupsPage from "./views/GroupsPage";
import IdolGroupPage from "./views/IdolGroupPage";
import AddGroupIdolPage from "./views/AddGroupIdolPage";

function App() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/idols" element={<IdolsPage />} />
        <Route path="/groups" element={<GroupsPage />} />
        <Route path="/group/:id" element={<IdolGroupPage />} />
        <Route path="/idol/:id" element={<IdolPage />} />
        <Route path="/log" element={<LogPage />} />
        <Route path="/add" element={<AddGroupIdolPage />} />
        <Route path="/stats" element={<StatsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;