'use client';

/**
 * AuthContext – gestion simplifiée de l'utilisateur courant.
 * Remplace par Supabase Auth si besoin.
 */

import React, { createContext, useContext, useState } from 'react';
import type { AppUser } from '../types';

interface AuthContextValue {
  user: AppUser | null;
  isAdmin: boolean;
  login: (user: AppUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Utilisateur de démo – remplace par Supabase Auth
const DEMO_ADMIN: AppUser = {
  id: 'demo-admin',
  email: 'admin@orbitdash.dev',
  role: 'admin',
  displayName: 'Admin',
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Par défaut on est connecté en tant qu'admin pour le dev
  const [user, setUser] = useState<AppUser | null>(DEMO_ADMIN);

  const login = (u: AppUser) => setUser(u);
  const logout = () => setUser(null);
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
