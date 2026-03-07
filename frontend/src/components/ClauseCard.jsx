import { useState } from "react";

const RISK_STYLES = {
  High:   { bg: "bg-red-50",   border: "border-red-200",   left: "border-l-red-500",   badge: "bg-red-600 text-white",       text: "text-red-700"   },
  Medium: { bg: "bg-amber-50", border: "border-amber-200", left: "border-l-amber-400", badge: "bg-amber-400 text-stone-900", text: "text-amber-700" },
  Low:    { bg: "bg-green-50", border: "border-green-200", left: "border-l-green-500", badge: "bg-green-600 text-white",     text: "text-green-700" },
};

const CAT_ICONS = {
  Liability: "⚖️", Indemnification: "🛡️", "Data Privacy": "🔒",
  "IP Rights": "©️", Termination: "🚫", Payment: "💰",
  Confidentiality: "🤫", "Dispute Resolution": "🏛️",
  "Ambiguous Language": "❓", Compliance: "📋", Other: "📄",
};

function NegotiationBar({ score = 0 }) {
  const color = score >= 61 ? "#22c55e" : score >= 31 ? "#f59e0b" : "#ef4444";
  const label = score >= 61 ? "Highly Negotiable"
              : score >= 31 ? "Somewhat Negotiable"
              : "Hard to Negotiate";

  return (
    <div style={{ marginTop: "10px" }}>
      <div style={{ display: "flex", justifyContent: "space-between",
                    alignItems: "center", marginBottom: "4px" }}>
        <span style={{ fontSize: "11px", fontWeight: 700, color: "#6b7280",
                       textTransform: "uppercase", letterSpacing: "0.07em" }}>
          🤝 Negotiability
        </span>
        <span style={{ fontSize: "11px", fontWeight: 700, color }}>
          {score}/100 · {label}
        </span>
      </div>
      <div style={{ height: "5px", background: "rgba(0,0,0,0.08)",
                    borderRadius: "100px", overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${score}%`, background: color,
          borderRadius: "100px",
          transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)"
        }} />
      </div>
    </div>
  );
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button onClick={copy} style={{
      padding: "3px 10px", borderRadius: "6px", border: "1px solid #d1fae5",
      background: copied ? "#d1fae5" : "transparent",
      color: copied ? "#065f46" : "#6b7280",
      fontSize: "11px", fontWeight: 600, cursor: "pointer",
      transition: "all 0.2s", marginLeft: "8px"
    }}>
      {copied ? "✓ Copied" : "Copy fix"}
    </button>
  );
}

const ClauseCard = ({ clause, isDark }) => {
  const [open, setOpen] = useState(false);
  const s = RISK_STYLES[clause.riskLevel] || RISK_STYLES.Low;

  return (
    <div className={`${s.bg} ${s.border} ${s.left} border border-l-4 rounded-xl p-4 mb-3`}
         style={{ transition: "box-shadow 0.2s" }}>
      <div style={{ display: "flex", gap: "12px" }}>
        <span style={{ fontSize: "20px", flexShrink: 0, marginTop: "2px" }}>
          {CAT_ICONS[clause.category] || "📄"}
        </span>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Badges */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px",
                        marginBottom: "8px", alignItems: "center" }}>
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full
                              uppercase tracking-wide ${s.badge}`}>
              {clause.riskLevel}
            </span>
            <span style={{ fontSize: "11px", fontWeight: 600, padding: "2px 10px",
                           borderRadius: "100px", background: "rgba(0,0,0,0.06)",
                           color: "#374151" }}>
              {clause.category}
            </span>
            {clause.ambiguous && (
              <span style={{ fontSize: "11px", fontWeight: 600, padding: "2px 10px",
                             borderRadius: "100px", background: "#e0e7ff",
                             color: "#4338ca" }}>
                ⚠ Ambiguous
              </span>
            )}
          </div>

          {/* Original text */}
          <blockquote style={{
            margin: "0 0 8px 0", padding: "8px 12px",
            background: "rgba(0,0,0,0.04)", borderRadius: "8px",
            fontFamily: "Georgia, serif", fontSize: "13px",
            color: "#1e293b", lineHeight: 1.6
          }}>
            "{clause.originalText}"
          </blockquote>

          {/* Reasoning */}
          <p className={`text-sm leading-relaxed mb-2 ${s.text}`}>
            {clause.reasoning}
          </p>

          {/* Negotiation score bar */}
          {clause.negotiationScore !== undefined && (
            <NegotiationBar score={clause.negotiationScore} />
          )}

          {/* Expand button */}
          <button
            onClick={() => setOpen(!open)}
            className={`mt-2 text-xs font-semibold px-3 py-1 rounded-md
                        border ${s.border} ${s.text} bg-transparent
                        hover:bg-black/5 transition-colors`}
          >
            {open ? "▲ Hide suggestion" : "▼ View suggested fix"}
          </button>

          {/* Suggested wording */}
          {open && (
            <div style={{
              marginTop: "10px", padding: "12px",
              background: "rgba(255,255,255,0.7)",
              border: `1px dashed`,
              borderRadius: "8px", borderColor: "#86efac"
            }}>
              <div style={{ display: "flex", alignItems: "center",
                            justifyContent: "space-between", marginBottom: "6px" }}>
                <p style={{ margin: 0, fontSize: "11px", fontWeight: 700,
                            color: "#6b7280", textTransform: "uppercase",
                            letterSpacing: "0.08em" }}>
                  ✏️ Suggested Wording
                </p>
                <CopyButton text={clause.suggestedWording} />
              </div>
              <p style={{ margin: 0, fontSize: "13px", color: "#1e293b",
                          lineHeight: 1.6, fontStyle: "italic" }}>
                {clause.suggestedWording}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClauseCard;