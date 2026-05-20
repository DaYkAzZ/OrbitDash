"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useWidgetStore } from "@/app/store/useWidgetStore";
import { useAuth } from "@/app/store/AuthContext";
import { useTheme } from "@/app/store/ThemeContext";
import { useDragDrop } from "@/app/hooks/useDragDrop";
import { CompactWidget } from "./components/widgets/CompactWidget";
import { ExpandedWidgetModal } from "./components/ExpandedWidgetModal";
import { WidgetCatalogModal } from "./components/WidgetCatalogModal";
import type { WidgetPosition } from "./types";

/* ── Widgets non-focusables (restent en in-place uniquement) ──────────────── */
const NON_FOCUSABLE_TYPES = new Set(["clock", "timer"]);

/* ── Zone de dépôt ────────────────────────────────────────────────────────── */
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

/* ── Dashboard principal ──────────────────────────────────────────────────── */
export default function Dashboard() {
  const router = useRouter();
  const { widgets, expandedWidgetId, isLoading, loadWidgets, resetWidgets, expandWidget } = useWidgetStore();
  const { user, isAdmin, isAuthenticated, logout } = useAuth();
  const { mode, toggleMode, density, setDensity } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showCatalog, setShowCatalog] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated) { router.replace("/login"); return; }
    loadWidgets();
  }, [isAuthenticated]);

  if (!mounted || isLoading || !isAuthenticated) {
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

  const handleWidgetClick = (widgetId: string, widgetType: string) => {
    // Vérifie si le widget est focusable avant d'ouvrir la zone centrale
    if (NON_FOCUSABLE_TYPES.has(widgetType)) return;
    expandWidget(widgetId);
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[var(--bg)]">

      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <header className="flex-none h-14 px-5 flex items-center justify-between border-b border-[var(--border)] bg-[var(--bg-card)] shadow-[var(--shadow-xs)] z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-sm">O</span>
          </div>
          <span className="font-semibold text-[var(--text-1)] tracking-tight">OrbitDash</span>
          <span className="ml-2 badge badge-accent">{widgets.length} widgets</span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Densité */}
          <div className="hidden sm:flex items-center gap-1 mr-1">
            {(["compact", "spaced"] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDensity(d)}
                title={d === "compact" ? "Vue compacte" : "Vue espacée"}
                className={`btn-icon text-xs ${density === d ? "bg-[var(--accent-light)] text-[var(--accent)]" : ""}`}
              >
                {d === "compact" ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
                    <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                    <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
                  </svg>
                )}
              </button>
            ))}
          </div>

          {/* Theme toggle */}
          <button onClick={toggleMode} className="btn-icon" title={mode === "dark" ? "Mode clair" : "Mode sombre"}>
            {mode === "dark" ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>

          {/* Hint drag */}
          <span className="hidden md:flex items-center gap-1 text-[11px] text-[var(--text-3)] mx-1">
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

          {/* Admin link (visible seulement pour admin) */}
          {isAdmin && (
            <Link href="/admin">
              <button className="btn-icon" title="Administration">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/>
                  <circle cx="19" cy="19" r="3"/><line x1="19" y1="16" x2="19" y2="19"/><line x1="19" y1="19" x2="22" y2="19"/>
                </svg>
              </button>
            </Link>
          )}

          {/* User avatar + logout */}
          <div className="relative group">
            <button className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center text-white text-xs font-bold shadow-sm">
              {user?.avatarInitials ?? "?"}
            </button>
            <div className="absolute right-0 top-full mt-1 hidden group-hover:block z-50">
              <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl shadow-[var(--shadow-lg)] py-1 min-w-36">
                <div className="px-3 py-2 border-b border-[var(--border)]">
                  <p className="text-xs font-semibold text-[var(--text-1)]">{user?.displayName}</p>
                  <p className="text-[10px] text-[var(--text-3)] capitalize">{user?.role}</p>
                </div>
                <button
                  onClick={() => { logout(); router.replace("/login"); }}
                  className="w-full text-left px-3 py-2 text-xs text-[var(--text-2)] hover:bg-[var(--bg-hover)] transition-colors"
                >
                  Déconnexion
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── Top strip ──────────────────────────────────────────────────────── */}
      {topWidgets.length > 0 && (
        <DropZone
          position="top"
          className="flex-none px-4 py-2 flex gap-3 overflow-x-auto border-b border-[var(--border)] bg-[var(--bg-card)]"
        >
          {topWidgets.map((w) => (
            <div key={w.id} className="w-52 flex-none">
              <CompactWidget widget={w} onClickOverride={NON_FOCUSABLE_TYPES.has(w.type) ? undefined : () => handleWidgetClick(w.id, w.type)} />
            </div>
          ))}
        </DropZone>
      )}

      {/* ── Main layout ────────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden min-h-0">

        {/* Left sidebar */}
        {leftWidgets.length > 0 && (
          <DropZone
            position="left"
            className="w-72 flex-none flex flex-col gap-3 p-3 overflow-y-auto border-r border-[var(--border)]"
          >
            {leftWidgets.map((w) => (
              <CompactWidget
                key={w.id}
                widget={w}
                onClickOverride={NON_FOCUSABLE_TYPES.has(w.type) ? undefined : () => handleWidgetClick(w.id, w.type)}
              />
            ))}
          </DropZone>
        )}

        {/* ── Center – zone de focus ────────────────────────────────────────── */}
        <main className="flex-1 flex flex-col overflow-hidden p-3 min-w-0">
          {expandedWidget ? (
            <div className="flex-1 bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] shadow-[var(--shadow-md)] overflow-hidden anim-scale">
              <ExpandedWidgetModal widget={expandedWidget} inline />
            </div>
          ) : (
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
                    Cliquez sur un widget pour l'afficher ici. Les widgets <span className="font-medium">Horloge</span> et <span className="font-medium">Minuteur</span> restent en mode in-place.
                  </p>
                </div>
                <button
                  onClick={() => setShowCatalog(true)}
                  className="mt-2 px-4 py-2 rounded-xl bg-[var(--accent)] text-white text-sm font-medium hover:bg-[var(--accent-hover)] transition-colors shadow-sm"
                >
                  + Ajouter des widgets
                </button>
                {isAdmin && (
                  <Link href="/admin">
                    <button className="mt-1 px-4 py-2 rounded-xl border border-[var(--border)] text-[var(--text-2)] text-sm font-medium hover:bg-[var(--bg-hover)] transition-colors">
                      ⚙️ Administrer
                    </button>
                  </Link>
                )}
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
                  <CompactWidget
                    key={w.id}
                    widget={w}
                    onClickOverride={NON_FOCUSABLE_TYPES.has(w.type) ? undefined : () => handleWidgetClick(w.id, w.type)}
                  />
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
            {rightWidgets.map((w) => (
              <CompactWidget
                key={w.id}
                widget={w}
                onClickOverride={NON_FOCUSABLE_TYPES.has(w.type) ? undefined : () => handleWidgetClick(w.id, w.type)}
              />
            ))}
          </DropZone>
        )}
      </div>

      {/* ── Modals ─────────────────────────────────────────────────────────── */}
      {showCatalog && <WidgetCatalogModal onClose={() => setShowCatalog(false)} />}
    </div>
  );
}
