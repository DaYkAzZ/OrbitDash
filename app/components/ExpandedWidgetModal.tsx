"use client";

import { useEffect, useState } from "react";
import { useWidgetStore } from "@/app/store/useWidgetStore";
import type { WidgetConfig } from "@/app/types";
import { ClockWidgetExpanded }    from "./widgets/ClockWidget";
import { WeatherWidgetExpanded }  from "./widgets/WeatherWidget";
import { StockWidgetExpanded }    from "./widgets/StockWidget";
import { AiNewsWidgetExpanded }   from "./widgets/AiNewsWidget";
import { NotesWidgetExpanded }    from "./widgets/NotesWidget";
import { MoodWidgetExpanded }     from "./widgets/MoodWidget";
import { ActivityWidgetExpanded } from "./widgets/ActivityWidget";
import { MusicWidgetExpanded }    from "./widgets/MusicWidget";
import { TimerWidgetExpanded }    from "./widgets/TimerWidget";
import { QuoteWidgetExpanded }    from "./widgets/QuoteWidget";
import { CryptoWidgetExpanded }   from "./widgets/CryptoWidget";

interface Props {
  widget: WidgetConfig;
  inline?: boolean;
}

function WidgetContent({ widget, onClose }: { widget: WidgetConfig; onClose: () => void }) {
  switch (widget.type) {
    case "clock":    return <ClockWidgetExpanded    widget={widget} onClose={onClose} />;
    case "weather":  return <WeatherWidgetExpanded  widget={widget} onClose={onClose} />;
    case "stock":    return <StockWidgetExpanded    widget={widget} onClose={onClose} />;
    case "ainews":   return <AiNewsWidgetExpanded   widget={widget} onClose={onClose} />;
    case "notes":    return <NotesWidgetExpanded    widget={widget} onClose={onClose} />;
    case "mood":     return <MoodWidgetExpanded     widget={widget} onClose={onClose} />;
    case "activity": return <ActivityWidgetExpanded widget={widget} onClose={onClose} />;
    case "music":    return <MusicWidgetExpanded    widget={widget} onClose={onClose} />;
    case "timer":    return <TimerWidgetExpanded    widget={widget} onClose={onClose} />;
    case "quote":    return <QuoteWidgetExpanded    widget={widget} onClose={onClose} />;
    case "crypto":   return <CryptoWidgetExpanded   widget={widget} onClose={onClose} />;
    default: return <div className="p-8 text-[var(--text-3)]">Widget : {widget.type}</div>;
  }
}

/* Couleurs d'accent par type de widget */
const WIDGET_COLORS: Record<string, string> = {
  clock:    "var(--neon-yellow)",
  weather:  "var(--neon-cyan)",
  stock:    "var(--neon-green)",
  crypto:   "var(--neon-green)",
  ainews:   "var(--neon-blue)",
  notes:    "var(--neon-yellow)",
  mood:     "var(--neon-pink)",
  activity: "var(--neon-orange)",
  music:    "var(--neon-purple)",
  timer:    "var(--accent)",
  quote:    "var(--neon-cyan)",
};

export function ExpandedWidgetModal({ widget, inline = false }: Props) {
  const { collapseWidget } = useWidgetStore();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleClose = () => { collapseWidget(); setIsFullscreen(false); };
  const accentColor = WIDGET_COLORS[widget.type] ?? "var(--neon-yellow)";

  const Header = () => (
    <div
      className="flex items-center justify-between px-5 py-3 flex-none"
      style={{
        background: accentColor,
        borderBottom: "2.5px solid var(--border)",
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 flex items-center justify-center text-xl"
          style={{
            background: "var(--bg-card)",
            border: "2px solid var(--border)",
            boxShadow: "2px 2px 0 var(--border)",
          }}
        >
          {widget.icon}
        </div>
        <div>
          <p
            className="font-black text-sm text-black uppercase tracking-wide"
            style={{ fontFamily: "Space Mono" }}
          >
            {widget.title}
          </p>
          <p className="text-[11px] text-black/60 font-bold">{widget.description}</p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          title={isFullscreen ? "Réduire" : "Plein écran"}
          className="w-8 h-8 flex items-center justify-center font-black text-black transition-all hover:scale-110"
          style={{
            background: "var(--bg-card)",
            border: "2px solid var(--border)",
            boxShadow: "2px 2px 0 var(--border)",
            fontSize: "12px",
          }}
        >
          {isFullscreen ? "⊡" : "⤢"}
        </button>
        <button
          onClick={handleClose}
          title="Fermer"
          className="w-8 h-8 flex items-center justify-center font-black text-black transition-all hover:scale-110"
          style={{
            background: "var(--accent)",
            border: "2px solid var(--border)",
            boxShadow: "2px 2px 0 var(--border)",
            color: "white",
            fontSize: "14px",
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );

  // Mode plein écran = overlay
  if (isFullscreen) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-6"
        style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
        onClick={handleClose}
      >
        <div
          className="w-full max-w-4xl max-h-[90vh] flex flex-col anim-scale"
          style={{
            background: "var(--bg-card)",
            border: "3px solid var(--border)",
            boxShadow: "var(--shadow-neo-xl)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <Header />
          <div className="flex-1 overflow-y-auto">
            <WidgetContent widget={widget} onClose={handleClose} />
          </div>
        </div>
      </div>
    );
  }

  // Mode inline dans la zone centrale
  return (
    <div className="flex flex-col h-full">
      <Header />
      <div className="flex-1 overflow-y-auto">
        <WidgetContent widget={widget} onClose={handleClose} />
      </div>
    </div>
  );
}
