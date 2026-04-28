import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { fetchIdols } from "../features/idols/idolsSlice";
import IdolCard from "../components/IdolCard";
import SkeletonCard from "../components/SkeletonCard";

export default function IdolsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { idols, loading, error } = useSelector((s) => s.idols);

  useEffect(() => {
    dispatch(fetchIdols("name"));
  }, []);

  return (
    <div className="home-page">
      <div className="home-header">
        <div className="home-header-left">
          <h1 className="home-title">All Idols</h1>
          <p className="home-subtitle">
            {loading
              ? "Loading…"
              : `${idols.length} idol${idols.length !== 1 ? "s" : ""} tracked`}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate("/log")}>
          + Add Log
        </button>
      </div>

      {error && (
        <div className="state-error">
          <span className="state-error-icon">⚠</span>
          <p>{error}</p>
          <button
            className="btn btn-secondary"
            onClick={() => dispatch(fetchIdols("name"))}
          >
            Try again
          </button>
        </div>
      )}

      {loading && !error && (
        <div className="idol-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {!loading && !error && idols.length === 0 && (
        <div className="state-empty">
          <div className="state-empty-icon">✦</div>
          <p className="state-empty-title">No idols yet</p>
          <p className="state-empty-sub">
            Log your first entry and your idols will appear here.
          </p>
          <button className="btn btn-primary" onClick={() => navigate("/log")}>
            Log your first entry
          </button>
        </div>
      )}

      {!loading && !error && idols.length > 0 && (
        <div className="idol-grid">
          {idols.map((idol) => (
            <IdolCard key={idol.id} idol={idol} />
          ))}
        </div>
      )}
    </div>
  );
}
