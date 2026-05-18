"use client";

import { useWidgetStore } from "@/app/store/useWidgetStore";
import type { WidgetConfig } from "@/app/types";
import { useEffect, useState } from "react";

interface Props { widget: WidgetConfig }

/** Rendu compact du contenu selon le type */
function CompactContent({ widget }: { widget: WidgetConfig }) {
  const [time, setTime] = useState("");

  useEffect(() => {
    if (widget.type !== "clock") return;
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [widget.type]);

  switch (widget.type) {
    case "clock":
      return (
        <div className="flex flex-col items-center justify-center py-3">
          <p className="text-3xl font-bold tabular-nums text-[var(--text-1)] tracking-tight">{time}</p>
          <p className="text-xs text-[var(--text-3)] mt-1">
            {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
      );

    case "weather": {
      const wmoIcons: Record<number, string> = { 0:"☀️",1:"🌤",2:"⛅",3:"☁️",61:"🌧",80:"🌦",95:"⛈" };
      const icon = wmoIcons[widget.data.weathercode ?? 0] ?? "🌡";
      return (
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-3xl font-bold text-[var(--text-1)]">{widget.data.temperature ?? "--"}°C</p>
            <p className="text-xs text-[var(--text-3)]">{widget.data.condition ?? "Chargement…"}</p>
            <p className="text-xs text-[var(--text-3)]">{widget.data.city ?? "Paris"}</p>
          </div>
          <span className="text-4xl">{icon}</span>
        </div>
      );
    }

    case "stock": {
      const items = widget.data.items?.slice(0, 3) ?? [];
      return (
        <div className="space-y-1.5 py-1">
          {items.map((s: any) => (
            <div key={s.symbol} className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--text-1)]">{s.symbol}</span>
              <span className="text-xs font-mono text-[var(--text-2)]">{s.price.toLocaleString("fr-FR")}</span>
              <span className={`badge text-[10px] ${s.trend === "up" ? "badge-green" : "badge-red"}`}>
                {s.pct > 0 ? "+" : ""}{s.pct.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      );
    }

    case "crypto": {
      const items = widget.data.items?.slice(0, 3) ?? [];
      return (
        <div className="space-y-1.5 py-1">
          {items.map((s: any) => (
            <div key={s.symbol} className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--text-1)]">{s.symbol}</span>
              <span className="text-xs font-mono text-[var(--text-2)]">${s.price.toLocaleString()}</span>
              <span className={`badge text-[10px] ${s.trend === "up" ? "badge-green" : "badge-red"}`}>
                {s.pct > 0 ? "+" : ""}{s.pct.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      );
    }

    case "ainews": {
      const art = widget.data.articles?.[0];
      return (
        <div className="py-1">
          {art ? (
            <div>
              <p className="text-xs font-semibold text-[var(--text-1)] line-clamp-3 leading-snug">{art.title}</p>
              <p className="text-[10px] text-[var(--text-3)] mt-1.5">{art.source} · {art.time}</p>
            </div>
          ) : <p className="text-xs text-[var(--text-3)]">Chargement…</p>}
        </div>
      );
    }

    case "notes":
      return (
        <p className="text-xs text-[var(--text-2)] line-clamp-4 py-1 whitespace-pre-line leading-relaxed">
          {widget.data.content ?? "Pas de notes"}
        </p>
      );

    case "mood":
      return (
        <div className="flex items-center gap-3 py-2">
          <span className="text-4xl">{widget.data.emoji ?? "😊"}</span>
          <div>
            <p className="text-sm font-semibold text-[var(--text-1)] capitalize">{widget.data.current ?? "—"}</p>
            <p className="text-xs text-[var(--text-3)]">Intensité {widget.data.intensity ?? 0}/10</p>
          </div>
        </div>
      );

    case "activity": {
      const pct = widget.data.tasksTotal
        ? Math.round((widget.data.tasksCompleted / widget.data.tasksTotal) * 100)
        : 0;
      return (
        <div className="py-2 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-[var(--text-2)]">{widget.data.tasksCompleted}/{widget.data.tasksTotal} tâches</span>
            <span className="font-semibold text-[var(--text-1)]">{pct}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-[var(--bg-hover)] overflow-hidden">
            <div className="h-full rounded-full bg-[var(--accent)] transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-xs text-[var(--text-3)]">🔥 {widget.data.streak ?? 0} jours de suite</p>
        </div>
      );
    }

    case "music": {
      const t = widget.data.track;
      return (
        <div className="py-2">
          <p className="text-sm font-semibold text-[var(--text-1)] truncate">{t?.title ?? "—"}</p>
          <p className="text-xs text-[var(--text-3)] truncate">{t?.artist ?? "—"}</p>
          <div className="mt-2 h-1 rounded-full bg-[var(--bg-hover)] overflow-hidden">
            <div
              className="h-full bg-[var(--accent)] rounded-full"
              style={{ width: t ? `${Math.round((t.progress / t.duration) * 100)}%` : "0%" }}
            />
          </div>
          <p className="text-[10px] text-[var(--text-3)] mt-1">
            {widget.data.isPlaying ? "▶ En cours" : "⏸ En pause"}
          </p>
        </div>
      );
    }

    case "timer": {
      const s = widget.data.secondsLeft ?? 0;
      const m = Math.floor(s / 60);
      const sec = s % 60;
      return (
        <div className="flex flex-col items-center py-2">
          <p className="text-3xl font-bold tabular-nums text-[var(--text-1)]">
            {String(m).padStart(2, "0")}:{String(sec).padStart(2, "0")}
          </p>
          <p className="text-xs text-[var(--text-3)] mt-1">Session {widget.data.session}/{widget.data.totalSessions}</p>
        </div>
      );
    }

    case "quote":
      return (
        <div className="py-2">
          <p className="text-xs italic text-[var(--text-1)] leading-relaxed line-clamp-3">"{widget.data.text}"</p>
          <p className="text-[10px] text-[var(--text-3)] mt-1.5">— {widget.data.author}</p>
        </div>
      );

    default:
      return <p className="text-xs text-[var(--text-3)] py-2">Widget non configuré</p>;
  }
}

export function CompactWidget({ widget }: Props) {
  const { expandWidget, removeWidget, toggleFavorite } = useWidgetStore();

  return (
    <div
      className="widget-card group p-4"
      onClick={() => expandWidget(widget.id)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-base flex-none">{widget.icon}</span>
          <p className="text-xs font-semibold text-[var(--text-2)] truncate">{widget.title}</p>
        </div>
        {/* Actions apparaissent au hover */}
        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-none ml-2">
          <button
            onClick={(e) => { e.stopPropagation(); toggleFavorite(widget.id); }}
            className="btn-icon w-6 h-6"
            title={widget.isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
          >
            <span className="text-xs">{widget.isFavorite ? "★" : "☆"}</span>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); removeWidget(widget.id); }}
            className="btn-icon w-6 h-6 hover:!bg-red-50 hover:!text-red-500"
            title="Supprimer"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Contenu */}
      <CompactContent widget={widget} />

      {/* Footer */}
      <div className="mt-2 pt-2 border-t border-[var(--border)] flex items-center justify-between">
        <span className="text-[10px] text-[var(--text-3)]">Cliquer pour détailler</span>
        <svg width="12" height="12" className="text-[var(--text-3)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </div>
    </div>
  );
}
