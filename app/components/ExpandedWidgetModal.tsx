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
  inline?: boolean;          // true = affiché dans la zone centrale (pas modal)
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
    default: return <div className="p-8 text-[var(--text-3)]">Widget non supporté : {widget.type}</div>;
  }
}

/** Affiché inline dans la zone centrale OU en modal plein écran */
export function ExpandedWidgetModal({ widget, inline = false }: Props) {
  const { collapseWidget, expandWidget } = useWidgetStore();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleClose = () => { collapseWidget(); setIsFullscreen(false); };

  // Inline = dans la zone centrale avec header propre
  if (inline && !isFullscreen) {
    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">{widget.icon}</span>
            <div>
              <p className="text-sm font-semibold text-[var(--text-1)]">{widget.title}</p>
              <p className="text-xs text-[var(--text-3)]">{widget.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {/* Fullscreen */}
            <button
              onClick={() => setIsFullscreen(true)}
              title="Plein écran"
              className="btn-icon"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
                <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
              </svg>
            </button>
            {/* Fermer */}
            <button onClick={handleClose} title="Fermer" className="btn-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>
        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <WidgetContent widget={widget} onClose={handleClose} />
        </div>
      </div>
    );
  }

  // Modal plein écran (overlay)
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-3xl max-h-[90vh] flex flex-col bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] shadow-[var(--shadow-xl)] overflow-hidden anim-scale"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--accent-light)] flex items-center justify-center text-lg">
              {widget.icon}
            </div>
            <div>
              <p className="font-semibold text-[var(--text-1)]">{widget.title}</p>
              <p className="text-xs text-[var(--text-3)]">{widget.description}</p>
            </div>
          </div>
          <div className="flex gap-1">
            {!inline && (
              <button onClick={() => setIsFullscreen(false)} title="Réduire" className="btn-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/>
                  <line x1="10" y1="14" x2="3" y2="21"/><line x1="21" y1="3" x2="14" y2="10"/>
                </svg>
              </button>
            )}
            <button onClick={handleClose} title="Fermer" className="btn-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <WidgetContent widget={widget} onClose={handleClose} />
        </div>
      </div>
    </div>
  );
}
