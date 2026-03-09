import { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import RiskGauge from "../components/RiskGauge";
import ClauseCard from "../components/ClauseCard";
import { useThemeContext } from "../context/ThemeContext";
import { exportToPdf } from "../utils/exportPdf";
import SeverityHeatmap from "../components/SeverityHeatmap";

export default function Results() {
  const location = useLocation();
  const navigate  = useNavigate();
  const { isDark } = useThemeContext();
  const results    = location.state?.results;

  const [riskFilter,   setRiskFilter]   = useState("All");
  const [catFilter,    setCatFilter]    = useState("All");
  const [search,       setSearch]       = useState("");
  const [sortBy,       setSortBy]       = useState("risk");
  const [emailInput,   setEmailInput]   = useState("");
  const [emailSent,    setEmailSent]    = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);

  // ── Theme tokens ──────────────────────────────────────────────────
  const t = {
    pageBg:      isDark
      ? "radial-gradient(circle at 20% 20%, #1e293b, #020617)"
      : "#f8fafc",
    cardBg:      isDark ? "rgba(15,23,42,0.85)" : "#ffffff",
    cardBorder:  isDark ? "#334155"              : "#e2e8f0",
    cardShadow:  isDark ? "0 8px 30px rgba(2,6,23,0.6)" : "0 2px 12px rgba(0,0,0,0.06)",
    text:        isDark ? "#f8fafc"              : "#0f172a",
    textSub:     isDark ? "#cbd5e1"              : "#475569",
    textMuted:   isDark ? "#64748b"              : "#94a3b8",
    inputBg:     isDark ? "rgba(255,255,255,0.04)" : "#f8fafc",
    inputBorder: isDark ? "#334155"              : "#e2e8f0",
    inputColor:  isDark ? "#e2e8f0"              : "#1e293b",
    selectBg:    isDark ? "#1e293b"              : "#f8fafc",
    filterActive:"linear-gradient(135deg,#334155,#475569)",
    filterInactive: isDark ? "rgba(255,255,255,0.05)" : "#f1f5f9",
    filterTextActive: "#fff",
    filterTextInactive: isDark ? "#94a3b8" : "#64748b",
  };

  const card = {
    background:   t.cardBg,
    border:       `1px solid ${t.cardBorder}`,
    borderRadius: "clamp(12px, 2vw, 16px)",
    padding:      "clamp(14px, 3vw, 20px)",
    boxShadow:    t.cardShadow,
    boxSizing:    "border-box",
    transition:   "background 0.3s, border-color 0.3s",
  };

  const filterBtn = (val, current) => ({
    padding:      "clamp(5px, 1vw, 7px) clamp(10px, 2vw, 14px)",
    borderRadius: "100px",
    border:       `1px solid ${t.cardBorder}`,
    fontWeight:   600,
    fontSize:     "clamp(11px, 1.8vw, 12px)",
    cursor:       "pointer",
    background:   current === val ? t.filterActive : t.filterInactive,
    color:        current === val ? t.filterTextActive : t.filterTextInactive,
    whiteSpace:   "nowrap",
    transition:   "all 0.15s",
    fontFamily:   "inherit",
  });

  const sendEmail = async () => {
    if (!emailInput || !results.id) return;
    setEmailLoading(true);
    try {
      const form = new FormData();
      form.append("email", emailInput);
      await fetch(
        `${import.meta.env.VITE_API_URL}/email-report/${results.id}`,
        { method: "POST", body: form },
      );
      setEmailSent(true);
    } catch (e) {
      console.error(e);
    } finally {
      setEmailLoading(false);
    }
  };

  // ── Empty state ───────────────────────────────────────────────────
  if (!results) return (
    <div style={{
      display:        "flex",
      alignItems:     "center",
      justifyContent: "center",
      minHeight:      "100vh",
      padding:        "clamp(16px, 4vw, 32px)",
      background:     t.pageBg,
      boxSizing:      "border-box",
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "clamp(36px, 8vw, 48px)", marginBottom: "12px" }}>📊</div>
        <div style={{
          fontWeight:   700,
          fontSize:     "clamp(16px, 3vw, 18px)",
          color:        t.text,
          marginBottom: "8px",
          transition:   "color 0.3s",
        }}>
          No results yet
        </div>
        <p style={{ color: t.textMuted, marginBottom: "20px", fontSize: "clamp(12px, 2vw, 14px)" }}>
          Run an analysis first.
        </p>
        <button
          onClick={() => navigate("/")}
          style={{
            padding:      "clamp(9px, 2vw, 11px) clamp(18px, 4vw, 26px)",
            borderRadius: "10px",
            border:       "1px solid #334155",
            background:   "linear-gradient(135deg,#334155,#475569)",
            color:        "#fff",
            fontWeight:   700,
            fontSize:     "clamp(13px, 2vw, 14px)",
            cursor:       "pointer",
            fontFamily:   "inherit",
          }}
        >
          Go Analyze →
        </button>
      </div>
    </div>
  );

  const counts = {
    High:   results.clauses.filter((c) => c.riskLevel === "High").length,
    Medium: results.clauses.filter((c) => c.riskLevel === "Medium").length,
    Low:    results.clauses.filter((c) => c.riskLevel === "Low").length,
  };

  const categories = ["All", ...new Set(results.clauses.map((c) => c.category))];

  const displayed = useMemo(() => {
    let list = results.clauses;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((c) =>
        c.originalText?.toLowerCase().includes(q) ||
        c.reasoning?.toLowerCase().includes(q) ||
        c.category?.toLowerCase().includes(q),
      );
    }
    if (riskFilter !== "All") list = list.filter((c) => c.riskLevel === riskFilter);
    if (catFilter  !== "All") list = list.filter((c) => c.category  === catFilter);
    if (sortBy === "risk") {
      const order = { High: 0, Medium: 1, Low: 2 };
      list = [...list].sort((a, b) => (order[a.riskLevel] ?? 3) - (order[b.riskLevel] ?? 3));
    } else {
      list = [...list].sort((a, b) => (a.category || "").localeCompare(b.category || ""));
    }
    return list;
  }, [results.clauses, search, riskFilter, catFilter, sortBy]);

  return (
    <div style={{
      minHeight:  "100vh",
      padding:    "clamp(14px, 4vw, 28px)",
      background: t.pageBg,
      transition: "background 0.3s",
      boxSizing:  "border-box",
    }}>
      <div style={{ maxWidth: "860px", margin: "0 auto" }}>

        {/* ── Summary card ── */}
        <div style={{
          ...card,
          display:      "flex",
          gap:          "clamp(14px, 3vw, 20px)",
          flexWrap:     "wrap",
          marginBottom: "clamp(12px, 2vw, 16px)",
          alignItems:   "flex-start",
        }}>
          {/* Gauge */}
          <div style={{ flexShrink: 0, display: "flex", justifyContent: "center" }}>
            <RiskGauge
              score={results.riskScore}
              label={results.riskLabel}
              color={results.riskColor}
              isDark={isDark}
            />
          </div>

          {/* Right side */}
          <div style={{ flex: 1, minWidth: "clamp(200px, 40vw, 300px)" }}>

            {/* Doc name */}
            <div style={{
              fontWeight:   700,
              fontSize:     "clamp(13px, 2.5vw, 15px)",
              color:        t.text,
              marginBottom: "6px",
              wordBreak:    "break-word",
              transition:   "color 0.3s",
            }}>
              {results.docName}
            </div>

            {/* Summary text */}
            <p style={{
              fontSize:     "clamp(12px, 2vw, 13px)",
              lineHeight:   1.65,
              marginBottom: "clamp(10px, 2vw, 14px)",
              color:        t.textSub,
              wordBreak:    "break-word",
              transition:   "color 0.3s",
            }}>
              {results.summary}
            </p>

            {/* Risk counts */}
            <div style={{
              display:      "flex",
              gap:          "clamp(12px, 3vw, 20px)",
              flexWrap:     "wrap",
              marginBottom: "clamp(12px, 2vw, 16px)",
            }}>
              {[["High","#ef4444"],["Medium","#f59e0b"],["Low","#22c55e"]].map(([lvl, color]) => (
                <div key={lvl} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color }}>
                    {counts[lvl]}
                  </div>
                  <div style={{ fontSize: "clamp(10px, 1.5vw, 11px)", color: t.textMuted }}>
                    {lvl}
                  </div>
                </div>
              ))}
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: t.textSub }}>
                  {results.clauses.length}
                </div>
                <div style={{ fontSize: "clamp(10px, 1.5vw, 11px)", color: t.textMuted }}>Total</div>
              </div>
            </div>

            {/* Export PDF button */}
            <button
              onClick={() => exportToPdf(results)}
              style={{
                padding:      "clamp(8px, 1.5vw, 10px) clamp(14px, 3vw, 18px)",
                borderRadius: "10px",
                border:       "none",
                background:   "linear-gradient(135deg, #6366f1, #8b5cf6)",
                color:        "#fff",
                fontWeight:   700,
                fontSize:     "clamp(12px, 2vw, 13px)",
                cursor:       "pointer",
                boxShadow:    "0 4px 12px rgba(99,102,241,0.35)",
                marginBottom: "clamp(8px, 2vw, 12px)",
                fontFamily:   "inherit",
                whiteSpace:   "nowrap",
              }}
            >
              📥 Export PDF Report
            </button>

            {/* Email report */}
            <div style={{
              display:   "flex",
              gap:       "clamp(6px, 1.5vw, 8px)",
              flexWrap:  "wrap",
              alignItems:"center",
            }}>
              <input
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="your@email.com"
                style={{
                  flex:         1,
                  minWidth:     "clamp(120px, 30vw, 180px)",
                  padding:      "clamp(7px, 1.5vw, 9px) clamp(10px, 2vw, 12px)",
                  borderRadius: "8px",
                  border:       `1px solid ${t.inputBorder}`,
                  background:   t.inputBg,
                  color:        t.inputColor,
                  fontSize:     "clamp(12px, 2vw, 13px)",
                  outline:      "none",
                  boxSizing:    "border-box",
                  fontFamily:   "inherit",
                  transition:   "background 0.3s, border-color 0.3s",
                }}
              />
              <button
                onClick={sendEmail}
                disabled={emailLoading || emailSent}
                style={{
                  padding:      "clamp(7px, 1.5vw, 9px) clamp(12px, 2.5vw, 16px)",
                  borderRadius: "8px",
                  border:       "none",
                  background:   emailSent ? "#22c55e" : "#6366f1",
                  color:        "#fff",
                  fontWeight:   600,
                  fontSize:     "clamp(12px, 2vw, 13px)",
                  cursor:       emailLoading || emailSent ? "default" : "pointer",
                  whiteSpace:   "nowrap",
                  opacity:      emailLoading ? 0.7 : 1,
                  fontFamily:   "inherit",
                  transition:   "background 0.2s",
                }}
              >
                {emailSent ? "✓ Sent!" : emailLoading ? "Sending…" : "📧 Email"}
              </button>
            </div>
          </div>
        </div>

        {/* ── Heatmap ── */}
        <div style={{ marginBottom: "clamp(10px, 2vw, 14px)" }}>
          <SeverityHeatmap clauses={results.clauses} isDark={isDark} />
        </div>

        {/* ── Search + Filters ── */}
        <div style={{ ...card, marginBottom: "clamp(8px, 2vw, 12px)" }}>

          {/* Search + Sort row */}
          <div style={{
            display:      "flex",
            gap:          "clamp(8px, 2vw, 10px)",
            marginBottom: "clamp(10px, 2vw, 14px)",
            flexWrap:     "wrap",
          }}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="🔍 Search clauses, reasoning, categories…"
              style={{
                flex:         1,
                minWidth:     "clamp(160px, 40vw, 220px)",
                padding:      "clamp(8px, 1.5vw, 10px) clamp(10px, 2vw, 14px)",
                borderRadius: "10px",
                border:       `1px solid ${t.inputBorder}`,
                background:   t.inputBg,
                color:        t.inputColor,
                fontSize:     "clamp(12px, 2vw, 13px)",
                outline:      "none",
                boxSizing:    "border-box",
                fontFamily:   "inherit",
                transition:   "background 0.3s, border-color 0.3s",
              }}
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding:      "clamp(8px, 1.5vw, 10px) clamp(10px, 2vw, 14px)",
                borderRadius: "10px",
                border:       `1px solid ${t.inputBorder}`,
                background:   t.selectBg,
                color:        t.inputColor,
                fontSize:     "clamp(12px, 2vw, 13px)",
                outline:      "none",
                cursor:       "pointer",
                fontFamily:   "inherit",
                transition:   "background 0.3s, border-color 0.3s",
              }}
            >
              <option value="risk">Sort: Risk Level</option>
              <option value="category">Sort: Category</option>
            </select>
          </div>

          {/* Risk filter pills */}
          <div style={{ display: "flex", gap: "clamp(4px, 1vw, 6px)", flexWrap: "wrap", marginBottom: "8px" }}>
            {["All", "High", "Medium", "Low"].map((r) => (
              <button key={r} onClick={() => setRiskFilter(r)} style={filterBtn(r, riskFilter)}>
                {r}
              </button>
            ))}
          </div>

          {/* Category filter pills */}
          <div style={{ display: "flex", gap: "clamp(4px, 1vw, 6px)", flexWrap: "wrap" }}>
            {categories.map((c) => (
              <button key={c} onClick={() => setCatFilter(c)} style={filterBtn(c, catFilter)}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* ── Results count ── */}
        <div style={{
          fontSize:     "clamp(11px, 2vw, 12px)",
          color:        t.textMuted,
          marginBottom: "clamp(8px, 2vw, 12px)",
          transition:   "color 0.3s",
        }}>
          Showing {displayed.length} of {results.clauses.length} clauses
          {search && ` matching "${search}"`}
        </div>

        {/* ── Clause cards ── */}
        {displayed.length === 0 ? (
          <div style={{
            ...card,
            textAlign: "center",
            padding:   "clamp(32px, 6vw, 48px)",
            color:     t.textMuted,
            fontSize:  "clamp(12px, 2vw, 13px)",
          }}>
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