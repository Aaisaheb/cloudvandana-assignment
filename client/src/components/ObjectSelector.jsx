export default function ObjectSelector({ objects, selected, onChange }) {
  return (
    <div className="object-selector">
      <label htmlFor="object-select" style={{ fontSize: 12, fontWeight: 600, display: "block", marginBottom: 4 }}>
        Salesforce Object
      </label>
      <select
        id="object-select"
        value={selected || ""}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="" disabled>
          Select an object...
        </option>
        {objects.map((obj) => (
          <option key={obj.name} value={obj.name}>
            {obj.label}
          </option>
        ))}
      </select>
    </div>
  );
}
