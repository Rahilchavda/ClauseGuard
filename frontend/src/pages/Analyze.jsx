import { useState } from "react";
import { useAnalyzer } from "../hooks/useAnalyzer";
import { useThemeContext } from "../context/ThemeContext";
import ClauseCard from "../components/ClauseCard";
import RiskGauge from "../components/RiskGauge";
import SeverityHeatmap from "../components/SeverityHeatmap";
import UploadZone from "../components/UploadZone";

export default function Analyze() {
  const [docText, setDocText] = useState("");
  const [docName, setDocName] = useState("");
  const [inputMode, setInputMode] = useState("upload");

  const { isDark } = useThemeContext();

  const {
    clauses, summary, riskScore, riskLabel, riskColor,
    progress, status, error, runText, cancel, reset,
  } = useAnalyzer();

  const isLoading = status === "loading";
  const isDone    = status === "done";

  const counts = {
    High:   clauses.filter((c) => c.riskLevel === "High").length,
    Medium: clauses.filter((c) => c.riskLevel === "Medium").length,
    Low:    clauses.filter((c) => c.riskLevel === "Low").length,
  };

  const handleAnalyze = () => {
    if (docText.trim()) runText(docText, docName || "Untitled Document");
  };

  const handleReset = () => {
    reset();
    setDocText("");
    setDocName("");
  };

  const handleFilesReady = (files) => {
    if (files.length === 0) { setDocText(""); setDocName(""); return; }
    const combined = files.map((f) => f.text).join("\n\n---\n\n");
    setDocText(combined);
    setDocName(files.length === 1 ? files[0].name : `${files.length} documents`);
  };

  // ── Theme tokens ──────────────────────────────────────────────────
  const t = {
    bg:           isDark ? "radial-gradient(1200px 600px at 10% 10%, rgba(148,163,184,0.04), transparent 10%), linear-gradient(135deg,#020617 0%,#0f172a 50%,#020617 100%)"
                         : "linear-gradient(135deg,#f8fafc 0%,#f1f5f9 50%,#e2e8f0 100%)",
    cardBg:       isDark ? "rgba(15,23,42,0.85)"  : "#ffffff",
    cardBorder:   isDark ? "#334155"               : "#e2e8f0",
    inputBg:      isDark ? "rgba(15,23,42,0.6)"   : "#f8fafc",
    inputBorder:  isDark ? "#334155"               : "#cbd5e1",
    textPrimary:  isDark ? "#f8fafc"               : "#0f172a",
    textSecond:   isDark ? "#94a3b8"               : "#475569",
    textMuted:    isDark ? "#64748b"               : "#94a3b8",
    textInput:    isDark ? "#e2e8f0"               : "#0f172a",
    pillBg:       isDark ? "rgba(255,255,255,0.03)": "rgba(0,0,0,0.03)",
    pillBorder:   isDark ? "#1e293b"               : "#e2e8f0",
    toggleBg:     isDark ? "rgba(15,23,42,0.6)"   : "#f1f5f9",
    toggleBorder: isDark ? "#1e293b"               : "#e2e8f0",
    activeTab:    isDark ? "#1e293b"               : "#ffffff",
    activeText:   isDark ? "#f1f5f9"               : "#0f172a",
    inactiveText: isDark ? "#64748b"               : "#94a3b8",
    progressBg:   isDark ? "#1e293b"               : "#e2e8f0",
    boxShadow:    isDark ? "0 10px 40px rgba(2,6,23,0.8)"
                         : "0 10px 40px rgba(0,0,0,0.08)",
  };

  return (
    <div
      className="flex-1 overflow-auto min-h-screen"
      style={{ background: t.bg, transition: "background 0.3s" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;600;700;800&family=DM+Serif+Display:ital@0;1&display=swap');
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(0.95); opacity: 0.6; }
          50%  { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.6; }
        }
        .clause-appear   { animation: fadeSlideIn 0.4s ease forwards; }
        .analyzing-pulse { animation: pulse-ring 1.5s ease-in-out infinite; }
        textarea:focus, input:focus { outline: none; }
      `}</style>

      <div
        className="max-w-3xl mx-auto px-6 py-10"
        style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
      >

        {/* ── IDLE / UPLOAD STATE ─────────────────────────────────── */}
        {status === "idle" && (
          <div>

            {/* Heading */}
            <div className="text-center mb-10">
              <div style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                padding: "6px 14px", borderRadius: "999px",
                border: `1px solid ${t.cardBorder}`,
                background: t.cardBg, marginBottom: "24px",
              }}>
                <span className="analyzing-pulse" style={{
                  width: "6px", height: "6px", borderRadius: "50%",
                  background: "#94a3b8", display: "inline-block",
                }} />
                <span style={{
                  fontSize: "12px", color: t.textSecond,
                  fontWeight: 600, letterSpacing: "0.08em",
                }}>
                  POWERED BY LLAMA 3.3 70B
                </span>
              </div>

              <h1 style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: "clamp(32px, 5vw, 48px)",
                color: t.textPrimary, lineHeight: 1.15, marginBottom: "12px",
              }}>
                Uncover Hidden Risks
                <br />
                <span style={{ fontStyle: "italic", color: t.textSecond }}>
                  Before You Sign
                </span>
              </h1>

              <p style={{ color: t.textMuted, fontSize: "15px" }}>
                AI-powered contract analysis. Results stream in real time.
              </p>
            </div>

            {/* Input mode toggle */}
            <div style={{
              display: "flex", gap: "4px", marginBottom: "16px",
              background: t.toggleBg, padding: "4px",
              borderRadius: "12px", border: `1px solid ${t.toggleBorder}`,
              width: "fit-content",
            }}>
              {[
                { key: "upload", label: "📂 Upload Files" },
                { key: "paste",  label: "📋 Paste Text"  },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setInputMode(key)}
                  style={{
                    padding: "8px 18px", borderRadius: "8px", border: "none",
                    background: inputMode === key ? t.activeTab : "transparent",
                    color: inputMode === key ? t.activeText : t.inactiveText,
                    fontWeight: 600, fontSize: "13px", cursor: "pointer",
                    transition: "all 0.15s",
                    boxShadow: inputMode === key && !isDark ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Upload zone */}
            {inputMode === "upload" && (
              <UploadZone onFilesReady={handleFilesReady} loading={isLoading} isDark={isDark} />
            )}

            {/* Paste textarea */}
            {inputMode === "paste" && (
              <textarea
                rows={8}
                placeholder="Paste contract or policy text here…"
                value={docText}
                onChange={(e) => {
                  setDocText(e.target.value);
                  if (!docName) setDocName("Pasted Document");
                }}
                style={{
                  width: "100%", padding: "14px 16px", borderRadius: "14px",
                  border: `1px solid ${t.inputBorder}`,
                  background: t.inputBg, color: t.textInput,
                  fontSize: "13px", resize: "vertical",
                  lineHeight: 1.6, fontFamily: "inherit",
                  boxSizing: "border-box", transition: "all 0.3s",
                }}
              />
            )}

            {/* Document name */}
            {docText && (
              <input
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
                placeholder="Document name…"
                style={{
                  width: "100%", marginTop: "10px", padding: "12px 16px",
                  borderRadius: "12px", border: `1px solid ${t.inputBorder}`,
                  background: t.inputBg, color: t.textInput,
                  fontSize: "13px", fontFamily: "inherit",
                  boxSizing: "border-box", transition: "all 0.3s",
                }}
              />
            )}

            {/* Error */}
            {error && (
              <div style={{
                marginTop: "14px", padding: "12px 16px", borderRadius: "12px",
                background: "#7f1d1d", border: "1px solid #dc2626",
                color: "#fecaca", fontSize: "13px",
              }}>
                ⚠️ {error}
              </div>
            )}

            {/* Analyze button */}
            <button
              onClick={handleAnalyze}
              disabled={!docText.trim()}
              style={{
                width: "100%", marginTop: "16px", padding: "16px",
                borderRadius: "14px", border: `1px solid ${t.cardBorder}`,
                background: docText.trim()
                  ? "linear-gradient(135deg,#334155,#475569)"
                  : t.inputBg,
                color: docText.trim() ? "#f1f5f9" : t.textMuted,
                fontSize: "15px", fontWeight: 700,
                cursor: docText.trim() ? "pointer" : "not-allowed",
                boxShadow: docText.trim() ? "0 4px 24px rgba(2,6,23,0.3)" : "none",
                transition: "all 0.2s", boxSizing: "border-box",
              }}
            >
              🔍 Analyze Document
            </button>

            {/* Feature pills */}
            <div style={{
              display: "flex", gap: "8px", flexWrap: "wrap",
              justifyContent: "center", marginTop: "24px",
            }}>
              {[
                "⚡ Real-time Streaming", "🗺️ Risk Heatmap",
                "🤝 Negotiation Score",  "📂 Multi-file Upload",
                "📊 Category Filtering", "🕐 History Tracking",
              ].map((f) => (
                <span key={f} style={{
                  padding: "5px 14px", borderRadius: "100px",
                  background: t.pillBg, border: `1px solid ${t.pillBorder}`,
                  fontSize: "12px", color: t.textMuted,
                }}>
                  {f}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── STREAMING / RESULTS VIEW ─────────────────────────────── */}
        {(isLoading || isDone) && (
          <div>

            {/* Summary card */}
            <div style={{
              background: t.cardBg, borderRadius: "20px",
              padding: "24px", marginBottom: "20px",
              border: `1px solid ${t.cardBorder}`,
              boxShadow: t.boxShadow,
              display: "flex", gap: "20px",
              alignItems: "center", flexWrap: "wrap",
              transition: "all 0.3s",
            }}>
              <RiskGauge
                score={riskScore}
                label={riskLabel || "Analyzing…"}
                color={riskColor}
                isDark={isDark}
              />

              <div style={{ flex: 1, minWidth: "200px" }}>

                {/* Progress bar */}
                {isLoading && (
                  <div style={{ marginBottom: "14px" }}>
                    <div style={{
                      display: "flex", justifyContent: "space-between",
                      marginBottom: "6px",
                    }}>
                      <span style={{ fontSize: "13px", color: t.textSecond, fontWeight: 600 }}>
                        {progress.label || "Scanning document…"}
                      </span>
                      <span style={{ fontSize: "13px", fontWeight: 700, color: t.textPrimary }}>
                        {progress.total > 0
                          ? `${Math.round((progress.chunk / progress.total) * 100)}%`
                          : "…"}
                      </span>
                    </div>
                    <div style={{
                      height: "5px", background: t.progressBg,
                      borderRadius: "100px", overflow: "hidden",
                    }}>
                      <div style={{
                        height: "100%", borderRadius: "100px",
                        background: "linear-gradient(90deg,#475569,#94a3b8)",
                        width: progress.total > 0
                          ? `${(progress.chunk / progress.total) * 100}%`
                          : "8%",
                        transition: "width 0.5s ease",
                      }} />
                    </div>
                  </div>
                )}

                {/* Summary text */}
                {isDone && summary && (
                  <p style={{
                    fontSize: "13px", color: t.textSecond,
                    lineHeight: 1.6, marginBottom: "12px",
                  }}>
                    {summary}
                  </p>
                )}

                {/* Counts */}
                <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                  {[["High","#ef4444"],["Medium","#f59e0b"],["Low","#22c55e"]].map(([lvl, color]) => (
                    <div key={lvl} style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "24px", fontWeight: 800, color, transition: "all 0.3s" }}>
                        {counts[lvl]}
                      </div>
                      <div style={{ fontSize: "11px", color: t.textMuted }}>{lvl}</div>
                    </div>
                  ))}
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "24px", fontWeight: 800, color: t.textSecond }}>
                      {clauses.length}
                    </div>
                    <div style={{ fontSize: "11px", color: t.textMuted }}>Total</div>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {isLoading && (
                  <button onClick={cancel} style={{
                    padding: "8px 16px", borderRadius: "10px",
                    border: "1px solid #7f1d1d", background: "rgba(127,29,29,0.3)",
                    color: "#fca5a5", fontWeight: 600, fontSize: "13px", cursor: "pointer",
                  }}>
                    ✕ Cancel
                  </button>
                )}
                {isDone && (
                  <button onClick={handleReset} style={{
                    padding: "8px 16px", borderRadius: "10px",
                    border: `1px solid ${t.cardBorder}`, background: t.inputBg,
                    color: t.textSecond, fontWeight: 600, fontSize: "13px", cursor: "pointer",
                  }}>
                    + New Analysis
                  </button>
                )}
              </div>
            </div>

            {/* Heatmap */}
            {clauses.length > 0 && (
              <SeverityHeatmap clauses={clauses} isDark={isDark} />
            )}

            {/* Scanning state */}
            {isLoading && clauses.length === 0 && (
              <div style={{
                textAlign: "center", padding: "48px",
                color: t.textMuted, fontSize: "14px",
              }}>
                <div className="analyzing-pulse" style={{ fontSize: "36px", marginBottom: "12px" }}>
                  ⚙️
                </div>
                Scanning document for risky clauses…
              </div>
            )}

            {/* Live label */}
            {clauses.length > 0 && (
              <div style={{
                fontSize: "11px", fontWeight: 700, color: t.textMuted,
                textTransform: "uppercase", letterSpacing: "0.1em",
                marginBottom: "12px", paddingLeft: "4px",
              }}>
                {isLoading
                  ? `⚡ Live — ${clauses.length} clause${clauses.length !== 1 ? "s" : ""} found so far…`
                  : `✅ ${clauses.length} risky clause${clauses.length !== 1 ? "s" : ""} identified`}
              </div>
            )}

            {/* Clause cards */}
            {clauses.map((clause, i) => (
              <div
                key={clause.id || i}
                className="clause-appear"
                style={{ animationDelay: `${Math.min(i * 0.05, 0.5)}s` }}
              >
                <ClauseCard clause={clause} isDark={isDark} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}