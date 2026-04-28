import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import axios from "axios";
import { toast } from "react-toastify";
import { fetchGroups, fetchAllForLog } from "../features/groups/groupsSlice";
import { BASE_URL } from "../constants/url";
import GroupSelect from "../components/log/GroupSelect";
import IdolSelectExclude from "../components/addgroupidol/IdolSelectExclude";
import AigPreview from "../components/addgroupidol/AigPreview";

let _uid = 0;
const uid = () => `aig_${++_uid}_${Date.now()}`;

const makeIdolEntry = () => ({
  id: uid(),
  selectedIdol: null,
  isNewIdol: false,
  newIdolName: "",
  idolPhotoFile: null,
});

export default function AddGroupIdolPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = useSelector((s) => s.auth.token);

  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isNewGroup, setIsNewGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [groupPhotoFile, setGroupPhotoFile] = useState(null);
  const [idolEntries, setIdolEntries] = useState([makeIdolEntry()]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchGroups());
    dispatch(fetchAllForLog());
  }, [dispatch]);

  // ── Group handlers ──────────────────────────────────────────────────────────

  const handleGroupChange = (group) => {
    setSelectedGroup(group);
    setIsNewGroup(false);
    setNewGroupName("");
    setGroupPhotoFile(null);
    setIdolEntries([makeIdolEntry()]);
  };

  const handleNewGroup = (name) => {
    setSelectedGroup(null);
    setIsNewGroup(true);
    setNewGroupName(name);
    setGroupPhotoFile(null);
    setIdolEntries([makeIdolEntry()]);
  };

  // ── Idol-entry helpers ──────────────────────────────────────────────────────

  const updateIdolEntry = (id, patch) =>
    setIdolEntries((prev) =>
      prev.map((it) => (it.id === id ? { ...it, ...patch } : it)),
    );

  const removeIdolEntry = (id) =>
    setIdolEntries((prev) => prev.filter((it) => it.id !== id));

  const addIdolEntry = () =>
    setIdolEntries((prev) => [...prev, makeIdolEntry()]);

  // ── Submit ──────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!isNewGroup && !selectedGroup) {
      toast.error("Please select or create a group");
      return;
    }
    const hasIdol = idolEntries.some((it) => it.selectedIdol || it.isNewIdol);
    if (!hasIdol) {
      toast.error("Please add at least one idol");
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };
    setSubmitting(true);

    try {
      // Step 1: Create group if new
      let resolvedGroup = selectedGroup;
      if (isNewGroup) {
        const fd = new FormData();
        fd.append("name", newGroupName);
        if (groupPhotoFile) fd.append("photo", groupPhotoFile);
        const { data } = await axios.post(`${BASE_URL}/groups`, fd, {
          headers,
        });
        resolvedGroup = data.group;
      }

      const groupId = resolvedGroup.id;

      // Step 2: Process each idol entry
      let count = 0;
      for (const entry of idolEntries) {
        if (!entry.selectedIdol && !entry.isNewIdol) continue;

        if (entry.isNewIdol) {
          const fd = new FormData();
          fd.append("name", entry.newIdolName.trim());
          fd.append("groupId", groupId);
          if (entry.idolPhotoFile) fd.append("photo", entry.idolPhotoFile);
          await axios.post(`${BASE_URL}/idols`, fd, { headers });
        } else {
          await axios.post(
            `${BASE_URL}/idols/${entry.selectedIdol.id}/groups`,
            { groupId },
            { headers },
          );
        }
        count++;
      }

      toast.success(
        `${count} idol${count !== 1 ? "s" : ""} registered to ${resolvedGroup.name}! ✦`,
      );
      navigate(`/group/${groupId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const effectiveGroup = isNewGroup
    ? { id: null, name: newGroupName }
    : selectedGroup;

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="log-page">
      <div className="log-header">
        <h1 className="log-title">Add Group / Idol</h1>
        <p className="log-subtitle">Register idols to a group</p>
      </div>

      <div className="aig-body">
        {/* ── Left: input container ── */}
        <div className="aig-container">
          {/* Group */}
          <div className="aig-field">
            <div className="log-section-label">Group</div>
            <GroupSelect
              value={
                isNewGroup ? { id: null, name: newGroupName } : selectedGroup
              }
              onChange={handleGroupChange}
              onNewGroup={handleNewGroup}
            />
            {isNewGroup && (
              <div className="selector-new-notice">
                <span className="new-badge">New group</span>
                <span className="new-name">{newGroupName}</span>
                <label className="photo-upload-label">
                  {groupPhotoFile
                    ? "✓ Photo selected"
                    : "Add group photo (optional)"}
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) =>
                      setGroupPhotoFile(e.target.files[0] || null)
                    }
                  />
                </label>
              </div>
            )}
          </div>

          {/* Idols */}
          <div className="aig-field">
            <div className="log-section-label">Idols</div>
            <div className="aig-idol-list">
              {idolEntries.map((entry) => (
                <div key={entry.id} className="aig-idol-entry">
                  <div className="aig-idol-input-row">
                    <IdolSelectExclude
                      selectedGroup={effectiveGroup}
                      value={
                        entry.isNewIdol
                          ? { id: null, name: entry.newIdolName }
                          : entry.selectedIdol
                      }
                      onChange={(idol) =>
                        updateIdolEntry(entry.id, {
                          selectedIdol: idol,
                          isNewIdol: false,
                          newIdolName: "",
                          idolPhotoFile: null,
                        })
                      }
                      onNewIdol={(name) =>
                        updateIdolEntry(entry.id, {
                          selectedIdol: null,
                          isNewIdol: true,
                          newIdolName: name,
                          idolPhotoFile: null,
                        })
                      }
                    />
                    {idolEntries.length > 1 && (
                      <button
                        className="selector-remove"
                        onClick={() => removeIdolEntry(entry.id)}
                        type="button"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  {entry.isNewIdol && (
                    <div className="selector-new-notice">
                      <span className="new-badge">New idol</span>
                      <span className="new-name">{entry.newIdolName}</span>
                      <label className="photo-upload-label">
                        {entry.idolPhotoFile
                          ? "✓ Photo selected"
                          : "Add idol photo (optional)"}
                        <input
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={(e) =>
                            updateIdolEntry(entry.id, {
                              idolPhotoFile: e.target.files[0] || null,
                            })
                          }
                        />
                      </label>
                    </div>
                  )}
                </div>
              ))}

              <button
                className="btn-add-idol"
                onClick={addIdolEntry}
                type="button"
              >
                + Add another idol
              </button>
            </div>
          </div>

          {/* Actions */}
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
              {submitting ? "Saving…" : "Save"}
            </button>
          </div>
        </div>

        {/* ── Right: preview ── */}
        <AigPreview
          selectedGroup={selectedGroup}
          isNewGroup={isNewGroup}
          newGroupName={newGroupName}
          groupPhotoFile={groupPhotoFile}
          idolEntries={idolEntries}
        />
      </div>
    </div>
  );
}
