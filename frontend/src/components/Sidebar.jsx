import { NavLink } from "react-router-dom";
import { useThemeContext } from "../context/ThemeContext";

const links = [
  { to: "/", icon: "🔍", label: "Analyze" },
  { to: "/results", icon: "📊", label: "Results" },
  { to: "/history", icon: "🕐", label: "History" },
  { to: "/dashboard", icon: "📈", label: "Dashboard" },
  { to: "/compare", icon: "⚖️", label: "Compare" },
];

export default function Sidebar() {
  const { isDark, toggle } = useThemeContext();

  const colors = {
    bg: isDark ? "#020617" : "#ffffff",
    border: isDark ? "#1e293b" : "#e2e8f0",
    text: isDark ? "#e2e8f0" : "#0f172a",
    muted: isDark ? "#64748b" : "#475569",
    hover: isDark ? "rgba(148,163,184,0.08)" : "#f1f5f9",
  };

  return (
    <aside
      style={{
        width: "220px",
        height: "100vh",
        flexShrink: 0,
        background: colors.bg,
        borderRight: `1px solid ${colors.border}`,
        display: "flex",
        flexDirection: "column",
        padding: "22px 12px",
        transition: "all 0.3s",
      }}
    >
      {/* Logo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "0 8px",
          marginBottom: "32px",
        }}
      >
        <div
          style={{
            width: "34px",
            height: "34px",
            borderRadius: "10px",
            background: "linear-gradient(135deg,#334155,#475569)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "16px",
            color: "#fff",
            boxShadow: "0 6px 16px rgba(2,6,23,0.5)",
          }}
        >
          ⚖️
        </div>

        <div>
          <div
            style={{
              fontWeight: 800,
              fontSize: "14px",
              color: colors.text,
              letterSpacing: "0.02em",
            }}
          >
            ClauseGuard
          </div>

          <div
            style={{
              fontSize: "10px",
              color: colors.muted,
              letterSpacing: "0.08em",
            }}
          >
            RISK ANALYZER
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          flex: 1,
        }}
      >
        {links.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            style={({ isActive }) => ({
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 12px",
              borderRadius: "10px",
              fontSize: "13px",
              fontWeight: 600,
              textDecoration: "none",
              transition: "all 0.15s",
              background: isActive
                ? "linear-gradient(135deg,#334155,#475569)"
                : "transparent",
              color: isActive ? "#ffffff" : colors.muted,
              border: isActive
                ? "1px solid rgba(255,255,255,0.05)"
                : "1px solid transparent",
            })}
            onMouseEnter={(e) => {
              if (!e.currentTarget.style.background.includes("gradient"))
                e.currentTarget.style.background = colors.hover;
            }}
            onMouseLeave={(e) => {
              if (!e.currentTarget.style.background.includes("gradient"))
                e.currentTarget.style.background = "transparent";
            }}
          >
            <span
              style={{
                fontSize: "16px",
                width: "22px",
                display: "flex",
                justifyContent: "center",
              }}
            >
              {icon}
            </span>

            {label}
          </NavLink>
        ))}
      </nav>

      {/* Theme toggle */}
      <button
        onClick={toggle}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "10px 12px",
          borderRadius: "10px",
          border: `1px solid ${colors.border}`,
          background: isDark
            ? "rgba(148,163,184,0.06)"
            : "#f8fafc",
          color: colors.muted,
          fontSize: "13px",
          fontWeight: 600,
          cursor: "pointer",
          transition: "all 0.2s",
          width: "100%",
        }}
      >
        <span style={{ fontSize: "16px" }}>
          {isDark ? "☀️" : "🌙"}
        </span>

        {isDark ? "Light Mode" : "Dark Mode"}
      </button>

      {/* Footer */}
      <div
        style={{
          textAlign: "center",
          marginTop: "14px",
          fontSize: "10px",
          color: colors.muted,
          opacity: 0.7,
          letterSpacing: "0.05em",
        }}
      >
        Powered by Groq × Llama
      </div>
    </aside>
  );
}