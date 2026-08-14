const express = require("express");
const router = express.Router();
const objectFields = require("../config/objectFields");
const { sfRequest } = require("../config/sfClient");

const API_VERSION = process.env.SF_API_VERSION || "v61.0";

// Only these 5 objects are allowed, per the assignment spec.
function assertValidObject(objectName, res) {
  if (!objectFields[objectName]) {
    res.status(400).json({ error: `Unsupported object: ${objectName}` });
    return false;
  }
  return true;
}

// GET /api/objects -> list of supported objects + their field metadata
// (drives the dropdown and the dynamic field rendering on the frontend)
router.get("/objects", (req, res) => {
  const list = Object.entries(objectFields).map(([name, meta]) => ({
    name,
    label: meta.label,
    fields: meta.fields
  }));
  res.json(list);
});

// GET /api/records/:object?offset=0&limit=20 -> paginated list (for infinite scroll)
router.get("/records/:object", async (req, res) => {
  const { object } = req.params;
  if (!assertValidObject(object, res)) return;

  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
  const offset = parseInt(req.query.offset, 10) || 0;
  const fieldNames = ["Id", ...objectFields[object].fields.map((f) => f.name)];

  const soql = `SELECT ${fieldNames.join(", ")} FROM ${object} ORDER BY CreatedDate DESC LIMIT ${limit} OFFSET ${offset}`;

  try {
    const data = await sfRequest(req, {
      method: "GET",
      path: `/services/data/${API_VERSION}/query`,
      params: { q: soql }
    });
    res.json({
      records: data.records,
      totalSize: data.totalSize,
      hasMore: offset + data.records.length < data.totalSize
    });
  } catch (err) {
    handleSfError(err, res);
  }
});

// POST /api/records/:object -> create
router.post("/records/:object", async (req, res) => {
  const { object } = req.params;
  if (!assertValidObject(object, res)) return;

  try {
    const data = await sfRequest(req, {
      method: "POST",
      path: `/services/data/${API_VERSION}/sobjects/${object}`,
      data: req.body
    });
    res.status(201).json(data);
  } catch (err) {
    handleSfError(err, res);
  }
});

// PATCH /api/records/:object/:id -> update
router.patch("/records/:object/:id", async (req, res) => {
  const { object, id } = req.params;
  if (!assertValidObject(object, res)) return;

  try {
    await sfRequest(req, {
      method: "PATCH",
      path: `/services/data/${API_VERSION}/sobjects/${object}/${id}`,
      data: req.body
    });
    res.status(204).send();
  } catch (err) {
    handleSfError(err, res);
  }
});

// DELETE /api/records/:object/:id -> delete
router.delete("/records/:object/:id", async (req, res) => {
  const { object, id } = req.params;
  if (!assertValidObject(object, res)) return;

  try {
    await sfRequest(req, {
      method: "DELETE",
      path: `/services/data/${API_VERSION}/sobjects/${object}/${id}`
    });
    res.status(204).send();
  } catch (err) {
    handleSfError(err, res);
  }
});

function handleSfError(err, res) {
  console.error("Salesforce API error:", err.response?.data || err.message);
  const status = err.status || err.response?.status || 500;
  res.status(status).json({
    error: err.response?.data || err.message || "Salesforce request failed"
  });
}

module.exports = router;
