import IdolSelectorPair from "./IdolSelectorPair";

let _uid = 0;
const uid = () => `sel_${++_uid}_${Date.now()}`;

export const makeSelector = () => ({
  id: uid(),
  selectedGroup: null,
  selectedIdol: null,
  isNewGroup: false,
  isNewIdol: false,
  newGroupName: "",
  newIdolName: "",
  groupPhotoFile: null,
  idolPhotoFile: null,
});

export default function IdolSelectorList({ items, onChange }) {
  const update = (id, patch) =>
    onChange(items.map((it) => (it.id === id ? { ...it, ...patch } : it)));

  const remove = (id) => onChange(items.filter((it) => it.id !== id));

  const add = () => onChange([...items, makeSelector()]);

  return (
    <div className="selector-list">
      {items.map((item) => (
        <IdolSelectorPair
          key={item.id}
          item={item}
          onChange={(updated) => update(item.id, updated)}
          onRemove={() => remove(item.id)}
          showRemove={items.length > 1}
        />
      ))}

      <button className="btn-add-idol" onClick={add} type="button">
        + Add another idol
      </button>
    </div>
  );
}
