import { useState } from "react";
import { useSelector } from "react-redux";
import { DEFAULT_MEDIUMS } from "../../features/options/optionsSlice";

export default function MediumSelect({ selected, onChange }) {
  // selected: string[]
  const customOptions = useSelector((s) => s.options.mediumOptions);
  const customLabels = customOptions.map((o) => o.label);

  // Merge: defaults first, then custom (deduplicated)
  const allOptions = [
    ...DEFAULT_MEDIUMS,
    ...customLabels.filter((l) => !DEFAULT_MEDIUMS.includes(l)),
  ];

  const [addingCustom, setAddingCustom] = useState(false);
  const [customInput, setCustomInput] = useState("");

  const toggle = (label) => {
    if (selected.includes(label)) {
      onChange(selected.filter((t) => t !== label));
    } else {
      onChange([...selected, label]);
    }
  };

  const handleAddCustom = () => {
    const val = customInput.trim();
    if (!val || allOptions.includes(val)) return;
    onChange([...selected, val]);
    setCustomInput("");
    setAddingCustom(false);
  };

  return (
    <div className="tag-select">
      <div className="tag-chips">
        {allOptions.map((label) => (
          <button
            key={label}
            type="button"
            className={`tag-chip${selected.includes(label) ? " --active" : ""}`}
            onClick={() => toggle(label)}
          >
            {label}
          </button>
        ))}

        {addingCustom ? (
          <div className="tag-custom-input-row">
            <input
              autoFocus
              className="log-input tag-custom-input"
              placeholder="Custom medium..."
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
