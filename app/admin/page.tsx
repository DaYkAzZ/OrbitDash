"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useWidgetStore, WIDGET_CATALOG } from "@/app/store/useWidgetStore";
import { useAuth } from "@/app/store/AuthContext";
import type { WidgetType, WidgetPosition } from "@/app/types";

const POSITIONS: { label: string; value: WidgetPosition; color: string }[] = [
  { label: "◀ Gauche", value: "left",   color: "var(--neon-blue)"   },
  { label: "▶ Droite", value: "right",  color: "var(--neon-purple)" },
  { label: "▲ Haut",   value: "top",    color: "var(--neon-cyan)"   },
  { label: "▼ Bas",    value: "bottom", color: "var(--neon-pink)"   },
];

/* ── Éditeur de données ─────────────────────────────────────────────────── */
function WidgetDataEditor({ widgetId, onClose }: { widgetId: string; onClose: () => void }) {
  const { widgets, updateWidgetData } = useWidgetStore();
  const widget = widgets.find((w) => w.id === widgetId);
  if (!widget) return null;

  const [data, setData] = useState(JSON.stringify(widget.data, null, 2));
  const [err, setErr] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setErr(null);
    try {
      const parsed = JSON.parse(data);
      updateWidgetData(widgetId, parsed);
      setSaved(true);
      setTimeout(() => { setSaved(false); onClose(); }, 700);
    } catch (e: any) { setErr("JSON invalide : " + e.message); }
  };

  const renderSpecialized = () => {
    switch (widget.type) {
      case "notes":
        return (
          <div className="space-y-2">
            <label className="label-neo">Contenu de la note</label>
            <textarea className="textarea-base" rows={6} value={widget.data.content ?? ""}
              onChange={(e) => updateWidgetData(widgetId, { content: e.target.value })} />
          </div>
        );
      case "weather":
        return (
          <div className="space-y-4">
            <div><label className="label-neo">Ville</label>
              <input className="input-base mt-1" value={widget.data.city ?? ""} onChange={(e) => updateWidgetData(widgetId, { city: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label-neo">Temp (°C)</label>
                <input type="number" className="input-base mt-1" value={widget.data.temperature ?? 0}
                  onChange={(e) => updateWidgetData(widgetId, { temperature: Number(e.target.value) })} />
              </div>
              <div><label className="label-neo">Condition</label>
                <input className="input-base mt-1" value={widget.data.condition ?? ""}
                  onChange={(e) => updateWidgetData(widgetId, { condition: e.target.value })} />
              </div>
            </div>
          </div>
        );
      case "quote":
        return (
          <div className="space-y-3">
            <div><label className="label-neo">Citation</label>
              <textarea className="textarea-base mt-1" rows={3} value={widget.data.text ?? ""}
                onChange={(e) => updateWidgetData(widgetId, { text: e.target.value })} />
            </div>
            <div><label className="label-neo">Auteur</label>
              <input className="input-base mt-1" value={widget.data.author ?? ""}
                onChange={(e) => updateWidgetData(widgetId, { author: e.target.value })} />
            </div>
          </div>
        );
      case "mood":
        return (
          <div className="space-y-4">
            <div>
              <label className="label-neo">Humeur</label>
              <select className="input-base mt-1" value={widget.data.current ?? "happy"}
                onChange={(e) => {
                  const m: Record<string, string> = { happy:"😊",focused:"🎯",energetic:"⚡",calm:"😌",stressed:"😰" };
                  updateWidgetData(widgetId, { current: e.target.value, emoji: m[e.target.value] });
                }}>
                {["happy","focused","energetic","calm","stressed"].map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="label-neo">Intensité : {widget.data.intensity ?? 5}/10</label>
              <input type="range" min={1} max={10} className="w-full mt-2" value={widget.data.intensity ?? 5}
                onChange={(e) => updateWidgetData(widgetId, { intensity: Number(e.target.value) })} />
            </div>
          </div>
        );
      default:
        return (
          <div className="space-y-3">
            <label className="label-neo">Données JSON brutes</label>
            <textarea className="textarea-base font-mono text-xs mt-1" rows={9} value={data}
              onChange={(e) => setData(e.target.value)} />
            {err && (
              <div className="px-3 py-2 text-xs font-bold"
                style={{ background: "var(--accent)", color: "white", border: "2px solid var(--border)" }}>
                ✕ {err}
              </div>
            )}
            <button onClick={handleSave} className="btn-primary">
              {saved ? "✓ Sauvegardé !" : "Appliquer le JSON"}
            </button>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 anim-scale"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={onClose}>
      <div className="w-full max-w-lg"
        style={{ background: "var(--bg-card)", border: "3px solid var(--border)", boxShadow: "var(--shadow-neo-xl)" }}
        onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4"
          style={{ background: "var(--neon-orange)", borderBottom: "2.5px solid var(--border)" }}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{widget.icon}</span>
            <div>
              <p className="font-black text-black uppercase tracking-wide" style={{ fontFamily: "Space Mono" }}>
                Modifier — {widget.title}
              </p>
              <p className="text-xs text-black/60 font-bold">Modifications immédiates</p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center font-black text-white"
            style={{ background: "var(--accent)", border: "2px solid var(--border)", boxShadow: "var(--shadow-neo-sm)" }}>
            ✕
          </button>
        </div>
        <div className="p-5">{renderSpecialized()}</div>
      </div>
    </div>
  );
}

/* ── Page Admin ────────────────────────────────────────────────────────────── */
export default function AdminPage() {
  const router = useRouter();
  const { user, isAdmin, isAuthenticated, logout } = useAuth();
  const { widgets, removeWidget, resetWidgets, reorderWidgets, availableTypes, enableType, disableType } = useWidgetStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toggleMsg, setToggleMsg] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("tous");
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) { router.replace("/login"); return; }
    if (!isAdmin) { router.replace("/"); }
  }, [isAuthenticated, isAdmin, router]);

  if (!isAdmin) return null;

  const handleToggleCatalog = (type: WidgetType) => {
    const enabled = availableTypes.includes(type);
    if (enabled) disableType(type);
    else enableType(type);
    setToggleMsg(enabled ? `${type} retiré du catalogue` : `${type} ajouté au catalogue`);
    setTimeout(() => setToggleMsg(null), 2000);
  };

  const handleLogout = () => { logout(); router.replace("/login"); };

  const filteredWidgets = filterType === "tous" ? widgets : widgets.filter((w) => w.type === filterType);
  const uniqueTypes = ["tous", ...Array.from(new Set(widgets.map((w) => w.type)))];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)]">

      {/* ══ HEADER ADMIN NÉOBRUT ══════════════════════════════════════════ */}
      <header style={{ borderBottom: "3px solid var(--border)" }}>
        {/* Bande rouge titre */}
        <div className="h-2" style={{ background: "var(--accent)" }} />
        <div className="h-16 px-5 flex items-center justify-between bg-[var(--bg-card)]"
          style={{ borderBottom: "2px solid var(--border)" }}>
          <div className="flex items-center gap-3">
            <Link href="/">
              <button
                className="w-9 h-9 flex items-center justify-center font-black text-sm transition-all hover:-translate-x-0.5"
                style={{ border: "2.5px solid var(--border)", boxShadow: "var(--shadow-neo-sm)", background: "var(--bg-card)" }}
                title="Retour"
              >
                ←
              </button>
            </Link>
            <div style={{ width: 2, height: 24, background: "var(--border)" }} />
            <div className="w-9 h-9 flex items-center justify-center font-black text-white"
              style={{ background: "var(--accent)", border: "2.5px solid var(--border)", boxShadow: "var(--shadow-neo-sm)" }}>
              <span style={{ fontFamily: "Space Mono" }}>O</span>
            </div>
            <p className="font-black text-lg uppercase tracking-wider text-[var(--text-1)]" style={{ fontFamily: "Space Mono" }}>
              Administration
            </p>
            <span className="text-[10px] font-black uppercase px-2 py-0.5"
              style={{ background: "var(--neon-pink)", color: "white", border: "2px solid var(--border)", boxShadow: "2px 2px 0 var(--border)", fontFamily: "Space Mono" }}>
              Admin
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-[var(--text-2)]" style={{ fontFamily: "Space Mono" }}>
              {user?.displayName}
            </span>
            <button onClick={handleLogout} className="btn-secondary" style={{ height: "36px" }}>
              → Déco
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 max-w-5xl mx-auto w-full space-y-6">

        {/* ── Stats ───────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Widgets", value: widgets.length,                                    bg: "var(--neon-yellow)", fg: "#0A0A0A" },
            { label: "Favoris", value: widgets.filter((w) => w.isFavorite).length,        bg: "var(--neon-pink)",   fg: "#FFFFFF" },
            { label: "Gauche",  value: widgets.filter((w) => w.position === "left").length, bg: "var(--neon-blue)",   fg: "#FFFFFF" },
            { label: "Droite",  value: widgets.filter((w) => w.position === "right").length, bg: "var(--neon-purple)", fg: "#FFFFFF" },
          ].map((s, i) => (
            <div
              key={s.label}
              className="flex items-center gap-3 p-4 anim-slide"
              style={{
                background: s.bg,
                border: "2.5px solid var(--border)",
                boxShadow: "var(--shadow-neo)",
                animationDelay: `${i * 70}ms`,
                borderRadius: 0,
              }}
            >
              <p className="text-3xl font-black" style={{ color: s.fg, fontFamily: "Space Mono" }}>{s.value}</p>
              <p className="text-xs font-black uppercase tracking-wider" style={{ color: s.fg, fontFamily: "Space Mono" }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Catalogue système (disponible pour les utilisateurs) ─────── */}
        <section className="card overflow-hidden">
          <div className="px-5 py-4 flex items-center justify-between border-b border-[var(--border)] bg-[var(--accent-light)]">
            <div>
              <p className="font-bold text-[var(--text-1)]">Catalogue des widgets</p>
              <p className="text-xs text-[var(--text-3)] mt-0.5">
                Activez ou retirez les types disponibles pour tous les utilisateurs
              </p>
            </div>
            {toggleMsg && (
              <span className="pill pill-green text-xs">{toggleMsg}</span>
            )}
          </div>

          <div className="p-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {WIDGET_CATALOG.map((item) => {
                const enabled = availableTypes.includes(item.type as WidgetType);
                return (
                  <div
                    key={item.type}
                    className="p-3 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg-card)] flex flex-col gap-2"
                    style={{ opacity: enabled ? 1 : 0.65 }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{item.icon}</span>
                      <p className="text-sm font-semibold text-[var(--text-1)] truncate">{item.title}</p>
                    </div>
                    <p className="text-[11px] text-[var(--text-3)] line-clamp-2">{item.description}</p>
                    <button
                      type="button"
                      onClick={() => handleToggleCatalog(item.type as WidgetType)}
                      className={enabled ? "btn-secondary" : "btn-primary"}
                      style={{ height: 34, fontSize: 12 }}
                    >
                      {enabled ? "Retirer du catalogue" : "Activer dans le catalogue"}
                    </button>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-[var(--text-3)] mt-4">
              Pour ajouter un widget à votre dashboard, utilisez « + Ajouter » sur la page d&apos;accueil (uniquement pour les types activés).
            </p>
          </div>
        </section>

        {/* ── Widgets actifs ────────────────────────────────────────────── */}
        <section style={{ border: "2.5px solid var(--border)", boxShadow: "var(--shadow-neo)", background: "var(--bg-card)" }}>
          <div className="px-5 py-4 flex flex-wrap items-center gap-3"
            style={{ borderBottom: "2.5px solid var(--border)", background: "var(--bg-hover)" }}>
            <p className="font-black text-[var(--text-1)] text-base uppercase tracking-wide" style={{ fontFamily: "Space Mono" }}>
              Widgets actifs
              <span className="ml-2 text-xs text-[var(--text-3)] font-bold normal-case">
                ({filteredWidgets.length}/{widgets.length})
              </span>
            </p>
            <div className="flex gap-1.5 overflow-x-auto">
              {uniqueTypes.map((t) => (
                <button key={t} onClick={() => setFilterType(t)}
                  className="flex-none px-2.5 py-1 text-[10px] font-black uppercase transition-all"
                  style={{
                    fontFamily: "Space Mono",
                    border: "2px solid var(--border)",
                    background: filterType === t ? "var(--neon-yellow)" : "transparent",
                    color: filterType === t ? "#0A0A0A" : "var(--text-3)",
                    boxShadow: filterType === t ? "var(--shadow-neo-sm)" : "none",
                    transform: filterType === t ? "translate(-1px,-1px)" : "none",
                  }}>
                  {t}
                </button>
              ))}
            </div>
            {confirmReset ? (
              <div className="flex gap-1 ml-auto">
                <button onClick={() => { resetWidgets(); setConfirmReset(false); }} className="btn-primary" style={{ height: "30px", fontSize: "11px" }}>
                  ✓ Confirmer
                </button>
                <button onClick={() => setConfirmReset(false)} className="btn-secondary" style={{ height: "30px", fontSize: "11px" }}>
                  ✕ Annuler
                </button>
              </div>
            ) : (
              <button onClick={() => setConfirmReset(true)} className="ml-auto btn-secondary text-xs"
                style={{ height: "30px", background: "var(--red-light)", color: "var(--red)" }}>
                ↺ Reset
              </button>
            )}
          </div>

          <div className="p-4 space-y-2">
            {filteredWidgets.length === 0 ? (
              <p className="text-sm font-bold text-[var(--text-3)] py-6 text-center uppercase" style={{ fontFamily: "Space Mono" }}>
                Aucun widget — Ajoutez-en un ci-dessus.
              </p>
            ) : (
              filteredWidgets.map((widget, i) => (
                <div
                  key={widget.id}
                  className="flex items-center gap-3 p-3 group transition-all anim-slide"
                  style={{
                    border: "2px solid var(--border)",
                    background: "var(--bg-card)",
                    boxShadow: "var(--shadow-neo-sm)",
                    animationDelay: `${i * 40}ms`,
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.transform = "translate(-2px,-2px)";
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "var(--shadow-neo)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.transform = "none";
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "var(--shadow-neo-sm)";
                  }}
                >
                  <span className="text-xl flex-none">{widget.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-black text-[var(--text-1)] uppercase truncate" style={{ fontFamily: "Space Mono" }}>
                        {widget.title}
                      </p>
                      <span className="neo-tag neo-tag-yellow text-[9px]">{widget.position}</span>
                      {widget.isFavorite && <span className="text-xs">⭐</span>}
                    </div>
                    <p className="text-[10px] text-[var(--text-3)] truncate font-mono">{widget.id}</p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <select
                      className="text-xs font-bold"
                      style={{ border: "2px solid var(--border)", background: "var(--bg-hover)", padding: "2px 6px", fontFamily: "Space Mono" }}
                      value={widget.position}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        const updated = widgets.map((w) =>
                          w.id === widget.id ? { ...w, position: e.target.value as WidgetPosition } : w
                        );
                        reorderWidgets(updated);
                      }}
                    >
                      {POSITIONS.map((p) => <option key={p.value} value={p.value}>{p.label.replace(/[◀▶▲▼] /g, "")}</option>)}
                    </select>
                    <button
                      onClick={() => setEditingId(widget.id)}
                      className="w-8 h-8 flex items-center justify-center font-black text-sm transition-all"
                      style={{ border: "2px solid var(--border)", background: "var(--neon-yellow)", color: "#0A0A0A", boxShadow: "var(--shadow-neo-sm)" }}
                      title="Modifier"
                    >
                      ✏
                    </button>
                    <button
                      onClick={() => removeWidget(widget.id)}
                      className="w-8 h-8 flex items-center justify-center font-black text-sm transition-all"
                      style={{ border: "2px solid var(--border)", background: "var(--accent)", color: "white", boxShadow: "var(--shadow-neo-sm)" }}
                      title="Supprimer"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* ── Infos système ─────────────────────────────────────────────── */}
        <section style={{ border: "2.5px solid var(--border)", boxShadow: "var(--shadow-neo)", background: "var(--bg-card)" }}>
          <div className="px-5 py-3 border-b-[2.5px] border-[var(--border)]"
            style={{ borderBottom: "2.5px solid var(--border)", background: "var(--neon-green)" }}>
            <p className="font-black text-black uppercase tracking-wide" style={{ fontFamily: "Space Mono" }}>
              ℹ Système
            </p>
          </div>
          <div className="p-4 grid grid-cols-2 gap-3">
            {[
              { k: "Utilisateur", v: user?.email ?? "—" },
              { k: "Rôle", v: user?.role ?? "—" },
              { k: "Persistance", v: "localStorage" },
              { k: "Framework", v: "Next.js + Zustand" },
            ].map((item) => (
              <div key={item.k} className="p-3"
                style={{ background: "var(--bg-hover)", border: "2px solid var(--border)", borderRadius: 0 }}>
                <p className="text-[10px] font-black uppercase text-[var(--text-3)] mb-1" style={{ fontFamily: "Space Mono" }}>
                  {item.k}
                </p>
                <p className="text-xs font-bold text-[var(--text-1)]">{item.v}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {editingId && <WidgetDataEditor widgetId={editingId} onClose={() => setEditingId(null)} />}
    </div>
  );
}
