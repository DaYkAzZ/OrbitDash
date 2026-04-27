'use client';

/**
 * FullscreenOverlay – overlay plein écran affiché quand un widget
 * est en mode "fullscreen". Se ferme avec Échap ou le bouton dédié.
 */

import { useEffect } from 'react';
import { useWidgetStore } from '../../store';
import { WidgetRenderer } from '../../widgets';

export function FullscreenOverlay() {
  const { widgets, fullscreenWidgetId, setFullscreen } = useWidgetStore();

  const widget = fullscreenWidgetId
    ? widgets.find((w) => w.id === fullscreenWidgetId)
    : null;

  // Fermeture avec la touche Échap
  useEffect(() => {
    if (!widget) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFullscreen(null);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [widget, setFullscreen]);

  if (!widget) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
      onClick={(e) => {
        // Ferme si on clique sur le fond
        if (e.target === e.currentTarget) setFullscreen(null);
      }}
    >
      <WidgetRenderer
        widget={widget}
        mode="fullscreen"
        onClose={() => setFullscreen(null)}
      />
    </div>
  );
}
