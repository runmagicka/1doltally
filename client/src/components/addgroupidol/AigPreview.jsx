const cf = (str) => str?.replace(/\b\w/g, (c) => c.toUpperCase()) ?? "";

export default function AigPreview({
  selectedGroup,
  isNewGroup,
  newGroupName,
  groupPhotoFile,
  idolEntries,
}) {
  const groupName = isNewGroup ? newGroupName : selectedGroup?.name;
  const groupPhoto = isNewGroup
    ? groupPhotoFile
      ? URL.createObjectURL(groupPhotoFile)
      : null
    : selectedGroup?.photoUrl;

  const hasGroup = isNewGroup || !!selectedGroup;
  const activeIdols = idolEntries.filter(
    (it) => it.selectedIdol || it.isNewIdol
  );

  if (!hasGroup && activeIdols.length === 0) {
    return (
      <div className="aig-preview aig-preview--empty">
        <div className="aig-preview-empty-icon">✦</div>
        <p>Fill in the form to preview</p>
      </div>
    );
  }

  return (
    <div className="aig-preview">
      {/* ── Group header ── */}
      {hasGroup && (
        <div className="aig-preview-group">
          <div className="aig-preview-group-logo">
            {groupPhoto ? (
              <img src={groupPhoto} alt={cf(groupName)} />
            ) : (
              <span className="aig-preview-group-initial">
                {cf(groupName)?.[0] ?? "?"}
              </span>
            )}
          </div>
          <div className="aig-preview-group-name">{cf(groupName)}</div>
          {isNewGroup && <span className="new-badge">New group</span>}
        </div>
      )}

      {/* ── Idol cards grid ── */}
      {activeIdols.length > 0 && (
        <div className="aig-preview-idols">
          {activeIdols.map((entry) => {
            const name = entry.isNewIdol
              ? entry.newIdolName
              : entry.selectedIdol?.name;
            const photo = entry.isNewIdol
              ? entry.idolPhotoFile
                ? URL.createObjectURL(entry.idolPhotoFile)
                : null
              : entry.selectedIdol?.photoUrl;

            return (
              <div key={entry.id} className="aig-preview-idol-card">
                <div className="aig-preview-idol-photo">
                  {photo ? (
                    <img src={photo} alt={cf(name)} />
                  ) : (
                    <div className="aig-preview-idol-initial">
                      {cf(name)?.[0] ?? "?"}
                    </div>
                  )}
                </div>
                <div className="aig-preview-idol-info">
                  <div className="aig-preview-idol-name">{cf(name)}</div>
                  {entry.isNewIdol && (
                    <span className="log-preview-new-tag">new</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
