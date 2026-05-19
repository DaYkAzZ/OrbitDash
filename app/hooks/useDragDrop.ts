"use client";

/**
 * useDragDrop – Drag & drop natif (HTML5 API) pour réordonner les widgets.
 *
 * Principe :
 *  - onDragStart : mémorise l'id du widget source
 *  - onDragOver  : highlight la cible (dropzone)
 *  - onDrop      : swap position+order entre source et cible, puis sauvegarde
 */

import { useRef } from "react";
import { useWidgetStore } from "@/app/store/useWidgetStore";
import type { WidgetConfig, WidgetPosition } from "@/app/types";

export function useDragDrop() {
  const { widgets, reorderWidgets } = useWidgetStore();
  const dragId = useRef<string | null>(null);

  const onDragStart = (id: string) => (e: React.DragEvent) => {
    dragId.current = id;
    e.dataTransfer.effectAllowed = "move";
    // léger délai pour que le ghost soit visible avant l'opacité
    requestAnimationFrame(() => {
      (e.target as HTMLElement).style.opacity = "0.4";
    });
  };

  const onDragEnd = (e: React.DragEvent) => {
    (e.target as HTMLElement).style.opacity = "1";
    dragId.current = null;
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const onDrop = (targetId: string, targetPosition: WidgetPosition) => (e: React.DragEvent) => {
    e.preventDefault();
    const srcId = dragId.current;
    if (!srcId || srcId === targetId) return;

    const src = widgets.find((w) => w.id === srcId);
    const tgt = widgets.find((w) => w.id === targetId);
    if (!src || !tgt) return;

    // Swap position + order
    const updated = widgets.map((w) => {
      if (w.id === srcId) return { ...w, position: tgt.position, order: tgt.order };
      if (w.id === targetId) return { ...w, position: src.position, order: src.order };
      return w;
    });

    reorderWidgets(updated);
  };

  /** Drop sur une zone vide (ex: colonne sans widgets) → déplace simplement le widget */
  const onDropZone = (position: WidgetPosition) => (e: React.DragEvent) => {
    e.preventDefault();
    const srcId = dragId.current;
    if (!srcId) return;

    const src = widgets.find((w) => w.id === srcId);
    if (!src || src.position === position) return;

    // Calcule le prochain order dans la colonne cible
    const maxOrder = Math.max(0, ...widgets.filter((w) => w.position === position).map((w) => w.order)) + 1;

    const updated = widgets.map((w) =>
      w.id === srcId ? { ...w, position, order: maxOrder } : w
    );
    reorderWidgets(updated);
  };

  return { onDragStart, onDragEnd, onDragOver, onDrop, onDropZone };
}
