"use client";

/**
 * FocusZone – la zone centrale qui accueille le widget en mode "focus".
 * Affiche un placeholder quand rien n'est sélectionné.
 */

import { useWidgetStore } from "../../store";
import { WidgetRenderer } from "../../widgets";
import { Card } from "../ui";

export function FocusZone() {
  const { widgets, expandedWidgetId, expandWidget, collapseWidget } =
    useWidgetStore();

  const focused = expandedWidgetId
    ? widgets.find((w) => w.id === expandedWidgetId)
    : null;

  if (!focused) {
    return (
      <Card className="flex flex-col items-center justify-center gap-3 p-8 text-center h-full min-h-[300px]">
        <span className="text-4xl">🛰️</span>
        <p className="text-sm text-zinc-500">
          Cliquez sur un widget pour afficher les détails ici.
        </p>
      </Card>
    );
  }

  return (
    <Card className="h-full overflow-auto">
      <WidgetRenderer
        widget={focused}
        mode="expanded"
        onClose={() => collapseWidget()}
      />
    </Card>
  );
}
