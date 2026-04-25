import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import axios from "axios";
import { toast } from "react-toastify";
import { fetchGroups, fetchAllForLog } from "../features/groups/groupsSlice";
import { fetchOptions } from "../features/options/optionsSlice";
import { submitEntry } from "../features/entries/entriesSlice";
import { BASE_URL } from "../constants/url";
import IdolSelectorList, {
  makeSelector,
} from "../components/log/IdolSelectorList";
import LogPreview from "../components/log/LogPreview";
import ThoughtSelect from "../components/log/ThoughtSelect";
import MediumSelect from "../components/log/MediumSelect";
import "../index.css";

const toLocalDatetimeValue = (d = new Date()) => {
  // Returns "YYYY-MM-DDTHH:MM" for datetime-local input
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export default function LogPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = useSelector((s) => s.auth.token);
  const submitting = useSelector((s) => s.entries.loading);

  const [idolSelectors, setIdolSelectors] = useState([makeSelector()]);
  const [thoughts, setThoughts] = useState([]);
  const [mediumTags, setMediumTags] = useState([]);
  const [notes, setNotes] = useState("");
  const [loggedAt, setLoggedAt] = useState(toLocalDatetimeValue());

  useEffect(() => {
    dispatch(fetchGroups());
    dispatch(fetchAllForLog());
    dispatch(fetchOptions());
  }, [dispatch]);

  // Update idol photo from LogPreview edit button
  const handleIdolPhotoChange = (selectorId, file) => {
    setIdolSelectors((prev) =>
      prev.map((it) =>
        it.id === selectorId ? { ...it, idolPhotoFile: file } : it,
      ),
    );
  };

  const handleSubmit = async () => {
    // Validate: at least one idol selected or being created
    const valid = idolSelectors.some((it) => it.selectedIdol || it.isNewIdol);
    if (!valid) {
      toast.error("Please select at least one idol");
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    try {
      // ── Step 1: Create new groups ──────────────────────────────────────────
      const resolvedSelectors = [...idolSelectors];

      for (let i = 0; i < resolvedSelectors.length; i++) {
        const it = resolvedSelectors[i];
        if (!it.isNewGroup) continue;

        const fd = new FormData();
        fd.append("name", it.newGroupName.toLowerCase());
        if (it.groupPhotoFile) fd.append("photo", it.groupPhotoFile);

        const { data } = await axios.post(`${BASE_URL}/groups`, fd, {
          headers,
        });
        resolvedSelectors[i] = {
          ...it,
          isNewGroup: false,
          selectedGroup: data.group,
        };
      }

      // ── Step 2: Create new idols ───────────────────────────────────────────
      for (let i = 0; i < resolvedSelectors.length; i++) {
        const it = resolvedSelectors[i];
        if (!it.isNewIdol) continue;

        const fd = new FormData();
        fd.append("name", it.newIdolName.toLowerCase());
        if (it.selectedGroup?.id) fd.append("groupId", it.selectedGroup.id);
        if (it.idolPhotoFile) fd.append("photo", it.idolPhotoFile);

        const { data } = await axios.post(`${BASE_URL}/idols`, fd, { headers });
        resolvedSelectors[i] = {
          ...it,
          isNewIdol: false,
          selectedIdol: data.idol,
        };
      }

      // ── Step 3: Build entry body ───────────────────────────────────────────
      const entryIdols = resolvedSelectors
        .filter((it) => it.selectedIdol)
        .map((it) => {
          // Detect if idol is paired to a group it wasn't originally in
          const idol = it.selectedIdol;
          const groupId = it.selectedGroup?.id ?? null;
          const idolGroupIds = idol.Groups?.map((g) => g.id) ?? [];
          const isNewIdolGroupRelation =
            groupId !== null && !idolGroupIds.includes(groupId);

          return {
            idolId: idol.id,
            groupId,
            isNewIdol: false,
            isNewIdolGroupRelation,
            name: null,
            photoBase64: null,
          };
        });

      if (!entryIdols.length) {
        toast.error("Something went wrong building idol list");
        return;
      }

      const body = {
        loggedAt: new Date(loggedAt).toISOString(),
        idols: entryIdols,
        thoughts,
        mediumTags,
        notes: notes.trim() || null,
      };

      // ── Step 4: Submit entry ───────────────────────────────────────────────
      const result = await dispatch(submitEntry(body));

      if (submitEntry.rejected.match(result)) {
        toast.error(result.payload || "Failed to submit log");
        return;
      }

      toast.success("Log submitted! ✦");

      // ── Step 5: Navigate ───────────────────────────────────────────────────
      if (entryIdols.length === 1) {
        navigate(`/idol/${entryIdols[0].idolId}`);
      } else {
        navigate("/");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="log-page">
      <div className="log-header">
        <h1 className="log-title">New Log</h1>
        <p className="log-subtitle">Record who you were thinking about</p>
      </div>

      <div className="log-body">
        {/* ── Left: Idol Selectors + Preview ── */}
        <div className="log-left">
          <section className="log-section">
            <div className="log-section-label">Who?</div>
            <IdolSelectorList
              items={idolSelectors}
              onChange={setIdolSelectors}
            />
          </section>

          <section className="log-section">
            <LogPreview
              items={idolSelectors}
              onIdolPhotoChange={handleIdolPhotoChange}
            />
          </section>
        </div>

        {/* ── Right: Tags + Notes + Submit ── */}
        <div className="log-right">
          <section className="log-section">
            <div className="log-section-label">Thoughts</div>
            <ThoughtSelect
              thoughts={thoughts}
              onChange={setThoughts}
              idolItems={idolSelectors}
            />
          </section>

          <section className="log-section">
            <div className="log-section-label">Medium</div>
            <MediumSelect selected={mediumTags} onChange={setMediumTags} />
          </section>

          <section className="log-section">
            <div className="log-section-label">Notes</div>
            <textarea
              className="log-textarea"
              placeholder="Any thoughts to add? (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </section>

          <section className="log-section">
            <div className="log-section-label">When?</div>
            <input
              type="datetime-local"
              className="log-input"
              value={loggedAt}
              onChange={(e) => setLoggedAt(e.target.value)}
            />
          </section>

          <div className="log-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "Submitting…" : "Submit Log"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
