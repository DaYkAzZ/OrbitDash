"use client";

import { useWidgetStore } from "@/app/store/useWidgetStore";
import { useDragDrop } from "@/app/hooks/useDragDrop";
import type { WidgetConfig } from "@/app/types";
import { useEffect, useState } from "react";

interface Props {
  widget: WidgetConfig;
  onClickOverride?: () => void;
}

/* ── Couleur accent par type ─────────────────────────────────────────────── */
const WIDGET_ACCENT: Record<string, { bg: string; fg: string }> = {
  clock:    { bg: "var(--neon-yellow)", fg: "#0A0A0A" },
  weather:  { bg: "var(--neon-cyan)",   fg: "#0A0A0A" },
  stock:    { bg: "var(--neon-green)",  fg: "#0A0A0A" },
  crypto:   { bg: "var(--neon-green)",  fg: "#0A0A0A" },
  ainews:   { bg: "var(--neon-blue)",   fg: "#FFFFFF" },
  notes:    { bg: "var(--neon-yellow)", fg: "#0A0A0A" },
  mood:     { bg: "var(--neon-pink)",   fg: "#FFFFFF" },
  activity: { bg: "var(--neon-orange)", fg: "#FFFFFF" },
  music:    { bg: "var(--neon-purple)", fg: "#FFFFFF" },
  timer:    { bg: "var(--accent)",      fg: "#FFFFFF" },
  quote:    { bg: "var(--neon-cyan)",   fg: "#0A0A0A" },
};

/* ── Contenu compact ─────────────────────────────────────────────────────── */
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
          <p className="text-2xl font-black tabular-nums text-[var(--text-1)] tracking-tight" style={{ fontFamily: "Space Mono" }}>
            {time}
          </p>
          <p className="text-[10px] text-[var(--text-3)] mt-1 font-bold uppercase tracking-wider">
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
            <p className="text-2xl font-black text-[var(--text-1)]" style={{ fontFamily: "Space Mono" }}>
              {widget.data.temperature ?? "--"}°C
            </p>
            <p className="text-[10px] text-[var(--text-3)] font-bold uppercase">{widget.data.condition ?? "…"}</p>
            <p className="text-[10px] text-[var(--text-3)] font-bold">{widget.data.city ?? "Paris"}</p>
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
              <span className="text-[11px] font-black text-[var(--text-1)]" style={{ fontFamily: "Space Mono" }}>{s.symbol}</span>
              <span className="text-[11px] font-mono text-[var(--text-2)]">{widget.type === "crypto" ? "$" : ""}{s.price.toLocaleString()}</span>
              <span
                className="text-[10px] font-black px-1.5 py-0.5"
                style={{
                  fontFamily: "Space Mono",
                  background: s.trend === "up" ? "var(--neon-green)" : "var(--accent)",
                  color: s.trend === "up" ? "#0A0A0A" : "white",
                  border: "1.5px solid var(--border)",
                }}
              >
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
              <p className="text-xs font-bold text-[var(--text-1)] line-clamp-3 leading-snug">{art.title}</p>
              <p className="text-[10px] text-[var(--text-3)] mt-1.5 font-black uppercase" style={{ fontFamily: "Space Mono" }}>
                {art.source} · {art.time}
              </p>
            </div>
          ) : <p className="text-xs text-[var(--text-3)]">Chargement…</p>}
        </div>
      );
    }

    case "notes":
      return (
        <p className="text-xs text-[var(--text-2)] line-clamp-4 py-1 whitespace-pre-line leading-relaxed font-medium">
          {widget.data.content ?? "Pas de notes"}
        </p>
      );

    case "mood":
      return (
        <div className="flex items-center gap-3 py-1">
          <span className="text-3xl">{widget.data.emoji ?? "😊"}</span>
          <div>
            <p className="text-sm font-black text-[var(--text-1)] capitalize uppercase" style={{ fontFamily: "Space Mono" }}>
              {widget.data.current ?? "—"}
            </p>
            <p className="text-[10px] text-[var(--text-3)] font-bold">{widget.data.intensity ?? 0}/10</p>
          </div>
        </div>
      );

    case "activity": {
      const pct = widget.data.tasksTotal
        ? Math.round((widget.data.tasksCompleted / widget.data.tasksTotal) * 100) : 0;
      return (
        <div className="py-1 space-y-2">
          <div className="flex justify-between text-[11px]">
            <span className="font-bold text-[var(--text-2)]">{widget.data.tasksCompleted}/{widget.data.tasksTotal}</span>
            <span className="font-black text-[var(--text-1)]" style={{ fontFamily: "Space Mono" }}>{pct}%</span>
          </div>
          <div style={{ height: "8px", background: "var(--bg-hover)", border: "2px solid var(--border)" }}>
            <div style={{ width: `${pct}%`, height: "100%", background: "var(--neon-green)", transition: "width .5s" }} />
          </div>
          <p className="text-[10px] text-[var(--text-3)] font-bold">🔥 {widget.data.streak ?? 0} jours</p>
        </div>
      );
    }

    case "music": {
      const t = widget.data.track;
      return (
        <div className="py-1">
          <p className="text-sm font-black text-[var(--text-1)] truncate uppercase" style={{ fontFamily: "Space Mono" }}>
            {t?.title ?? "—"}
          </p>
          <p className="text-[10px] text-[var(--text-3)] truncate font-bold">{t?.artist ?? "—"}</p>
          <div style={{ marginTop: "8px", height: "6px", background: "var(--bg-hover)", border: "2px solid var(--border)" }}>
            <div style={{ width: t ? `${Math.round((t.progress / t.duration) * 100)}%` : "0%", height: "100%", background: "var(--neon-purple)" }} />
          </div>
          <p className="text-[10px] text-[var(--text-3)] mt-1 font-bold uppercase" style={{ fontFamily: "Space Mono" }}>
            {widget.data.isPlaying ? "▶ Playing" : "⏸ Paused"}
          </p>
        </div>
      );
    }

    case "timer": {
      const s = widget.data.secondsLeft ?? 0;
      const m = Math.floor(s / 60);
      const sec = s % 60;
      return (
        <div className="flex flex-col items-center py-1">
          <p className="text-2xl font-black tabular-nums text-[var(--text-1)]" style={{ fontFamily: "Space Mono" }}>
            {String(m).padStart(2, "0")}:{String(sec).padStart(2, "0")}
          </p>
          <p className="text-[10px] text-[var(--text-3)] mt-1 font-bold uppercase">
            Session {widget.data.session}/{widget.data.totalSessions}
          </p>
        </div>
      );
    }

    case "quote":
      return (
        <div className="py-1">
          <p className="text-xs italic text-[var(--text-1)] leading-relaxed line-clamp-3 font-medium">
            "{widget.data.text}"
          </p>
          <p className="text-[10px] text-[var(--text-3)] mt-1.5 font-black uppercase" style={{ fontFamily: "Space Mono" }}>
            — {widget.data.author}
          </p>
        </div>
      );

    default:
      return <p className="text-xs text-[var(--text-3)] py-2">Non configuré</p>;
  }
}

/* ── CompactWidget néobrut ────────────────────────────────────────────────── */
export function CompactWidget({ widget, onClickOverride }: Props) {
  const { removeWidget, toggleFavorite } = useWidgetStore();
  const { onDragStart, onDragEnd, onDragOver, onDrop } = useDragDrop();
  const [isDragOver, setIsDragOver] = useState(false);

  const isFocusable = onClickOverride !== undefined;
  const accent = WIDGET_ACCENT[widget.type] ?? { bg: "var(--neon-yellow)", fg: "#0A0A0A" };

  return (
    <div
      draggable
      onDragStart={onDragStart(widget.id)}
      onDragEnd={onDragEnd}
      onDragOver={(e) => { onDragOver(e); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => { onDrop(widget.id, widget.position)(e); setIsDragOver(false); }}
      onClick={isFocusable ? onClickOverride : undefined}
      className="group select-none widget-card flex flex-col !p-0 overflow-hidden"
      style={{
        transform: isDragOver ? "scale(1.02)" : undefined,
        cursor: isFocusable ? "pointer" : "default",
        boxShadow: isDragOver ? "var(--shadow-lg)" : undefined,
      }}
    >
      {/* ── Header coloré ────────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-3 py-2"
        style={{
          background: accent.bg + "22",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="flex items-center gap-2 min-w-0">
          {/* Drag handle */}
          <div
            className="cursor-grab active:cursor-grabbing flex-none opacity-50 hover:opacity-100 transition-opacity"
            style={{ fontFamily: "Space Mono", fontSize: "10px", color: accent.fg, letterSpacing: "0.1em" }}
          >
            ⠿
          </div>
          <span className="text-base flex-none">{widget.icon}</span>
          <p
            className="text-[11px] font-black truncate uppercase tracking-wide"
            style={{ color: "var(--text-1)" }}
          >
            {widget.title}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-none">
          <button
            onClick={(e) => { e.stopPropagation(); toggleFavorite(widget.id); }}
            className="w-6 h-6 flex items-center justify-center text-xs transition-all hover:scale-125"
            style={{ color: accent.fg, fontWeight: 900 }}
            title="Favori"
          >
            {widget.isFavorite ? "★" : "☆"}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); removeWidget(widget.id); }}
            className="w-6 h-6 flex items-center justify-center text-xs font-black transition-all"
            style={{
              background: "var(--accent)",
              color: "white",
              border: "1.5px solid var(--border)",
            }}
            title="Supprimer"
          >
            ✕
          </button>
        </div>
      </div>

      {/* ── Contenu ─────────────────────────────────────────────────────── */}
      <div className="px-3 pb-3 pt-2 flex-1">
        <CompactContent widget={widget} />
      </div>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <div
        className="px-3 py-1.5 flex items-center justify-between"
        style={{ borderTop: "2px solid var(--border)", background: "var(--bg-hover)" }}
      >
        {isFocusable ? (
          <>
            <span
              className="text-[9px] font-black uppercase tracking-wider text-[var(--text-3)]"
              style={{ fontFamily: "Space Mono" }}
            >
              Cliquer pour détail
            </span>
            <span style={{ color: "var(--accent)", fontWeight: 900, fontSize: "10px" }}>→</span>
          </>
        ) : (
          <span
            className="text-[9px] font-black uppercase tracking-wider text-[var(--text-3)] italic"
            style={{ fontFamily: "Space Mono" }}
          >
            In-place only
          </span>
        )}
      </div>
    </div>
  );
}
