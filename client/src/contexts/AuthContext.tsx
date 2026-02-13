import { createContext, useContext, useState, ReactNode } from "react";

interface AuthState {
  isLoggedIn: boolean;
  username: string | null;
  serviceTokens: Record<string, string>; // serviceId -> token
}

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  setServiceToken: (serviceId: string, token: string) => void;
  hasServiceToken: (serviceId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({
    isLoggedIn: false,
    username: null,
    serviceTokens: {},
  });

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        setAuth((prev) => ({ ...prev, isLoggedIn: true, username }));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const logout = () => {
    setAuth({ isLoggedIn: false, username: null, serviceTokens: {} });
  };

  const setServiceToken = (serviceId: string, token: string) => {
    setAuth((prev) => ({
      ...prev,
      serviceTokens: { ...prev.serviceTokens, [serviceId]: token },
    }));
  };

  const hasServiceToken = (serviceId: string) => {
    return !!auth.serviceTokens[serviceId];
  };

  return (
    <AuthContext.Provider value={{ ...auth, login, logout, setServiceToken, hasServiceToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}