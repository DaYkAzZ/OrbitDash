"use client";
import { useState } from "react";
import type { WidgetConfig } from "@/app/types";
import { useWidgetStore } from "@/app/store/useWidgetStore";

const MOODS = [
  { key: "happy",     emoji: "😊", label: "Heureux" },
  { key: "energetic", emoji: "⚡", label: "Énergique" },
  { key: "focused",   emoji: "🎯", label: "Concentré" },
  { key: "calm",      emoji: "😌", label: "Calme" },
  { key: "neutral",   emoji: "😐", label: "Neutre" },
  { key: "stressed",  emoji: "😤", label: "Stressé" },
  { key: "sad",       emoji: "😢", label: "Triste" },
];

export function MoodWidgetExpanded({ widget, onClose }: { widget: WidgetConfig; onClose: () => void }) {
  const { updateWidgetData } = useWidgetStore();
  const [selected, setSelected] = useState(widget.data.current ?? "happy");
  const [intensity, setIntensity] = useState(widget.data.intensity ?? 7);
  const [note, setNote] = useState(widget.data.note ?? "");

  const save = () => {
    const m = MOODS.find((m) => m.key === selected)!;
    updateWidgetData(widget.id, {
      current: selected, emoji: m.emoji, intensity, note,
      history: [{ mood: selected, emoji: m.emoji, time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) }, ...(widget.data.history ?? []).slice(0, 4)],
    });
  };

  const stats = widget.data.stats ?? {};
  const total = Object.values(stats).reduce((a: any, b: any) => a + b, 0) || 1;

  return (
    <div className="p-6 space-y-6">
      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-3)]">Comment vous sentez-vous ?</p>

      {/* Mood grid */}
      <div className="grid grid-cols-4 gap-2">
        {MOODS.map((m) => (
          <button
            key={m.key}
            onClick={() => setSelected(m.key)}
            className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all ${selected === m.key ? "border-[var(--accent)] bg-[var(--accent-light)]" : "border-[var(--border)] hover:bg-[var(--bg-hover)]"}`}
          >
            <span className="text-2xl">{m.emoji}</span>
            <p className="text-xs text-[var(--text-2)]">{m.label}</p>
          </button>
        ))}
      </div>

      {/* Intensité */}
      <div>
        <div className="flex justify-between mb-2">
          <p className="text-xs text-[var(--text-3)]">Intensité</p>
          <p className="text-xs font-semibold text-[var(--text-1)]">{intensity}/10</p>
        </div>
        <input type="range" min={1} max={10} value={intensity}
          onChange={(e) => setIntensity(+e.target.value)}
          className="w-full accent-[var(--accent)]" />
      </div>

      {/* Note */}
      <input type="text" value={note} onChange={(e) => setNote(e.target.value)}
        placeholder="Ajoutez une note (optionnel)…"
        className="w-full h-9 px-3 rounded-lg border border-[var(--border)] bg-[var(--bg-hover)] text-sm text-[var(--text-1)] placeholder-[var(--text-3)] focus:outline-none focus:border-[var(--accent)] transition-colors" />

      <button onClick={save} className="w-full py-2.5 rounded-xl bg-[var(--accent)] text-white text-sm font-semibold hover:bg-[var(--accent-hover)] transition-colors">
        Enregistrer l'humeur
      </button>

      {/* Stats */}
      {Object.keys(stats).length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-3)] mb-3">Répartition globale</p>
          <div className="space-y-2">
            {MOODS.filter((m) => stats[m.key]).map((m) => (
              <div key={m.key} className="flex items-center gap-3">
                <span className="text-sm w-6">{m.emoji}</span>
                <div className="flex-1 h-1.5 rounded-full bg-[var(--bg-hover)] overflow-hidden">
                  <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${((stats[m.key] ?? 0) / (total as number)) * 100}%` }} />
                </div>
                <span className="text-xs text-[var(--text-3)] w-8 text-right">{stats[m.key]}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
