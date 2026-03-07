import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { useThemeContext } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/", icon: "🔍", label: "Analyze" },
  { to: "/results", icon: "📊", label: "Results" },
  { to: "/history", icon: "🕐", label: "History" },
  { to: "/dashboard", icon: "📈", label: "Dashboard" },
  { to: "/compare", icon: "⚖️", label: "Compare" },
];

export default function Sidebar() {
  const { isDark, toggle } = useThemeContext();
  const { signOut } = useAuth();

  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreen = () => {
      const mobile = window.innerWidth < 900;
      setIsMobile(mobile);
      setIsOpen(!mobile);
    };

    checkScreen();
    window.addEventListener("resize", checkScreen);

    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  const colors = {
    bg: isDark ? "#020617" : "#ffffff",
    border: isDark ? "#1e293b" : "#e2e8f0",
    text: isDark ? "#e2e8f0" : "#0f172a",
    muted: isDark ? "#64748b" : "#475569",
    hover: isDark ? "rgba(148,163,184,0.08)" : "#f1f5f9",
  };

  return (
    <>
      {/* Hamburger Button */}
    <button
      onClick={() => setIsOpen(!isOpen)}
      style={{
        position: "fixed",
        top: "5px",
        left: "5px",
        zIndex: 1200,
        border: `1px solid ${colors.border}55`,
        background: isDark
          ? "rgba(2,6,23,0.55)"
          : "rgba(255,255,255,0.55)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        borderRadius: "10px",
        padding: "5px 5px",
        fontSize: "15px",
        cursor: "pointer",
        boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
        transition: "all 0.2s ease"
        }}
    >
      ☰
    </button>


      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            zIndex: 900,
          }}
        />
      )}

      {/* Sidebar */}
      <aside
        style={{
          width: "220px",
          height: "100vh",
          background: colors.bg,
          borderRight: `1px solid ${colors.border}`,
          display: "flex",
          flexDirection: "column",
          padding: "26px 12px",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 1000,
          transform:
            isMobile && !isOpen ? "translateX(-100%)" : "translateX(0)",
          transition: "transform 0.3s ease",
        }}
      >
        {/* Spacer so hamburger doesn't overlap */}
        <div style={{ height: "40px" }} />

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
              }}
            >
              ClauseGuard
            </div>

            <div
              style={{
                fontSize: "10px",
                color: colors.muted,
              }}
            >
              RISK ANALYZER
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
          {links.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={() => isMobile && setIsOpen(false)}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "11px 12px",
                borderRadius: "10px",
                fontSize: "13px",
                fontWeight: 600,
                textDecoration: "none",
                background: isActive
                  ? "linear-gradient(135deg,#334155,#475569)"
                  : "transparent",
                color: isActive ? "#ffffff" : colors.muted,
              })}
            >
              <span style={{ fontSize: "16px", width: "22px" }}>{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Sign out */}
        <button
          onClick={signOut}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "10px 12px",
            borderRadius: "10px",
            border: `1px solid ${colors.border}`,
            background: "rgba(239,68,68,0.06)",
            color: "#ef4444",
            fontWeight: 600,
            cursor: "pointer",
            marginBottom: "8px",
          }}
        >
          🚪 Sign Out
        </button>

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
            background: isDark ? "#1e293b" : "#f8fafc",
            color: colors.muted,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {isDark ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>

        {/* Footer */}
        <div
          style={{
            textAlign: "center",
            marginTop: "14px",
            fontSize: "10px",
            color: colors.muted,
            opacity: 0.7,
          }}
        >
          Powered by Groq × Llama
        </div>
      </aside>
    </>
  );
}