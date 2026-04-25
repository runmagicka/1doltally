import GroupSelect from "./GroupSelect"
import IdolSelect from "./IdolSelect"

export default function IdolSelectorPair({ item, onChange, onRemove, showRemove }) {
  const update = (patch) => onChange({ ...item, ...patch })

  const handleGroupChange = (group) => {
    // Reset idol selection when group changes
    update({
      selectedGroup: group,
      selectedIdol: null,
      isNewGroup: false,
      isNewIdol: false,
      newGroupName: "",
      newIdolName: "",
      groupPhotoFile: null,
      idolPhotoFile: null,
    })
  }

  const handleNewGroup = (name) => {
    update({
      selectedGroup: null,
      isNewGroup: true,
      newGroupName: name,
      selectedIdol: null,
      isNewIdol: false,
      newIdolName: "",
    })
  }

  const handleIdolChange = (idol) => {
    update({ selectedIdol: idol, isNewIdol: false, newIdolName: "", idolPhotoFile: null })
  }

  const handleNewIdol = (name) => {
    update({ selectedIdol: null, isNewIdol: true, newIdolName: name, idolPhotoFile: null })
  }

  // Effective "selectedGroup" for IdolSelect — either existing or the new-group placeholder
  const effectiveGroup = item.isNewGroup
    ? { id: null, name: item.newGroupName }
    : item.selectedGroup

  return (
    <div className="selector-pair">
      <div className="selector-pair-selects">
        <GroupSelect
          value={item.isNewGroup ? { id: null, name: item.newGroupName } : item.selectedGroup}
          onChange={handleGroupChange}
          onNewGroup={handleNewGroup}
        />
        <IdolSelect
          selectedGroup={effectiveGroup}
          value={item.isNewIdol ? { id: null, name: item.newIdolName } : item.selectedIdol}
          onChange={handleIdolChange}
          onNewIdol={handleNewIdol}
        />
      </div>

      {/* New group photo upload */}
      {item.isNewGroup && (
        <div className="selector-new-notice">
          <span className="new-badge">New group</span>
          <span className="new-name">{item.newGroupName}</span>
          <label className="photo-upload-label">
            {item.groupPhotoFile ? "✓ Photo selected" : "Add group photo (optional)"}
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => update({ groupPhotoFile: e.target.files[0] || null })}
            />
          </label>
        </div>
      )}

      {/* New idol photo upload */}
      {item.isNewIdol && (
        <div className="selector-new-notice">
          <span className="new-badge">New idol</span>
          <span className="new-name">{item.newIdolName}</span>
          <label className="photo-upload-label">
            {item.idolPhotoFile ? "✓ Photo selected" : "Add idol photo (optional)"}
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => update({ idolPhotoFile: e.target.files[0] || null })}
            />
          </label>
        </div>
      )}

      {showRemove && (
        <button className="selector-remove" onClick={onRemove} type="button">
          Remove
        </button>
      )}
    </div>
  )
}
