'use client';

/**
 * AuthContext – OAuth via Supabase Auth.
 * Providers supportés : Google, GitHub (configurable dans Supabase Dashboard).
 *
 * Le rôle "admin" est déterminé via la table `profiles` (colonne `role`).
 * Si la table n'existe pas, tous les users connectés sont traités comme "user".
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import type { AppUser } from '../types';

interface AuthContextValue {
  user: AppUser | null;
  session: Session | null;
  isAdmin: boolean;
  isLoading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithGithub: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchUserRole(supabaseUser: User): Promise<'admin' | 'user'> {
  try {
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', supabaseUser.id)
      .single();
    return (data?.role as 'admin' | 'user') ?? 'user';
  } catch {
    return 'user';
  }
}

function toAppUser(supabaseUser: User, role: 'admin' | 'user'): AppUser {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email ?? '',
    role,
    displayName:
      supabaseUser.user_metadata?.full_name ??
      supabaseUser.user_metadata?.name ??
      supabaseUser.email?.split('@')[0] ??
      'Utilisateur',
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const hydrateUser = async (supabaseUser: User | null) => {
    if (!supabaseUser) {
      setUser(null);
      return;
    }
    const role = await fetchUserRole(supabaseUser);
    setUser(toAppUser(supabaseUser, role));
  };

  useEffect(() => {
    // Récupère la session existante au chargement
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      hydrateUser(session?.user ?? null).finally(() => setIsLoading(false));
    });

    // Écoute les changements d'état auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      hydrateUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/` },
    });
  };

  const loginWithGithub = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: `${window.location.origin}/` },
    });
  };

  const loginWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{ user, session, isAdmin, isLoading, loginWithGoogle, loginWithGithub, loginWithEmail, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
