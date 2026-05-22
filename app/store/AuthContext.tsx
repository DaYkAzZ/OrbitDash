"use client";

/**
 * AuthContext – gestion des rôles admin/user.
 * Simule une authentification locale avec persistance sessionStorage.
 *
 * Rôles :
 *  - admin  → accès /admin + drag & drop avancé
 *  - user   → lecture seule côté admin
 */

import React, { createContext, useContext, useEffect, useState } from "react";

export type UserRole = "admin" | "user";

export interface AppUser {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  avatarInitials: string;
}

interface AuthContextValue {
  user: AppUser | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginAsGuest: () => void;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const DEMO_ACCOUNTS: Record<string, AppUser & { password: string }> = {
  "admin@orbitdash.dev": {
    id: "admin-001",
    email: "admin@orbitdash.dev",
    displayName: "Admin",
    role: "admin",
    avatarInitials: "AD",
    password: "admin123",
  },
  "user@orbitdash.dev": {
    id: "user-001",
    email: "user@orbitdash.dev",
    displayName: "Utilisateur",
    role: "user",
    avatarInitials: "US",
    password: "user123",
  },
};

const GUEST: AppUser = {
  id: "guest",
  email: "",
  displayName: "Invité",
  role: "user",
  avatarInitials: "IN",
};

const SESSION_KEY = "orbitdash-session";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Recharge la session depuis sessionStorage au montage
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      if (saved) setUser(JSON.parse(saved));
    } catch {}
    setHydrated(true);
  }, []);

  const persist = (u: AppUser | null) => {
    try {
      if (u) sessionStorage.setItem(SESSION_KEY, JSON.stringify(u));
      else sessionStorage.removeItem(SESSION_KEY);
    } catch {}
  };

  const login = async (email: string, password: string) => {
    setError(null);
    await new Promise((r) => setTimeout(r, 400));
    const account = DEMO_ACCOUNTS[email.toLowerCase()];
    if (!account || account.password !== password) {
      setError("Email ou mot de passe incorrect");
      throw new Error("Identifiants invalides");
    }
    const { password: _, ...u } = account;
    setUser(u);
    persist(u);
  };

  const loginAsGuest = () => {
    setError(null);
    setUser(GUEST);
    persist(GUEST);
  };

  const logout = () => {
    setUser(null);
    persist(null);
  };

  // Empêche un flash du contenu avant hydration
  if (!hydrated) return null;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin: user?.role === "admin",
        isAuthenticated: user !== null,
        login,
        loginAsGuest,
        logout,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside <AuthProvider>");
  return ctx;
}
