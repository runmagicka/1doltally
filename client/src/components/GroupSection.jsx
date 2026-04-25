import { useState } from "react";
import IdolCard from "./IdolCard";

const capitalizeFull = (str) =>
  str?.replace(/\b\w/g, (c) => c.toUpperCase()) ?? "";

export default function GroupSection({ groupName, idols }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="group-section">
      <button
        className="group-section-header"
        onClick={() => setCollapsed((p) => !p)}
      >
        <span className="group-section-name">{capitalizeFull(groupName)}</span>
        <span className="group-section-count">{idols.length}</span>
        <span className={`vibe-collapse-icon ${collapsed ? "collapsed" : ""}`}>
          ▼
        </span>
      </button>

      <div className={`vibe-group-body ${collapsed ? "is-collapsed" : ""}`}>
        <div className="vibe-group-items">
          <div className="idol-grid">
            {idols.map((idol) => (
              <IdolCard key={idol.id} idol={idol} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
