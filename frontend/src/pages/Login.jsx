import { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const BACKEND = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:8000";

export default function Login() {
  const [role,         setRole]         = useState("Admin");
  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember,     setRemember]     = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState("");

  const { setAToken } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please enter email & password");
      toast.error("Please enter email & password");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email");
      toast.error("Please enter a valid email");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const { data } = await axios.post(`${BACKEND}/api/admin/login`, {
        email,
        password,
        role,
      });

      if (data?.success) {
        setAToken(data.token);
        toast.success("Login successful!");
        navigate("/");
      } else {
        toast.error(data?.message || "Login failed. Please try again.");
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (err.request ? "Network error. Please check your connection." : "Unexpected error.");
      toast.error(msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-slate-100 relative overflow-hidden">
      {/* Background glow */}
      <div
        aria-hidden
        className="absolute -z-10 inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(600px 400px at 10% 10%, rgba(99,102,241,0.12), transparent), radial-gradient(500px 350px at 90% 85%, rgba(16,185,129,0.08), transparent)",
          filter: "blur(40px)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md p-6 md:p-10 rounded-2xl bg-gradient-to-br from-white/3 via-white/2 to-black/10 backdrop-blur border border-white/6 shadow-2xl"
      >
        {/* Header */}
        <header className="mb-6">
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "10px",
            marginBottom: "12px",
          }}>
            <div style={{
              width: "36px", height: "36px", borderRadius: "10px",
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "18px",
            }}>
              ⚖️
            </div>
            <span style={{ fontWeight: 800, fontSize: "18px", color: "#f1f5f9" }}>
              ClauseGuard
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            {role} Login
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Access your Dashboard
          </p>
        </header>

        {/* Role toggle */}
        <div className="mb-6">
          <div className="relative inline-flex p-1 rounded-full bg-white/3 border border-white/6">
            <div
              className="absolute top-1/2 transform -translate-y-1/2 transition-all duration-300 ease-in-out rounded-full bg-gradient-to-r from-indigo-500 to-teal-400 shadow-md h-8 w-20"
              style={{ left: role === "Admin" ? "4px" : "calc(100% - 4px - 5rem)" }}
              aria-hidden
            />
            {["Admin", "Owner"].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className="relative z-10 px-4 py-1 text-sm font-medium rounded-full"
                aria-pressed={role === r}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Email */}
          <label className="relative block">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="peer w-full bg-transparent border border-white/6 rounded-lg px-4 pt-5 pb-2 placeholder-transparent focus:shadow-[0_8px_30px_rgba(99,102,241,0.08)] focus:border-indigo-400 outline-none transition-all"
              placeholder="you@company.com"
            />
            <span className="absolute left-4 top-1 text-xs text-slate-400 peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-focus:top-1 peer-focus:text-xs peer-focus:text-indigo-300 transition-all">
              Email address
            </span>
          </label>

          {/* Password */}
          <label className="relative block">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="peer w-full bg-transparent border border-white/6 rounded-lg px-4 pt-5 pb-2 pr-12 placeholder-transparent focus:shadow-[0_8px_30px_rgba(16,185,129,0.06)] focus:border-emerald-300 outline-none transition-all"
              placeholder="Your password"
            />
            <span className="absolute left-4 top-1 text-xs text-slate-400 peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-focus:top-1 peer-focus:text-xs peer-focus:text-emerald-300 transition-all">
              Password
            </span>
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-2 top-2 h-9 w-9 grid place-items-center rounded-lg hover:scale-105 active:scale-95 transition-transform"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {showPassword ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10a9.962 9.962 0 013.175-6.975M6.88 6.88A10.026 10.026 0 0112 5c5.523 0 10 4.477 10 10 0 1.2-.188 2.357-.54 3.44M3 3l18 18" />
                ) : (
                  <>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </>
                )}
              </svg>
            </button>
          </label>

          {/* Remember + Forgot */}
          <div className="flex items-center justify-between text-sm text-slate-400">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-white/10 bg-white/3 cursor-pointer"
              />
              <span>Remember me</span>
            </label>
            <a href="#" className="hover:text-indigo-300 transition-colors">
              Forgot password?
            </a>
          </div>

          {/* Error message */}
          {error && (
            <div className="text-sm text-rose-400 px-1">
              ⚠️ {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-1 inline-flex items-center justify-center gap-2 rounded-lg py-3 font-medium text-black bg-gradient-to-r from-indigo-400 to-emerald-300 shadow-lg hover:brightness-105 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading && (
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10"
                  stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z" />
              </svg>
            )}
            <span>{loading ? "Signing in…" : `Sign in as ${role}`}</span>
          </button>

          {/* Divider */}
          <div className="relative text-center text-sm text-slate-500 pt-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/6" />
            </div>
            <span className="relative bg-gray-900 px-3">or continue with</span>
          </div>

          {/* Social buttons (UI only — hook up if needed) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 gap-3"
          >
            <button
              type="button"
              className="flex items-center justify-center gap-2 rounded-lg py-2 border border-white/6 hover:scale-[1.02] active:scale-[0.98] transition-transform"
            >
              <svg className="h-5 w-5" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.5 0 6.2 1.5 8.1 2.8l6-6C34.8 3.1 29.9 1.5 24 1.5 14.6 1.5 6.9 6.6 3 13.6l7 5.4C12.9 14 17.9 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.4c-.5 2.8-2.1 5.2-4.5 6.8l7 5.4c4.1-3.8 6.5-9.3 6.5-16.2z"/>
                <path fill="#FBBC05" d="M10 28.6A14.5 14.5 0 019.5 24c0-1.6.3-3.1.7-4.6L3.2 14C1.2 17.5 0 21.6 0 24s1.2 6.5 3.2 10l6.8-5.4z"/>
                <path fill="#34A853" d="M24 48c6 0 11-2 14.7-5.4l-7-5.4c-2 1.3-4.5 2.1-7.7 2.1-5.9 0-10.9-4-12.7-9.4l-7 5.4C7 43.1 15 48 24 48z"/>
              </svg>
              <span className="text-sm text-slate-200">Google</span>
            </button>

            <button
              type="button"
              className="flex items-center justify-center gap-2 rounded-lg py-2 border border-white/6 hover:scale-[1.02] active:scale-[0.98] transition-transform"
            >
              <svg className="h-5 w-5" viewBox="0 0 23 23">
                <path fill="#F25022" d="M1 1h10v10H1z"/>
                <path fill="#7FBA00" d="M12 1h10v10H12z"/>
                <path fill="#00A4EF" d="M1 12h10v10H1z"/>
                <path fill="#FFB900" d="M12 12h10v10H12z"/>
              </svg>
              <span className="text-sm text-slate-200">Microsoft</span>
            </button>
          </motion.div>
        </form>

        {/* Footer */}
        <footer className="mt-6 text-center text-xs text-slate-500">
          Need access?{" "}
          <button
            onClick={() => toast.info("Contact the ClauseGuard admin team.")}
            className="underline hover:text-indigo-300 transition-colors"
          >
            Contact admin
          </button>
        </footer>
      </motion.div>
    </div>
  );
}