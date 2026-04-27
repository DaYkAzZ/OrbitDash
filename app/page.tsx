"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar, WidgetGrid, FocusZone, FullscreenOverlay } from "./components";
import { useWidgetStore, useAuth } from "./store";

export default function DashboardPage() {
  const { loadWidgets, initRealtime, stopRealtime, isLoading, error, widgets } = useWidgetStore();
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
      return;
    }

    if (!user) return;

    loadWidgets();
    initRealtime();
    return () => stopRealtime();
  }, [authLoading, user, router, loadWidgets, initRealtime, stopRealtime]);

  if (authLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <span className="animate-pulse text-sm text-zinc-500">Connexion…</span>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Navbar />

      <main className="flex flex-1 overflow-hidden">
        {/* Grille des widgets – scroll vertical si débordement */}
        <section className="flex-1 overflow-y-auto">
          {isLoading && (
            <div className="flex h-full items-center justify-center">
              <span className="text-zinc-500 text-sm animate-pulse">
                Chargement des widgets…
              </span>
            </div>
          )}

          {error && (
            <div className="m-4 rounded-xl border border-red-700/50 bg-red-900/20 p-4 text-sm text-red-400">
              Erreur : {error}
            </div>
          )}

          {!isLoading && !error && widgets.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center p-8">
              <span className="text-4xl">🛰️</span>
              <p className="text-zinc-400 text-sm">
                Aucun widget configuré. Rendez-vous dans{" "}
                <a href="/admin" className="text-indigo-400 hover:underline">
                  l&apos;admin
                </a>{" "}
                pour en ajouter.
              </p>
            </div>
          )}

          {!isLoading && widgets.length > 0 && <WidgetGrid />}
        </section>

        {/* Zone centrale de focus */}
        <aside className="hidden w-80 shrink-0 overflow-y-auto border-l border-zinc-800 p-3 lg:block xl:w-96">
          <FocusZone />
        </aside>
      </main>

      {/* Overlay plein écran */}
      <FullscreenOverlay />
    </div>
  );
}
