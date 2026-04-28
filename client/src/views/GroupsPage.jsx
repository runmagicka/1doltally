import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { fetchGroups } from "../features/groups/groupsSlice";

const capitalizeFull = (str) =>
  str?.replace(/\b\w/g, (c) => c.toUpperCase()) ?? "";

function GroupCircle({ group }) {
  const navigate = useNavigate();
  const initial = capitalizeFull(group.name).charAt(0);

  return (
    <button
      className="group-circle-btn"
      onClick={() => navigate(`/group/${group.id}`)}
    >
      <div className="group-circle-avatar">
        {group.photoUrl ? (
          <img src={group.photoUrl} alt={group.name} />
        ) : (
          <span className="group-circle-initial">{initial}</span>
        )}
      </div>
      <p className="group-circle-label">{capitalizeFull(group.name)}</p>
      <p className="group-circle-count">
        {group.Idols?.length ?? 0} member{group.Idols?.length !== 1 ? "s" : ""}
      </p>
    </button>
  );
}

export default function GroupsPage() {
  const dispatch = useDispatch();
  const { groups, loading } = useSelector((s) => s.groups);

  useEffect(() => {
    dispatch(fetchGroups());
  }, []);

  return (
    <div className="home-page">
      <div className="home-header">
        <div className="home-header-left">
          <h1 className="home-title">Groups</h1>
          <p className="home-subtitle">
            {loading
              ? "Loading…"
              : `${groups.length} group${groups.length !== 1 ? "s" : ""}`}
          </p>
        </div>
      </div>

      {loading && (
        <div className="groups-circle-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="group-circle-skeleton">
              <div className="group-circle-avatar skeleton-box" />
              <div className="skeleton-line" style={{ width: 60, marginTop: 10 }} />
            </div>
          ))}
        </div>
      )}

      {!loading && groups.length === 0 && (
        <div className="state-empty">
          <div className="state-empty-icon">✦</div>
          <p className="state-empty-title">No groups yet</p>
          <p className="state-empty-sub">
            Groups are created when you log an entry with a group assigned.
          </p>
        </div>
      )}

      {!loading && groups.length > 0 && (
        <div className="groups-circle-grid">
          {[...groups]
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((group) => (
              <GroupCircle key={group.id} group={group} />
            ))}
        </div>
      )}
    </div>
  );
}
