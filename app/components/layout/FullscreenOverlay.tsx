"use client";

/**
 * FullscreenOverlay – overlay plein écran affiché quand un widget
 * est en mode "fullscreen". Se ferme avec Échap ou le bouton dédié.
 * Note: Actuellement non utilisé - les widgets utilisent le mode "expanded"
 */

import { useEffect } from "react";
import { useWidgetStore } from "../../store";
import { WidgetRenderer } from "../../widgets";

export function FullscreenOverlay() {
  const { widgets, expandedWidgetId, collapseWidget } = useWidgetStore();

  const widget = expandedWidgetId
    ? widgets.find((w) => w.id === expandedWidgetId)
    : null;

  // Fermeture avec la touche Échap
  useEffect(() => {
    if (!widget) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") collapseWidget();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [widget, collapseWidget]);

  if (!widget) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
      onClick={(e) => {
        // Ferme si on clique sur le fond
        if (e.target === e.currentTarget) collapseWidget();
      }}
    >
      <WidgetRenderer
        widget={widget}
        mode="expanded"
        onClose={() => collapseWidget()}
      />
    </div>
  );
}
