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

  const card = {
    background: isDark ? "#1e293b" : "#ffffff",
    border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
    borderRadius: "16px", padding: "20px",
  };

  const inputStyle = {
    width: "100%", padding: "10px 14px", borderRadius: "10px",
    border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
    background: isDark ? "rgba(255,255,255,0.04)" : "#f8fafc",
    color: isDark ? "#e2e8f0" : "#1e293b",
    fontSize: "13px", outline: "none", fontFamily: "inherit",
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
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", padding: "24px",
                  background: isDark ? "#0f172a" : "#f8fafc" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>

        <h1 style={{ fontWeight: 800, fontSize: "24px", marginBottom: "6px",
                     color: isDark ? "#f8fafc" : "#0f172a" }}>
          ⚖️ Document Comparison
        </h1>
        <p style={{ color: "#64748b", fontSize: "13px", marginBottom: "24px" }}>
          Paste two contracts to compare their risk profiles side by side.
        </p>

        {/* Input area */}
        {!results && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr",
                          gap: "16px", marginBottom: "16px" }}>
              {/* Doc 1 */}
              <div style={card}>
                <input value={doc1Name} onChange={e => setDoc1Name(e.target.value)}
                  style={{ ...inputStyle, marginBottom: "10px", fontWeight: 700 }} />
                <textarea rows={8} value={doc1Text} placeholder="Paste contract A here…"
                  onChange={e => setDoc1Text(e.target.value)}
                  style={{ ...inputStyle, resize: "vertical" }} />
                <div style={{ fontSize: "11px", color: "#64748b", marginTop: "6px" }}>
                  {doc1Text.split(/\s+/).filter(Boolean).length} words
                </div>
              </div>

              {/* Doc 2 */}
              <div style={card}>
                <input value={doc2Name} onChange={e => setDoc2Name(e.target.value)}
                  style={{ ...inputStyle, marginBottom: "10px", fontWeight: 700 }} />
                <textarea rows={8} value={doc2Text} placeholder="Paste contract B here…"
                  onChange={e => setDoc2Text(e.target.value)}
                  style={{ ...inputStyle, resize: "vertical" }} />
                <div style={{ fontSize: "11px", color: "#64748b", marginTop: "6px" }}>
                  {doc2Text.split(/\s+/).filter(Boolean).length} words
                </div>
              </div>
            </div>

            {error && (
              <div style={{ padding: "12px 16px", borderRadius: "10px", marginBottom: "12px",
                            background: "#fef2f2", border: "1px solid #fca5a5",
                            color: "#dc2626", fontSize: "13px" }}>
                ⚠️ {error}
              </div>
            )}

            <button onClick={handleCompare} disabled={loading}
              style={{
                width: "100%", padding: "14px", borderRadius: "12px", border: "none",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                color: "#fff", fontWeight: 700, fontSize: "15px",
                cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1,
                boxShadow: "0 4px 20px rgba(99,102,241,0.35)"
              }}>
              {loading ? "⚙️ Analyzing both documents…" : "⚖️ Compare Documents"}
            </button>
          </div>
        )}

        {/* Results */}
        {results && (
          <div>
            {/* Winner banner */}
            <div style={{
              ...card, marginBottom: "16px", textAlign: "center",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              border: "none"
            }}>
              <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)",
                            marginBottom: "4px" }}>
                {results.comparison.winnerLabel}
              </div>
              <div style={{ fontSize: "22px", fontWeight: 800, color: "#fff" }}>
                🏆 {results.comparison.winner}
              </div>
              <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)",
                            marginTop: "6px" }}>
                Risk score difference: {Math.abs(results.comparison.riskDiff)} points ·{" "}
                Clause difference: {Math.abs(results.comparison.clauseDiff)} clauses
              </div>
            </div>

            {/* Side by side gauges */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr",
                          gap: "16px", marginBottom: "16px" }}>
              {[results.doc1, results.doc2].map((doc, i) => (
                <div key={i} style={card}>
                  <div style={{ fontWeight: 700, fontSize: "14px", marginBottom: "12px",
                                color: isDark ? "#f8fafc" : "#0f172a" }}>
                    {doc.docName}
                  </div>
                  <RiskGauge score={doc.riskScore} label={doc.riskLabel}
                             color={doc.riskColor} />
                  <div style={{ display: "flex", justifyContent: "center",
                                gap: "16px", marginTop: "12px" }}>
                    {[["High","#dc2626"],["Medium","#f59e0b"],["Low","#22c55e"]].map(
                      ([lvl, color]) => (
                        <div key={lvl} style={{ textAlign: "center" }}>
                          <div style={{ fontWeight: 800, color, fontSize: "18px" }}>
                            {doc.clauses.filter(c => c.riskLevel === lvl).length}
                          </div>
                          <div style={{ fontSize: "10px", color: "#6b7280" }}>{lvl}</div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Tab switcher for clauses */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
              {[
                { key: "doc1", label: results.doc1.docName },
                { key: "doc2", label: results.doc2.docName },
              ].map(({ key, label }) => (
                <button key={key} onClick={() => setActiveTab(key)}
                  style={{
                    padding: "8px 20px", borderRadius: "10px", border: "none",
                    background: activeTab === key
                      ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                      : isDark ? "#1e293b" : "#f1f5f9",
                    color: activeTab === key ? "#fff"
                           : isDark ? "#64748b" : "#6b7280",
                    fontWeight: 600, fontSize: "13px", cursor: "pointer"
                  }}>
                  {label} ({activeTab === key
                    ? (results[key]?.clauses?.length || 0)
                    : (results[key]?.clauses?.length || 0)} clauses)
                </button>
              ))}
              <button onClick={() => { setResults(null); }}
                style={{
                  padding: "8px 20px", borderRadius: "10px", border: "none",
                  background: isDark ? "rgba(255,255,255,0.06)" : "#f1f5f9",
                  color: isDark ? "#64748b" : "#6b7280",
                  fontWeight: 600, fontSize: "13px", cursor: "pointer",
                  marginLeft: "auto"
                }}>
                + New Comparison
              </button>
            </div>

            {/* Clauses for active tab */}
            {(results[activeTab]?.clauses || []).map((clause, i) => (
              <ClauseCard key={clause.id || i} clause={clause} isDark={isDark} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}