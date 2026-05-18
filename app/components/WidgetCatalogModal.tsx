"use client";

import { WIDGET_CATALOG, useWidgetStore } from "@/app/store/useWidgetStore";
import type { WidgetType, WidgetPosition } from "@/app/types";
import { useState } from "react";

const CATEGORIES = ["tous", "temps", "finance", "info", "productivité", "divertissement"] as const;
type Cat = typeof CATEGORIES[number];

const POSITIONS: { label: string; value: WidgetPosition }[] = [
  { label: "Gauche",  value: "left" },
  { label: "Droite",  value: "right" },
  { label: "Bas",     value: "bottom" },
  { label: "Haut",    value: "top" },
];

export function WidgetCatalogModal({ onClose }: { onClose: () => void }) {
  const { addWidget } = useWidgetStore();
  const [cat, setCat] = useState<Cat>("tous");
  const [pos, setPos] = useState<WidgetPosition>("left");
  const [added, setAdded] = useState<string | null>(null);

  const filtered = WIDGET_CATALOG.filter((w) => cat === "tous" || w.category === cat);

  const handle = (type: WidgetType) => {
    addWidget(type, pos);
    setAdded(type);
    setTimeout(() => setAdded(null), 1200);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] shadow-[var(--shadow-xl)] flex flex-col max-h-[85vh] overflow-hidden anim-scale"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <div>
            <p className="font-semibold text-[var(--text-1)]">Catalogue de widgets</p>
            <p className="text-xs text-[var(--text-3)] mt-0.5">Sélectionnez un widget à ajouter</p>
          </div>
          <button onClick={onClose} className="btn-icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Filtres catégorie */}
        <div className="flex gap-2 px-6 pt-4 pb-2 overflow-x-auto flex-none">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`flex-none px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                cat === c
                  ? "bg-[var(--accent)] text-white"
                  : "bg-[var(--bg-hover)] text-[var(--text-2)] hover:bg-[var(--bg-active)]"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Position */}
        <div className="flex items-center gap-3 px-6 py-3 border-b border-[var(--border)] flex-none">
          <span className="text-xs text-[var(--text-3)] font-medium">Position :</span>
          {POSITIONS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPos(p.value)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                pos === p.value
                  ? "bg-[var(--accent-light)] text-[var(--accent)]"
                  : "text-[var(--text-3)] hover:bg-[var(--bg-hover)]"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Grid widgets */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filtered.map((item) => {
              const isAdded = added === item.type;
              return (
                <button
                  key={item.type}
                  onClick={() => handle(item.type as WidgetType)}
                  className={`group text-left p-4 rounded-xl border transition-all ${
                    isAdded
                      ? "border-[var(--green)] bg-[var(--green-light)]"
                      : "border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--accent)]/40 hover:shadow-[var(--shadow-sm)]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-none"
                      style={{ background: item.color + "18" }}
                    >
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[var(--text-1)] truncate">{item.title}</p>
                      <p className="text-xs text-[var(--text-3)] mt-0.5 line-clamp-2">{item.description}</p>
                    </div>
                  </div>
                  {isAdded && (
                    <p className="text-xs text-[var(--green)] font-medium mt-2">✓ Ajouté !</p>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
