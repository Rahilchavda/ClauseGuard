import { useState } from "react";
import { compareDocuments } from "../services/api";
import RiskGauge from "../components/RiskGauge";
import ClauseCard from "../components/ClauseCard";
import { useThemeContext } from "../context/ThemeContext";

export default function Compare() {
  const { isDark }  = useThemeContext();
  const [doc1Text,  setDoc1Text]  = useState("");
  const [doc1Name,  setDoc1Name]  = useState("Document A");
  const [doc2Text,  setDoc2Text]  = useState("");
  const [doc2Name,  setDoc2Name]  = useState("Document B");
  const [results,   setResults]   = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");
  const [activeTab, setActiveTab] = useState("doc1");

  // ── Theme tokens ──────────────────────────────────────────────────
  const t = {
    pageBg:      isDark ? "#0f172a"                      : "#f8fafc",
    cardBg:      isDark ? "#1e293b"                      : "#ffffff",
    cardBorder:  isDark ? "#334155"                      : "#e2e8f0",
    cardShadow:  isDark ? "0 4px 20px rgba(0,0,0,0.3)"  : "0 4px 20px rgba(0,0,0,0.06)",
    text:        isDark ? "#f8fafc"                      : "#0f172a",
    textSub:     isDark ? "#94a3b8"                      : "#475569",
    textMuted:   isDark ? "#64748b"                      : "#94a3b8",
    inputBg:     isDark ? "rgba(255,255,255,0.04)"       : "#f8fafc",
    inputBorder: isDark ? "#334155"                      : "#e2e8f0",
    inputColor:  isDark ? "#e2e8f0"                      : "#1e293b",
    tabInactive: isDark ? "#1e293b"                      : "#f1f5f9",
    tabText:     isDark ? "#64748b"                      : "#6b7280",
    newBtnBg:    isDark ? "rgba(255,255,255,0.06)"       : "#f1f5f9",
    errorBg:     isDark ? "rgba(220,38,38,0.12)"         : "#fef2f2",
    errorBorder: isDark ? "#7f1d1d"                      : "#fca5a5",
  };

  const card = {
    background:   t.cardBg,
    border:       `1px solid ${t.cardBorder}`,
    borderRadius: "clamp(12px, 2vw, 16px)",
    padding:      "clamp(14px, 3vw, 20px)",
    boxSizing:    "border-box",
    transition:   "background 0.3s, border-color 0.3s",
    boxShadow:    t.cardShadow,
  };

  const inputStyle = {
    width:        "100%",
    padding:      "clamp(8px, 1.5vw, 10px) clamp(10px, 2vw, 14px)",
    borderRadius: "10px",
    border:       `1px solid ${t.inputBorder}`,
    background:   t.inputBg,
    color:        t.inputColor,
    fontSize:     "clamp(12px, 2vw, 13px)",
    outline:      "none",
    fontFamily:   "inherit",
    boxSizing:    "border-box",
    transition:   "background 0.3s, border-color 0.3s, color 0.3s",
  };

  const handleCompare = async () => {
    if (!doc1Text.trim() || !doc2Text.trim()) {
      setError("Please provide text for both documents.");
      return;
    }
    setLoading(true);
    setError("");
    setResults(null);
    try {
      const data = await compareDocuments(doc1Text, doc1Name, doc2Text, doc2Name);
      setResults(data);
      setActiveTab("doc1");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight:  "100vh",
      padding:    "clamp(14px, 4vw, 28px)",
      background: t.pageBg,
      transition: "background 0.3s",
      boxSizing:  "border-box",
    }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>

        {/* ── Page header ── */}
        <h1 style={{
          fontWeight:   800,
          fontSize:     "clamp(18px, 4vw, 24px)",
          marginBottom: "6px",
          color:        t.text,
          transition:   "color 0.3s",
        }}>
          ⚖️ Document Comparison
        </h1>
        <p style={{
          color:        t.textMuted,
          fontSize:     "clamp(12px, 2vw, 13px)",
          marginBottom: "clamp(16px, 3vw, 24px)",
          transition:   "color 0.3s",
        }}>
          Paste two contracts to compare their risk profiles side by side.
        </p>

        {/* ── INPUT STATE ─────────────────────────────────────────── */}
        {!results && (
          <div>
            {/* Two doc inputs — stacks on mobile */}
            <div style={{
              display:             "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
              gap:                 "clamp(10px, 2vw, 16px)",
              marginBottom:        "clamp(12px, 2vw, 16px)",
            }}>
              {/* Doc 1 */}
              <div style={card}>
                <input
                  value={doc1Name}
                  onChange={e => setDoc1Name(e.target.value)}
                  style={{ ...inputStyle, marginBottom: "10px", fontWeight: 700 }}
                />
                <textarea
                  rows={7}
                  value={doc1Text}
                  placeholder="Paste contract A here…"
                  onChange={e => setDoc1Text(e.target.value)}
                  style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
                />
                <div style={{
                  fontSize:   "clamp(10px, 1.5vw, 11px)",
                  color:      t.textMuted,
                  marginTop:  "6px",
                  transition: "color 0.3s",
                }}>
                  {doc1Text.split(/\s+/).filter(Boolean).length} words
                </div>
              </div>

              {/* Doc 2 */}
              <div style={card}>
                <input
                  value={doc2Name}
                  onChange={e => setDoc2Name(e.target.value)}
                  style={{ ...inputStyle, marginBottom: "10px", fontWeight: 700 }}
                />
                <textarea
                  rows={7}
                  value={doc2Text}
                  placeholder="Paste contract B here…"
                  onChange={e => setDoc2Text(e.target.value)}
                  style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
                />
                <div style={{
                  fontSize:   "clamp(10px, 1.5vw, 11px)",
                  color:      t.textMuted,
                  marginTop:  "6px",
                  transition: "color 0.3s",
                }}>
                  {doc2Text.split(/\s+/).filter(Boolean).length} words
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                padding:      "clamp(10px, 2vw, 12px) clamp(12px, 2vw, 16px)",
                borderRadius: "10px",
                marginBottom: "12px",
                background:   t.errorBg,
                border:       `1px solid ${t.errorBorder}`,
                color:        "#dc2626",
                fontSize:     "clamp(12px, 2vw, 13px)",
              }}>
                ⚠️ {error}
              </div>
            )}

            {/* Compare button */}
            <button
              onClick={handleCompare}
              disabled={loading}
              style={{
                width:        "100%",
                padding:      "clamp(12px, 2vw, 14px)",
                borderRadius: "12px",
                border:       "none",
                background:   "linear-gradient(135deg, #6366f1, #8b5cf6)",
                color:        "#fff",
                fontWeight:   700,
                fontSize:     "clamp(13px, 2vw, 15px)",
                cursor:       loading ? "not-allowed" : "pointer",
                opacity:      loading ? 0.7 : 1,
                boxShadow:    "0 4px 20px rgba(99,102,241,0.35)",
                transition:   "opacity 0.2s",
                boxSizing:    "border-box",
                fontFamily:   "inherit",
              }}
            >
              {loading ? "⚙️ Analyzing both documents…" : "⚖️ Compare Documents"}
            </button>
          </div>
        )}

        {/* ── RESULTS STATE ────────────────────────────────────────── */}
        {results && (
          <div>

            {/* Winner banner */}
            <div style={{
              ...card,
              marginBottom: "clamp(12px, 2vw, 16px)",
              textAlign:    "center",
              background:   "linear-gradient(135deg, #6366f1, #8b5cf6)",
              border:       "none",
              padding:      "clamp(16px, 3vw, 24px)",
            }}>
              <div style={{
                fontSize:     "clamp(11px, 2vw, 13px)",
                color:        "rgba(255,255,255,0.75)",
                marginBottom: "4px",
              }}>
                {results.comparison.winnerLabel}
              </div>
              <div style={{
                fontSize:   "clamp(17px, 4vw, 22px)",
                fontWeight: 800,
                color:      "#fff",
              }}>
                🏆 {results.comparison.winner}
              </div>
              <div style={{
                fontSize:  "clamp(11px, 2vw, 13px)",
                color:     "rgba(255,255,255,0.7)",
                marginTop: "6px",
              }}>
                Risk difference: {Math.abs(results.comparison.riskDiff)} pts ·{" "}
                Clause difference: {Math.abs(results.comparison.clauseDiff)}
              </div>
            </div>

            {/* Side-by-side gauges — stacks on mobile */}
            <div style={{
              display:             "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))",
              gap:                 "clamp(10px, 2vw, 16px)",
              marginBottom:        "clamp(12px, 2vw, 16px)",
            }}>
              {[results.doc1, results.doc2].map((doc, i) => (
                <div key={i} style={{ ...card, textAlign: "center" }}>
                  <div style={{
                    fontWeight:   700,
                    fontSize:     "clamp(13px, 2vw, 14px)",
                    marginBottom: "12px",
                    color:        t.text,
                    transition:   "color 0.3s",
                    overflow:     "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace:   "nowrap",
                  }}>
                    {doc.docName}
                  </div>

                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <RiskGauge
                      score={doc.riskScore}
                      label={doc.riskLabel}
                      color={doc.riskColor}
                      isDark={isDark}
                    />
                  </div>

                  <div style={{
                    display:        "flex",
                    justifyContent: "center",
                    gap:            "clamp(12px, 3vw, 20px)",
                    marginTop:      "12px",
                    flexWrap:       "wrap",
                  }}>
                    {[["High","#dc2626"],["Medium","#f59e0b"],["Low","#22c55e"]].map(([lvl, color]) => (
                      <div key={lvl} style={{ textAlign: "center" }}>
                        <div style={{
                          fontWeight: 800,
                          color,
                          fontSize:   "clamp(16px, 3vw, 20px)",
                        }}>
                          {doc.clauses.filter(c => c.riskLevel === lvl).length}
                        </div>
                        <div style={{
                          fontSize:   "clamp(9px, 1.5vw, 10px)",
                          color:      t.textMuted,
                          transition: "color 0.3s",
                        }}>
                          {lvl}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Tab switcher — scrollable on very small screens */}
            <div style={{
              display:        "flex",
              gap:            "clamp(6px, 1.5vw, 8px)",
              marginBottom:   "clamp(12px, 2vw, 16px)",
              flexWrap:       "wrap",
              alignItems:     "center",
            }}>
              {[
                { key: "doc1", label: results.doc1.docName },
                { key: "doc2", label: results.doc2.docName },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  style={{
                    padding:      "clamp(7px, 1.5vw, 9px) clamp(12px, 2.5vw, 20px)",
                    borderRadius: "10px",
                    border:       "none",
                    background:   activeTab === key
                      ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                      : t.tabInactive,
                    color:        activeTab === key ? "#fff" : t.tabText,
                    fontWeight:   600,
                    fontSize:     "clamp(11px, 2vw, 13px)",
                    cursor:       "pointer",
                    transition:   "all 0.15s",
                    whiteSpace:   "nowrap",
                    fontFamily:   "inherit",
                    maxWidth:     "clamp(140px, 35vw, 220px)",
                    overflow:     "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {label} ({results[key]?.clauses?.length || 0})
                </button>
              ))}

              {/* New comparison button */}
              <button
                onClick={() => setResults(null)}
                style={{
                  padding:      "clamp(7px, 1.5vw, 9px) clamp(12px, 2.5vw, 20px)",
                  borderRadius: "10px",
                  border:       "none",
                  background:   t.newBtnBg,
                  color:        t.tabText,
                  fontWeight:   600,
                  fontSize:     "clamp(11px, 2vw, 13px)",
                  cursor:       "pointer",
                  marginLeft:   "auto",
                  whiteSpace:   "nowrap",
                  fontFamily:   "inherit",
                  transition:   "background 0.2s",
                }}
              >
                + New
              </button>
            </div>

            {/* Clause cards for active tab */}
            {(results[activeTab]?.clauses?.length === 0) && (
              <div style={{
                textAlign:  "center",
                padding:    "40px",
                color:      t.textMuted,
                fontSize:   "clamp(12px, 2vw, 13px)",
                transition: "color 0.3s",
              }}>
                ✅ No risky clauses found in this document.
              </div>
            )}
            {(results[activeTab]?.clauses || []).map((clause, i) => (
              <ClauseCard key={clause.id || i} clause={clause} isDark={isDark} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}