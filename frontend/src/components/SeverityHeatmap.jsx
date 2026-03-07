const CAT_ICONS = {
    Liability: "⚖️", Indemnification: "🛡️", "Data Privacy": "🔒",
    "IP Rights": "©️", Termination: "🚫", Payment: "💰",
    Confidentiality: "🤫", "Dispute Resolution": "🏛️",
    "Ambiguous Language": "❓", Compliance: "📋", Other: "📄",
  };
  
  const RISK_COLOR = {
    High:   { bg: "#fef2f2", dot: "#ef4444", text: "#dc2626" },
    Medium: { bg: "#fffbeb", dot: "#f59e0b", text: "#b45309" },
    Low:    { bg: "#f0fdf4", dot: "#22c55e", text: "#15803d" },
  };
  
  export default function SeverityHeatmap({ clauses, isDark }) {
    if (!clauses?.length) return null;
  
    // Group clauses by category
    const grouped = clauses.reduce((acc, clause) => {
      const cat = clause.category || "Other";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(clause);
      return acc;
    }, {});
  
    // Sort categories by highest risk count
    const sorted = Object.entries(grouped).sort((a, b) => {
      const score = (clauses) =>
        clauses.filter(c => c.riskLevel === "High").length * 10 +
        clauses.filter(c => c.riskLevel === "Medium").length * 4 +
        clauses.filter(c => c.riskLevel === "Low").length;
      return score(b[1]) - score(a[1]);
    });
  
    return (
      <div style={{
        background: isDark ? "#1e293b" : "#ffffff",
        border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
        borderRadius: "16px", padding: "20px", marginBottom: "16px"
      }}>
        <h3 style={{ fontWeight: 700, fontSize: "14px", marginBottom: "16px",
                     color: isDark ? "#f8fafc" : "#0f172a" }}>
          🗺️ Risk Heatmap
        </h3>
  
        <div style={{ display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                      gap: "10px" }}>
          {sorted.map(([category, cats]) => {
            const high   = cats.filter(c => c.riskLevel === "High").length;
            const medium = cats.filter(c => c.riskLevel === "Medium").length;
            const low    = cats.filter(c => c.riskLevel === "Low").length;
  
            // Dominant risk level
            const dominant = high > 0 ? "High" : medium > 0 ? "Medium" : "Low";
            const colors   = RISK_COLOR[dominant];
  
            // Heat intensity based on clause count
            const intensity = Math.min(cats.length / 5, 1);
  
            return (
              <div key={category} style={{
                padding: "12px", borderRadius: "12px",
                background: colors.bg,
                border: `1px solid ${colors.dot}40`,
                position: "relative", overflow: "hidden"
              }}>
                {/* Heat overlay */}
                <div style={{
                  position: "absolute", inset: 0,
                  background: colors.dot,
                  opacity: intensity * 0.08,
                  borderRadius: "12px"
                }} />
  
                {/* Content */}
                <div style={{ position: "relative" }}>
                  <div style={{ fontSize: "20px", marginBottom: "6px" }}>
                    {CAT_ICONS[category] || "📄"}
                  </div>
                  <div style={{ fontSize: "12px", fontWeight: 700,
                                color: isDark ? "#1e293b" : "#1e293b",
                                marginBottom: "8px", lineHeight: 1.3 }}>
                    {category}
                  </div>
  
                  {/* Risk dots */}
                  <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                    {Array(high).fill(0).map((_, i) => (
                      <div key={`h${i}`} style={{
                        width: "8px", height: "8px", borderRadius: "100%",
                        background: "#ef4444",
                        boxShadow: "0 0 4px rgba(239,68,68,0.5)"
                      }} />
                    ))}
                    {Array(medium).fill(0).map((_, i) => (
                      <div key={`m${i}`} style={{
                        width: "8px", height: "8px", borderRadius: "100%",
                        background: "#f59e0b",
                        boxShadow: "0 0 4px rgba(245,158,11,0.5)"
                      }} />
                    ))}
                    {Array(low).fill(0).map((_, i) => (
                      <div key={`l${i}`} style={{
                        width: "8px", height: "8px", borderRadius: "100%",
                        background: "#22c55e",
                        boxShadow: "0 0 4px rgba(34,197,94,0.5)"
                      }} />
                    ))}
                  </div>
  
                  {/* Count */}
                  <div style={{ marginTop: "6px", fontSize: "11px",
                                color: colors.text, fontWeight: 600 }}>
                    {cats.length} clause{cats.length !== 1 ? "s" : ""}
                    {high > 0 && ` · ${high} high`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
  
        {/* Legend */}
        <div style={{ display: "flex", gap: "16px", marginTop: "14px",
                      paddingTop: "12px",
                      borderTop: `1px solid ${isDark ? "#334155" : "#f1f5f9"}` }}>
          {[["High","#ef4444"],["Medium","#f59e0b"],["Low","#22c55e"]].map(
            ([label, color]) => (
              <div key={label} style={{ display: "flex", alignItems: "center",
                                        gap: "6px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "100%",
                              background: color }} />
                <span style={{ fontSize: "11px", color: "#6b7280" }}>{label}</span>
              </div>
            )
          )}
          <span style={{ fontSize: "11px", color: "#94a3b8", marginLeft: "auto" }}>
            Intensity = clause density
          </span>
        </div>
      </div>
    );
  }