"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useWidgetStore, WIDGET_CATALOG, createDefaultWidget } from "@/app/store/useWidgetStore";
import { useAuth } from "@/app/store/AuthContext";
import type { WidgetType, WidgetPosition } from "@/app/types";

const POSITIONS: { label: string; value: WidgetPosition }[] = [
  { label: "Gauche", value: "left" },
  { label: "Droite", value: "right" },
  { label: "Haut", value: "top" },
  { label: "Bas", value: "bottom" },
];

/* ── Éditeur de données d'un widget ──────────────────────────────────────────── */
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
    } catch (e: any) {
      setErr("JSON invalide : " + e.message);
    }
  };

  // Éditeurs spécialisés par type
  const renderSpecialized = () => {
    switch (widget.type) {
      case "notes":
        return (
          <div className="space-y-2">
            <label className="text-xs font-medium text-[var(--text-2)]">Contenu de la note</label>
            <textarea
              className="textarea-base"
              rows={6}
              value={widget.data.content ?? ""}
              onChange={(e) => updateWidgetData(widgetId, { content: e.target.value })}
            />
          </div>
        );

      case "weather":
        return (
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--text-2)]">Ville</label>
              <input className="input-base" value={widget.data.city ?? ""} onChange={(e) => updateWidgetData(widgetId, { city: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-[var(--text-2)]">Température (°C)</label>
                <input type="number" className="input-base" value={widget.data.temperature ?? 0} onChange={(e) => updateWidgetData(widgetId, { temperature: Number(e.target.value) })} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-[var(--text-2)]">Condition</label>
                <input className="input-base" value={widget.data.condition ?? ""} onChange={(e) => updateWidgetData(widgetId, { condition: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-[var(--text-2)]">Humidité (%)</label>
                <input type="number" className="input-base" value={widget.data.humidity ?? 0} onChange={(e) => updateWidgetData(widgetId, { humidity: Number(e.target.value) })} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-[var(--text-2)]">Vent (km/h)</label>
                <input type="number" className="input-base" value={widget.data.windSpeed ?? 0} onChange={(e) => updateWidgetData(widgetId, { windSpeed: Number(e.target.value) })} />
              </div>
            </div>
          </div>
        );

      case "ainews":
        return (
          <div className="space-y-3">
            <p className="text-xs text-[var(--text-3)]">Modifier les articles (JSON brut)</p>
            <textarea
              className="textarea-base font-mono text-xs"
              rows={8}
              value={data}
              onChange={(e) => setData(e.target.value)}
            />
            {err && <p className="text-xs text-[var(--red)]">{err}</p>}
            <button onClick={handleSave} className="btn-primary">
              {saved ? "✓ Sauvegardé" : "Appliquer"}
            </button>
          </div>
        );

      case "mood":
        return (
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--text-2)]">Humeur actuelle</label>
              <select
                className="input-base"
                value={widget.data.current ?? "happy"}
                onChange={(e) => {
                  const moods: Record<string, string> = { happy: "😊", focused: "🎯", energetic: "⚡", calm: "😌", stressed: "😰" };
                  updateWidgetData(widgetId, { current: e.target.value, emoji: moods[e.target.value] ?? "😊" });
                }}
              >
                {["happy", "focused", "energetic", "calm", "stressed"].map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--text-2)]">Intensité (1–10)</label>
              <input type="range" min={1} max={10} value={widget.data.intensity ?? 5}
                onChange={(e) => updateWidgetData(widgetId, { intensity: Number(e.target.value) })}
                className="w-full"
              />
              <p className="text-xs text-[var(--text-3)]">{widget.data.intensity ?? 5}/10</p>
            </div>
          </div>
        );

      case "quote":
        return (
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--text-2)]">Citation</label>
              <textarea className="textarea-base" rows={3} value={widget.data.text ?? ""}
                onChange={(e) => updateWidgetData(widgetId, { text: e.target.value })} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--text-2)]">Auteur</label>
              <input className="input-base" value={widget.data.author ?? ""}
                onChange={(e) => updateWidgetData(widgetId, { author: e.target.value })} />
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-2">
            <label className="text-xs font-medium text-[var(--text-2)]">Données (JSON)</label>
            <textarea className="textarea-base font-mono text-xs" rows={8} value={data}
              onChange={(e) => setData(e.target.value)} />
            {err && <p className="text-xs text-[var(--red)]">{err}</p>}
            <button onClick={handleSave} className="btn-primary">
              {saved ? "✓ Sauvegardé" : "Appliquer le JSON"}
            </button>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-lg bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] shadow-[var(--shadow-xl)] overflow-hidden anim-scale"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">{widget.icon}</span>
            <div>
              <p className="font-semibold text-[var(--text-1)]">Modifier — {widget.title}</p>
              <p className="text-xs text-[var(--text-3)]">Les changements sont appliqués immédiatement</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon">✕</button>
        </div>
        <div className="p-5">{renderSpecialized()}</div>
      </div>
    </div>
  );
}

/* ── Page Admin ───────────────────────────────────────────────────────────── */
export default function AdminPage() {
  const router = useRouter();
  const { user, isAdmin, isAuthenticated, logout } = useAuth();
  const { widgets, removeWidget, resetWidgets, addWidget, reorderWidgets } = useWidgetStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<WidgetType | null>(null);
  const [selectedPos, setSelectedPos] = useState<WidgetPosition>("left");
  const [addedMsg, setAddedMsg] = useState(false);
  const [filterType, setFilterType] = useState<string>("tous");
  const [confirmReset, setConfirmReset] = useState(false);

  // Redirige les non-admins
  useEffect(() => {
    if (!isAuthenticated) { router.replace("/login"); return; }
    if (!isAdmin) { router.replace("/"); }
  }, [isAuthenticated, isAdmin, router]);

  if (!isAdmin) return null;

  const handleAddWidget = () => {
    if (!selectedType) return;
    addWidget(selectedType, selectedPos);
    setAddedMsg(true);
    setSelectedType(null);
    setTimeout(() => setAddedMsg(false), 2000);
  };

  const handleLogout = () => { logout(); router.replace("/login"); };

  const filteredWidgets = filterType === "tous" ? widgets : widgets.filter((w) => w.type === filterType);
  const uniqueTypes = ["tous", ...Array.from(new Set(widgets.map((w) => w.type)))];

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col">
      {/* Header admin */}
      <header className="flex-none h-14 px-5 flex items-center justify-between border-b border-[var(--border)] bg-[var(--bg-card)] shadow-[var(--shadow-xs)]">
        <div className="flex items-center gap-3">
          <Link href="/">
            <button className="btn-icon" title="Retour au dashboard">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 5l-7 7 7 7"/>
              </svg>
            </button>
          </Link>
          <div className="h-5 w-px bg-[var(--border)]" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center">
              <span className="text-white font-bold text-xs">O</span>
            </div>
            <span className="font-semibold text-[var(--text-1)]">Administration</span>
            <span className="badge badge-accent">Admin</span>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-sm text-[var(--text-2)]">{user?.displayName}</span>
          <button onClick={handleLogout} className="btn-secondary text-xs px-3 py-1.5 h-auto">
            Déconnexion
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 max-w-5xl mx-auto w-full space-y-6">

        {/* Stats rapides */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Widgets actifs", value: widgets.length, icon: "📊" },
            { label: "Favoris", value: widgets.filter((w) => w.isFavorite).length, icon: "⭐" },
            { label: "Gauche", value: widgets.filter((w) => w.position === "left").length, icon: "◀" },
            { label: "Droite", value: widgets.filter((w) => w.position === "right").length, icon: "▶" },
          ].map((s) => (
            <div key={s.label} className="stat-card flex items-center gap-3">
              <span className="text-2xl">{s.icon}</span>
              <div>
                <p className="text-2xl font-bold text-[var(--text-1)]">{s.value}</p>
                <p className="text-xs text-[var(--text-3)]">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Ajouter un widget ── */}
        <section className="card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-[var(--text-1)]">Ajouter un widget</h2>
            {addedMsg && <span className="text-sm text-[var(--green)] font-medium">✓ Widget ajouté !</span>}
          </div>

          {/* Catalogue */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {WIDGET_CATALOG.map((item) => (
              <button
                key={item.type}
                onClick={() => setSelectedType(item.type as WidgetType)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedType === item.type
                    ? "border-[var(--accent)] bg-[var(--accent-light)]"
                    : "border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--accent)]/30 hover:shadow-[var(--shadow-sm)]"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{item.icon}</span>
                  <p className="text-xs font-semibold text-[var(--text-1)] truncate">{item.title}</p>
                </div>
                <p className="text-[10px] text-[var(--text-3)] line-clamp-2">{item.description}</p>
              </button>
            ))}
          </div>

          {/* Position + bouton */}
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[var(--border)]">
            <span className="text-xs font-medium text-[var(--text-2)]">Position :</span>
            <div className="flex gap-2">
              {POSITIONS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setSelectedPos(p.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    selectedPos === p.value
                      ? "bg-[var(--accent)] text-white"
                      : "bg-[var(--bg-hover)] text-[var(--text-2)] hover:bg-[var(--bg-active)]"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <div className="flex-1" />
            <button
              onClick={handleAddWidget}
              disabled={!selectedType}
              className={`btn-primary ${!selectedType ? "opacity-40 cursor-not-allowed" : ""}`}
            >
              + Ajouter au dashboard
            </button>
          </div>
        </section>

        {/* ── Liste des widgets actifs ── */}
        <section className="card p-5 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="font-semibold text-[var(--text-1)]">
              Widgets actifs
              <span className="ml-2 text-xs text-[var(--text-3)] font-normal">({filteredWidgets.length}/{widgets.length})</span>
            </h2>
            <div className="flex items-center gap-2">
              {/* Filtre par type */}
              <div className="flex gap-1.5 overflow-x-auto">
                {uniqueTypes.map((t) => (
                  <button
                    key={t}
                    onClick={() => setFilterType(t)}
                    className={`flex-none px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-colors ${
                      filterType === t
                        ? "bg-[var(--accent)] text-white"
                        : "bg-[var(--bg-hover)] text-[var(--text-2)] hover:bg-[var(--bg-active)]"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              {/* Reset */}
              {confirmReset ? (
                <div className="flex gap-1">
                  <button onClick={() => { resetWidgets(); setConfirmReset(false); }}
                    className="px-3 py-1 text-xs rounded-lg bg-[var(--red)] text-white font-medium">
                    Confirmer
                  </button>
                  <button onClick={() => setConfirmReset(false)} className="px-3 py-1 text-xs rounded-lg bg-[var(--bg-hover)] text-[var(--text-2)]">
                    Annuler
                  </button>
                </div>
              ) : (
                <button onClick={() => setConfirmReset(true)}
                  className="px-3 py-1 text-xs rounded-lg bg-[var(--red-light)] text-[var(--red)] font-medium hover:bg-[var(--red)] hover:text-white transition-colors">
                  Réinitialiser
                </button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            {filteredWidgets.length === 0 ? (
              <p className="text-sm text-[var(--text-3)] py-4 text-center">Aucun widget. Ajoutez-en un ci-dessus.</p>
            ) : (
              filteredWidgets.map((widget) => (
                <div
                  key={widget.id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--accent)]/20 transition-all group"
                >
                  <span className="text-xl flex-none">{widget.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-[var(--text-1)] truncate">{widget.title}</p>
                      <span className="badge badge-accent text-[10px] capitalize">{widget.position}</span>
                      {widget.isFavorite && <span className="text-xs">⭐</span>}
                    </div>
                    <p className="text-xs text-[var(--text-3)] truncate font-mono">{widget.id}</p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* Changer position rapide */}
                    <select
                      className="text-xs border border-[var(--border)] rounded-lg px-2 py-1 bg-[var(--bg-hover)] text-[var(--text-2)] cursor-pointer"
                      value={widget.position}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        const updated = widgets.map((w) =>
                          w.id === widget.id ? { ...w, position: e.target.value as WidgetPosition } : w
                        );
                        reorderWidgets(updated);
                      }}
                    >
                      {POSITIONS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </select>
                    {/* Modifier les données */}
                    <button
                      onClick={() => setEditingId(widget.id)}
                      className="btn-icon"
                      title="Modifier les données"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    {/* Supprimer */}
                    <button
                      onClick={() => removeWidget(widget.id)}
                      className="btn-icon hover:!bg-[var(--red-light)] hover:!text-[var(--red)]"
                      title="Supprimer"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        <line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* ── Infos système ── */}
        <section className="card p-5 space-y-3">
          <h2 className="font-semibold text-[var(--text-1)]">Informations système</h2>
          <div className="grid grid-cols-2 gap-2 text-xs text-[var(--text-2)]">
            <div className="stat-card">
              <p className="text-[var(--text-3)] mb-1">Utilisateur connecté</p>
              <p className="font-medium text-[var(--text-1)]">{user?.email}</p>
            </div>
            <div className="stat-card">
              <p className="text-[var(--text-3)] mb-1">Rôle</p>
              <p className="font-medium text-[var(--text-1)] capitalize">{user?.role}</p>
            </div>
            <div className="stat-card">
              <p className="text-[var(--text-3)] mb-1">Persistance</p>
              <p className="font-medium text-[var(--text-1)]">localStorage (orbitdash-v2)</p>
            </div>
            <div className="stat-card">
              <p className="text-[var(--text-3)] mb-1">Framework</p>
              <p className="font-medium text-[var(--text-1)]">Next.js 16 + Zustand</p>
            </div>
          </div>
        </section>
      </div>

      {/* Modal éditeur de widget */}
      {editingId && (
        <WidgetDataEditor widgetId={editingId} onClose={() => setEditingId(null)} />
      )}
    </div>
  );
}
