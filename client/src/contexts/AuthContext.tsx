import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface AuthContextType {
  isLoggedIn: boolean;
  username: string | null;
  token: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  setToken: (token: string | null) => void;
  authHeaders: () => Record<string, string>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(
    () => localStorage.getItem("isLoggedIn") === "true"
  );
  const [username, setUsername] = useState<string | null>(
    () => localStorage.getItem("username")
  );
  const [token, setTokenState] = useState<string | null>(
    () => localStorage.getItem("api_token")
  );

  const setToken = useCallback((newToken: string | null) => {
    if (newToken) {
      localStorage.setItem("api_token", newToken);
    } else {
      localStorage.removeItem("api_token");
    }
    setTokenState(newToken);
  }, []);

  const login = async (usr: string, pwd: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: usr, password: pwd }),
      });
      if (res.ok) {
        setIsLoggedIn(true);
        setUsername(usr);
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("username", usr);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setUsername(null);
    setTokenState(null);
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("username");
    localStorage.removeItem("api_token");
  }, []);

  const authHeaders = useCallback((): Record<string, string> => {
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
    return {};
  }, [token]);

  return (
    <AuthContext.Provider value={{ isLoggedIn, username, token, login, logout, setToken, authHeaders }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}