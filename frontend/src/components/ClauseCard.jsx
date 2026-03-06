import { useState } from "react";

const RISK_STYLES = {
  High: {
    left: "border-l-4 border-l-red-500/60",
    badge: "bg-red-600 text-white",
    text: "text-red-300",
  },
  Medium: {
    left: "border-l-4 border-l-amber-400/50",
    badge: "bg-amber-500 text-stone-900",
    text: "text-amber-300",
  },
  Low: {
    left: "border-l-4 border-l-green-500/45",
    badge: "bg-green-600 text-white",
    text: "text-green-300",
  },
};

/* === Category icons (keep glyphs, but render them in identical circular containers) === */
const CAT_ICONS = {
  Liability: "⚖️",
  Indemnification: "🛡️",
  "Data Privacy": "🔒",
  "IP Rights": "©️",
  Termination: "🚫",
  Payment: "💰",
  Confidentiality: "🤫",
  "Dispute Resolution": "🏛️",
  "Ambiguous Language": "❓",
  Compliance: "📋",
  Other: "📄",
};

const IconBadge = ({ symbol, title }) => {
  return (
    <div
      title={title}
      className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
                 bg-slate-700/60 text-slate-100 text-lg ring-1 ring-slate-800/60
                 shadow-inner"
    >
      <span className="select-none">{symbol}</span>
    </div>
  );
};

const ClauseCard = ({ clause = {} }) => {
  const [open, setOpen] = useState(false);
  const s = RISK_STYLES[clause.riskLevel] || RISK_STYLES.Low;

  return (
    <div
      className={`
        w-full rounded-xl p-4 mb-3 transition-shadow duration-200
        bg-gradient-to-b from-slate-900/60 to-slate-900/35
        border border-slate-700/60
        hover:shadow-[0_8px_30px_rgba(2,6,23,0.7)]
        ${s.left}
      `}
    >
      <div className="flex gap-4">
        {/* consistent circular icon */}
        <IconBadge symbol={CAT_ICONS[clause.category] || "📄"} title={clause.category} />

        <div className="flex-1 min-w-0">
          {/* badges row */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span
              className={`
                text-[11px] font-semibold px-3 py-1 rounded-full uppercase tracking-wide
                ${s.badge} shadow-sm ring-1 ring-black/20
              `}
            >
              {clause.riskLevel}
            </span>

            <span className="text-[11px] font-medium px-3 py-1 rounded-full bg-slate-800/50 text-slate-300 ring-1 ring-slate-900/40">
              {clause.category}
            </span>

            {clause.ambiguous && (
              <span className="text-[11px] font-medium px-3 py-1 rounded-full bg-amber-600/10 text-amber-300 ring-1 ring-amber-800/10 flex items-center gap-2">
                <span className="text-xs">⚠</span>
                <span>Ambiguous</span>
              </span>
            )}
          </div>

          {/* original clause — chalkboard quote style */}
          <blockquote className="text-sm text-slate-200 bg-slate-900/30 rounded-md px-3 py-2 mb-3 border-l-2 border-l-slate-700/40 italic">
            {clause.originalText}
          </blockquote>

          {/* reasoning */}
          <p className={`text-sm leading-relaxed mb-3 ${s.text}`}>
            {clause.reasoning}
          </p>

          {/* CTA row */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen(!open)}
              className={`
                text-xs font-semibold px-3 py-1 rounded-md border
                border-slate-700/50 text-slate-200 bg-transparent
                hover:bg-slate-800/40 transition
                flex items-center gap-2
              `}
              aria-expanded={open}
            >
              <span className="text-[10px]">{open ? "▲" : "▼"}</span>
              <span>{open ? "Hide suggestion" : "View suggested fix"}</span>
            </button>

            <button
              onClick={() => {
                // placeholder for "apply suggestion" or copy
                navigator.clipboard?.writeText(clause.suggestedWording || "")?.then(() => {
                  /* noop: keep UI quick and silent */
                });
              }}
              className="text-xs px-3 py-1 rounded-md bg-slate-800/40 text-slate-200 border border-slate-700/60 hover:bg-slate-800/60 transition"
              title="Copy suggested wording"
            >
              ✂ Copy
            </button>

            <div className="ml-auto text-[11px] text-slate-500">
              {/* optionally show small metadata */}
              {clause.length ? `${clause.length} chars` : null}
            </div>
          </div>

          {/* suggested wording — expandable */}
          {open && (
            <div
              className="mt-3 p-3 rounded-md border border-dashed border-slate-700/40
                         bg-slate-800/40 text-slate-200"
            >
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                ✏ Suggested Wording
              </p>
              <p className="text-sm leading-relaxed">{clause.suggestedWording}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClauseCard;