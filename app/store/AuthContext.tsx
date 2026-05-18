"use client";

/**
 * AuthContext – Stub pour version sans authentification
 * En production, implémenter avec Supabase ou un autre service d'auth
 */

import React, { createContext, useContext } from "react";

interface AuthContextValue {
  user: null;
  isAdmin: false;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthContext.Provider
      value={{ user: null, isAdmin: false, logout: async () => {} }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
