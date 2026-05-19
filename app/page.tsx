"use client";

import { useEffect, useState } from "react";
import { useWidgetStore } from "@/app/store/useWidgetStore";
import { useDragDrop } from "@/app/hooks/useDragDrop";
import { CompactWidget } from "./components/widgets/CompactWidget";
import { ExpandedWidgetModal } from "./components/ExpandedWidgetModal";
import { WidgetCatalogModal } from "./components/WidgetCatalogModal";
import type { WidgetPosition } from "./types";

/* ── Zone de dépôt (colonne/bande) ─────────────────────────────────────────── */
function DropZone({
  position,
  children,
  className = "",
}: {
  position: WidgetPosition;
  children: React.ReactNode;
  className?: string;
}) {
  const { onDragOver, onDropZone } = useDragDrop();
  const [over, setOver] = useState(false);

  return (
    <div
      onDragOver={(e) => { onDragOver(e); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { onDropZone(position)(e); setOver(false); }}
      className={`${className} transition-all duration-150 ${
        over ? "ring-2 ring-[var(--accent)] ring-inset bg-[var(--accent-light)]/30 rounded-2xl" : ""
      }`}
    >
      {children}
    </div>
  );
}

/* ── Dashboard principal ────────────────────────────────────────────────────── */
export default function Dashboard() {
  const { widgets, expandedWidgetId, isLoading, loadWidgets, resetWidgets } = useWidgetStore();
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

  const byPos = (pos: WidgetPosition) =>
    [...widgets].filter((w) => w.position === pos).sort((a, b) => a.order - b.order);

  const leftWidgets   = byPos("left");
  const rightWidgets  = byPos("right");
  const bottomWidgets = byPos("bottom");
  const topWidgets    = byPos("top");
  const expandedWidget = expandedWidgetId ? widgets.find((w) => w.id === expandedWidgetId) : null;

  const totalWidgets = widgets.length;

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[var(--bg)]">

      {/* ── Navbar ───────────────────────────────────────────────────────────── */}
      <header className="flex-none h-14 px-5 flex items-center justify-between border-b border-[var(--border)] bg-[var(--bg-card)] shadow-[var(--shadow-xs)] z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-sm">O</span>
          </div>
          <span className="font-semibold text-[var(--text-1)] tracking-tight">OrbitDash</span>
          <span className="ml-2 badge badge-accent">{totalWidgets} widgets</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Hint drag */}
          <span className="hidden sm:flex items-center gap-1 text-[11px] text-[var(--text-3)] mr-1">
            <svg width="12" height="12" viewBox="0 0 20 8" fill="none">
              <circle cx="4" cy="2" r="1.5" fill="currentColor"/>
              <circle cx="10" cy="2" r="1.5" fill="currentColor"/>
              <circle cx="16" cy="2" r="1.5" fill="currentColor"/>
              <circle cx="4" cy="6" r="1.5" fill="currentColor"/>
              <circle cx="10" cy="6" r="1.5" fill="currentColor"/>
              <circle cx="16" cy="6" r="1.5" fill="currentColor"/>
            </svg>
            Glisser pour réorganiser
          </span>

          <button
            onClick={() => setShowCatalog(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--accent)] text-white text-xs font-semibold hover:bg-[var(--accent-hover)] transition-colors shadow-sm"
          >
            <span className="text-base leading-none">+</span> Ajouter
          </button>
          <button
            onClick={resetWidgets}
            title="Réinitialiser le dashboard"
            className="btn-icon"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
            </svg>
          </button>
        </div>
      </header>

      {/* ── Top strip ────────────────────────────────────────────────────────── */}
      {topWidgets.length > 0 && (
        <DropZone
          position="top"
          className="flex-none px-4 py-2 flex gap-3 overflow-x-auto border-b border-[var(--border)] bg-[var(--bg-card)]"
        >
          {topWidgets.map((w) => (
            <div key={w.id} className="w-52 flex-none">
              <CompactWidget widget={w} />
            </div>
          ))}
        </DropZone>
      )}

      {/* ── Main layout ──────────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden min-h-0">

        {/* Left sidebar */}
        {leftWidgets.length > 0 && (
          <DropZone
            position="left"
            className="w-72 flex-none flex flex-col gap-3 p-3 overflow-y-auto border-r border-[var(--border)]"
          >
            {leftWidgets.map((w) => <CompactWidget key={w.id} widget={w} />)}
          </DropZone>
        )}

        {/* ── Center – zone de focus ─────────────────────────────────────────── */}
        <main className="flex-1 flex flex-col overflow-hidden p-3 min-w-0">
          {expandedWidget ? (
            <div className="flex-1 bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] shadow-[var(--shadow-md)] overflow-hidden anim-scale">
              <ExpandedWidgetModal widget={expandedWidget} inline />
            </div>
          ) : (
            /* Zone centrale vide – accepte aussi le drop */
            <DropZone
              position="left"
              className="flex-1 flex flex-col items-center justify-center gap-5 rounded-2xl border-2 border-dashed border-[var(--border)] bg-[var(--bg-card)]"
            >
              <div className="spot w-64 h-64 bg-indigo-100/60 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              <div className="relative flex flex-col items-center gap-3 text-center px-6">
                <div className="w-16 h-16 rounded-2xl bg-[var(--accent-light)] flex items-center justify-center text-3xl shadow-sm">
                  🛰️
                </div>
                <div>
                  <p className="font-semibold text-[var(--text-1)]">Zone de détail</p>
                  <p className="text-sm text-[var(--text-3)] mt-1 max-w-xs">
                    Cliquez sur un widget pour l'afficher ici, ou glissez-déposez les widgets pour les réorganiser.
                  </p>
                </div>
                <button
                  onClick={() => setShowCatalog(true)}
                  className="mt-2 px-4 py-2 rounded-xl bg-[var(--accent)] text-white text-sm font-medium hover:bg-[var(--accent-hover)] transition-colors shadow-sm"
                >
                  + Ajouter des widgets
                </button>
              </div>
            </DropZone>
          )}

          {/* Bottom strip */}
          {bottomWidgets.length > 0 && (
            <DropZone
              position="bottom"
              className="flex-none mt-3 flex gap-3 overflow-x-auto"
            >
              {bottomWidgets.map((w) => (
                <div key={w.id} className="w-64 flex-none">
                  <CompactWidget widget={w} />
                </div>
              ))}
            </DropZone>
          )}
        </main>

        {/* Right sidebar */}
        {rightWidgets.length > 0 && (
          <DropZone
            position="right"
            className="w-72 flex-none flex flex-col gap-3 p-3 overflow-y-auto border-l border-[var(--border)]"
          >
            {rightWidgets.map((w) => <CompactWidget key={w.id} widget={w} />)}
          </DropZone>
        )}
      </div>

      {/* ── Modals ───────────────────────────────────────────────────────────── */}
      {showCatalog && <WidgetCatalogModal onClose={() => setShowCatalog(false)} />}
    </div>
  );
}
