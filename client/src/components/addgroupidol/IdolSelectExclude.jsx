import { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { BASE_URL } from "../../constants/url";

const cf = (str) => str?.replace(/\b\w/g, (c) => c.toUpperCase()) ?? "";

/**
 * Like IdolSelect but inverted:
 * - Existing group → shows only "others" (idols NOT yet in this group)
 * - New/no group   → shows all idols (allForLog)
 */
export default function IdolSelectExclude({
  selectedGroup,
  value,
  onChange,
  onNewIdol,
}) {
  const token = useSelector((s) => s.auth.token);
  const allForLog = useSelector((s) => s.groups.allForLog);

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [availableIdols, setAvailableIdols] = useState([]);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Sync display text when value changes externally
  useEffect(() => {
    setQuery(value ? cf(value.name) : "");
  }, [value]);

  // Recompute available list when selected group changes
  useEffect(() => {
    if (selectedGroup?.id) {
      // Existing group: fetch by-group and expose only "others" (not members)
      axios
        .get(`${BASE_URL}/idols/by-group/${selectedGroup.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((r) => setAvailableIdols(r.data.others || []))
        .catch(() => setAvailableIdols([]));
    } else {
      // New group or nothing selected: all idols are fair game
      setAvailableIdols(allForLog);
    }
  }, [selectedGroup?.id, token, allForLog]);

  const q = query.trim().toLowerCase();
  const filtered = availableIdols.filter((i) =>
    i.name.toLowerCase().includes(q)
  );
  const allNames = availableIdols.map((i) => i.name.toLowerCase());
  const showAddNew = query.trim() !== "" && !allNames.includes(q);

  const handleSelect = (idol) => {
    onChange(idol);
    setOpen(false);
  };

  const handleInput = (e) => {
    setQuery(e.target.value);
    setOpen(true);
    if (!e.target.value.trim()) onChange(null);
  };

  const handleClear = () => {
    setQuery("");
    onChange(null);
    setOpen(false);
  };

  const emptyMsg = () => {
    if (query.trim()) return "No match found";
    if (selectedGroup?.id) return "All existing idols are already in this group";
    return "No idols yet";
  };

  const renderOption = (idol) => (
    <div
      key={idol.id}
      className={`log-dropdown-option${value?.id === idol.id ? " --active" : ""}`}
      onMouseDown={(e) => {
        e.preventDefault();
        handleSelect(idol);
      }}
    >
      {idol.photoUrl ? (
        <img src={idol.photoUrl} alt="" className="log-dropdown-thumb" />
      ) : (
        <div className="log-dropdown-initial">{cf(idol.name)[0]}</div>
      )}
      <span>{cf(idol.name)}</span>
    </div>
  );

  return (
    <div className="log-select-wrap" ref={ref}>
      <div className="log-select-input-row">
        <input
          className="log-input"
          placeholder="Idol"
          value={query}
          onChange={handleInput}
          onFocus={() => setOpen(true)}
          autoComplete="off"
        />
        {query && (
          <button
            className="log-select-clear"
            onClick={handleClear}
            type="button"
          >
            ×
          </button>
        )}
      </div>

      {open && (
        <div className="log-dropdown">
          {filtered.map(renderOption)}

          {showAddNew && (
            <div
              className="log-dropdown-option --add"
              onMouseDown={(e) => {
                e.preventDefault();
                onNewIdol(query.trim());
                setOpen(false);
              }}
            >
              <span className="log-dropdown-add-icon">+</span>
              Add &ldquo;{query.trim()}&rdquo; as new idol
            </div>
          )}

          {!filtered.length && !showAddNew && (
            <div className="log-dropdown-empty">{emptyMsg()}</div>
          )}
        </div>
      )}
    </div>
  );
}
