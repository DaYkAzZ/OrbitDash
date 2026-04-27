'use client';

import { useState, useEffect } from 'react';
import type { WidgetProps } from '../../types';
import type { ClockWidgetData } from '../../types';
import { Card } from '../../components/ui';

function getTime(timezone: string, format24h: boolean, showSeconds: boolean) {
  const opts: Intl.DateTimeFormatOptions = {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: !format24h,
    ...(showSeconds ? { second: '2-digit' } : {}),
  };
  return new Date().toLocaleTimeString('fr-FR', opts);
}

function getDate(timezone: string) {
  return new Date().toLocaleDateString('fr-FR', {
    timeZone: timezone,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function ClockWidget({ widget, mode, onFocus, onFullscreen, onClose }: WidgetProps) {
  const data = widget.data as ClockWidgetData;
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    const tick = () => {
      setTime(getTime(data.timezone, data.format24h, data.showSeconds));
      setDate(getDate(data.timezone));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [data]);

  // ── In-place (vue grille) ──────────────────────────────────────────────────
  if (mode === 'inplace') {
    return (
      <Card
        hoverable={widget.focusable}
        onClick={widget.focusable ? onFocus : undefined}
        className="flex h-full flex-col items-center justify-center gap-1 p-4"
      >
        <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">
          {widget.title}
        </p>
        <p className="text-3xl font-bold tabular-nums text-white">{time}</p>
        <p className="text-xs text-zinc-400">{data.timezone}</p>
      </Card>
    );
  }

  // ── Focus (zone centrale) ─────────────────────────────────────────────────
  if (mode === 'focus') {
    return (
      <div className="flex flex-col gap-4 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">{widget.title}</h2>
          <div className="flex gap-2">
            {widget.fullscreenable && (
              <button
                onClick={onFullscreen}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white"
                title="Plein écran"
              >
                ⛶
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white"
              title="Fermer"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 py-6">
          <p className="text-7xl font-bold tabular-nums text-white">{time}</p>
          <p className="capitalize text-zinc-300">{date}</p>
          <p className="text-sm text-zinc-500">{data.timezone}</p>
        </div>
      </div>
    );
  }

  // ── Fullscreen ─────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <p className="text-2xl font-medium uppercase tracking-widest text-zinc-500">
        {widget.title}
      </p>
      <p className="text-[10rem] font-bold tabular-nums leading-none text-white">{time}</p>
      <p className="text-xl capitalize text-zinc-300">{date}</p>
      <p className="text-sm text-zinc-500">{data.timezone}</p>
      <button
        onClick={onClose}
        className="mt-8 rounded-lg px-4 py-2 text-sm text-zinc-500 hover:bg-white/10 hover:text-white"
      >
        Quitter le plein écran
      </button>
    </div>
  );
}
