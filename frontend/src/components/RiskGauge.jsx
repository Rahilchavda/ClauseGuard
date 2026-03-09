import { useEffect, useState } from "react";

const RiskGauge = ({ score = 0, label = "", color = "#64748b", isDark = true }) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setAnimatedScore(score), 120);
    return () => clearTimeout(t);
  }, [score]);

  // ── Responsive size via CSS clamp approximated with viewBox scaling ──
  // We keep the SVG viewBox fixed and let width/height scale responsively
  const radius = 52;
  const circ   = 2 * Math.PI * radius;
  const arc    = circ * 0.75;
  const offset = circ * 0.125;
  const filled = arc * (animatedScore / 100);

  const trackColor  = isDark ? "rgba(71,85,105,0.45)" : "rgba(148,163,184,0.35)";
  const scoreColor  = isDark ? "#e2e8f0"              : "#0f172a";
  const subColor    = isDark ? "#64748b"              : "#94a3b8";
  const labelColor  = color;

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      userSelect: "none",
      flexShrink: 0,
    }}>
      <svg
        // Responsive: fills container width up to 130px
        width="100%"
        height="auto"
        viewBox="0 0 130 100"
        style={{
          maxWidth: "clamp(90px, 20vw, 130px)",
          minWidth: "80px",
          display: "block",
        }}
        role="img"
        aria-label={`Risk score ${score}`}
      >
        {/* ── Background arc ── */}
        <circle
          cx="65" cy="70" r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth="10"
          strokeDasharray={`${arc} ${circ - arc}`}
          strokeDashoffset={-offset}
          strokeLinecap="round"
        />

        {/* ── Progress arc ── */}
        <circle
          cx="65" cy="70" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={`${filled} ${circ - filled}`}
          strokeDashoffset={-offset}
          strokeLinecap="round"
          style={{
            transition: "stroke-dasharray 900ms cubic-bezier(0.4,0,0.2,1)",
            filter: `drop-shadow(0 0 6px ${color}55)`,
          }}
        />

        {/* ── Score number ── */}
        <text
          x="65" y="65"
          textAnchor="middle"
          fontSize="24"
          fontWeight="800"
          fill={scoreColor}
          style={{ transition: "fill 0.3s" }}
        >
          {animatedScore}
        </text>

        {/* ── Subtitle ── */}
        <text
          x="65" y="82"
          textAnchor="middle"
          fontSize="10"
          fill={subColor}
          letterSpacing="1"
          style={{ transition: "fill 0.3s" }}
        >
          RISK SCORE
        </text>
      </svg>

      {/* ── Label below gauge ── */}
      <span style={{
        color: labelColor,
        fontWeight: 600,
        fontSize: "clamp(11px, 2.5vw, 13px)",
        marginTop: "-6px",
        letterSpacing: "0.04em",
        textAlign: "center",
        transition: "color 0.3s",
        whiteSpace: "nowrap",
      }}>
        {label}
      </span>
    </div>
  );
};

export default RiskGauge;