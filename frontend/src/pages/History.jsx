import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchHistory, deleteAnalysis } from "../services/api";

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory()
      .then(setHistory)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    setDeleting(id);
    await deleteAnalysis(id).catch(console.error);
    setHistory((prev) => prev.filter((r) => r.id !== id));
    setDeleting(null);
  };

  if (loading) {
    return (
      <div
        className="flex-1 flex items-center justify-center min-h-screen"
        style={{
          background:
            "radial-gradient(1200px 600px at 10% 10%, rgba(148,163,184,0.04), transparent 10%), linear-gradient(135deg,#020617 0%,#0f172a 50%,#020617 100%)",
        }}
      >
        <div className="text-slate-400 animate-pulse text-sm">
          Loading history…
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex-1 overflow-auto min-h-screen p-6"
      style={{
        background:
          "radial-gradient(1200px 600px at 10% 10%, rgba(148,163,184,0.04), transparent 10%), linear-gradient(135deg,#020617 0%,#0f172a 50%,#020617 100%)",
      }}
    >
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">
          Analysis History
        </h1>

        {history.length === 0 ? (
          <div
            className="text-center py-20 rounded-2xl border border-slate-700"
            style={{
              background: "rgba(15,23,42,0.7)",
              boxShadow: "0 10px 40px rgba(2,6,23,0.8)",
            }}
          >
            <div className="text-5xl mb-4">🕐</div>
            <div className="text-white font-semibold mb-2">
              No history yet
            </div>
            <p className="text-slate-500 text-sm">
              Analyzed documents will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((rec) => (
              <div
                key={rec.id}
                onClick={() =>
                  navigate("/results", { state: { results: rec } })
                }
                className="rounded-xl p-4 flex items-center gap-4 cursor-pointer
                           border border-slate-700 transition-all group"
                style={{
                  background: "rgba(15,23,42,0.75)",
                  boxShadow: "0 6px 24px rgba(2,6,23,0.6)",
                }}
              >
                {/* Doc icon */}
                <div
                  className="w-11 h-11 rounded-lg flex-shrink-0 flex
                             items-center justify-center text-xl"
                  style={{
                    background: rec.riskColor + "22",
                    border: "1px solid #334155",
                  }}
                >
                  📄
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="text-white font-semibold text-sm truncate">
                    {rec.docName}
                  </div>

                  <div className="text-slate-400 text-xs mt-0.5">
                    {new Date(rec.timestamp).toLocaleString()} ·{" "}
                    {rec.clauses?.length || 0} flags
                  </div>
                </div>

                {/* Risk score */}
                <div className="text-center flex-shrink-0">
                  <div
                    className="text-xl font-black"
                    style={{ color: rec.riskColor }}
                  >
                    {rec.riskScore}
                  </div>

                  <div
                    className="text-[10px] font-bold"
                    style={{ color: rec.riskColor }}
                  >
                    {rec.riskLabel}
                  </div>
                </div>

                {/* Delete button */}
                <button
                  onClick={(e) => handleDelete(rec.id, e)}
                  disabled={deleting === rec.id}
                  className="opacity-0 group-hover:opacity-100
                             text-slate-600 hover:text-red-400
                             text-lg transition-all
                             disabled:animate-pulse"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;