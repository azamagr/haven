import { createContext, useCallback, useContext, useEffect, useState } from "react";
import * as authApi from "../api/authApi";

const AuthContext = createContext(null);
const TOKEN_KEY = "haven_token";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("checking"); // checking | authed | guest

  useEffect(() => {
    let cancelled = false;

    async function verify() {
      if (!token) {
        setStatus("guest");
        return;
      }
      try {
        const data = await authApi.fetchMe(token);
        if (cancelled) return;
        setUser(data.user);
        setStatus("authed");
      } catch {
        if (cancelled) return;
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
        setStatus("guest");
      }
    }

    verify();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const login = useCallback(async (credentials) => {
    const data = await authApi.login(credentials);
    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setUser(data.user);
    setStatus("authed");
  }, []);

  const signup = useCallback(async (details) => {
    const data = await authApi.signup(details);
    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setUser(data.user);
    setStatus("authed");
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    setStatus("guest");
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, status, login, signup, logout, isHost: user?.role === "host" }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside an AuthProvider");
  return ctx;
}
