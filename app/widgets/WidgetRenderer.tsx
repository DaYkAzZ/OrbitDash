'use client';

/**
 * WidgetRenderer – résout dynamiquement le bon composant React
 * à partir du type du widget et du mode d'affichage.
 *
 * Pour ajouter un nouveau widget : importer son composant et l'ajouter
 * dans WIDGET_MAP ci-dessous. C'est tout.
 */

import type { WidgetProps } from '../types';
import { ClockWidget } from './Clock';
import { PollWidget } from './Poll';
import { StockWidget } from './Stock';
import { WeatherWidget } from './Weather';
import { AiNewsWidget } from './AiNews';

type WidgetComponent = (props: WidgetProps) => React.ReactElement | null;

const WIDGET_MAP: Record<string, WidgetComponent> = {
  clock: ClockWidget,
  poll: PollWidget,
  stock: StockWidget,
  weather: WeatherWidget,
  ainews: AiNewsWidget,
};

export function WidgetRenderer(props: WidgetProps) {
  const Component = WIDGET_MAP[props.widget.type];

  if (!Component) {
    return (
      <div className="flex h-full items-center justify-center text-xs text-zinc-600">
        Widget inconnu : {props.widget.type}
      </div>
    );
  }

  return <Component {...props} />;
}
