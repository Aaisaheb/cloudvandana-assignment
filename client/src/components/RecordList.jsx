import { useEffect, useRef, useCallback } from "react";

// Displays records in a table and loads the next 20 automatically
// when the user scrolls near the bottom (IntersectionObserver), as
// required: "load 20 records at a time; on scroll, load next 20".
export default function RecordList({ fields, records, loading, hasMore, onLoadMore, onEdit, onDelete }) {
  const sentinelRef = useRef(null);

  const handleIntersect = useCallback(
    (entries) => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        onLoadMore();
      }
    },
    [hasMore, loading, onLoadMore]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersect, { rootMargin: "200px" });
    const node = sentinelRef.current;
    if (node) observer.observe(node);
    return () => {
      if (node) observer.unobserve(node);
    };
  }, [handleIntersect]);

  return (
    <div>
      <table>
        <thead>
          <tr>
            {fields.map((f) => (
              <th key={f.name}>{f.label}</th>
            ))}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {records.map((rec) => (
            <tr key={rec.Id}>
              {fields.map((f) => (
                <td key={f.name}>{rec[f.name] ?? ""}</td>
              ))}
              <td className="actions-cell">
                <button className="btn-secondary" onClick={() => onEdit(rec)}>
                  Edit
                </button>
                <button className="btn-danger" onClick={() => onDelete(rec)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {!loading && records.length === 0 && (
            <tr>
              <td className="empty-row" colSpan={fields.length + 1}>
                No records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {loading && <div className="loading-row">Loading records...</div>}
      <div ref={sentinelRef} className="sentinel" />
    </div>
  );
}
