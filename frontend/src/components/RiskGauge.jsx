import { useEffect, useState } from "react";

const RiskGauge = ({ score = 0, label = "", color = "#64748b" }) => {
  const radius = 52;
  const circ = 2 * Math.PI * radius;
  const arc = circ * 0.75;
  const offset = circ * 0.125;

  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setAnimatedScore(score), 120);
    return () => clearTimeout(t);
  }, [score]);

  const filled = arc * (animatedScore / 100);

  return (
    <div className="flex flex-col items-center select-none">
      <svg
        width="130"
        height="100"
        viewBox="0 0 130 100"
        role="img"
        aria-label={`Risk score ${score}`}
      >
        {/* background arc */}
        <circle
          cx="65"
          cy="70"
          r={radius}
          fill="none"
          stroke="rgba(71,85,105,0.45)"
          strokeWidth="10"
          strokeDasharray={`${arc} ${circ - arc}`}
          strokeDashoffset={-offset}
          strokeLinecap="round"
        />

        {/* progress arc */}
        <circle
          cx="65"
          cy="70"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={`${filled} ${circ - filled}`}
          strokeDashoffset={-offset}
          strokeLinecap="round"
          style={{
            transition:
              "stroke-dasharray 900ms cubic-bezier(0.4,0,0.2,1)",
            filter: `drop-shadow(0 0 6px ${color}55)`
          }}
        />

        {/* score number */}
        <text
          x="65"
          y="65"
          textAnchor="middle"
          fontSize="24"
          fontWeight="800"
          fill="#e2e8f0"
        >
          {animatedScore}
        </text>

        {/* small subtitle */}
        <text
          x="65"
          y="82"
          textAnchor="middle"
          fontSize="10"
          fill="#64748b"
          letterSpacing="1"
        >
          RISK SCORE
        </text>
      </svg>

      {/* label */}
      <span
        className="font-semibold text-sm -mt-2 tracking-wide"
        style={{ color }}
      >
        {label}
      </span>
    </div>
  );
};

export default RiskGauge;