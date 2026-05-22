"use client";

/**
 * WidgetGrid – affiche les widgets en mode "inplace" dans une grille CSS.
 * Chaque cellule est cliquable si le widget est focusable.
 */

import { useWidgetStore } from "../../store";
import { WidgetRenderer } from "../../widgets";

interface WidgetGridProps {
  /** Optionnel : override les colonnes de grille (défaut : auto) */
  columns?: number;
}

export function WidgetGrid({ columns }: WidgetGridProps) {
  const { widgets, expandWidget } = useWidgetStore();

  const sorted = [...widgets].sort((a, b) => a.order - b.order);

  const gridStyle = columns
    ? { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }
    : undefined;

  return (
    <div
      className="grid gap-3 p-3"
      style={
        gridStyle ?? {
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        }
      }
    >
      {sorted.map((widget) => (
        <div
          key={widget.id}
          className="aspect-square min-h-[160px] cursor-pointer"
          onClick={() => expandWidget(widget.id)}
        >
          <WidgetRenderer widget={widget} mode="compact" />
        </div>
      ))}
    </div>
  );
}
