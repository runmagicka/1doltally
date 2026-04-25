import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProfile, updateAvatar } from "../features/auth/authSlice";
import { fetchStats } from "../features/stats/statsSlice";
import { toast } from "react-toastify";

const capitalizeFull = (str) =>
  str?.replace(/\b\w/g, (c) => c.toUpperCase()) ?? "";

const formatMonth = (ym) => {
  const [y, m] = ym.split("-");
  return new Date(y, m - 1).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });
};

// Simple heatmap: last 365 days
function Heatmap({ data }) {
  const countByDate = {};
  data.forEach(({ date, count }) => {
    countByDate[date] = count;
  });

  const today = new Date();
  const days = [];
  for (let i = 364; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({ date: key, count: countByDate[key] || 0 });
  }

  const max = Math.max(...days.map((d) => d.count), 1);

  const getColor = (count) => {
    if (!count) return "var(--surface-3)";
    const intensity = count / max;
    if (intensity < 0.25) return "rgba(127,119,221,0.3)";
    if (intensity < 0.5) return "rgba(127,119,221,0.55)";
    if (intensity < 0.75) return "rgba(127,119,221,0.75)";
    return "var(--accent)";
  };

  return (
    <div className="heatmap-wrap">
      <div className="heatmap-grid">
        {days.map(({ date, count }) => (
          <div
            key={date}
            className="heatmap-cell"
            style={{ background: getColor(count) }}
            title={`${date}: ${count} entr${count !== 1 ? "ies" : "y"}`}
          />
        ))}
      </div>
    </div>
  );
}

function BarList({ items, labelKey = "tag", countKey = "count" }) {
  const max = Math.max(...items.map((i) => i[countKey]), 1);
  return (
    <div className="bar-list">
      {items.slice(0, 8).map((item) => (
        <div key={item[labelKey]} className="bar-row">
          <span className="bar-label">{item[labelKey]}</span>
          <div className="bar-track">
            <div
              className="bar-fill"
              style={{ width: `${(item[countKey] / max) * 100}%` }}
            />
          </div>
          <span className="bar-count">{item[countKey]}</span>
        </div>
      ))}
    </div>
  );
}

export default function StatsPage() {
  const dispatch = useDispatch();
  const avatarInputRef = useRef(null);
  const { user } = useSelector((s) => s.auth);
  const { data, loading, error } = useSelector((s) => s.stats);

  useEffect(() => {
    if (!user) dispatch(fetchProfile());
    dispatch(fetchStats());
  }, []);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = await dispatch(updateAvatar(file));
    if (updateAvatar.fulfilled.match(result)) {
      toast.success("Avatar updated!");
    } else {
      toast.error(result.payload);
    }
  };

  const initial = user?.username?.charAt(0).toUpperCase() ?? "?";

  return (
    <div className="stats-page">
      {/* Profile header */}
      <div className="stats-profile">
        <div className="stats-avatar-wrap">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.username}
              className="stats-avatar"
            />
          ) : (
            <div className="stats-avatar-placeholder">{initial}</div>
          )}
          <button
            className="idol-photo-edit-btn"
            onClick={() => avatarInputRef.current?.click()}
            title="Change avatar"
          >
            ✎
          </button>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleAvatarChange}
          />
        </div>
        <div>
          <h1 className="stats-username">{user?.username ?? "..."}</h1>
          <p className="stats-email">{user?.email}</p>
        </div>
      </div>

      {loading && <p className="page-loading">Loading stats...</p>}
      {error && <p className="page-error">{error}</p>}

      {!loading && !data && (
        <p className="page-empty">No entries yet. Start logging!</p>
      )}

      {data && (
        <div className="stats-sections">
          {/* Overview */}
          <div className="stats-section">
            <h2 className="stats-section-title">Overview</h2>
            <div className="stats-overview-grid">
              <div className="stats-card">
                <span className="stats-card-num">{data.totalEntries}</span>
                <span className="stats-card-label">total entries</span>
              </div>
              <div className="stats-card">
                <span className="stats-card-num">{data.totalIdols}</span>
                <span className="stats-card-label">idols logged</span>
              </div>
              {data.mostLoyal && (
                <div className="stats-card">
                  <span className="stats-card-num">
                    {capitalizeFull(data.mostLoyal.idol?.name)}
                  </span>
                  <span className="stats-card-label">
                    most loyal · {data.mostLoyal.months} month
                    {data.mostLoyal.months !== 1 ? "s" : ""}
                  </span>
                </div>
              )}
              {data.hyperfixation && (
                <div className="stats-card stats-card-accent">
                  <span className="stats-card-num">
                    {capitalizeFull(data.hyperfixation.idol?.name)}
                  </span>
                  <span className="stats-card-label">
                    this month's hyperfixation · +{data.hyperfixation.increase}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Activity Heatmap */}
          <div className="stats-section">
            <h2 className="stats-section-title">Activity — last 365 days</h2>
            <Heatmap data={data.heatmapData} />
          </div>

          {/* Top idols */}
          {data.topIdols.length > 0 && (
            <div className="stats-section">
              <h2 className="stats-section-title">Top idols</h2>
              <BarList
                items={data.topIdols.map((t) => ({
                  tag: capitalizeFull(t.idol?.name),
                  count: t.count,
                }))}
              />
            </div>
          )}

          {/* Two column: thoughts + mediums */}
          <div className="stats-two-col">
            {data.thoughtBreakdown.length > 0 && (
              <div className="stats-section">
                <h2 className="stats-section-title">What you thought about</h2>
                <BarList items={data.thoughtBreakdown} />
              </div>
            )}
            {data.mediumBreakdown.length > 0 && (
              <div className="stats-section">
                <h2 className="stats-section-title">What you used</h2>
                <BarList items={data.mediumBreakdown} />
              </div>
            )}
          </div>

          {/* Time of day */}
          <div className="stats-section">
            <h2 className="stats-section-title">Time of day</h2>
            <div className="tod-grid">
              {data.timeOfDay.map(({ hour, count }) => {
                const max = Math.max(...data.timeOfDay.map((t) => t.count), 1);
                const height = count ? Math.max((count / max) * 60, 4) : 2;
                return (
                  <div
                    key={hour}
                    className="tod-col"
                    title={`${hour}:00 — ${count}`}
                  >
                    <div className="tod-bar" style={{ height }} />
                    {hour % 6 === 0 && (
                      <span className="tod-label">{hour}h</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
