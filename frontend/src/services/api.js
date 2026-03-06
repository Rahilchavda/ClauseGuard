const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Request failed: ${res.status}`);
  }
  return res.json();
}

// ── Analysis ──────────────────────────────────────────
export const analyzeText = (text, docName) =>
  request("/analyze/text", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, docName }),
  });

export const analyzeFile = (file) => {
  const form = new FormData();
  form.append("file", file);
  form.append("docName", file.name);
  return request("/analyze/file", { method: "POST", body: form });
};

// ── History ───────────────────────────────────────────
export const fetchHistory    = ()    => request("/history");
export const fetchAnalysis   = (id)  => request(`/history/${id}`);
export const deleteAnalysis  = (id)  => request(`/history/${id}`, { method: "DELETE" });

// ── Dashboard ─────────────────────────────────────────
export const fetchDashboardStats = () => request("/dashboard/stats");

// ── Comparison ────────────────────────────────────────
export const compareDocuments = (text1, name1, text2, name2) =>
  request("/compare", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text1, name1, text2, name2 }),
  });