import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addOption,
  DEFAULT_THOUGHTS,
} from "../../features/options/optionsSlice";

const cf = (str) => str?.replace(/\b\w/g, (c) => c.toUpperCase()) ?? "";

export default function ThoughtSelect({ thoughts, onChange, idolItems }) {
  // thoughts: [{ tag: string, idolIds: number[] | "all" }]
  // idolItems: array of selector items (to get selected idols for sub-select)
  const dispatch = useDispatch();
  const customOptions = useSelector((s) => s.options.thoughtOptions);
  const customLabels = customOptions.map((o) => o.label);

  const allOptions = [
    ...DEFAULT_THOUGHTS,
    ...customLabels.filter((l) => !DEFAULT_THOUGHTS.includes(l)),
  ];

  const [addingCustom, setAddingCustom] = useState(false);
  const [customInput, setCustomInput] = useState("");

  // Build the list of selected idols with real IDs (existing only)
  const selectedIdols = idolItems
    .filter((it) => it.selectedIdol || it.isNewIdol)
    .map((it) => ({
      id: it.selectedIdol?.id ?? null, // null for new idols — they'll resolve to "all"
      name: it.isNewIdol ? it.newIdolName : it.selectedIdol?.name,
      itemId: it.id,
    }));

  const selectedTags = thoughts.map((t) => t.tag);

  const findThought = (tag) => thoughts.find((t) => t.tag === tag);

  const toggleTag = (label) => {
    if (selectedTags.includes(label)) {
      // Remove
      onChange(thoughts.filter((t) => t.tag !== label));
    } else {
      // Add — auto-assign idolIds
      let idolIds;
      if (selectedIdols.length === 0) {
        idolIds = "all";
      } else if (selectedIdols.length === 1) {
        idolIds = selectedIdols[0].id !== null ? [selectedIdols[0].id] : "all";
      } else {
        idolIds = "all";
      }
      onChange([...thoughts, { tag: label, idolIds }]);
    }
  };

  const setIdolIds = (tag, idolIds) => {
    onChange(thoughts.map((t) => (t.tag === tag ? { ...t, idolIds } : t)));
  };

  const handleAddCustom = async () => {
    const val = customInput.trim();
    if (!val || allOptions.includes(val)) return;
    setCustomInput("");
    setAddingCustom(false);
    // Persist to DB first — Redux state updates via addOption.fulfilled
    await dispatch(addOption({ category: "thought", label: val }));
    // Then toggle it as selected
    toggleTag(val);
  };

  const renderIdolPicker = (tag) => {
    if (selectedIdols.length <= 1) return null;
    const thought = findThought(tag);
    if (!thought) return null;

    const isAll = thought.idolIds === "all";
    const count = selectedIdols.length;

    return (
      <div className="thought-idol-picker">
        <button
          type="button"
          className={`thought-idol-option${isAll ? " --active" : ""}`}
          onClick={() => setIdolIds(tag, "all")}
        >
          {count === 2 ? "Both of them" : `All ${count} of them`}
        </button>
        {selectedIdols.map((idol) => {
          const active =
            !isAll &&
            Array.isArray(thought.idolIds) &&
            thought.idolIds.includes(idol.id);
          return (
            <button
              key={idol.itemId}
              type="button"
              className={`thought-idol-option${active ? " --active" : ""}`}
              onClick={() => {
                if (idol.id === null) {
                  // new idol — use "all" or skip
                  setIdolIds(tag, "all");
                  return;
                }
                if (active) {
                  // Deselect — go back to all
                  setIdolIds(tag, "all");
                } else {
                  setIdolIds(tag, [idol.id]);
                }
              }}
            >
              {cf(idol.name)}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="tag-select">
      <div className="tag-chips">
        {allOptions.map((label) => (
          <div key={label} className="thought-chip-group">
            <button
              type="button"
              className={`tag-chip${selectedTags.includes(label) ? " --active" : ""}`}
              onClick={() => toggleTag(label)}
            >
              {label}
            </button>
            {selectedTags.includes(label) && renderIdolPicker(label)}
          </div>
        ))}

        {addingCustom ? (
          <div className="tag-custom-input-row">
            <input
              autoFocus
              className="log-input tag-custom-input"
              placeholder="Custom thought..."
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddCustom();
                if (e.key === "Escape") setAddingCustom(false);
              }}
            />
            <button
              type="button"
              className="tag-custom-confirm"
              onClick={handleAddCustom}
            >
              ✓
            </button>
            <button
              type="button"
              className="tag-custom-cancel"
              onClick={() => setAddingCustom(false)}
            >
              ×
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="tag-chip --ghost"
            onClick={() => setAddingCustom(true)}
          >
            + Custom
          </button>
        )}
      </div>
    </div>
  );
}
