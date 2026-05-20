"use client";

/**
 * useDragDrop – Drag & drop natif HTML5.
 *
 * CORRECTION CRITIQUE : dragId doit être partagé globalement entre toutes
 * les instances du hook. On utilise une variable module-level (singleton)
 * car useRef est local à chaque composant et ne peut pas être partagé.
 */

import { useWidgetStore } from "@/app/store/useWidgetStore";
import type { WidgetPosition } from "@/app/types";

// ── Singleton partagé entre toutes les instances ──────────────────────────
let globalDragId: string | null = null;

export function useDragDrop() {
  const { widgets, reorderWidgets } = useWidgetStore();

  const onDragStart = (id: string) => (e: React.DragEvent) => {
    globalDragId = id;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id); // fallback cross-browser
    const el = e.currentTarget as HTMLElement;
    requestAnimationFrame(() => { el.style.opacity = "0.45"; });
  };

  const onDragEnd = (e: React.DragEvent) => {
    const el = e.currentTarget as HTMLElement;
    el.style.opacity = "1";
    globalDragId = null;
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  /** Drop widget-sur-widget → swap position + order */
  const onDrop = (targetId: string, targetPosition: WidgetPosition) => (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Récupère l'id depuis le singleton OU depuis dataTransfer (fallback)
    const srcId = globalDragId ?? e.dataTransfer.getData("text/plain");
    globalDragId = null;

    if (!srcId || srcId === targetId) return;

    // Relit les widgets depuis le store au moment du drop (état frais)
    const current = useWidgetStore.getState().widgets;
    const src = current.find((w) => w.id === srcId);
    const tgt = current.find((w) => w.id === targetId);
    if (!src || !tgt) return;

    const updated = current.map((w) => {
      if (w.id === srcId) return { ...w, position: tgt.position, order: tgt.order };
      if (w.id === targetId) return { ...w, position: src.position, order: src.order };
      return w;
    });

    reorderWidgets(updated);
  };

  /** Drop sur une zone vide → déplace le widget vers cette zone */
  const onDropZone = (position: WidgetPosition) => (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const srcId = globalDragId ?? e.dataTransfer.getData("text/plain");
    globalDragId = null;

    if (!srcId) return;

    const current = useWidgetStore.getState().widgets;
    const src = current.find((w) => w.id === srcId);
    if (!src || src.position === position) return;

    const sameZone = current.filter((w) => w.position === position);
    const maxOrder = sameZone.length > 0
      ? Math.max(...sameZone.map((w) => w.order)) + 1
      : 0;

    const updated = current.map((w) =>
      w.id === srcId ? { ...w, position, order: maxOrder } : w
    );
    reorderWidgets(updated);
  };

  return { onDragStart, onDragEnd, onDragOver, onDrop, onDropZone };
}
