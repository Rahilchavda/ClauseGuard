import { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import RiskGauge from "../components/RiskGauge";
import ClauseCard from "../components/ClauseCard";
import { useThemeContext } from "../context/ThemeContext";
import { exportToPdf } from "../utils/exportPdf";
export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark } = useThemeContext();
  const results = location.state?.results;

  const [riskFilter, setRiskFilter] = useState("All");
  const [catFilter, setCatFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("risk");

  
  const card = {
    background: isDark ? "rgba(15,23,42,0.85)" : "#ffffff",
    border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
    borderRadius: "16px",
    padding: "20px",
    boxShadow: isDark ? "0 8px 30px rgba(2,6,23,0.6)" : "0 2px 12px rgba(0,0,0,0.06)"
  };

  if (!results)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          background: isDark
            ? "radial-gradient(circle at 20% 20%, #1e293b, #020617)"
            : "#f8fafc"
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>📊</div>

          <div
            style={{
              fontWeight: 700,
              fontSize: "18px",
              color: isDark ? "#f8fafc" : "#0f172a",
              marginBottom: "8px"
            }}
          >
            No results yet
          </div>

          <p style={{ color: "#64748b", marginBottom: "20px" }}>
            Run an analysis first.
          </p>

          <button
            onClick={() => navigate("/")}
            style={{
              padding: "10px 24px",
              borderRadius: "10px",
              border: "1px solid #334155",
              background: "linear-gradient(135deg,#334155,#475569)",
              color: "#fff",
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            Go Analyze →
          </button>
        </div>
      </div>
    );

  const counts = {
    High: results.clauses.filter((c) => c.riskLevel === "High").length,
    Medium: results.clauses.filter((c) => c.riskLevel === "Medium").length,
    Low: results.clauses.filter((c) => c.riskLevel === "Low").length
  };

  const categories = ["All", ...new Set(results.clauses.map((c) => c.category))];

  const displayed = useMemo(() => {
    let list = results.clauses;

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.originalText?.toLowerCase().includes(q) ||
          c.reasoning?.toLowerCase().includes(q) ||
          c.category?.toLowerCase().includes(q)
      );
    }

    if (riskFilter !== "All")
      list = list.filter((c) => c.riskLevel === riskFilter);

    if (catFilter !== "All")
      list = list.filter((c) => c.category === catFilter);

    if (sortBy === "risk") {
      const order = { High: 0, Medium: 1, Low: 2 };
      list = [...list].sort(
        (a, b) => (order[a.riskLevel] ?? 3) - (order[b.riskLevel] ?? 3)
      );
    } else {
      list = [...list].sort((a, b) =>
        (a.category || "").localeCompare(b.category || "")
      );
    }

    return list;
  }, [results.clauses, search, riskFilter, catFilter, sortBy]);

  const filterBtn = (val, current) => ({
    padding: "6px 14px",
    borderRadius: "100px",
    border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
    fontWeight: 600,
    fontSize: "12px",
    cursor: "pointer",
    background:
      current === val
        ? "linear-gradient(135deg,#334155,#475569)"
        : isDark
        ? "rgba(255,255,255,0.05)"
        : "#f1f5f9",
    color: current === val ? "#fff" : isDark ? "#94a3b8" : "#64748b"
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "24px",
        background: isDark
          ? "radial-gradient(circle at 20% 20%, #1e293b, #020617)"
          : "#f8fafc"
      }}
    >
      <div style={{ maxWidth: "860px", margin: "0 auto" }}>

        {/* Summary */}
        <div style={{ ...card, display: "flex", gap: "20px", flexWrap: "wrap", marginBottom: "16px" }}>
          <RiskGauge
            score={results.riskScore}
            label={results.riskLabel}
            color={results.riskColor}
          />

          <div style={{ flex: 1, minWidth: "200px" }}>
            <div
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "#64748b",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: "6px"
              }}
            >
              <button
  onClick={() => exportToPdf(results)}
  style={{
    padding: "8px 18px", borderRadius: "10px", border: "none",
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    color: "#fff", fontWeight: 700, fontSize: "13px",
    cursor: "pointer", marginTop: "10px",
    boxShadow: "0 4px 12px rgba(99,102,241,0.35)"
  }}
>
  📥 Export PDF Report
</button>
              {results.docName}
            </div>

            <p
              style={{
                fontSize: "13px",
                lineHeight: 1.6,
                marginBottom: "14px",
                color: isDark ? "#cbd5f5" : "#475569"
              }}
            >
              {results.summary}
            </p>

            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              {[["High", "#ef4444"], ["Medium", "#f59e0b"], ["Low", "#22c55e"]].map(
                ([lvl, color]) => (
                  <div key={lvl} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "24px", fontWeight: 800, color }}>
                      {counts[lvl]}
                    </div>
                    <div style={{ fontSize: "11px", color: "#64748b" }}>{lvl}</div>
                  </div>
                )
              )}

              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "24px", fontWeight: 800, color: "#94a3b8" }}>
                  {results.clauses.length}
                </div>
                <div style={{ fontSize: "11px", color: "#64748b" }}>Total</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search + Filters */}
        <div style={{ ...card, marginBottom: "12px" }}>
          <div style={{ display: "flex", gap: "10px", marginBottom: "14px", flexWrap: "wrap" }}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="🔍 Search clauses, reasoning, categories..."
              style={{
                flex: 1,
                minWidth: "200px",
                padding: "9px 14px",
                borderRadius: "10px",
                border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
                background: isDark ? "rgba(255,255,255,0.04)" : "#f8fafc",
                color: isDark ? "#e2e8f0" : "#1e293b",
                fontSize: "13px"
              }}
            />

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: "9px 14px",
                borderRadius: "10px",
                border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
                background: isDark ? "#1e293b" : "#f8fafc",
                color: isDark ? "#e2e8f0" : "#1e293b"
              }}
            >
              <option value="risk">Sort: Risk Level</option>
              <option value="category">Sort: Category</option>
            </select>
          </div>

          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "8px" }}>
            {["All", "High", "Medium", "Low"].map((r) => (
              <button key={r} onClick={() => setRiskFilter(r)} style={filterBtn(r, riskFilter)}>
                {r}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {categories.map((c) => (
              <button key={c} onClick={() => setCatFilter(c)} style={filterBtn(c, catFilter)}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Results info */}
        <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "12px" }}>
          Showing {displayed.length} of {results.clauses.length} clauses
          {search && ` matching "${search}"`}
        </div>

        {/* Clauses */}
        {displayed.length === 0 ? (
          <div style={{ ...card, textAlign: "center", padding: "48px", color: "#64748b" }}>
            No clauses match your filters.
          </div>
        ) : (
          displayed.map((clause, i) => (
            <ClauseCard key={clause.id || i} clause={clause} isDark={isDark} />
          ))
        )}
      </div>
    </div>
  );
}