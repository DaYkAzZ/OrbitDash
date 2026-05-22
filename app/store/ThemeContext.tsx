"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type ThemeMode = "light" | "dark";
export type ThemeDensity = "compact" | "spaced";

export interface Theme {
  mode: ThemeMode;
  density: ThemeDensity;
}

interface ThemeContextValue extends Theme {
  toggleMode: () => void;
  setMode: (m: ThemeMode) => void;
  setDensity: (d: ThemeDensity) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("light");
  const [density, setDensityState] = useState<ThemeDensity>("spaced");

  // Charge depuis localStorage côté client uniquement
  useEffect(() => {
    try {
      const saved = localStorage.getItem("orbitdash-theme");
      if (saved) {
        const { mode: m, density: d } = JSON.parse(saved);
        if (m) setModeState(m);
        if (d) setDensityState(d);
      }
    } catch {}
  }, []);

  // Applique les classes CSS
  useEffect(() => {
    const root = document.documentElement;
    if (mode === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    root.dataset.density = density;
    try {
      localStorage.setItem("orbitdash-theme", JSON.stringify({ mode, density }));
    } catch {}
  }, [mode, density]);

  return (
    <ThemeContext.Provider
      value={{
        mode, density,
        toggleMode: () => setModeState((m) => (m === "light" ? "dark" : "light")),
        setMode: setModeState,
        setDensity: setDensityState,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be inside <ThemeProvider>");
  return ctx;
}
