import { useEffect } from "react";

const ProgressBar = ({ current = 0, total = 0, label = "" }) => {
  // clamp values
  const safeCurrent = typeof current === "number" ? current : 0;
  const safeTotal = typeof total === "number" ? total : 0;

  const pct = safeTotal > 0
    ? Math.round((Math.min(safeCurrent, safeTotal) / safeTotal) * 100)
    : 0;

  const isIndeterminate = safeTotal === 0 && safeCurrent > 0;

  // inject animation once
  useEffect(() => {
    if (document.getElementById("pb-indeterminate-style")) return;

    const style = document.createElement("style");
    style.id = "pb-indeterminate-style";
    style.innerHTML = `
      @keyframes pb-indeterminate {
        0% { transform: translateX(-40%); }
        100% { transform: translateX(120%); }
      }

      .pb-indeterminate {
        animation: pb-indeterminate 1.6s cubic-bezier(.4,0,.2,1) infinite;
      }
    `;
    document.head.appendChild(style);
  }, []);

  return (
    <div className="w-full mt-3">
      {/* label row */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-slate-400">{label}</span>

        <span className="text-xs font-semibold text-slate-200">
          {isIndeterminate ? "…" : `${pct}%`}
        </span>
      </div>

      {/* progress container */}
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={safeTotal || 100}
        aria-valuenow={safeTotal ? safeCurrent : undefined}
        className="
          relative
          w-full
          h-2.5
          rounded-full
          overflow-hidden
          bg-slate-800/60
          border border-slate-700/60
        "
      >
        {/* determinate progress */}
        {!isIndeterminate && (
          <div
            className="
              h-full
              rounded-full
              transition-all
              duration-500
            "
            style={{
              width: `${pct}%`,
              background:
                "linear-gradient(90deg, rgba(148,163,184,0.35), rgba(148,163,184,0.15))",
              boxShadow:
                "inset 0 -6px 16px rgba(2,6,23,0.45), 0 2px 8px rgba(2,6,23,0.4)",
            }}
          />
        )}

        {/* indeterminate animation */}
        {isIndeterminate && (
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="absolute top-0 bottom-0 pb-indeterminate rounded-full"
              style={{
                width: "40%",
                background:
                  "linear-gradient(90deg, rgba(148,163,184,0.15), rgba(148,163,184,0.35), rgba(148,163,184,0.15))",
                boxShadow:
                  "inset 0 -6px 16px rgba(2,6,23,0.45), 0 4px 16px rgba(2,6,23,0.4)",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressBar;