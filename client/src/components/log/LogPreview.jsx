const cf = (str) => str?.replace(/\b\w/g, (c) => c.toUpperCase()) ?? "";

export default function LogPreview({ items, onIdolPhotoChange }) {
  // items: array of selector items
  const selected = items.filter((it) => it.isNewIdol || it.selectedIdol);

  if (!selected.length) {
    return (
      <div className="log-preview log-preview--empty">
        <div className="log-preview-empty-icon">✦</div>
        <p>Select an idol to preview</p>
      </div>
    );
  }

  return (
    <div className="log-preview">
      <div className="log-preview-label">Selected</div>
      <div className="log-preview-grid">
        {selected.map((item) => {
          const name = item.isNewIdol
            ? item.newIdolName
            : item.selectedIdol?.name;
          const photo = item.isNewIdol
            ? item.idolPhotoFile
              ? URL.createObjectURL(item.idolPhotoFile)
              : null
            : item.selectedIdol?.photoUrl;
          const groupName = item.isNewGroup
            ? item.newGroupName
            : item.selectedGroup?.name;

          return (
            <div key={item.id} className="log-preview-card">
              <div className="log-preview-photo">
                {photo ? (
                  <img src={photo} alt={cf(name)} />
                ) : (
                  <div className="log-preview-initial">{cf(name)[0]}</div>
                )}
                <label className="log-preview-edit" title="Change photo">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) =>
                      onIdolPhotoChange(item.id, e.target.files[0])
                    }
                  />
                </label>
              </div>
              <div className="log-preview-info">
                <div className="log-preview-name">{cf(name)}</div>
                {groupName && (
                  <div className="log-preview-group">{cf(groupName)}</div>
                )}
                {(item.isNewGroup || item.isNewIdol) && (
                  <div className="log-preview-new-tag">
                    {item.isNewIdol ? "new idol" : "new group"}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
