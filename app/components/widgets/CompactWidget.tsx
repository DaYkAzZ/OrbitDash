"use client";

import { useWidgetStore } from "@/app/store/useWidgetStore";
import { useDragDrop } from "@/app/hooks/useDragDrop";
import { useAuth } from "@/app/store/AuthContext";
import type { WidgetConfig } from "@/app/types";
import { useEffect, useState } from "react";

interface Props {
  widget: WidgetConfig;
  onClickOverride?: () => void;
}

function CompactContent({ widget }: { widget: WidgetConfig }) {
  const [time, setTime] = useState("");

  useEffect(() => {
    if (widget.type !== "clock") return;
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [widget.type]);

  switch (widget.type) {
    case "clock":
      return (
        <div className="flex flex-col items-center justify-center py-2">
          <p className="text-2xl font-bold tabular-nums text-[var(--text-1)] tracking-tight">{time}</p>
          <p className="text-[10px] text-[var(--text-3)] mt-1 font-medium">
            {new Date().toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })}
          </p>
        </div>
      );

    case "weather": {
      const wmoIcons: Record<number, string> = { 0:"☀️",1:"🌤",2:"⛅",3:"☁️",61:"🌧",80:"🌦",95:"⛈" };
      const icon = wmoIcons[widget.data.weathercode ?? 0] ?? "🌡";
      return (
        <div className="flex items-center justify-between py-1">
          <div>
            <p className="text-2xl font-bold text-[var(--text-1)]">{widget.data.temperature ?? "--"}°C</p>
            <p className="text-[10px] text-[var(--text-3)]">{widget.data.condition ?? "…"}</p>
            <p className="text-[10px] text-[var(--text-3)]">{widget.data.city ?? "Paris"}</p>
          </div>
          <span className="text-3xl">{icon}</span>
        </div>
      );
    }

    case "stock":
    case "crypto": {
      const items = widget.data.items?.slice(0, 3) ?? [];
      return (
        <div className="space-y-1.5 py-1">
          {items.map((s: any) => (
            <div key={s.symbol} className="flex items-center justify-between gap-1">
              <span className="text-[11px] font-semibold text-[var(--text-1)]">{s.symbol}</span>
              <span className="text-[11px] tabular-nums text-[var(--text-2)]">
                {widget.type === "crypto" ? "$" : ""}{s.price.toLocaleString()}
              </span>
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${s.trend === "up" ? "bg-[var(--green-light)] text-[var(--green)]" : "bg-[var(--red-light)] text-[var(--red)]"}`}>
                {s.pct > 0 ? "+" : ""}{s.pct.toFixed(1)}%
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
              <p className="text-xs font-medium text-[var(--text-1)] line-clamp-3 leading-snug">{art.title}</p>
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
        <div className="flex items-center gap-3 py-1">
          <span className="text-3xl">{widget.data.emoji ?? "😊"}</span>
          <div>
            <p className="text-sm font-semibold text-[var(--text-1)] capitalize">{widget.data.current ?? "—"}</p>
            <p className="text-[10px] text-[var(--text-3)]">{widget.data.intensity ?? 0}/10</p>
          </div>
        </div>
      );

    case "activity": {
      const pct = widget.data.tasksTotal
        ? Math.round((widget.data.tasksCompleted / widget.data.tasksTotal) * 100) : 0;
      return (
        <div className="py-1 space-y-2">
          <div className="flex justify-between text-[11px]">
            <span className="text-[var(--text-2)]">{widget.data.tasksCompleted}/{widget.data.tasksTotal}</span>
            <span className="font-semibold text-[var(--text-1)]">{pct}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-[var(--bg-hover)] overflow-hidden">
            <div className="h-full rounded-full bg-[var(--accent)] transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-[10px] text-[var(--text-3)]">🔥 {widget.data.streak ?? 0} jours</p>
        </div>
      );
    }

    case "music": {
      const t = widget.data.track;
      return (
        <div className="py-1">
          <p className="text-sm font-semibold text-[var(--text-1)] truncate">{t?.title ?? "—"}</p>
          <p className="text-[10px] text-[var(--text-3)] truncate">{t?.artist ?? "—"}</p>
          <div className="mt-2 h-1 rounded-full bg-[var(--bg-hover)] overflow-hidden">
            <div className="h-full bg-[var(--accent)] rounded-full"
              style={{ width: t ? `${Math.round((t.progress / t.duration) * 100)}%` : "0%" }} />
          </div>
          <p className="text-[10px] text-[var(--text-3)] mt-1">{widget.data.isPlaying ? "▶ En cours" : "⏸ En pause"}</p>
        </div>
      );
    }

    case "timer": {
      const s = widget.data.secondsLeft ?? 0;
      const m = Math.floor(s / 60);
      const sec = s % 60;
      return (
        <div className="flex flex-col items-center py-1">
          <p className="text-2xl font-bold tabular-nums text-[var(--text-1)]">
            {String(m).padStart(2, "0")}:{String(sec).padStart(2, "0")}
          </p>
          <p className="text-[10px] text-[var(--text-3)] mt-1">Session {widget.data.session}/{widget.data.totalSessions}</p>
        </div>
      );
    }

    case "quote":
      return (
        <div className="py-1">
          <p className="text-xs italic text-[var(--text-1)] leading-relaxed line-clamp-3">"{widget.data.text}"</p>
          <p className="text-[10px] text-[var(--text-3)] mt-1.5">— {widget.data.author}</p>
        </div>
      );

    default:
      return <p className="text-xs text-[var(--text-3)] py-2">Non configuré</p>;
  }
}

export function CompactWidget({ widget, onClickOverride }: Props) {
  const { removeWidget, toggleFavorite } = useWidgetStore();
  const { onDragStart, onDragEnd, onDragOver, onDrop } = useDragDrop();
  const { isAdmin } = useAuth();
  const [isDragOver, setIsDragOver] = useState(false);

  const isFocusable = onClickOverride !== undefined;

  return (
    <div
      // Drag activé uniquement pour les admins
      draggable={isAdmin}
      onDragStart={isAdmin ? onDragStart(widget.id) : undefined}
      onDragEnd={isAdmin ? onDragEnd : undefined}
      onDragOver={isAdmin ? (e) => { onDragOver(e); setIsDragOver(true); } : undefined}
      onDragLeave={isAdmin ? () => setIsDragOver(false) : undefined}
      onDrop={isAdmin ? (e) => { onDrop(widget.id, widget.position)(e); setIsDragOver(false); } : undefined}
      onClick={isFocusable ? onClickOverride : undefined}
      className="group select-none widget-card flex flex-col !p-0 overflow-hidden"
      style={{
        transform: isDragOver ? "scale(1.02)" : undefined,
        cursor: isFocusable ? "pointer" : "default",
        boxShadow: isDragOver ? "var(--shadow-lg)" : undefined,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border)] bg-[var(--bg-hover)]">
        <div className="flex items-center gap-2 min-w-0">
          {/* Handle drag visible seulement pour admin */}
          {isAdmin && (
            <span
              className="cursor-grab active:cursor-grabbing flex-none text-[var(--text-3)] opacity-40 hover:opacity-100 transition-opacity text-sm"
              title="Glisser pour déplacer"
            >
              ⠿
            </span>
          )}
          <span className="text-base flex-none">{widget.icon}</span>
          <p className="text-[11px] font-semibold text-[var(--text-1)] truncate">{widget.title}</p>
        </div>

        {/* Boutons d'action : visibles uniquement pour admin */}
        {isAdmin && (
          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-none">
            <button
              onClick={(e) => { e.stopPropagation(); toggleFavorite(widget.id); }}
              className="w-6 h-6 flex items-center justify-center text-xs text-[var(--text-3)] hover:text-[var(--yellow)] transition-colors"
              title="Favori"
            >
              {widget.isFavorite ? "★" : "☆"}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); removeWidget(widget.id); }}
              className="w-6 h-6 flex items-center justify-center text-xs rounded bg-[var(--red-light)] text-[var(--red)] hover:bg-[var(--red)] hover:text-white transition-colors"
              title="Supprimer (admin)"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Contenu */}
      <div className="px-3 pb-3 pt-2 flex-1">
        <CompactContent widget={widget} />
      </div>

      {/* Footer */}
      <div className="px-3 py-1.5 flex items-center justify-between border-t border-[var(--border)] bg-[var(--bg-hover)]">
        {isFocusable ? (
          <>
            <span className="text-[9px] font-medium text-[var(--text-3)]">Cliquer pour détail</span>
            <span className="text-[var(--accent)] text-[10px]">→</span>
          </>
        ) : (
          <span className="text-[9px] text-[var(--text-3)] italic">In-place uniquement</span>
        )}
      </div>
    </div>
  );
}
