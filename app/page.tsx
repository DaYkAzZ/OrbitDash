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

const NON_FOCUSABLE_TYPES = new Set(["clock", "timer"]);

function NavTicker({ widgets }: { widgets: { icon: string; title: string }[] }) {
  const items = [...widgets, ...widgets];
  return (
    <div className="ticker-wrap h-7 flex items-center">
      <div className="ticker-inner flex gap-8 items-center px-4">
        {items.map((w, i) => (
          <span key={i} className="text-[11px] font-semibold text-[var(--text-2)] flex items-center gap-1.5">
            <span>{w.icon}</span> {w.title}
          </span>
        ))}
      </div>
    </div>
  );
}

function DropZone({
  position, children, className = "",
}: { position: WidgetPosition; children: React.ReactNode; className?: string }) {
  const { onDragOver, onDropZone } = useDragDrop();
  const [over, setOver] = useState(false);
  return (
    <div
      onDragOver={(e) => { onDragOver(e); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { onDropZone(position)(e); setOver(false); }}
      className={`${className} transition-all duration-150 ${over ? "dropzone-over" : ""}`}
    >
      {children}
    </div>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const { widgets, expandedWidgetId, isLoading, loadWidgets, expandWidget } = useWidgetStore();
  const { user, isAdmin, isAuthenticated, logout } = useAuth();
  const { mode, toggleMode, density, setDensity } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showCatalog, setShowCatalog] = useState(false);
  const [activeNav, setActiveNav] = useState("home");

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated) { router.replace("/login"); return; }
    loadWidgets();
  }, [isAuthenticated]);

  if (!mounted || isLoading || !isAuthenticated) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-16 h-16 rounded-2xl bg-[var(--accent)] flex items-center justify-center text-white font-bold text-2xl"
            style={{ animation: "brutPulse 1.2s ease infinite", boxShadow: "var(--shadow-lg)" }}
          >
            O
          </div>
          <p className="text-sm font-semibold text-[var(--text-3)]">Chargement...</p>
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
    if (NON_FOCUSABLE_TYPES.has(widgetType)) return;
    expandWidget(widgetId);
  };

  const firstName = user?.displayName?.split(" ")[0] ?? "vous";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";

  const navItems = [
    { id: "home", icon: "🏠", label: "Accueil" },
    { id: "dash", icon: "📊", label: "Dashboard" },
    { id: "widgets", icon: "🧩", label: "Widgets", action: () => setShowCatalog(true) },
    ...(isAdmin ? [{ id: "admin", icon: "⚙️", label: "Admin", href: "/admin" }] : []),
  ];

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-[var(--bg)]">

      {/* Sidebar */}
      <aside className="sidebar">
        <div
          className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold text-lg mb-4"
        >
          O
        </div>
        {navItems.map((item) => {
          const isActive = activeNav === item.id;
          const cls = `sidebar-item ${isActive ? "active" : ""}`;
          if ("href" in item && item.href) {
            return (
              <Link key={item.id} href={item.href} title={item.label}>
                <span className={cls}>{item.icon}</span>
              </Link>
            );
          }
          return (
            <button
              key={item.id}
              type="button"
              title={item.label}
              className={cls}
              onClick={() => {
                setActiveNav(item.id);
                if ("action" in item && item.action) item.action();
              }}
            >
              {item.icon}
            </button>
          );
        })}
        <div className="flex-1" />
        <button
          type="button"
          className="sidebar-item"
          title="Déconnexion"
          onClick={() => { logout(); router.replace("/login"); }}
        >
          🚪
        </button>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <header className="flex-none px-6 py-4 flex items-center gap-4 bg-[var(--bg)]">
          <div className="search-bar">
            <span className="text-[var(--text-3)]">🔍</span>
            <input type="search" placeholder="Rechercher un widget..." aria-label="Rechercher" />
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <div className="hidden sm:flex rounded-[var(--radius-sm)] overflow-hidden border border-[var(--border)] bg-[var(--bg-card)]">
              {(["compact", "spaced"] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDensity(d)}
                  className="w-9 h-9 flex items-center justify-center text-xs transition-colors"
                  style={{
                    background: density === d ? "var(--accent)" : "transparent",
                    color: density === d ? "#fff" : "var(--text-3)",
                    fontWeight: density === d ? 700 : 400,
                  }}
                  title={d === "compact" ? "Compact" : "Espacé"}
                >
                  {d === "compact" ? "≡" : "⊞"}
                </button>
              ))}
            </div>
            <button type="button" onClick={toggleMode} className="btn-icon" title="Thème">
              {mode === "dark" ? "☀️" : "🌙"}
            </button>
            <button type="button" onClick={() => setShowCatalog(true)} className="btn-primary" style={{ height: 40 }}>
              + Ajouter
            </button>
            <div className="relative group">
              <button
                type="button"
                className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white"
                style={{ background: "var(--accent)", boxShadow: "var(--shadow-sm)" }}
              >
                {user?.avatarInitials ?? "?"}
              </button>
              <div className="absolute right-0 top-full mt-2 hidden group-hover:block z-50 card py-2 min-w-[160px]">
                <div className="px-4 py-2 border-b border-[var(--border)]">
                  <p className="text-sm font-semibold text-[var(--text-1)]">{user?.displayName}</p>
                  <p className="text-xs text-[var(--text-3)]">{user?.role}{isAdmin ? " · Admin" : ""}</p>
                </div>
                <button
                  type="button"
                  onClick={() => { logout(); router.replace("/login"); }}
                  className="w-full text-left px-4 py-2 text-sm text-[var(--text-2)] hover:bg-[var(--bg-hover)] hover:text-[var(--accent)]"
                >
                  Déconnexion
                </button>
              </div>
            </div>
          </div>
        </header>

        {widgets.length > 0 && <NavTicker widgets={widgets.map((w) => ({ icon: w.icon, title: w.title }))} />}

        {/* Content */}
        <div className="flex-1 flex overflow-hidden min-h-0 px-4 pb-4 gap-4">

          {/* Left column */}
          <div className="flex-1 flex flex-col min-w-0 gap-4 overflow-hidden">
            <div className="greeting-banner flex-none flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-[var(--text-1)]">
                  {greeting}, {firstName} !
                </p>
                <p className="text-sm text-[var(--text-2)] mt-1">
                  {widgets.length} widget{widgets.length !== 1 ? "s" : ""} actif{widgets.length !== 1 ? "s" : ""} sur votre tableau de bord
                </p>
              </div>
              <span className="text-5xl hidden sm:block" aria-hidden>🐕</span>
            </div>

            {topWidgets.length > 0 && (
              <DropZone position="top" className="flex-none flex gap-3 overflow-x-auto pb-1">
                {topWidgets.map((w, i) => (
                  <div key={w.id} className="w-52 flex-none anim-slide" style={{ animationDelay: `${i * 50}ms` }}>
                    <CompactWidget widget={w} onClickOverride={NON_FOCUSABLE_TYPES.has(w.type) ? undefined : () => handleWidgetClick(w.id, w.type)} />
                  </div>
                ))}
              </DropZone>
            )}

            <div className="flex-1 flex gap-4 min-h-0 overflow-hidden">
              {leftWidgets.length > 0 && (
                <DropZone position="left" className="w-64 xl:w-72 flex-none flex flex-col gap-3 overflow-y-auto pr-1">
                  {leftWidgets.map((w, i) => (
                    <div key={w.id} className="anim-slide" style={{ animationDelay: `${i * 60}ms` }}>
                      <CompactWidget
                        widget={w}
                        onClickOverride={NON_FOCUSABLE_TYPES.has(w.type) ? undefined : () => handleWidgetClick(w.id, w.type)}
                      />
                    </div>
                  ))}
                </DropZone>
              )}

              <main className="flex-1 flex flex-col min-w-0 gap-3 overflow-hidden">
                {expandedWidget ? (
                  <div className="flex-1 overflow-hidden anim-scale card">
                    <ExpandedWidgetModal widget={expandedWidget} inline />
                  </div>
                ) : (
                  <DropZone
                    position="left"
                    className="flex-1 flex flex-col items-center justify-center gap-4 card border-2 border-dashed border-[var(--border-2)] bg-[var(--bg-card)]/80"
                  >
                    <div className="flex flex-col items-center gap-3 text-center px-6 anim-fade">
                      <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                        style={{ background: "var(--accent-light)", animation: "brutBounce 2.5s ease infinite" }}
                      >
                        🛰️
                      </div>
                      <div>
                        <p className="font-bold text-lg text-[var(--text-1)]">Zone Focus</p>
                        <p className="text-sm text-[var(--text-3)] mt-1 max-w-xs">
                          Cliquez sur un widget pour l&apos;afficher ici en mode détaillé.
                        </p>
                      </div>
                      <button type="button" onClick={() => setShowCatalog(true)} className="btn-primary">
                        + Ajouter un widget
                      </button>
                    </div>
                  </DropZone>
                )}

                {bottomWidgets.length > 0 && (
                  <DropZone position="bottom" className="flex-none flex gap-3 overflow-x-auto py-1">
                    {bottomWidgets.map((w, i) => (
                      <div key={w.id} className="w-64 flex-none anim-slide" style={{ animationDelay: `${i * 60}ms` }}>
                        <CompactWidget
                          widget={w}
                          onClickOverride={NON_FOCUSABLE_TYPES.has(w.type) ? undefined : () => handleWidgetClick(w.id, w.type)}
                        />
                      </div>
                    ))}
                  </DropZone>
                )}
              </main>
            </div>
          </div>

          {/* Right column */}
          {rightWidgets.length > 0 && (
            <DropZone
              position="right"
              className="w-64 xl:w-72 flex-none flex flex-col gap-3 overflow-y-auto"
            >
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-3)] px-1">Mes widgets</p>
              {rightWidgets.map((w, i) => (
                <div key={w.id} className="anim-slide" style={{ animationDelay: `${i * 60}ms` }}>
                  <CompactWidget
                    widget={w}
                    onClickOverride={NON_FOCUSABLE_TYPES.has(w.type) ? undefined : () => handleWidgetClick(w.id, w.type)}
                  />
                </div>
              ))}
            </DropZone>
          )}
        </div>
      </div>

      {showCatalog && <WidgetCatalogModal onClose={() => setShowCatalog(false)} />}
    </div>
  );
}
