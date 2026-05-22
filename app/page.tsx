"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useWidgetStore, WIDGET_CATALOG } from "@/app/store/useWidgetStore";
import { useAuth } from "@/app/store/AuthContext";
import { useTheme } from "@/app/store/ThemeContext";
import { useDragDrop } from "@/app/hooks/useDragDrop";
import { useMarketSimulator } from "@/app/hooks/useMarketSimulator";
import { CompactWidget } from "./components/widgets/CompactWidget";
import { ExpandedWidgetModal } from "./components/ExpandedWidgetModal";
import { WidgetCatalogModal } from "./components/WidgetCatalogModal";
import type { WidgetPosition } from "./types";

const NON_FOCUSABLE_TYPES = new Set(["clock", "timer"]);

function NavTicker({ widgets }: { widgets: { icon: string; title: string }[] }) {
  const items = [...widgets, ...widgets];
  return (
    <div className="ticker-wrap h-7 flex items-center overflow-hidden">
      <div className="ticker-inner flex gap-8 items-center px-4">
        {items.map((w, i) => (
          <span key={i} className="text-[11px] font-semibold text-[var(--text-2)] flex items-center gap-1.5 whitespace-nowrap">
            <span>{w.icon}</span> {w.title}
          </span>
        ))}
      </div>
    </div>
  );
}

// DropZone uniquement utilisée par admin (drag & drop)
function AdminDropZone({
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

// Conteneur simple pour les users (pas de drag & drop)
function PlainZone({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

interface SearchResult {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  kind: "widget-active" | "widget-catalog" | "page";
  action: () => void;
}

export default function Dashboard() {
  const router = useRouter();
  const { widgets, expandedWidgetId, isLoading, loadWidgets, expandWidget } = useWidgetStore();
  const { user, isAdmin, isAuthenticated, logout } = useAuth();
  const userId = user?.id;
  const { mode, toggleMode, density, setDensity } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showCatalog, setShowCatalog] = useState(false);
  const [activeNav, setActiveNav] = useState("home");

  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useMarketSimulator();

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated) { router.replace("/login"); return; }
    loadWidgets();
  }, [isAuthenticated, userId, loadWidgets, router]);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  if (!mounted || isLoading || !isAuthenticated) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[var(--accent)] flex items-center justify-center text-white font-bold text-2xl"
            style={{ boxShadow: "var(--shadow-lg)" }}>O</div>
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
    setShowResults(false);
    setQuery("");
  };

  // Zone wrapper : admin = drag & drop, user = plain
  const Zone = isAdmin ? AdminDropZone : PlainZone;

  // ── Recherche ──
  const searchResults: SearchResult[] = (() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const results: SearchResult[] = [];

    widgets.forEach((w) => {
      if (w.title.toLowerCase().includes(q) || w.type.toLowerCase().includes(q) || w.description.toLowerCase().includes(q)) {
        results.push({
          id: `active-${w.id}`,
          icon: w.icon,
          title: w.title,
          subtitle: NON_FOCUSABLE_TYPES.has(w.type) ? `In-place · ${w.position}` : `Actif · ${w.position} · cliquer pour détailler`,
          kind: "widget-active",
          action: () => {
            if (!NON_FOCUSABLE_TYPES.has(w.type)) expandWidget(w.id);
            setShowResults(false); setQuery("");
          },
        });
      }
    });

    if (isAdmin) {
      const activeTypes = new Set(widgets.map((w) => w.type));
      const { availableTypes } = useWidgetStore.getState();
      WIDGET_CATALOG.forEach((cat) => {
        if (!availableTypes.includes(cat.type as any) || activeTypes.has(cat.type as any)) return;
        if (cat.title.toLowerCase().includes(q) || cat.description.toLowerCase().includes(q)) {
          results.push({
            id: `catalog-${cat.type}`,
            icon: cat.icon,
            title: cat.title,
            subtitle: `Catalogue · ${cat.description}`,
            kind: "widget-catalog",
            action: () => { setShowCatalog(true); setShowResults(false); setQuery(""); },
          });
        }
      });
    }

    const pages = [
      { id: "page-admin", icon: "⚙️", title: "Administration", subtitle: "Gérer les widgets", href: "/admin", adminOnly: true },
      { id: "page-logout", icon: "🚪", title: "Déconnexion", subtitle: "Quitter la session", href: null as string | null, adminOnly: false },
    ];
    pages.forEach((p) => {
      if (p.adminOnly && !isAdmin) return;
      if (p.title.toLowerCase().includes(q)) {
        results.push({
          id: p.id, icon: p.icon, title: p.title, subtitle: p.subtitle,
          kind: "page",
          action: () => {
            if (p.href) router.push(p.href);
            else { logout(); router.replace("/login"); }
            setShowResults(false); setQuery("");
          },
        });
      }
    });

    return results.slice(0, 8);
  })();

  const firstName = user?.displayName?.split(" ")[0] ?? "vous";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";

  const kindLabel: Record<SearchResult["kind"], string> = {
    "widget-active": "Actif", "widget-catalog": "Catalogue", "page": "Page",
  };
  const kindColor: Record<SearchResult["kind"], string> = {
    "widget-active": "var(--accent)", "widget-catalog": "var(--green)", "page": "var(--text-3)",
  };

  const navItems = [
    { id: "home",    icon: "🏠", label: "Accueil" },
    { id: "dash",    icon: "📊", label: "Dashboard" },
    // Bouton "Ajouter widget" dans la sidebar uniquement pour admin
    ...(isAdmin ? [{ id: "widgets", icon: "🧩", label: "Ajouter un widget", action: () => setShowCatalog(true) }] : []),
    ...(isAdmin ? [{ id: "admin",   icon: "⚙️", label: "Administration", href: "/admin" }] : []),
  ];

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-[var(--bg)]">

      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside className="sidebar">
        <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold text-lg mb-4">O</div>
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
            <button key={item.id} type="button" title={item.label} className={cls}
              onClick={() => { setActiveNav(item.id); if ("action" in item && item.action) item.action(); }}>
              {item.icon}
            </button>
          );
        })}
        <div className="flex-1" />
        <button type="button" className="sidebar-item" title="Déconnexion"
          onClick={() => { logout(); router.replace("/login"); }}>
          🚪
        </button>
      </aside>

      {/* ── Main ────────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <header className="flex-none px-6 py-4 flex items-center gap-4 bg-[var(--bg)]">
          {/* Recherche */}
          <div ref={searchRef} className="relative flex-1 max-w-md">
            <div
              className="flex items-center gap-2 px-4 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg-card)] transition-all"
              style={{ height: 42, boxShadow: showResults ? "var(--shadow-md)" : "var(--shadow-sm)", borderColor: showResults ? "var(--accent)" : undefined }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-none">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setShowResults(true); }}
                onFocus={() => setShowResults(true)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") { setShowResults(false); setQuery(""); }
                  if (e.key === "Enter" && searchResults.length > 0) searchResults[0].action();
                }}
                placeholder="Rechercher un widget…"
                className="flex-1 bg-transparent outline-none text-sm text-[var(--text-1)] placeholder:text-[var(--text-3)]"
                autoComplete="off"
              />
              {query && (
                <button type="button" onClick={() => { setQuery(""); setShowResults(false); inputRef.current?.focus(); }}
                  className="text-[var(--text-3)] hover:text-[var(--text-1)] transition-colors text-base leading-none flex-none">
                  ✕
                </button>
              )}
            </div>

            {showResults && query.trim() && (
              <div className="absolute top-full left-0 right-0 mt-2 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden anim-scale z-50"
                style={{ boxShadow: "var(--shadow-lg)" }}>
                {searchResults.length === 0 ? (
                  <div className="px-4 py-6 text-center">
                    <p className="text-sm text-[var(--text-3)]">Aucun résultat pour <strong className="text-[var(--text-2)]">"{query}"</strong></p>
                  </div>
                ) : (
                  <ul>
                    {searchResults.map((r, i) => (
                      <li key={r.id}>
                        <button type="button" onClick={r.action}
                          className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[var(--bg-hover)] transition-colors"
                          style={{ borderTop: i > 0 ? "1px solid var(--border)" : undefined }}>
                          <span className="text-xl flex-none w-8 text-center">{r.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-[var(--text-1)] truncate">{r.title}</p>
                            <p className="text-xs text-[var(--text-3)] truncate mt-0.5">{r.subtitle}</p>
                          </div>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-none"
                            style={{ background: kindColor[r.kind] + "18", color: kindColor[r.kind] }}>
                            {kindLabel[r.kind]}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 ml-auto">
            <div className="hidden sm:flex rounded-[var(--radius-sm)] overflow-hidden border border-[var(--border)] bg-[var(--bg-card)]">
              {(["compact", "spaced"] as const).map((d) => (
                <button key={d} type="button" onClick={() => setDensity(d)}
                  className="w-9 h-9 flex items-center justify-center text-xs transition-colors"
                  style={{ background: density === d ? "var(--accent)" : "transparent", color: density === d ? "#fff" : "var(--text-3)", fontWeight: density === d ? 700 : 400 }}
                  title={d === "compact" ? "Compact" : "Espacé"}>
                  {d === "compact" ? "≡" : "⊞"}
                </button>
              ))}
            </div>
            <button type="button" onClick={toggleMode} className="btn-icon" title="Thème">
              {mode === "dark" ? "☀️" : "🌙"}
            </button>
            {/* Bouton "+ Ajouter" uniquement pour admin */}
            {isAdmin && (
              <button type="button" onClick={() => setShowCatalog(true)} className="btn-primary" style={{ height: 40 }}>
                + Ajouter
              </button>
            )}
            <div className="relative group">
              <button type="button"
                className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white"
                style={{ background: "var(--accent)", boxShadow: "var(--shadow-sm)" }}>
                {user?.avatarInitials ?? "?"}
              </button>
              <div className="absolute right-0 top-full mt-2 hidden group-hover:block z-50 card py-2 min-w-[160px]">
                <div className="px-4 py-2 border-b border-[var(--border)]">
                  <p className="text-sm font-semibold text-[var(--text-1)]">{user?.displayName}</p>
                  <p className="text-xs text-[var(--text-3)]">{user?.role}{isAdmin ? " · Admin" : ""}</p>
                </div>
                <button type="button" onClick={() => { logout(); router.replace("/login"); }}
                  className="w-full text-left px-4 py-2 text-sm text-[var(--text-2)] hover:bg-[var(--bg-hover)] hover:text-[var(--accent)]">
                  Déconnexion
                </button>
              </div>
            </div>
          </div>
        </header>

        {widgets.length > 0 && <NavTicker widgets={widgets.map((w) => ({ icon: w.icon, title: w.title }))} />}

        {/* Content */}
        <div className="flex-1 flex overflow-hidden min-h-0 px-4 pb-4 gap-4">
          <div className="flex-1 flex flex-col min-w-0 gap-4 overflow-hidden">

            {/* Greeting */}
            <div className="flex-none flex items-center justify-between px-4 py-3 rounded-[var(--radius)] bg-[var(--bg-card)] border border-[var(--border)]"
              style={{ boxShadow: "var(--shadow-sm)" }}>
              <div>
                <p className="text-xl font-bold text-[var(--text-1)]">{greeting}, {firstName} !</p>
                <p className="text-sm text-[var(--text-2)] mt-0.5">
                  {widgets.length} widget{widgets.length !== 1 ? "s" : ""} actif{widgets.length !== 1 ? "s" : ""}
                  {isAdmin && <span className="ml-2 text-xs text-[var(--accent)] font-semibold">· Mode Admin</span>}
                </p>
              </div>
              <span className="text-4xl hidden sm:block" aria-hidden>🐕</span>
            </div>

            {/* Top */}
            {topWidgets.length > 0 && (
              <Zone position={"top" as WidgetPosition} className="flex-none flex gap-3 overflow-x-auto pb-1">
                {topWidgets.map((w, i) => (
                  <div key={w.id} className="w-52 flex-none anim-slide" style={{ animationDelay: `${i * 50}ms` }}>
                    <CompactWidget widget={w} onClickOverride={NON_FOCUSABLE_TYPES.has(w.type) ? undefined : () => handleWidgetClick(w.id, w.type)} />
                  </div>
                ))}
              </Zone>
            )}

            <div className="flex-1 flex gap-4 min-h-0 overflow-hidden">
              {/* Left */}
              {leftWidgets.length > 0 && (
                <Zone position={"left" as WidgetPosition} className="w-64 xl:w-72 flex-none flex flex-col gap-3 overflow-y-auto pr-1">
                  {leftWidgets.map((w, i) => (
                    <div key={w.id} className="anim-slide" style={{ animationDelay: `${i * 60}ms` }}>
                      <CompactWidget widget={w} onClickOverride={NON_FOCUSABLE_TYPES.has(w.type) ? undefined : () => handleWidgetClick(w.id, w.type)} />
                    </div>
                  ))}
                </Zone>
              )}

              {/* Centre / Zone focus */}
              <main className="flex-1 flex flex-col min-w-0 gap-3 overflow-hidden">
                {expandedWidget ? (
                  <div className="flex-1 overflow-hidden anim-scale card">
                    <ExpandedWidgetModal widget={expandedWidget} inline />
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center gap-4 card border-2 border-dashed border-[var(--border-2)] bg-[var(--bg-card)]/80">
                    <div className="flex flex-col items-center gap-3 text-center px-6 anim-fade">
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                        style={{ background: "var(--accent-light)" }}>🛰️</div>
                      <div>
                        <p className="font-bold text-lg text-[var(--text-1)]">Zone Focus</p>
                        <p className="text-sm text-[var(--text-3)] mt-1 max-w-xs">
                          Cliquez sur un widget pour l&apos;afficher ici en mode détaillé.
                        </p>
                      </div>
                      {/* CTA uniquement pour admin */}
                      {isAdmin && (
                        <button type="button" onClick={() => setShowCatalog(true)} className="btn-primary">
                          + Ajouter un widget
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Bottom */}
                {bottomWidgets.length > 0 && (
                  <Zone position={"bottom" as WidgetPosition} className="flex-none flex gap-3 overflow-x-auto py-1">
                    {bottomWidgets.map((w, i) => (
                      <div key={w.id} className="w-64 flex-none anim-slide" style={{ animationDelay: `${i * 60}ms` }}>
                        <CompactWidget widget={w} onClickOverride={NON_FOCUSABLE_TYPES.has(w.type) ? undefined : () => handleWidgetClick(w.id, w.type)} />
                      </div>
                    ))}
                  </Zone>
                )}
              </main>
            </div>
          </div>

          {/* Right */}
          {rightWidgets.length > 0 && (
            <Zone position={"right" as WidgetPosition} className="w-64 xl:w-72 flex-none flex flex-col gap-3 overflow-y-auto">
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-3)] px-1">Mes widgets</p>
              {rightWidgets.map((w, i) => (
                <div key={w.id} className="anim-slide" style={{ animationDelay: `${i * 60}ms` }}>
                  <CompactWidget widget={w} onClickOverride={NON_FOCUSABLE_TYPES.has(w.type) ? undefined : () => handleWidgetClick(w.id, w.type)} />
                </div>
              ))}
            </Zone>
          )}
        </div>
      </div>

      {isAdmin && showCatalog && <WidgetCatalogModal onClose={() => setShowCatalog(false)} />}
    </div>
  );
}
