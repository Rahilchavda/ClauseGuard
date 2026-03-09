import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth }             from "./context/AuthContext";
import { ThemeProvider, useThemeContext }    from "./context/ThemeContext";
import Sidebar   from "./components/Sidebar";
import Analyze   from "./pages/Analyze";
import Results   from "./pages/Results";
import History   from "./pages/History";
import Dashboard from "./pages/Dashboard";
import Compare   from "./pages/Compare";
import Login     from "./pages/Login";

// Redirects to /login if not logged in
function ProtectedRoute({ children }) {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? children : <Navigate to="/login" replace />;
}

// Redirects to / if already logged in (prevents visiting /login when authed)
function GuestRoute({ children }) {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? <Navigate to="/" replace /> : children;
}

function AppInner() {
  const { isDark }     = useThemeContext();
  const { isLoggedIn } = useAuth();

  return (
    <div style={{
      display:    "flex",
      height:     "100vh",
      width:      "100vw",
      overflow:   "hidden",
      background: isDark ? "#0f172a" : "#f8fafc",
      transition: "background 0.3s",
    }}>
      {/* Sidebar only when logged in */}
      {isLoggedIn && <Sidebar />}

      <div style={{ flex: 1, overflow: "auto" }}>
        <Routes>

          {/* ── Public route ── */}
          <Route path="/login" element={
            <GuestRoute><Login /></GuestRoute>
          } />

          {/* ── Protected routes ── */}
          <Route path="/" element={
            <ProtectedRoute><Analyze /></ProtectedRoute>
          } />
          <Route path="/results" element={
            <ProtectedRoute><Results /></ProtectedRoute>
          } />
          <Route path="/history" element={
            <ProtectedRoute><History /></ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          <Route path="/compare" element={
            <ProtectedRoute><Compare /></ProtectedRoute>
          } />

          {/* ── Catch-all ── */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <AppInner />
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}