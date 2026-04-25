import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchIdolDetail,
  updateIdolPhoto,
  clearIdolDetail,
} from "../features/idols/idolsSlice";
import {
  fetchEntriesByIdol,
  deleteEntry,
  clearEntries,
} from "../features/entries/entriesSlice";
import { toast } from "react-toastify";

const capitalizeFull = (str) =>
  str?.replace(/\b\w/g, (c) => c.toUpperCase()) ?? "";

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const formatDateTime = (iso) =>
  new Date(iso).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

// Compute stats from entries for a specific idol
function computeStats(entries, idolId) {
  if (!entries.length) return null;

  const sorted = [...entries].sort(
    (a, b) => new Date(a.loggedAt) - new Date(b.loggedAt),
  );

  // Thought tag frequency (only tags where this idol is included)
  const thoughtCount = {};
  entries.forEach((e) => {
    e.EntryThoughts?.forEach((t) => {
      const included = t.idolIds?.includes(idolId) || t.idolIds?.length === 0; // empty = all
      if (included) {
        thoughtCount[t.tag] = (thoughtCount[t.tag] || 0) + 1;
      }
    });
  });

  // Medium tag frequency
  const mediumCount = {};
  entries.forEach((e) => {
    e.mediumTags?.forEach((m) => {
      mediumCount[m] = (mediumCount[m] || 0) + 1;
    });
  });

  const topThoughts = Object.entries(thoughtCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  const topMediums = Object.entries(mediumCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  return {
    firstEntry: sorted[0].loggedAt,
    lastEntry: sorted[sorted.length - 1].loggedAt,
    totalCount: entries.length,
    topThoughts,
    topMediums,
  };
}

export default function IdolPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const photoInputRef = useRef(null);

  const { idolDetail, loading: idolLoading } = useSelector((s) => s.idols);
  const { entries, loading: entriesLoading } = useSelector((s) => s.entries);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    dispatch(fetchIdolDetail(id));
    dispatch(fetchEntriesByIdol(id));
    return () => {
      dispatch(clearIdolDetail());
      dispatch(clearEntries());
    };
  }, [id]);

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = await dispatch(updateIdolPhoto({ id, file }));
    if (updateIdolPhoto.fulfilled.match(result)) {
      toast.success("Photo updated!");
    } else {
      toast.error(result.payload);
    }
  };

  const handleDelete = async (entryId) => {
    if (!confirm("Delete this entry?")) return;
    setDeletingId(entryId);
    const result = await dispatch(deleteEntry(entryId));
    setDeletingId(null);
    if (deleteEntry.fulfilled.match(result)) {
      toast.success("Entry deleted");
      // Refresh idol to update entryCount
      dispatch(fetchIdolDetail(id));
    } else {
      toast.error(result.payload);
    }
  };

  if (idolLoading) return <p className="page-loading">Loading...</p>;
  if (!idolDetail) return <p className="page-error">Idol not found.</p>;

  const stats = computeStats(entries, Number(id));
  const displayName = capitalizeFull(idolDetail.name);
  const groups = idolDetail.Groups?.map((g) => capitalizeFull(g.name)).join(
    ", ",
  );

  return (
    <div className="idol-page">
      {/* Back */}
      <button
        className="btn btn-ghost idol-back-btn"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>

      {/* Hero */}
      <div className="idol-hero">
        <div className="idol-hero-photo-wrap">
          {idolDetail.photoUrl ? (
            <img
              src={idolDetail.photoUrl}
              alt={displayName}
              className="idol-hero-photo"
            />
          ) : (
            <div className="idol-hero-photo-placeholder">
              {displayName.charAt(0)}
            </div>
          )}
          <button
            className="idol-photo-edit-btn"
            onClick={() => photoInputRef.current?.click()}
            title="Change photo"
          >
            ✎
          </button>
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handlePhotoChange}
          />
        </div>

        <div className="idol-hero-info">
          <h1 className="idol-hero-name">{displayName}</h1>
          {groups && <p className="idol-hero-groups">{groups}</p>}

          {stats && (
            <div className="idol-stats-grid">
              <div className="idol-stat">
                <span className="idol-stat-num">{stats.totalCount}</span>
                <span className="idol-stat-label">total entries</span>
              </div>
              <div className="idol-stat">
                <span className="idol-stat-num">
                  {formatDate(stats.firstEntry)}
                </span>
                <span className="idol-stat-label">first entry</span>
              </div>
              <div className="idol-stat">
                <span className="idol-stat-num">
                  {formatDate(stats.lastEntry)}
                </span>
                <span className="idol-stat-label">last entry</span>
              </div>
            </div>
          )}

          {stats?.topThoughts.length > 0 && (
            <div className="idol-tags-row">
              <span className="idol-tags-label">You often think about</span>
              <div className="idol-tags">
                {stats.topThoughts.map(([tag, count]) => (
                  <span key={tag} className="idol-tag">
                    {tag}
                    <span className="idol-tag-count">{count}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {stats?.topMediums.length > 0 && (
            <div className="idol-tags-row">
              <span className="idol-tags-label">Usually via</span>
              <div className="idol-tags">
                {stats.topMediums.map(([tag, count]) => (
                  <span key={tag} className="idol-tag">
                    {tag}
                    <span className="idol-tag-count">{count}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {!stats && !entriesLoading && (
            <p className="idol-no-entries">No entries yet for this idol.</p>
          )}
        </div>
      </div>

      {/* Entry History */}
      <div className="idol-history">
        <h2 className="idol-history-title">
          Entry history
          {entries.length > 0 && (
            <span className="idol-history-count">{entries.length}</span>
          )}
        </h2>

        {entriesLoading && <p className="page-loading">Loading entries...</p>}

        {!entriesLoading && entries.length === 0 && (
          <p className="page-empty">No entries yet.</p>
        )}

        <div className="idol-history-list">
          {[...entries]
            .sort((a, b) => new Date(b.loggedAt) - new Date(a.loggedAt))
            .map((entry) => (
              <div key={entry.id} className="entry-card">
                <div className="entry-card-header">
                  <span className="entry-card-date">
                    {formatDateTime(entry.loggedAt)}
                  </span>
                  <button
                    className="btn btn-danger entry-delete-btn"
                    onClick={() => handleDelete(entry.id)}
                    disabled={deletingId === entry.id}
                  >
                    {deletingId === entry.id ? "..." : "Delete"}
                  </button>
                </div>

                {entry.EntryThoughts?.length > 0 && (
                  <div className="entry-card-row">
                    <span className="entry-card-row-label">Thought about</span>
                    <div className="idol-tags">
                      {entry.EntryThoughts.map((t) => (
                        <span key={t.id} className="idol-tag">
                          {t.tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {entry.mediumTags?.length > 0 && (
                  <div className="entry-card-row">
                    <span className="entry-card-row-label">Via</span>
                    <div className="idol-tags">
                      {entry.mediumTags.map((m) => (
                        <span key={m} className="idol-tag">
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {entry.notes && (
                  <p className="entry-card-notes">{entry.notes}</p>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
