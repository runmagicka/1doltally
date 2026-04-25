import { useNavigate } from "react-router";

const capitalizeFull = (str) =>
  str?.replace(/\b\w/g, (c) => c.toUpperCase()) ?? "";

export default function IdolCard({ idol }) {
  const navigate = useNavigate();
  const { id, name, photoUrl, Groups, entryCount } = idol;

  const displayName = capitalizeFull(name);
  const groupNames =
    Groups?.map((g) => capitalizeFull(g.name)).join(", ") || "";
  const initial = displayName.charAt(0);

  return (
    <div className="idol-card" onClick={() => navigate(`/idol/${id}`)}>
      <div className="idol-card-photo">
        {photoUrl ? (
          <img src={photoUrl} alt={displayName} />
        ) : (
          <span className="idol-card-initial">{initial}</span>
        )}
        <span className="idol-card-count">{entryCount ?? 0}</span>
      </div>
      <div className="idol-card-info">
        <p className="idol-card-name">{displayName}</p>
        {groupNames && <p className="idol-card-group">{groupNames}</p>}
      </div>
    </div>
  );
}
