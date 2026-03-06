import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAnalyzer } from "../hooks/useAnalyzer";
import ClauseCard from "../components/ClauseCard";
import RiskGauge from "../components/RiskGauge";

export default function Analyze() {
  const [docText, setDocText] = useState("");
  const [docName, setDocName] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();
  const navigate = useNavigate();

  const {
    clauses,
    summary,
    riskScore,
    riskLabel,
    riskColor,
    progress,
    status,
    error,
    runText,
    runFile,
    cancel,
    reset,
  } = useAnalyzer();

  const isLoading = status === "loading";
  const isDone = status === "done";

  // ── File reading ──────────────────────────────────────────────────
  const readFile = async (file) => {
    setDocName(file.name);

    if (file.type === "application/pdf") {
      if (!window.pdfjsLib) {
        await loadScript(
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"
        );
        window.pdfjsLib.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      }

      const buffer = await file.arrayBuffer();
      const pdf = await window.pdfjsLib.getDocument({ data: buffer }).promise;

      let text = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((x) => x.str).join(" ") + "\n";
      }

      setDocText(text);
    } else {
      setDocText(await file.text());
    }
  };

  function loadScript(src) {
    return new Promise((res, rej) => {
      const s = document.createElement("script");
      s.src = src;
      s.onload = res;
      s.onerror = rej;
      document.head.appendChild(s);
    });
  }

  const handleAnalyze = () => {
    if (docText) runText(docText, docName || "Untitled Document");
  };

  const handleReset = () => {
    reset();
    setDocText("");
    setDocName("");
  };

  const counts = {
    High: clauses.filter((c) => c.riskLevel === "High").length,
    Medium: clauses.filter((c) => c.riskLevel === "Medium").length,
    Low: clauses.filter((c) => c.riskLevel === "Low").length,
  };

  return (
    <div
      className="flex-1 overflow-auto min-h-screen"
      style={{
        background:
          "radial-gradient(1200px 600px at 10% 10%, rgba(148,163,184,0.04), transparent 10%), linear-gradient(135deg,#020617 0%,#0f172a 50%,#020617 100%)",
      }}
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

        .clause-appear { animation: fadeSlideIn 0.4s ease forwards; }
        .analyzing-pulse { animation: pulse-ring 1.5s ease-in-out infinite; }
      `}</style>

      <div
        className="max-w-3xl mx-auto px-6 py-10"
        style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
      >
        {/* HERO */}
        {status === "idle" && (
          <div>
            <div className="text-center mb-10">
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "6px 14px",
                  borderRadius: "999px",
                  border: "1px solid #334155",
                  background: "rgba(15,23,42,0.6)",
                  marginBottom: "24px",
                }}
              >
                <span
                  className="analyzing-pulse"
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "#94a3b8",
                    display: "inline-block",
                  }}
                />
                <span
                  style={{
                    fontSize: "12px",
                    color: "#cbd5f5",
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                  }}
                >
                  POWERED BY LLAMA 3.3 70B
                </span>
              </div>

              <h1
                style={{
                  fontFamily: "'DM Serif Display', serif",
                  fontSize: "clamp(32px, 5vw, 48px)",
                  color: "#f8fafc",
                  lineHeight: 1.15,
                  marginBottom: "12px",
                }}
              >
                Uncover Hidden Risks
                <br />
                <span style={{ fontStyle: "italic", color: "#cbd5f5" }}>
                  Before You Sign
                </span>
              </h1>

              <p style={{ color: "#94a3b8", fontSize: "15px" }}>
                AI-powered contract analysis. Results stream in real time.
              </p>
            </div>

            {/* Drop zone */}
            <div
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const f = e.dataTransfer.files[0];
                if (f) readFile(f);
              }}
              style={{
                border: `2px dashed ${
                  dragOver ? "#64748b" : docText ? "#22c55e" : "#334155"
                }`,
                borderRadius: "20px",
                padding: "48px 24px",
                textAlign: "center",
                cursor: "pointer",
                background: dragOver
                  ? "rgba(148,163,184,0.06)"
                  : docText
                  ? "rgba(34,197,94,0.05)"
                  : "rgba(15,23,42,0.55)",
                backdropFilter: "blur(6px)",
              }}
            >
              <input
                ref={fileRef}
                type="file"
                className="hidden"
                accept=".pdf,.txt,.md"
                onChange={(e) =>
                  e.target.files[0] && readFile(e.target.files[0])
                }
              />

              <div style={{ fontSize: "48px", marginBottom: "12px" }}>
                {docText ? "✅" : "📄"}
              </div>

              <div
                style={{
                  fontSize: "16px",
                  fontWeight: 700,
                  marginBottom: "6px",
                  color: docText ? "#22c55e" : "#f8fafc",
                }}
              >
                {docText ? docName : "Drop your contract here"}
              </div>

              <div style={{ fontSize: "13px", color: "#64748b" }}>
                {docText
                  ? `${docText
                      .split(/\s+/)
                      .length.toLocaleString()} words · click to replace`
                  : "PDF or TXT · or click to browse"}
              </div>
            </div>

            {/* textarea */}
            <div style={{ marginTop: "16px" }}>
              <textarea
                rows={5}
                placeholder="Paste contract or policy text here…"
                value={docText}
                onChange={(e) => {
                  setDocText(e.target.value);
                  if (!docName) setDocName("Pasted Document");
                }}
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: "14px",
                  border: "1px solid #334155",
                  background: "rgba(15,23,42,0.6)",
                  color: "#e2e8f0",
                  fontSize: "13px",
                  resize: "vertical",
                }}
              />
            </div>

            {docText && (
              <input
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
                placeholder="Document name…"
                style={{
                  width: "100%",
                  marginTop: "10px",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  border: "1px solid #334155",
                  background: "rgba(15,23,42,0.6)",
                  color: "#e2e8f0",
                  fontSize: "13px",
                }}
              />
            )}

            {error && (
              <div
                style={{
                  marginTop: "14px",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  background: "#7f1d1d",
                  border: "1px solid #dc2626",
                  color: "#fecaca",
                  fontSize: "13px",
                }}
              >
                ⚠️ {error}
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={!docText}
              style={{
                width: "100%",
                marginTop: "16px",
                padding: "16px",
                borderRadius: "14px",
                border: "1px solid #334155",
                background: docText
                  ? "linear-gradient(135deg,#334155,#475569)"
                  : "#0f172a",
                color: docText ? "#f1f5f9" : "#475569",
                fontSize: "15px",
                fontWeight: 700,
                cursor: docText ? "pointer" : "not-allowed",
                boxShadow: docText
                  ? "0 4px 24px rgba(2,6,23,0.6)"
                  : "none",
              }}
            >
              🔍 Analyze Document
            </button>
          </div>
        )}

        {/* STREAMING / RESULTS */}
        {(isLoading || isDone) && (
          <div>
            <div
              style={{
                background: "rgba(15,23,42,0.85)",
                borderRadius: "20px",
                padding: "24px",
                marginBottom: "20px",
                border: "1px solid #334155",
                boxShadow: "0 10px 40px rgba(2,6,23,0.8)",
                display: "flex",
                gap: "20px",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <RiskGauge
                score={riskScore}
                label={riskLabel || "Analyzing…"}
                color={riskColor}
              />

              <div style={{ flex: 1, minWidth: "200px" }}>
                {isDone && summary && (
                  <p
                    style={{
                      fontSize: "13px",
                      color: "#cbd5f5",
                      lineHeight: 1.6,
                      marginBottom: "12px",
                    }}
                  >
                    {summary}
                  </p>
                )}

                <div style={{ display: "flex", gap: "16px" }}>
                  {["High", "Medium", "Low"].map((lvl) => (
                    <div key={lvl} style={{ textAlign: "center" }}>
                      <div
                        style={{
                          fontSize: "24px",
                          fontWeight: 800,
                          color:
                            lvl === "High"
                              ? "#ef4444"
                              : lvl === "Medium"
                              ? "#f59e0b"
                              : "#22c55e",
                        }}
                      >
                        {counts[lvl]}
                      </div>
                      <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                        {lvl}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {clauses.map((clause, i) => (
              <div
                key={clause.id || i}
                className="clause-appear"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <ClauseCard clause={clause} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}