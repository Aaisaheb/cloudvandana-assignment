import { useState } from "react";

// Renders a modal form driven entirely by the field metadata that came
// from the backend (/api/objects). Works for both "create" and "edit"
// since the caller just passes in initialValues (empty object for create).
export default function RecordFormModal({ objectLabel, fields, initialValues, onSave, onClose, saving }) {
  const [values, setValues] = useState(() => {
    const base = {};
    fields.forEach((f) => (base[f.name] = initialValues?.[f.name] ?? ""));
    return base;
  });

  const handleChange = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Strip empty strings for optional fields so we don't send blanks
    // that Salesforce might reject for typed fields (numbers/dates).
    const payload = {};
    Object.entries(values).forEach(([k, v]) => {
      if (v !== "") payload[k] = v;
    });
    onSave(payload);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{initialValues ? `Edit ${objectLabel}` : `New ${objectLabel}`}</h2>
        <form onSubmit={handleSubmit}>
          {fields.map((f) => (
            <div className="form-field" key={f.name}>
              <label htmlFor={f.name}>
                {f.label}
                {f.required ? " *" : ""}
              </label>
              {f.type === "textarea" ? (
                <textarea
                  id={f.name}
                  rows={3}
                  value={values[f.name]}
                  required={f.required}
                  onChange={(e) => handleChange(f.name, e.target.value)}
                />
              ) : (
                <input
                  id={f.name}
                  type={f.type === "number" ? "number" : f.type === "date" ? "date" : f.type === "email" ? "email" : "text"}
                  value={values[f.name]}
                  required={f.required}
                  onChange={(e) => handleChange(f.name, e.target.value)}
                />
              )}
            </div>
          ))}
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
