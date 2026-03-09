import { useEffect } from "react";

const ProgressBar = ({ current = 0, total = 0, label = "", isDark = true }) => {
  const safeCurrent = typeof current === "number" ? current : 0;
  const safeTotal   = typeof total   === "number" ? total   : 0;

  const pct = safeTotal > 0
    ? Math.round((Math.min(safeCurrent, safeTotal) / safeTotal) * 100)
    : 0;

  const isIndeterminate = safeTotal === 0 && safeCurrent > 0;

  // Inject animation once
  useEffect(() => {
    if (document.getElementById("pb-indeterminate-style")) return;
    const style = document.createElement("style");
    style.id = "pb-indeterminate-style";
    style.innerHTML = `
      @keyframes pb-indeterminate {
        0%   { transform: translateX(-40%); }
        100% { transform: translateX(120%); }
      }
      .pb-indeterminate {
        animation: pb-indeterminate 1.6s cubic-bezier(.4,0,.2,1) infinite;
      }
    `;
    document.head.appendChild(style);
  }, []);

  // ── Theme tokens ──
  const trackBg     = isDark ? "rgba(30,41,59,0.6)"   : "rgba(226,232,240,0.8)";
  const trackBorder = isDark ? "rgba(51,65,85,0.6)"   : "rgba(203,213,225,0.8)";
  const fillBg      = isDark
    ? "linear-gradient(90deg, rgba(148,163,184,0.35), rgba(148,163,184,0.15))"
    : "linear-gradient(90deg, rgba(71,85,105,0.5),   rgba(71,85,105,0.25))";
  const fillShadow  = isDark
    ? "inset 0 -6px 16px rgba(2,6,23,0.45), 0 2px 8px rgba(2,6,23,0.4)"
    : "inset 0 -4px 10px rgba(0,0,0,0.1),   0 2px 6px rgba(0,0,0,0.08)";
  const labelColor  = isDark ? "#94a3b8" : "#64748b";
  const pctColor    = isDark ? "#e2e8f0" : "#0f172a";

  return (
    <div style={{
      width: "100%",
      marginTop: "clamp(8px, 2vw, 12px)",
      boxSizing: "border-box",
    }}>

      {/* ── Label row ── */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "6px",
        gap: "8px",
        flexWrap: "wrap",
      }}>
        <span style={{
          fontSize: "clamp(11px, 2vw, 12px)",
          color: labelColor,
          lineHeight: 1.4,
          transition: "color 0.3s",
          wordBreak: "break-word",
          flex: 1,
        }}>
          {label}
        </span>

        <span style={{
          fontSize: "clamp(11px, 2vw, 12px)",
          fontWeight: 700,
          color: pctColor,
          whiteSpace: "nowrap",
          transition: "color 0.3s",
        }}>
          {isIndeterminate ? "…" : `${pct}%`}
        </span>
      </div>

      {/* ── Track ── */}
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={safeTotal || 100}
        aria-valuenow={safeTotal ? safeCurrent : undefined}
        style={{
          position: "relative",
          width: "100%",
          height: "clamp(6px, 1.5vw, 10px)",
          borderRadius: "100px",
          overflow: "hidden",
          background: trackBg,
          border: `1px solid ${trackBorder}`,
          boxSizing: "border-box",
          transition: "background 0.3s, border-color 0.3s",
        }}
      >
        {/* Determinate fill */}
        {!isIndeterminate && (
          <div style={{
            height: "100%",
            width: `${pct}%`,
            borderRadius: "100px",
            background: fillBg,
            boxShadow: fillShadow,
            transition: "width 0.5s cubic-bezier(0.4,0,0.2,1), background 0.3s",
          }} />
        )}

        {/* Indeterminate shimmer */}
        {isIndeterminate && (
          <div style={{
            position: "absolute",
            inset: 0,
            overflow: "hidden",
            borderRadius: "100px",
          }}>
            <div
              className="pb-indeterminate"
              style={{
                position: "absolute",
                top: 0, bottom: 0,
                width: "40%",
                borderRadius: "100px",
                background: isDark
                  ? "linear-gradient(90deg, rgba(148,163,184,0.1), rgba(148,163,184,0.35), rgba(148,163,184,0.1))"
                  : "linear-gradient(90deg, rgba(71,85,105,0.05), rgba(71,85,105,0.25), rgba(71,85,105,0.05))",
                boxShadow: fillShadow,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressBar;