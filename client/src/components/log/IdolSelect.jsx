import { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { BASE_URL } from "../../constants/url";

const cf = (str) => str?.replace(/\b\w/g, (c) => c.toUpperCase()) ?? "";

export default function IdolSelect({
  selectedGroup,
  value,
  onChange,
  onNewIdol,
}) {
  // selectedGroup: { id, name, photoUrl } | null (existing group)
  // value: { id, name, photoUrl } | null
  const token = useSelector((s) => s.auth.token);
  const allForLog = useSelector((s) => s.groups.allForLog);

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [members, setMembers] = useState([]);
  const [others, setOthers] = useState([]);
  const [localList, setLocalList] = useState([]); // used when no group selected
  const ref = useRef(null);

  // Click outside
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Sync display when value changes
  useEffect(() => {
    setQuery(value ? cf(value.name) : "");
  }, [value]);

  // Fetch idols by group when selectedGroup changes
  useEffect(() => {
    if (selectedGroup?.id) {
      axios
        .get(`${BASE_URL}/idols/by-group/${selectedGroup.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((r) => {
          setMembers(r.data.members || []);
          setOthers(r.data.others || []);
        })
        .catch(() => {
          setMembers([]);
          setOthers([]);
        });
    } else {
      setMembers([]);
      setOthers([]);
    }
  }, [selectedGroup?.id, token]);

  // Use allForLog when no group selected
  useEffect(() => {
    if (!selectedGroup?.id) {
      setLocalList(allForLog);
    }
  }, [allForLog, selectedGroup?.id]);

  const q = query.trim().toLowerCase();

  const filterList = (list) =>
    list.filter((i) => i.name.toLowerCase().includes(q));

  const filteredMembers = filterList(members);
  const filteredOthers = filterList(others);
  const filteredAll = filterList(localList);

  const hasGroupSelected = !!selectedGroup?.id;
  const hasResults = hasGroupSelected
    ? filteredMembers.length > 0 || filteredOthers.length > 0
    : filteredAll.length > 0;

  const allNames = hasGroupSelected
    ? [...members, ...others].map((i) => i.name.toLowerCase())
    : localList.map((i) => i.name.toLowerCase());

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
          {hasGroupSelected ? (
            <>
              {filteredMembers.length > 0 && (
                <>
                  <div className="log-dropdown-section-label">Members</div>
                  {filteredMembers.map(renderOption)}
                </>
              )}
              {filteredMembers.length > 0 && filteredOthers.length > 0 && (
                <div className="log-dropdown-divider" />
              )}
              {filteredOthers.length > 0 && (
                <>
                  <div className="log-dropdown-section-label">Others</div>
                  {filteredOthers.map(renderOption)}
                </>
              )}
            </>
          ) : (
            filteredAll.map(renderOption)
          )}

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

          {!hasResults && !showAddNew && (
            <div className="log-dropdown-empty">
              {query.trim() ? "No match found" : "No idols yet"}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
