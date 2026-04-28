import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchGroupDetail,
  updateGroupPhoto,
  clearGroupDetail,
} from "../features/groups/groupsSlice";
import { toast } from "react-toastify";
import Spinner from "../components/Spinner";

const capitalizeFull = (str) =>
  str?.replace(/\b\w/g, (c) => c.toUpperCase()) ?? "";

function MemberChip({ idol }) {
  const navigate = useNavigate();
  const initial = capitalizeFull(idol.name).charAt(0);
  return (
    <button
      className="member-chip"
      onClick={() => navigate(`/idol/${idol.id}`)}
    >
      {idol.photoUrl ? (
        <img src={idol.photoUrl} alt={idol.name} className="member-chip-img" />
      ) : (
        <span className="member-chip-initial">{initial}</span>
      )}
      <span className="member-chip-name">{capitalizeFull(idol.name)}</span>
    </button>
  );
}

export default function IdolGroupPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const photoInputRef = useRef(null);
  const [photoUploading, setPhotoUploading] = useState(false);

  const { groupDetail, groupStats, detailLoading } = useSelector(
    (s) => s.groups,
  );

  useEffect(() => {
    dispatch(fetchGroupDetail(id));
    return () => dispatch(clearGroupDetail());
  }, [id]);

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoUploading(true);
    const result = await dispatch(updateGroupPhoto({ id, file }));
    setPhotoUploading(false);
    if (updateGroupPhoto.fulfilled.match(result)) toast.success("Logo updated!");
    else toast.error(result.payload);
  };

  if (detailLoading) {
    return (
      <div className="idol-page">
        <button className="btn btn-ghost idol-back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <div className="idol-hero skeleton-hero" aria-hidden="true">
          <div className="idol-hero-photo-wrap skeleton-box" style={{ borderRadius: "50%" }} />
          <div className="idol-hero-info">
            <div className="skeleton-line" style={{ width: "40%", height: 28, marginBottom: 8 }} />
            <div className="skeleton-line" style={{ width: "25%" }} />
          </div>
        </div>
      </div>
    );
  }

  if (!groupDetail) {
    return (
      <div className="idol-page">
        <button className="btn btn-ghost idol-back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <div className="state-error">
          <span className="state-error-icon">⚠</span>
          <p>Group not found.</p>
        </div>
      </div>
    );
  }

  const members = groupDetail.Idols ?? [];
  const displayName = capitalizeFull(groupDetail.name);
  const initial = displayName.charAt(0);
  const topIdolName = groupStats?.topIdol
    ? capitalizeFull(groupStats.topIdol.name)
    : null;

  return (
    <div className="idol-page">
      <button className="btn btn-ghost idol-back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      {/* Hero */}
      <div className="idol-hero">
        <div className="idol-hero-photo-wrap group-logo-wrap">
          {groupDetail.photoUrl ? (
            <img
              src={groupDetail.photoUrl}
              alt={displayName}
              className="idol-hero-photo"
            />
          ) : (
            <div className="idol-hero-photo-placeholder group-logo-placeholder">
              {initial}
            </div>
          )}
          <button
            className="idol-photo-edit-btn"
            onClick={() => photoInputRef.current?.click()}
            disabled={photoUploading}
            title="Change group logo"
          >
            {photoUploading ? <Spinner size={14} /> : "✎"}
          </button>
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handlePhotoChange}
          />
        </div>

        <div className="idol-hero-info">
          <h1 className="idol-hero-name">{displayName}</h1>
          <p className="idol-hero-groups">
            {members.length} member{members.length !== 1 ? "s" : ""}
          </p>

          {groupStats && (
            <div className="idol-stats-grid" style={{ marginTop: 16 }}>
              <div className="idol-stat">
                <span className="idol-stat-num">{groupStats.totalEntries}</span>
                <span className="idol-stat-label">total entries</span>
              </div>
              {topIdolName && (
                <div className="idol-stat">
                  <span className="idol-stat-num">{topIdolName}</span>
                  <span className="idol-stat-label">
                    top idol · {groupStats.topIdol.entryCount} entries
                  </span>
                </div>
              )}
              <div className="idol-stat">
                <span className="idol-stat-num">{members.length}</span>
                <span className="idol-stat-label">members</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Members */}
      <div className="idol-history">
        <h2 className="idol-history-title">
          Members
          {members.length > 0 && (
            <span className="idol-history-count">{members.length}</span>
          )}
        </h2>

        {members.length === 0 ? (
          <div className="state-empty state-empty--inline">
            <p className="state-empty-sub">No members in this group yet.</p>
          </div>
        ) : (
          <div className="members-chip-grid">
            {[...members]
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((idol) => (
                <MemberChip key={idol.id} idol={idol} />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
