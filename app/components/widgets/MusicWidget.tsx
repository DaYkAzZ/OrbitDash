"use client";
import { useState } from "react";
import type { WidgetConfig } from "@/app/types";
import { useWidgetStore } from "@/app/store/useWidgetStore";

export function MusicWidgetExpanded({ widget, onClose }: { widget: WidgetConfig; onClose: () => void }) {
  const { updateWidgetData } = useWidgetStore();
  const [isPlaying, setIsPlaying] = useState(widget.data.isPlaying ?? false);
  const track = widget.data.track ?? {};
  const queue = widget.data.queue ?? [];

  const toggle = () => {
    setIsPlaying((p: boolean) => !p);
    updateWidgetData(widget.id, { isPlaying: !isPlaying });
  };

  const pct = track.duration ? Math.round((track.progress / track.duration) * 100) : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Track actuel */}
      <div className="flex flex-col items-center gap-4 py-4">
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[var(--accent)] to-purple-600 flex items-center justify-center text-4xl shadow-lg">
          🎵
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-[var(--text-1)]">{track.title ?? "—"}</p>
          <p className="text-sm text-[var(--text-3)]">{track.artist ?? "—"}</p>
          <p className="text-xs text-[var(--text-3)]">{track.album}</p>
        </div>
      </div>

      {/* Barre de progression */}
      <div className="space-y-2">
        <div className="h-1.5 rounded-full bg-[var(--bg-hover)] overflow-hidden cursor-pointer">
          <div className="h-full rounded-full bg-[var(--accent)] transition-all" style={{ width: `${pct}%` }} />
        </div>
        <div className="flex justify-between text-xs text-[var(--text-3)]">
          <span>{Math.floor(track.progress / 60)}:{String(track.progress % 60).padStart(2, "0")}</span>
          <span>{Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, "0")}</span>
        </div>
      </div>

      {/* Contrôles */}
      <div className="flex items-center justify-center gap-6">
        <button className="btn-icon w-10 h-10 text-[var(--text-2)]">⏮</button>
        <button onClick={toggle} className="w-14 h-14 rounded-full bg-[var(--accent)] text-white text-2xl flex items-center justify-center shadow-md hover:bg-[var(--accent-hover)] transition-colors">
          {isPlaying ? "⏸" : "▶"}
        </button>
        <button className="btn-icon w-10 h-10 text-[var(--text-2)]">⏭</button>
      </div>

      {/* File d'attente */}
      {queue.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-3)] mb-2">Suivant</p>
          {queue.map((q: any, i: number) => (
            <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--bg-hover)] transition-colors">
              <span className="text-xs text-[var(--text-3)] w-4">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--text-1)] truncate">{q.title}</p>
                <p className="text-xs text-[var(--text-3)] truncate">{q.artist}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
