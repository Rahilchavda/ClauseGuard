import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchDashboardStats } from "../services/api";
import { useThemeContext } from "../context/ThemeContext";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const { isDark } = useThemeContext();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const card = {
    background: isDark ? "rgba(15,23,42,0.85)" : "#ffffff",
    border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
    borderRadius: "16px",
    padding: "20px",
    boxShadow: isDark
      ? "0 10px 40px rgba(2,6,23,0.7)"
      : "0 2px 12px rgba(0,0,0,0.06)"
  };

  const statCard = (icon, label, value, color) => (
    <div
      style={{
        ...card,
        textAlign: "center",
        padding: "24px 18px"
      }}
    >
      <div style={{ fontSize: "30px", marginBottom: "10px" }}>{icon}</div>

      <div
        style={{
          fontSize: "32px",
          fontWeight: 800,
          color,
          marginBottom: "4px"
        }}
      >
        {value}
      </div>

      <div
        style={{
          fontSize: "12px",
          color: "#64748b",
          fontWeight: 600,
          letterSpacing: "0.03em"
        }}
      >
        {label}
      </div>
    </div>
  );

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          background: isDark
            ? "radial-gradient(circle at 20% 20%, #1e293b, #020617)"
            : "#f8fafc"
        }}
      >
        <div style={{ color: "#6366f1", fontSize: "14px" }}>
          Loading dashboard…
        </div>
      </div>
    );

  if (!stats || stats.totalDocs === 0)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          flexDirection: "column",
          gap: "16px",
          background: isDark
            ? "radial-gradient(circle at 20% 20%, #1e293b, #020617)"
            : "#f8fafc"
        }}
      >
        <div style={{ fontSize: "48px" }}>📈</div>

        <div
          style={{
            fontWeight: 700,
            fontSize: "18px",
            color: isDark ? "#f8fafc" : "#0f172a"
          }}
        >
          No data yet
        </div>

        <p style={{ color: "#64748b" }}>
          Analyze some documents to see stats here.
        </p>

        <button
          onClick={() => navigate("/")}
          style={{
            padding: "10px 24px",
            borderRadius: "10px",
            border: "1px solid #334155",
            background: "linear-gradient(135deg,#334155,#475569)",
            color: "#fff",
            fontWeight: 700,
            cursor: "pointer"
          }}
        >
          Analyze Now →
        </button>
      </div>
    );

  const maxCat = Math.max(...Object.values(stats.categoryBreakdown));

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "24px",
        background: isDark
          ? "radial-gradient(circle at 20% 20%, #1e293b, #020617)"
          : "#f8fafc"
      }}
    >
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        {/* Title */}
        <h1
          style={{
            fontWeight: 800,
            fontSize: "24px",
            marginBottom: "24px",
            color: isDark ? "#f8fafc" : "#0f172a"
          }}
        >
          📈 Analytics Dashboard
        </h1>

        {/* Stat cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))",
            gap: "12px",
            marginBottom: "20px"
          }}
        >
          {statCard("📄", "Documents Analyzed", stats.totalDocs, "#6366f1")}
          {statCard("🚩", "Total Clauses Found", stats.totalClauses, "#f59e0b")}
          {statCard("📊", "Average Risk Score", stats.avgRiskScore, "#ef4444")}
          {statCard(
            "🔴",
            "High Risk Clauses",
            stats.riskDistribution.High,
            "#dc2626"
          )}
        </div>

        {/* Risk distribution */}
        <div style={{ ...card, marginBottom: "16px" }}>
          <h2
            style={{
              fontWeight: 700,
              fontSize: "15px",
              marginBottom: "16px",
              color: isDark ? "#f8fafc" : "#0f172a"
            }}
          >
            Risk Distribution
          </h2>

          {[
            ["High", stats.riskDistribution.High, "#ef4444"],
            ["Medium", stats.riskDistribution.Medium, "#f59e0b"],
            ["Low", stats.riskDistribution.Low, "#22c55e"]
          ].map(([label, count, color]) => {
            const total = stats.totalClauses || 1;
            const pct = Math.round((count / total) * 100);

            return (
              <div key={label} style={{ marginBottom: "14px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "6px"
                  }}
                >
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: isDark ? "#e2e8f0" : "#374151"
                    }}
                  >
                    {label} Risk
                  </span>

                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color
                    }}
                  >
                    {count} ({pct}%)
                  </span>
                </div>

                <div
                  style={{
                    height: "8px",
                    background: isDark ? "#334155" : "#f1f5f9",
                    borderRadius: "100px",
                    overflow: "hidden"
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${pct}%`,
                      background: color,
                      borderRadius: "100px",
                      transition: "width 0.8s ease"
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Category breakdown */}
        <div style={{ ...card, marginBottom: "16px" }}>
          <h2
            style={{
              fontWeight: 700,
              fontSize: "15px",
              marginBottom: "16px",
              color: isDark ? "#f8fafc" : "#0f172a"
            }}
          >
            Top Risk Categories
          </h2>

          {Object.entries(stats.categoryBreakdown).map(([cat, count]) => (
            <div key={cat} style={{ marginBottom: "12px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "4px"
                }}
              >
                <span
                  style={{
                    fontSize: "13px",
                    color: isDark ? "#e2e8f0" : "#374151"
                  }}
                >
                  {cat}
                </span>

                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#6366f1"
                  }}
                >
                  {count}
                </span>
              </div>

              <div
                style={{
                  height: "6px",
                  background: isDark ? "#334155" : "#f1f5f9",
                  borderRadius: "100px",
                  overflow: "hidden"
                }}
              >
                <div
                  style={{
                    height: "100%",
                    borderRadius: "100px",
                    width: `${Math.round((count / maxCat) * 100)}%`,
                    background: "linear-gradient(90deg,#6366f1,#8b5cf6)",
                    transition: "width 0.8s ease"
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Recent analyses */}
        <div style={card}>
          <h2
            style={{
              fontWeight: 700,
              fontSize: "15px",
              marginBottom: "16px",
              color: isDark ? "#f8fafc" : "#0f172a"
            }}
          >
            Recent Analyses
          </h2>

          {stats.recentDocs.map((doc) => (
            <div
              key={doc.id}
              onClick={() =>
                navigate("/results", { state: { results: doc } })
              }
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px",
                borderRadius: "10px",
                cursor: "pointer",
                marginBottom: "8px",
                background: isDark
                  ? "rgba(255,255,255,0.04)"
                  : "#f8fafc",
                border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`
              }}
            >
              <span style={{ fontSize: "20px" }}>📄</span>

              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: "13px",
                    color: isDark ? "#f8fafc" : "#0f172a"
                  }}
                >
                  {doc.docName}
                </div>

                <div style={{ fontSize: "11px", color: "#64748b" }}>
                  {new Date(doc.timestamp).toLocaleDateString()} ·{" "}
                  {doc.clauses?.length || 0} clauses
                </div>
              </div>

              <div
                style={{
                  fontWeight: 800,
                  fontSize: "18px",
                  color: doc.riskColor
                }}
              >
                {doc.riskScore}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}