import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { useThemeContext } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/",          icon: "🔍", label: "Analyze"   },
  { to: "/results",   icon: "📊", label: "Results"   },
  { to: "/history",   icon: "🕐", label: "History"   },
  { to: "/dashboard", icon: "📈", label: "Dashboard" },
  { to: "/compare",   icon: "⚖️", label: "Compare"   },
];

export default function Sidebar() {
  const { isDark, toggle } = useThemeContext();
  const { signOut } = useAuth();

  const [isOpen,   setIsOpen]   = useState(true);
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

  const c = {
    bg:          isDark ? "#020617"              : "#ffffff",
    border:      isDark ? "#1e293b"              : "#e2e8f0",
    text:        isDark ? "#e2e8f0"              : "#0f172a",
    muted:       isDark ? "#64748b"              : "#475569",
    hamburgerBg: isDark ? "rgba(2,6,23,0.75)"   : "rgba(255,255,255,0.85)",
    signOutBg:   isDark ? "rgba(239,68,68,0.08)": "rgba(239,68,68,0.06)",
    toggleBg:    isDark ? "#1e293b"              : "#f8fafc",
  };

  // Sidebar width: fixed on mobile, fluid on desktop
  const sidebarWidth = isMobile ? "240px" : "clamp(180px, 18vw, 220px)";

  return (
    <>
      {/* ── Hamburger ── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close menu" : "Open menu"}
        style={{
          position:             "fixed",
          top:                  "clamp(8px, 2vw, 12px)",
          left:                 "clamp(8px, 2vw, 12px)",
          zIndex:               1200,
          border:               `1px solid ${c.border}88`,
          background:           c.hamburgerBg,
          backdropFilter:       "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          borderRadius:         "10px",
          padding:              "clamp(5px, 1.5vw, 7px) clamp(7px, 1.5vw, 9px)",
          fontSize:             "clamp(14px, 3vw, 16px)",
          cursor:               "pointer",
          boxShadow:            "0 4px 16px rgba(0,0,0,0.12)",
          transition:           "all 0.2s ease",
          lineHeight:           1,
          color:                c.text,
        }}
      >
        {isOpen ? "✕" : "☰"}
      </button>

      {/* ── Mobile overlay ── */}
      {isMobile && isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position:       "fixed",
            inset:          0,
            background:     "rgba(0,0,0,0.4)",
            zIndex:         900,
            backdropFilter: "blur(2px)",
          }}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        style={{
          width:          sidebarWidth,
          height:         "100vh",
          background:     c.bg,
          borderRight:    `1px solid ${c.border}`,
          display:        "flex",
          flexDirection:  "column",
          padding:        `clamp(16px, 3vw, 26px) clamp(8px, 1.5vw, 12px)`,
          position:       "fixed",
          top:            0,
          left:           0,
          zIndex:         1000,
          transform:      isMobile && !isOpen ? "translateX(-100%)" : "translateX(0)",
          transition:     "transform 0.28s cubic-bezier(0.4,0,0.2,1), background 0.3s, border-color 0.3s",
          boxSizing:      "border-box",
          overflowY:      "auto",
          overflowX:      "hidden",
        }}
      >
        {/* Spacer for hamburger */}
        <div style={{ height: "clamp(36px, 6vw, 48px)", flexShrink: 0 }} />

        {/* ── Logo ── */}
        <div style={{
          display:      "flex",
          alignItems:   "center",
          gap:          "clamp(8px, 1.5vw, 10px)",
          padding:      "0 8px",
          marginBottom: "clamp(20px, 4vw, 32px)",
          flexShrink:   0,
        }}>
          <div style={{
            width:          "clamp(28px, 4vw, 34px)",
            height:         "clamp(28px, 4vw, 34px)",
            borderRadius:   "10px",
            background:     "linear-gradient(135deg,#334155,#475569)",
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            fontSize:       "clamp(13px, 2vw, 16px)",
            color:          "#fff",
            flexShrink:     0,
          }}>
            ⚖️
          </div>

          <div style={{ minWidth: 0 }}>
            <div style={{
              fontWeight:   800,
              fontSize:     "clamp(12px, 2vw, 14px)",
              color:        c.text,
              whiteSpace:   "nowrap",
              overflow:     "hidden",
              textOverflow: "ellipsis",
              transition:   "color 0.3s",
            }}>
              ClauseGuard
            </div>
            <div style={{
              fontSize:      "clamp(9px, 1.2vw, 10px)",
              color:         c.muted,
              letterSpacing: "0.06em",
              transition:    "color 0.3s",
            }}>
              RISK ANALYZER
            </div>
          </div>
        </div>

        {/* ── Nav links ── */}
        <nav style={{
          display:       "flex",
          flexDirection: "column",
          gap:           "clamp(3px, 0.8vw, 6px)",
          flex:          1,
        }}>
          {links.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={() => isMobile && setIsOpen(false)}
              style={({ isActive }) => ({
                display:        "flex",
                alignItems:     "center",
                gap:            "clamp(8px, 1.5vw, 12px)",
                padding:        `clamp(9px, 1.5vw, 11px) clamp(10px, 1.5vw, 12px)`,
                borderRadius:   "10px",
                fontSize:       "clamp(12px, 1.5vw, 13px)",
                fontWeight:     600,
                textDecoration: "none",
                background:     isActive
                  ? "linear-gradient(135deg,#334155,#475569)"
                  : "transparent",
                color:          isActive ? "#ffffff" : c.muted,
                transition:     "background 0.15s, color 0.15s",
                whiteSpace:     "nowrap",
              })}
            >
              <span style={{
                fontSize:  "clamp(14px, 2vw, 16px)",
                width:     "clamp(18px, 2.5vw, 22px)",
                textAlign: "center",
                flexShrink: 0,
              }}>
                {icon}
              </span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* ── Sign out ── */}
        <button
          onClick={signOut}
          style={{
            display:      "flex",
            alignItems:   "center",
            gap:          "clamp(8px, 1.5vw, 10px)",
            padding:      `clamp(8px, 1.5vw, 10px) clamp(10px, 1.5vw, 12px)`,
            borderRadius: "10px",
            border:       `1px solid ${c.border}`,
            background:   c.signOutBg,
            color:        "#ef4444",
            fontWeight:   600,
            cursor:       "pointer",
            marginBottom: "8px",
            fontSize:     "clamp(12px, 1.5vw, 13px)",
            whiteSpace:   "nowrap",
            width:        "100%",
            boxSizing:    "border-box",
            transition:   "background 0.2s, border-color 0.3s",
          }}
        >
          🚪 Sign Out
        </button>

        {/* ── Theme toggle ── */}
        <button
          onClick={toggle}
          style={{
            display:      "flex",
            alignItems:   "center",
            gap:          "clamp(8px, 1.5vw, 10px)",
            padding:      `clamp(8px, 1.5vw, 10px) clamp(10px, 1.5vw, 12px)`,
            borderRadius: "10px",
            border:       `1px solid ${c.border}`,
            background:   c.toggleBg,
            color:        c.muted,
            fontWeight:   600,
            cursor:       "pointer",
            fontSize:     "clamp(12px, 1.5vw, 13px)",
            whiteSpace:   "nowrap",
            width:        "100%",
            boxSizing:    "border-box",
            transition:   "background 0.3s, color 0.3s, border-color 0.3s",
          }}
        >
          {isDark ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>

        {/* ── Footer ── */}
        <div style={{
          textAlign:  "center",
          marginTop:  "clamp(10px, 2vw, 14px)",
          fontSize:   "clamp(9px, 1.2vw, 10px)",
          color:      c.muted,
          opacity:    0.7,
          flexShrink: 0,
          transition: "color 0.3s",
        }}>
          Powered by Groq × Llama
        </div>
      </aside>

      {/* ── Desktop layout spacer ── */}
      {!isMobile && (
        <div style={{
          width:      isOpen ? sidebarWidth : "0px",
          flexShrink: 0,
          transition: "width 0.28s cubic-bezier(0.4,0,0.2,1)",
        }} />
      )}
    </>
  );
}