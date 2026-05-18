"use client";

import { useEffect, useState } from "react";
import { useWidgetStore, WIDGET_CATALOG, createDefaultWidget } from "@/app/store/useWidgetStore";
import { CompactWidget } from "./components/widgets/CompactWidget";
import { ExpandedWidgetModal } from "./components/ExpandedWidgetModal";
import { WidgetCatalogModal } from "./components/WidgetCatalogModal";
import type { WidgetConfig, WidgetType } from "./types";

export default function Dashboard() {
  const { widgets, expandedWidgetId, isLoading, loadWidgets, removeWidget, resetWidgets, addWidget } = useWidgetStore();
  const [mounted, setMounted] = useState(false);
  const [showCatalog, setShowCatalog] = useState(false);

  useEffect(() => { setMounted(true); loadWidgets(); }, []);

  if (!mounted || isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center">
            <span className="text-white font-bold text-lg">O</span>
          </div>
          <p className="text-[var(--text-3)] text-sm">Chargement…</p>
        </div>
      </div>
    );
  }

  const leftWidgets   = [...widgets].filter((w) => w.position === "left").sort((a, b) => a.order - b.order);
  const rightWidgets  = [...widgets].filter((w) => w.position === "right").sort((a, b) => a.order - b.order);
  const bottomWidgets = [...widgets].filter((w) => w.position === "bottom").sort((a, b) => a.order - b.order);
  const topWidgets    = [...widgets].filter((w) => w.position === "top").sort((a, b) => a.order - b.order);

  const expandedWidget = expandedWidgetId ? widgets.find((w) => w.id === expandedWidgetId) : null;

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[var(--bg)]">
      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <header className="flex-none h-14 px-5 flex items-center justify-between border-b border-[var(--border)] bg-[var(--bg-card)] shadow-[var(--shadow-xs)]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-sm">O</span>
          </div>
          <span className="font-semibold text-[var(--text-1)] tracking-tight">OrbitDash</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowCatalog(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--accent)] text-white text-xs font-semibold hover:bg-[var(--accent-hover)] transition-colors shadow-sm"
          >
            <span className="text-base leading-none">+</span> Ajouter un widget
          </button>
          <button
            onClick={resetWidgets}
            title="Réinitialiser"
            className="btn-icon ml-1"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
            </svg>
          </button>
        </div>
      </header>

      {/* ── Top bar ────────────────────────────────────────────────────────── */}
      {topWidgets.length > 0 && (
        <div className="flex-none px-4 py-2 flex gap-3 overflow-x-auto border-b border-[var(--border)] bg-[var(--bg-card)]">
          {topWidgets.map((w) => (
            <div key={w.id} className="w-52 flex-none">
              <CompactWidget widget={w} />
            </div>
          ))}
        </div>
      )}

      {/* ── Main layout ────────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden min-h-0">

        {/* Left sidebar */}
        {leftWidgets.length > 0 && (
          <aside className="w-72 flex-none flex flex-col gap-3 p-3 overflow-y-auto border-r border-[var(--border)]">
            {leftWidgets.map((w) => <CompactWidget key={w.id} widget={w} />)}
          </aside>
        )}

        {/* Center – Focus zone */}
        <main className="flex-1 flex flex-col overflow-hidden p-3 min-w-0">
          {expandedWidget ? (
            <div className="flex-1 bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] shadow-[var(--shadow-md)] overflow-hidden anim-scale">
              <ExpandedWidgetModal widget={expandedWidget} inline />
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-5 rounded-2xl border-2 border-dashed border-[var(--border)] bg-[var(--bg-card)]">
              {/* Spot déco */}
              <div className="spot w-64 h-64 bg-indigo-100/60 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              <div className="relative flex flex-col items-center gap-3 text-center px-6">
                <div className="w-16 h-16 rounded-2xl bg-[var(--accent-light)] flex items-center justify-center text-3xl shadow-sm">
                  🛰️
                </div>
                <div>
                  <p className="font-semibold text-[var(--text-1)]">Zone de détail</p>
                  <p className="text-sm text-[var(--text-3)] mt-1 max-w-xs">
                    Cliquez sur un widget pour afficher ses détails ici, ou utilisez l'icône ⛶ pour le plein écran.
                  </p>
                </div>
                <button
                  onClick={() => setShowCatalog(true)}
                  className="mt-2 px-4 py-2 rounded-xl bg-[var(--accent)] text-white text-sm font-medium hover:bg-[var(--accent-hover)] transition-colors shadow-sm"
                >
                  + Ajouter des widgets
                </button>
              </div>
            </div>
          )}

          {/* Bottom strip */}
          {bottomWidgets.length > 0 && (
            <div className="flex-none mt-3 flex gap-3 overflow-x-auto">
              {bottomWidgets.map((w) => (
                <div key={w.id} className="w-64 flex-none">
                  <CompactWidget widget={w} />
                </div>
              ))}
            </div>
          )}
        </main>

        {/* Right sidebar */}
        {rightWidgets.length > 0 && (
          <aside className="w-72 flex-none flex flex-col gap-3 p-3 overflow-y-auto border-l border-[var(--border)]">
            {rightWidgets.map((w) => <CompactWidget key={w.id} widget={w} />)}
          </aside>
        )}
      </div>

      {/* ── Modals ─────────────────────────────────────────────────────────── */}
      {showCatalog && <WidgetCatalogModal onClose={() => setShowCatalog(false)} />}
    </div>
  );
}
