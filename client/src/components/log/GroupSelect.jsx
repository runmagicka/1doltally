import { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";

const cf = (str) => str?.replace(/\b\w/g, (c) => c.toUpperCase()) ?? "";

export default function GroupSelect({ value, onChange, onNewGroup }) {
  // value: { id, name, photoUrl } | null
  const groups = useSelector((s) => s.groups.groups);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    setQuery(value ? cf(value.name) : "");
  }, [value]);

  const q = query.trim().toLowerCase();
  const filtered = groups.filter((g) => g.name.toLowerCase().includes(q));
  const showAddNew =
    query.trim() !== "" && !filtered.some((g) => g.name.toLowerCase() === q);

  const handleSelect = (g) => {
    onChange(g);
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

  return (
    <div className="log-select-wrap" ref={ref}>
      <div className="log-select-input-row">
        <input
          className="log-input"
          placeholder="Group"
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
          {filtered.map((g) => (
            <div
              key={g.id}
              className={`log-dropdown-option${value?.id === g.id ? " --active" : ""}`}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(g);
              }}
            >
              {g.photoUrl ? (
                <img src={g.photoUrl} alt="" className="log-dropdown-thumb" />
              ) : (
                <div className="log-dropdown-initial">{cf(g.name)[0]}</div>
              )}
              <span>{cf(g.name)}</span>
            </div>
          ))}

          {showAddNew && (
            <div
              className="log-dropdown-option --add"
              onMouseDown={(e) => {
                e.preventDefault();
                onNewGroup(query.trim());
                setOpen(false);
              }}
            >
              <span className="log-dropdown-add-icon">+</span>
              Add &ldquo;{query.trim()}&rdquo; as new group
            </div>
          )}

          {!filtered.length && !showAddNew && (
            <div className="log-dropdown-empty">No groups yet</div>
          )}
        </div>
      )}
    </div>
  );
}
