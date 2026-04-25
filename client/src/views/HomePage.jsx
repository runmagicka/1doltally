import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { fetchIdols } from "../features/idols/idolsSlice";
import { fetchProfile } from "../features/auth/authSlice";
import IdolCard from "../components/IdolCard";
import GroupSection from "../components/GroupSection";

const SORT_OPTIONS = [
  { value: "createdAt", label: "Last added" },
  { value: "name", label: "A–Z" },
  { value: "group", label: "By group" },
];

export default function HomePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { idols, loading, error } = useSelector((state) => state.idols);
  const user = useSelector((state) => state.auth.user);
  const [sort, setSort] = useState("createdAt");

  useEffect(() => {
    if (!user) dispatch(fetchProfile());
    dispatch(fetchIdols(sort === "group" ? "createdAt" : sort));
  }, [sort]);

  // Group by group name for "By group" sort
  const grouped = () => {
    const map = {};
    idols.forEach((idol) => {
      const groups = idol.Groups?.length
        ? idol.Groups
        : [{ name: "ungrouped" }];
      groups.forEach((g) => {
        if (!map[g.name]) map[g.name] = [];
        map[g.name].push(idol);
      });
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  };

  return (
    <div className="home-page">
      <div className="home-header">
        <div className="home-header-left">
          <h1 className="home-title">
            {user ? `Hey, ${user.username}` : "Your Idols"}
          </h1>
          <p className="home-subtitle">
            {idols.length} idol{idols.length !== 1 ? "s" : ""} tracked
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate("/log")}>
          + Add Log
        </button>
      </div>

      <div className="home-controls">
        <div className="type-tabs">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={`type-tab ${sort === opt.value ? "active" : ""}`}
              onClick={() => setSort(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {loading && <p className="page-loading">Loading...</p>}
      {error && <p className="page-error">{error}</p>}

      {!loading && !error && idols.length === 0 && (
        <div className="home-empty">
          <p>No idols yet.</p>
          <button className="btn btn-primary" onClick={() => navigate("/log")}>
            Log your first entry
          </button>
        </div>
      )}

      {!loading && idols.length > 0 && sort !== "group" && (
        <div className="idol-grid">
          {idols.map((idol) => (
            <IdolCard key={idol.id} idol={idol} />
          ))}
        </div>
      )}

      {!loading && idols.length > 0 && sort === "group" && (
        <div className="group-sections">
          {grouped().map(([groupName, groupIdols]) => (
            <GroupSection
              key={groupName}
              groupName={groupName}
              idols={groupIdols}
            />
          ))}
        </div>
      )}
    </div>
  );
}
