import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar   from "./components/Sidebar";
import Analyze   from "./pages/Analyze";
import Results   from "./pages/Results";
import History   from "./pages/History";
import Dashboard from "./pages/Dashboard";
import Compare   from "./pages/Compare";
import { useThemeContext } from "./context/ThemeContext";

function AppInner() {
  const { isDark } = useThemeContext();
  return (
    <div style={{
      display: "flex", height: "100vh", width: "100vw", overflow: "hidden",
      background: isDark ? "#0f172a" : "#f8fafc",
      transition: "background 0.3s"
    }}>
      <Sidebar />
      <div style={{ flex: 1, overflow: "auto" }}>
        <Routes>
          <Route path="/"          element={<Analyze />}   />
          <Route path="/results"   element={<Results />}   />
          <Route path="/history"   element={<History />}   />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/compare"   element={<Compare />}   />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  );
}