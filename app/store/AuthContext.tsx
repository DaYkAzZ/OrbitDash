"use client";

/**
 * AuthContext – gestion des rôles admin/user.
 * Simule une authentification locale (pas de Supabase requis pour la démo).
 * En production : remplacer par Supabase Auth.
 *
 * Rôles :
 *  - admin  → accès admin + drag & drop
 *  - user   → lecture seule, pas de drag & drop
 */

import React, { createContext, useContext, useState } from "react";

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

// Comptes de démo – en production, remplacer par Supabase Auth
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    setError(null);
    await new Promise((r) => setTimeout(r, 400)); // simule latence réseau
    const account = DEMO_ACCOUNTS[email.toLowerCase()];
    if (!account || account.password !== password) {
      setError("Email ou mot de passe incorrect");
      throw new Error("Identifiants invalides");
    }
    const { password: _, ...userWithoutPassword } = account;
    setUser(userWithoutPassword);
  };

  const loginAsGuest = () => {
    setError(null);
    setUser(GUEST);
  };

  const logout = () => setUser(null);

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
