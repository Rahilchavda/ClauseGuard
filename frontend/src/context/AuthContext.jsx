import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token,   setToken]   = useState(() => localStorage.getItem("aToken") || "");
  const [loading, setLoading] = useState(false);

  const setAToken = (t) => {
    setToken(t);
    localStorage.setItem("aToken", t);
  };

  const signOut = () => {
    setToken("");
    localStorage.removeItem("aToken");
  };

  const isLoggedIn = !!token;

  return (
    <AuthContext.Provider value={{ token, setAToken, signOut, isLoggedIn, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);