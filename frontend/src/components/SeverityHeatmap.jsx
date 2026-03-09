const CAT_ICONS = {
  Liability: "⚖️", Indemnification: "🛡️", "Data Privacy": "🔒",
  "IP Rights": "©️", Termination: "🚫", Payment: "💰",
  Confidentiality: "🤫", "Dispute Resolution": "🏛️",
  "Ambiguous Language": "❓", Compliance: "📋", Other: "📄",
};

const RISK_COLOR = {
  High: {
    light: { bg: "#fef2f2", dot: "#ef4444", text: "#dc2626", border: "#fecaca" },
    dark:  { bg: "rgba(127,29,29,0.25)", dot: "#ef4444", text: "#fca5a5", border: "#7f1d1d" },
  },
  Medium: {
    light: { bg: "#fffbeb", dot: "#f59e0b", text: "#b45309", border: "#fde68a" },
    dark:  { bg: "rgba(120,53,15,0.25)", dot: "#f59e0b", text: "#fcd34d", border: "#78350f" },
  },
  Low: {
    light: { bg: "#f0fdf4", dot: "#22c55e", text: "#15803d", border: "#bbf7d0" },
    dark:  { bg: "rgba(20,83,45,0.25)", dot: "#22c55e", text: "#86efac", border: "#14532d" },
  },
};

export default function SeverityHeatmap({ clauses, isDark }) {
  if (!clauses?.length) return null;

  // Group by category
  const grouped = clauses.reduce((acc, clause) => {
    const cat = clause.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(clause);
    return acc;
  }, {});

  // Sort by weighted risk score
  const sorted = Object.entries(grouped).sort((a, b) => {
    const score = (list) =>
      list.filter(c => c.riskLevel === "High").length * 10 +
      list.filter(c => c.riskLevel === "Medium").length * 4 +
      list.filter(c => c.riskLevel === "Low").length;
    return score(b[1]) - score(a[1]);
  });

  const theme = isDark
    ? { cardBg: "#1e293b", cardBorder: "#334155", title: "#f8fafc", legendBorder: "#334155", legendText: "#94a3b8", intensityText: "#64748b" }
    : { cardBg: "#ffffff",  cardBorder: "#e2e8f0", title: "#0f172a", legendBorder: "#f1f5f9", legendText: "#6b7280", intensityText: "#94a3b8" };

  return (
    <div style={{
      background: theme.cardBg,
      border: `1px solid ${theme.cardBorder}`,
      borderRadius: "16px",
      padding: "clamp(14px, 3vw, 20px)",
      marginBottom: "16px",
      boxSizing: "border-box",
      width: "100%",
    }}>

      {/* Title */}
      <h3 style={{
        fontWeight: 700,
        fontSize: "clamp(13px, 2.5vw, 14px)",
        marginBottom: "14px", margin: "0 0 14px 0",
        color: theme.title,
      }}>
        🗺️ Risk Heatmap
      </h3>

      {/* Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(clamp(130px, 30vw, 160px), 1fr))",
        gap: "clamp(8px, 2vw, 10px)",
      }}>
        {sorted.map(([category, cats]) => {
          const high   = cats.filter(c => c.riskLevel === "High").length;
          const medium = cats.filter(c => c.riskLevel === "Medium").length;
          const low    = cats.filter(c => c.riskLevel === "Low").length;

          const dominant = high > 0 ? "High" : medium > 0 ? "Medium" : "Low";
          const colors   = RISK_COLOR[dominant][isDark ? "dark" : "light"];
          const intensity = Math.min(cats.length / 5, 1);

          // Cap dots at 12 to avoid overflow on small screens
          const maxDots = 12;
          const totalDots = Math.min(high + medium + low, maxDots);
          const cappedHigh   = Math.min(high, maxDots);
          const cappedMedium = Math.min(medium, Math.max(0, maxDots - cappedHigh));
          const cappedLow    = Math.min(low, Math.max(0, maxDots - cappedHigh - cappedMedium));

          return (
            <div key={category} style={{
              padding: "clamp(10px, 2vw, 14px)",
              borderRadius: "12px",
              background: colors.bg,
              border: `1px solid ${colors.border}`,
              position: "relative",
              overflow: "hidden",
              boxSizing: "border-box",
            }}>

              {/* Heat overlay */}
              <div style={{
                position: "absolute", inset: 0,
                background: colors.dot,
                opacity: intensity * 0.08,
                borderRadius: "12px",
                pointerEvents: "none",
              }} />

              {/* Content */}
              <div style={{ position: "relative" }}>

                {/* Icon */}
                <div style={{
                  fontSize: "clamp(16px, 4vw, 20px)",
                  marginBottom: "6px",
                  lineHeight: 1,
                }}>
                  {CAT_ICONS[category] || "📄"}
                </div>

                {/* Category name */}
                <div style={{
                  fontSize: "clamp(11px, 2vw, 12px)",
                  fontWeight: 700,
                  color: isDark ? "#e2e8f0" : "#1e293b",
                  marginBottom: "8px",
                  lineHeight: 1.3,
                  wordBreak: "break-word",
                }}>
                  {category}
                </div>

                {/* Risk dots */}
                <div style={{
                  display: "flex", gap: "3px",
                  flexWrap: "wrap", maxWidth: "100%",
                }}>
                  {Array(cappedHigh).fill(0).map((_, i) => (
                    <div key={`h${i}`} style={{
                      width: "clamp(6px, 1.5vw, 8px)",
                      height: "clamp(6px, 1.5vw, 8px)",
                      borderRadius: "100%",
                      background: "#ef4444",
                      boxShadow: "0 0 4px rgba(239,68,68,0.5)",
                      flexShrink: 0,
                    }} />
                  ))}
                  {Array(cappedMedium).fill(0).map((_, i) => (
                    <div key={`m${i}`} style={{
                      width: "clamp(6px, 1.5vw, 8px)",
                      height: "clamp(6px, 1.5vw, 8px)",
                      borderRadius: "100%",
                      background: "#f59e0b",
                      boxShadow: "0 0 4px rgba(245,158,11,0.5)",
                      flexShrink: 0,
                    }} />
                  ))}
                  {Array(cappedLow).fill(0).map((_, i) => (
                    <div key={`l${i}`} style={{
                      width: "clamp(6px, 1.5vw, 8px)",
                      height: "clamp(6px, 1.5vw, 8px)",
                      borderRadius: "100%",
                      background: "#22c55e",
                      boxShadow: "0 0 4px rgba(34,197,94,0.5)",
                      flexShrink: 0,
                    }} />
                  ))}
                  {/* Show +N if dots were capped */}
                  {(high + medium + low) > maxDots && (
                    <span style={{
                      fontSize: "10px", color: colors.text,
                      fontWeight: 700, alignSelf: "center",
                    }}>
                      +{(high + medium + low) - maxDots}
                    </span>
                  )}
                </div>

                {/* Count label */}
                <div style={{
                  marginTop: "6px",
                  fontSize: "clamp(10px, 2vw, 11px)",
                  color: colors.text,
                  fontWeight: 600,
                  lineHeight: 1.4,
                }}>
                  {cats.length} clause{cats.length !== 1 ? "s" : ""}
                  {high > 0 && ` · ${high} high`}
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{
        display: "flex",
        gap: "clamp(10px, 3vw, 16px)",
        marginTop: "14px",
        paddingTop: "12px",
        borderTop: `1px solid ${theme.legendBorder}`,
        flexWrap: "wrap",
        alignItems: "center",
      }}>
        {[["High","#ef4444"],["Medium","#f59e0b"],["Low","#22c55e"]].map(([label, color]) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <div style={{
              width: "8px", height: "8px",
              borderRadius: "100%", background: color,
              flexShrink: 0,
            }} />
            <span style={{
              fontSize: "clamp(10px, 2vw, 11px)",
              color: theme.legendText,
            }}>
              {label}
            </span>
          </div>
        ))}
        <span style={{
          fontSize: "clamp(10px, 2vw, 11px)",
          color: theme.intensityText,
          marginLeft: "auto",
          whiteSpace: "nowrap",
        }}>
          Intensity = clause density
        </span>
      </div>
    </div>
  );
}