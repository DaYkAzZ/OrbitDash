'use client';

/**
 * ThemeContext – gère le mode clair/sombre et la densité d'affichage.
 * Persiste le choix dans localStorage.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Theme, ThemeMode, ThemeDensity } from '../types';

interface ThemeContextValue extends Theme {
  setMode: (mode: ThemeMode) => void;
  setDensity: (density: ThemeDensity) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('dark');
  const [density, setDensityState] = useState<ThemeDensity>('spaced');

  // Lit le localStorage au montage
  useEffect(() => {
    const saved = localStorage.getItem('orbitdash-theme');
    if (saved) {
      const parsed = JSON.parse(saved) as Theme;
      setModeState(parsed.mode);
      setDensityState(parsed.density);
    }
  }, []);

  // Applique les classes sur <html>
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', mode === 'dark');
    root.dataset.density = density;
    localStorage.setItem('orbitdash-theme', JSON.stringify({ mode, density }));
  }, [mode, density]);

  const setMode = (m: ThemeMode) => setModeState(m);
  const setDensity = (d: ThemeDensity) => setDensityState(d);
  const toggleMode = () => setModeState((m) => (m === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeContext.Provider value={{ mode, density, setMode, setDensity, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}
