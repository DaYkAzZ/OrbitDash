"use client";

import { WIDGET_CATALOG, useWidgetStore } from "@/app/store/useWidgetStore";
import type { WidgetType, WidgetPosition } from "@/app/types";
import { useState } from "react";

const CATEGORIES = ["tous", "temps", "finance", "info", "productivité", "divertissement"] as const;
type Cat = typeof CATEGORIES[number];

const POSITIONS: { label: string; value: WidgetPosition; color: string }[] = [
  { label: "◀ Gauche",  value: "left",   color: "var(--neon-blue)" },
  { label: "▶ Droite",  value: "right",  color: "var(--neon-purple)" },
  { label: "▼ Bas",     value: "bottom", color: "var(--neon-pink)" },
  { label: "▲ Haut",    value: "top",    color: "var(--neon-cyan)" },
];

const CAT_COLORS: Record<string, string> = {
  temps:          "var(--neon-cyan)",
  finance:        "var(--neon-green)",
  info:           "var(--neon-blue)",
  productivité:   "var(--neon-yellow)",
  divertissement: "var(--neon-pink)",
  tous:           "var(--bg-card)",
};

export function WidgetCatalogModal({ onClose }: { onClose: () => void }) {
  const { addWidget, availableTypes } = useWidgetStore();
  const [cat, setCat] = useState<Cat>("tous");
  const [pos, setPos] = useState<WidgetPosition>("left");
  const [added, setAdded] = useState<string | null>(null);

  const filtered = WIDGET_CATALOG.filter(
    (w) => availableTypes.includes(w.type as WidgetType) && (cat === "tous" || w.category === cat)
  );

  const handle = (type: WidgetType) => {
    if (!availableTypes.includes(type)) return;
    const id = addWidget(type, pos);
    if (id) {
      setAdded(type);
      setTimeout(() => setAdded(null), 1200);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl flex flex-col max-h-[90vh] anim-scale"
        style={{
          background: "var(--bg-card)",
          border: "3px solid var(--border)",
          boxShadow: "var(--shadow-neo-xl)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 flex-none"
          style={{ background: "var(--neon-yellow)", borderBottom: "2.5px solid var(--border)" }}
        >
          <div>
            <p className="font-black text-black text-lg uppercase tracking-wide" style={{ fontFamily: "Space Mono" }}>
              + Catalogue
            </p>
            <p className="text-xs text-black/60 font-bold mt-0.5">Sélectionnez un widget à ajouter</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center font-black text-white"
            style={{
              background: "var(--accent)",
              border: "2.5px solid var(--border)",
              boxShadow: "var(--shadow-neo-sm)",
            }}
          >
            ✕
          </button>
        </div>

        {/* Filtres catégorie */}
        <div
          className="flex gap-2 px-5 py-3 overflow-x-auto flex-none"
          style={{ borderBottom: "2px solid var(--border)", background: "var(--bg-hover)" }}
        >
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className="flex-none px-3 py-1.5 text-xs font-black uppercase tracking-wider transition-all"
              style={{
                fontFamily: "Space Mono",
                border: "2px solid var(--border)",
                boxShadow: cat === c ? "var(--shadow-neo-sm)" : "none",
                background: cat === c ? (CAT_COLORS[c] ?? "var(--neon-yellow)") : "var(--bg-card)",
                color: cat === c && c !== "productivité" && c !== "temps" ? "#0A0A0A" : "var(--text-1)",
                transform: cat === c ? "translate(-2px,-2px)" : "none",
              }}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Position */}
        <div
          className="flex items-center gap-2 px-5 py-3 flex-none flex-wrap"
          style={{ borderBottom: "2px solid var(--border)", background: "var(--bg-card)" }}
        >
          <span className="text-xs font-black uppercase text-[var(--text-3)] mr-2" style={{ fontFamily: "Space Mono" }}>
            Position :
          </span>
          {POSITIONS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPos(p.value)}
              className="px-3 py-1.5 text-xs font-black uppercase transition-all"
              style={{
                fontFamily: "Space Mono",
                border: "2px solid var(--border)",
                background: pos === p.value ? p.color : "transparent",
                color: pos === p.value ? "#0A0A0A" : "var(--text-3)",
                boxShadow: pos === p.value ? "var(--shadow-neo-sm)" : "none",
                transform: pos === p.value ? "translate(-2px,-2px)" : "none",
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {filtered.length === 0 ? (
            <p className="text-sm text-center text-[var(--text-3)] py-8">
              Aucun widget disponible. L&apos;administrateur doit activer des widgets dans le panneau Admin.
            </p>
          ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filtered.map((item) => {
              const isAdded = added === item.type;
              return (
                <button
                  key={item.type}
                  onClick={() => handle(item.type as WidgetType)}
                  className="group text-left p-4 transition-all"
                  style={{
                    border: "2.5px solid var(--border)",
                    boxShadow: isAdded ? "none" : "var(--shadow-neo-sm)",
                    background: isAdded ? "var(--neon-green)" : "var(--bg-card)",
                    transform: isAdded ? "translate(3px,3px)" : "none",
                  }}
                  onMouseEnter={(e) => {
                    if (!isAdded) {
                      (e.currentTarget as HTMLButtonElement).style.transform = "translate(-3px,-3px)";
                      (e.currentTarget as HTMLButtonElement).style.boxShadow = "var(--shadow-neo)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isAdded) {
                      (e.currentTarget as HTMLButtonElement).style.transform = "none";
                      (e.currentTarget as HTMLButtonElement).style.boxShadow = "var(--shadow-neo-sm)";
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 flex items-center justify-center text-xl flex-none"
                      style={{
                        background: item.color + "30",
                        border: "2px solid var(--border)",
                      }}
                    >
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <p
                        className="text-sm font-black text-[var(--text-1)] uppercase truncate"
                        style={{ fontFamily: "Space Mono" }}
                      >
                        {item.title}
                      </p>
                      <p className="text-[11px] text-[var(--text-3)] mt-0.5 line-clamp-2 font-medium">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  {isAdded && (
                    <p className="text-xs font-black mt-2 text-black uppercase" style={{ fontFamily: "Space Mono" }}>
                      ✓ Ajouté !
                    </p>
                  )}
                </button>
              );
            })}
          </div>
          )}
        </div>
      </div>
    </div>
  );
}
