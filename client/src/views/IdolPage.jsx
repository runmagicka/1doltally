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
import Spinner from "../components/Spinner";

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

function computeStats(entries, idolId) {
  if (!entries.length) return null;
  const sorted = [...entries].sort(
    (a, b) => new Date(a.loggedAt) - new Date(b.loggedAt),
  );
  const thoughtCount = {};
  entries.forEach((e) => {
    e.EntryThoughts?.forEach((t) => {
      const included = t.idolIds?.includes(idolId) || t.idolIds?.length === 0;
      if (included) thoughtCount[t.tag] = (thoughtCount[t.tag] || 0) + 1;
    });
  });
  const mediumCount = {};
  entries.forEach((e) => {
    e.mediumTags?.forEach((m) => {
      mediumCount[m] = (mediumCount[m] || 0) + 1;
    });
  });
  return {
    firstEntry: sorted[0].loggedAt,
    lastEntry: sorted[sorted.length - 1].loggedAt,
    totalCount: entries.length,
    topThoughts: Object.entries(thoughtCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3),
    topMediums: Object.entries(mediumCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3),
  };
}

function HeroSkeleton() {
  return (
    <div className="idol-hero skeleton-hero" aria-hidden="true">
      <div
        className="idol-hero-photo-wrap skeleton-box"
        style={{ borderRadius: "var(--r-xl)" }}
      />
      <div className="idol-hero-info">
        <div
          className="skeleton-line"
          style={{ width: "50%", height: 28, marginBottom: 8 }}
        />
        <div className="skeleton-line" style={{ width: "30%" }} />
        <div className="idol-stats-grid" style={{ marginTop: 20 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="idol-stat">
              <div
                className="skeleton-line"
                style={{ width: "60%", height: 22 }}
              />
              <div
                className="skeleton-line"
                style={{ width: "80%", marginTop: 4 }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function IdolPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const photoInputRef = useRef(null);

  const { idolDetail, loading: idolLoading } = useSelector((s) => s.idols);
  const { entries, loading: entriesLoading } = useSelector((s) => s.entries);
  const [deletingId, setDeletingId] = useState(null);
  const [photoUploading, setPhotoUploading] = useState(false);

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
    setPhotoUploading(true);
    const result = await dispatch(updateIdolPhoto({ id, file }));
    setPhotoUploading(false);
    if (updateIdolPhoto.fulfilled.match(result))
      toast.success("Photo updated!");
    else toast.error(result.payload);
  };

  const handleDelete = async (entryId) => {
    if (!confirm("Delete this entry?")) return;
    setDeletingId(entryId);
    const result = await dispatch(deleteEntry(entryId));
    setDeletingId(null);
    if (deleteEntry.fulfilled.match(result)) {
      toast.success("Entry deleted");
      dispatch(fetchIdolDetail(id));
    } else {
      toast.error(result.payload);
    }
  };

  if (idolLoading) {
    return (
      <div className="idol-page">
        <button
          className="btn btn-ghost idol-back-btn"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>
        <HeroSkeleton />
      </div>
    );
  }

  if (!idolDetail) {
    return (
      <div className="idol-page">
        <button
          className="btn btn-ghost idol-back-btn"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>
        <div className="state-error">
          <span className="state-error-icon">⚠</span>
          <p>Idol not found.</p>
        </div>
      </div>
    );
  }

  const stats = computeStats(entries, Number(id));
  const displayName = capitalizeFull(idolDetail.name);
  const groups = idolDetail.Groups?.map((g) => capitalizeFull(g.name)).join(
    ", ",
  );

  return (
    <div className="idol-page">
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
            disabled={photoUploading}
            title="Change photo"
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
            <div className="idol-no-entries-cta">
              <p>No entries yet for {displayName}.</p>
              <button
                className="btn btn-primary"
                onClick={() => navigate("/log")}
              >
                Log an entry
              </button>
            </div>
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

        {entriesLoading && (
          <div className="entries-skeleton">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="entry-card skeleton-entry"
                aria-hidden="true"
              >
                <div className="skeleton-line" style={{ width: "40%" }} />
                <div
                  className="skeleton-line"
                  style={{ width: "70%", marginTop: 8 }}
                />
                <div
                  className="skeleton-line"
                  style={{ width: "55%", marginTop: 6 }}
                />
              </div>
            ))}
          </div>
        )}

        {!entriesLoading && entries.length === 0 && (
          <div className="state-empty state-empty--inline">
            <p className="state-empty-sub">No entries logged yet.</p>
          </div>
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
                    className="entry-delete-btn"
                    onClick={() => handleDelete(entry.id)}
                    disabled={deletingId === entry.id}
                  >
                    {deletingId === entry.id ? <Spinner size={13} /> : "Delete"}
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
