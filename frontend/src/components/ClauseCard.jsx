import { useState } from "react";

const RISK_STYLES = {
  High: {
    bg: "#fef2f2", border: "#fecaca", left: "#ef4444",
    badge: { bg: "#dc2626", color: "#fff" },
    text: "#b91c1c", suggestBorder: "#fca5a5", suggestBg: "rgba(255,255,255,0.85)",
  },
  Medium: {
    bg: "#fffbeb", border: "#fde68a", left: "#f59e0b",
    badge: { bg: "#f59e0b", color: "#1c1917" },
    text: "#b45309", suggestBorder: "#fcd34d", suggestBg: "rgba(255,255,255,0.85)",
  },
  Low: {
    bg: "#f0fdf4", border: "#bbf7d0", left: "#22c55e",
    badge: { bg: "#16a34a", color: "#fff" },
    text: "#15803d", suggestBorder: "#86efac", suggestBg: "rgba(255,255,255,0.85)",
  },
};

// Dark mode overrides
const RISK_STYLES_DARK = {
  High: {
    bg: "rgba(127,29,29,0.2)", border: "#7f1d1d", left: "#ef4444",
    badge: { bg: "#dc2626", color: "#fff" },
    text: "#fca5a5", suggestBorder: "#7f1d1d", suggestBg: "rgba(15,23,42,0.8)",
  },
  Medium: {
    bg: "rgba(120,53,15,0.2)", border: "#78350f", left: "#f59e0b",
    badge: { bg: "#d97706", color: "#1c1917" },
    text: "#fcd34d", suggestBorder: "#78350f", suggestBg: "rgba(15,23,42,0.8)",
  },
  Low: {
    bg: "rgba(20,83,45,0.2)", border: "#14532d", left: "#22c55e",
    badge: { bg: "#16a34a", color: "#fff" },
    text: "#86efac", suggestBorder: "#14532d", suggestBg: "rgba(15,23,42,0.8)",
  },
};

const CAT_ICONS = {
  Liability: "⚖️", Indemnification: "🛡️", "Data Privacy": "🔒",
  "IP Rights": "©️", Termination: "🚫", Payment: "💰",
  Confidentiality: "🤫", "Dispute Resolution": "🏛️",
  "Ambiguous Language": "❓", Compliance: "📋", Other: "📄",
};

function NegotiationBar({ score = 0, isDark }) {
  const color = score >= 61 ? "#22c55e" : score >= 31 ? "#f59e0b" : "#ef4444";
  const label = score >= 61 ? "Highly Negotiable"
              : score >= 31 ? "Somewhat Negotiable"
              : "Hard to Negotiate";

  return (
    <div style={{ marginTop: "10px" }}>
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", gap: "8px", marginBottom: "5px",
        flexWrap: "wrap",
      }}>
        <span style={{
          fontSize: "11px", fontWeight: 700,
          color: isDark ? "#64748b" : "#6b7280",
          textTransform: "uppercase", letterSpacing: "0.07em",
          whiteSpace: "nowrap",
        }}>
          🤝 Negotiability
        </span>
        <span style={{
          fontSize: "11px", fontWeight: 700, color,
          whiteSpace: "nowrap",
        }}>
          {score}/100 · {label}
        </span>
      </div>
      <div style={{
        height: "5px",
        background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
        borderRadius: "100px", overflow: "hidden",
      }}>
        <div style={{
          height: "100%", width: `${score}%`, background: color,
          borderRadius: "100px",
          transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)",
        }} />
      </div>
    </div>
  );
}

function CopyButton({ text, isDark }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={copy}
      style={{
        padding: "4px 10px", borderRadius: "6px",
        border: `1px solid ${isDark ? "#14532d" : "#d1fae5"}`,
        background: copied
          ? (isDark ? "#14532d" : "#d1fae5")
          : "transparent",
        color: copied
          ? (isDark ? "#86efac" : "#065f46")
          : (isDark ? "#64748b" : "#6b7280"),
        fontSize: "11px", fontWeight: 600,
        cursor: "pointer", transition: "all 0.2s",
        whiteSpace: "nowrap", flexShrink: 0,
      }}
    >
      {copied ? "✓ Copied" : "Copy fix"}
    </button>
  );
}

const ClauseCard = ({ clause, isDark = false }) => {
  const [open, setOpen] = useState(false);
  const styles = isDark ? RISK_STYLES_DARK : RISK_STYLES;
  const s = styles[clause.riskLevel] || styles.Low;

  return (
    <div style={{
      background: s.bg,
      border: `1px solid ${s.border}`,
      borderLeft: `4px solid ${s.left}`,
      borderRadius: "14px",
      padding: "clamp(12px, 3vw, 18px)",
      marginBottom: "12px",
      transition: "all 0.2s",
      boxSizing: "border-box",
      width: "100%",
    }}>

      {/* ── Top row: icon + content ── */}
      <div style={{ display: "flex", gap: "clamp(8px, 2vw, 14px)", alignItems: "flex-start" }}>

        {/* Icon — hidden on very small screens */}
        <span style={{
          fontSize: "clamp(16px, 4vw, 22px)",
          flexShrink: 0, marginTop: "2px",
          display: "block",
        }}>
          {CAT_ICONS[clause.category] || "📄"}
        </span>

        <div style={{ flex: 1, minWidth: 0 }}>

          {/* ── Badges row ── */}
          <div style={{
            display: "flex", flexWrap: "wrap", gap: "6px",
            marginBottom: "10px", alignItems: "center",
          }}>
            {/* Severity badge */}
            <span style={{
              fontSize: "11px", fontWeight: 700,
              padding: "3px 10px", borderRadius: "100px",
              background: s.badge.bg, color: s.badge.color,
              textTransform: "uppercase", letterSpacing: "0.06em",
              whiteSpace: "nowrap",
            }}>
              {clause.riskLevel}
            </span>

            {/* Category badge */}
            <span style={{
              fontSize: "11px", fontWeight: 600,
              padding: "3px 10px", borderRadius: "100px",
              background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
              color: isDark ? "#94a3b8" : "#374151",
              whiteSpace: "nowrap",
            }}>
              {clause.category}
            </span>

            {/* Ambiguous badge */}
            {clause.ambiguous && (
              <span style={{
                fontSize: "11px", fontWeight: 600,
                padding: "3px 10px", borderRadius: "100px",
                background: isDark ? "rgba(67,56,202,0.3)" : "#e0e7ff",
                color: isDark ? "#a5b4fc" : "#4338ca",
                whiteSpace: "nowrap",
              }}>
                ⚠ Ambiguous
              </span>
            )}
          </div>

          {/* ── Original clause text ── */}
          <blockquote style={{
            margin: "0 0 10px 0",
            padding: "clamp(8px, 2vw, 12px)",
            background: isDark ? "rgba(0,0,0,0.25)" : "rgba(0,0,0,0.04)",
            borderRadius: "8px",
            fontFamily: "Georgia, serif",
            fontSize: "clamp(12px, 2.5vw, 13px)",
            color: isDark ? "#cbd5e1" : "#1e293b",
            lineHeight: 1.65,
            wordBreak: "break-word",
            overflowWrap: "break-word",
          }}>
            "{clause.originalText}"
          </blockquote>

          {/* ── Reasoning ── */}
          <p style={{
            margin: "0 0 6px 0",
            fontSize: "clamp(12px, 2.5vw, 13px)",
            color: s.text, lineHeight: 1.6,
            wordBreak: "break-word",
          }}>
            {clause.reasoning}
          </p>

          {/* ── Negotiation bar ── */}
          {clause.negotiationScore !== undefined && (
            <NegotiationBar score={clause.negotiationScore} isDark={isDark} />
          )}

          {/* ── Expand toggle ── */}
          <button
            onClick={() => setOpen(!open)}
            style={{
              marginTop: "12px",
              padding: "6px 14px",
              borderRadius: "8px",
              border: `1px solid ${s.border}`,
              background: "transparent",
              color: s.text,
              fontSize: "12px", fontWeight: 600,
              cursor: "pointer", transition: "all 0.15s",
            }}
          >
            {open ? "▲ Hide suggestion" : "▼ View suggested fix"}
          </button>

          {/* ── Suggested fix ── */}
          {open && (
            <div style={{
              marginTop: "10px",
              padding: "clamp(10px, 2vw, 14px)",
              background: s.suggestBg,
              border: `1px dashed ${s.suggestBorder}`,
              borderRadius: "10px",
              boxSizing: "border-box",
            }}>
              {/* Fix header */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "8px",
                marginBottom: "8px",
              }}>
                <p style={{
                  margin: 0, fontSize: "11px", fontWeight: 700,
                  color: isDark ? "#64748b" : "#6b7280",
                  textTransform: "uppercase", letterSpacing: "0.08em",
                }}>
                  ✏️ Suggested Wording
                </p>
                <CopyButton text={clause.suggestedWording} isDark={isDark} />
              </div>

              {/* Fix text */}
              <p style={{
                margin: 0,
                fontSize: "clamp(12px, 2.5vw, 13px)",
                color: isDark ? "#cbd5e1" : "#1e293b",
                lineHeight: 1.65,
                fontStyle: "italic",
                wordBreak: "break-word",
                overflowWrap: "break-word",
              }}>
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