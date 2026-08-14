import { useEffect, useState, useCallback } from "react";
import api from "./api";
import Login from "./components/Login";
import ObjectSelector from "./components/ObjectSelector";
import RecordList from "./components/RecordList";
import RecordFormModal from "./components/RecordFormModal";

const PAGE_SIZE = 20;

export default function App() {
  const [authChecked, setAuthChecked] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  const [objects, setObjects] = useState([]);
  const [selectedObject, setSelectedObject] = useState("");

  const [records, setRecords] = useState([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [modalMode, setModalMode] = useState(null); // "create" | "edit" | null
  const [editingRecord, setEditingRecord] = useState(null);
  const [saving, setSaving] = useState(false);

  // 1. On load, check if the OAuth session cookie is still valid.
  useEffect(() => {
    api
      .get("/auth/status")
      .then((res) => setAuthenticated(res.data.authenticated))
      .catch(() => setAuthenticated(false))
      .finally(() => setAuthChecked(true));
  }, []);

  // 2. Once authenticated, fetch the list of supported objects + field metadata.
  useEffect(() => {
    if (!authenticated) return;
    api
      .get("/api/objects")
      .then((res) => setObjects(res.data))
      .catch(() => setError("Failed to load object metadata."));
  }, [authenticated]);

  const currentMeta = objects.find((o) => o.name === selectedObject);

  const fetchPage = useCallback(
    async (objectName, currentOffset) => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get(`/api/records/${objectName}`, {
          params: { offset: currentOffset, limit: PAGE_SIZE }
        });
        setRecords((prev) => (currentOffset === 0 ? res.data.records : [...prev, ...res.data.records]));
        setHasMore(res.data.hasMore);
        setOffset(currentOffset + res.data.records.length);
      } catch (err) {
        // Handle different Salesforce error formats
        const errorMsg = 
          err.response?.data?.error?.[0]?.message ||
          err.response?.data?.error ||
          (typeof err.response?.data === 'string' ? err.response.data : null) ||
          "Failed to load records.";
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // 3. When the object dropdown changes, reset pagination and load the first page.
  const handleSelectObject = (objectName) => {
    setSelectedObject(objectName);
    setRecords([]);
    setOffset(0);
    setHasMore(true);
    fetchPage(objectName, 0);
  };

  const handleLoadMore = () => {
    if (selectedObject) fetchPage(selectedObject, offset);
  };

  const handleCreate = () => {
    setModalMode("create");
    setEditingRecord(null);
  };

  const handleEdit = (record) => {
    setModalMode("edit");
    setEditingRecord(record);
  };

  const handleDelete = async (record) => {
    if (!window.confirm(`Delete this ${selectedObject} record?`)) return;
    try {
      await api.delete(`/api/records/${selectedObject}/${record.Id}`);
      setRecords((prev) => prev.filter((r) => r.Id !== record.Id));
    } catch (err) {
      // Handle different Salesforce error formats
      const errorMsg = 
        err.response?.data?.error?.[0]?.message ||
        err.response?.data?.error ||
        (typeof err.response?.data === 'string' ? err.response.data : null) ||
        "Delete failed.";
      setError(errorMsg);
    }
  };

  const handleSave = async (values) => {
    setSaving(true);
    setError("");
    try {
      if (modalMode === "create") {
        await api.post(`/api/records/${selectedObject}`, values);
      } else {
        await api.patch(`/api/records/${selectedObject}/${editingRecord.Id}`, values);
      }
      setModalMode(null);
      // Refresh from the top so the new/updated record is reflected.
      setOffset(0);
      setHasMore(true);
      fetchPage(selectedObject, 0);
    } catch (err) {
      // Handle different Salesforce error formats
      const errorMsg = 
        err.response?.data?.error?.[0]?.message ||
        err.response?.data?.error ||
        (typeof err.response?.data === 'string' ? err.response.data : null) ||
        "Save failed.";
      setError(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await api.post("/auth/logout");
    window.location.href = "/";
  };

  if (!authChecked) return null;
  if (!authenticated) return <Login />;

  return (
    <div className="app-shell">
      <div className="topbar">
        <h1>CloudVandana Salesforce CRUD App</h1>
        <button className="btn-secondary" onClick={handleLogout}>
          Log out
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <ObjectSelector objects={objects} selected={selectedObject} onChange={handleSelectObject} />

      {currentMeta && (
        <>
          <div style={{ marginBottom: 16 }}>
            <button className="btn-primary" onClick={handleCreate}>
              + New {currentMeta.label}
            </button>
          </div>

          <RecordList
            fields={currentMeta.fields}
            records={records}
            loading={loading}
            hasMore={hasMore}
            onLoadMore={handleLoadMore}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </>
      )}

      {modalMode && currentMeta && (
        <RecordFormModal
          objectLabel={currentMeta.label}
          fields={currentMeta.fields}
          initialValues={modalMode === "edit" ? editingRecord : null}
          onSave={handleSave}
          onClose={() => setModalMode(null)}
          saving={saving}
        />
      )}
    </div>
  );
}
