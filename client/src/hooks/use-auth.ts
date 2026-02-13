import { useState, useEffect } from "react";
import { useLocation } from "wouter";

export function useAuth() {
  const [token, setTokenState] = useState<string | null>(() => localStorage.getItem("api_token"));
  const [, setLocation] = useLocation();

  const setToken = (newToken: string | null) => {
    if (newToken) {
      localStorage.setItem("api_token", newToken);
    } else {
      localStorage.removeItem("api_token");
    }
    setTokenState(newToken);
  };

  const logout = () => {
    setToken(null);
    setLocation("/login");
  };

  // Helper to add auth header
  const authHeaders = () => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  return { token, setToken, logout, authHeaders };
}
