"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { authApi, setAccessToken, clearAccessToken } from "./api";

type User = {
  id: string;
  name: string;
  email: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check auth status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      // Try to get current user (will auto-refresh if token expired)
      const response = await authApi.me();
      if (response.success && response.data.user) {
        setUser(response.data.user);
      }
    } catch (error) {
      // Not authenticated or session expired
      setUser(null);
      clearAccessToken();
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, password: string) {
    const response = await authApi.login(email, password);
    if (response.success && response.data.user) {
      setUser(response.data.user);
    }
  }

  async function register(name: string, email: string, password: string) {
    const response = await authApi.register(name, email, password);
    if (response.success && response.data.user) {
      setUser(response.data.user);
    }
  }

  async function logout() {
    await authApi.logout();
    setUser(null);
    clearAccessToken();
  }

  async function refreshAuth() {
    await checkAuth();
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
