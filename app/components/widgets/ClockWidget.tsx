"use client";
import { useEffect, useState } from "react";
import type { WidgetConfig } from "@/app/types";

export function ClockWidgetExpanded({ widget, onClose }: { widget: WidgetConfig; onClose: () => void }) {
  const [time, setTime] = useState({ h: "--", m: "--", s: "--", date: "", day: "" });

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime({
        h: now.toLocaleTimeString("fr-FR", { hour: "2-digit" }),
        m: now.toLocaleTimeString("fr-FR", { minute: "2-digit" }),
        s: now.toLocaleTimeString("fr-FR", { second: "2-digit" }),
        date: now.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
        day: now.toLocaleDateString("fr-FR", { weekday: "long" }),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const zones = [
    { city: "Paris",     tz: "Europe/Paris" },
    { city: "New York",  tz: "America/New_York" },
    { city: "Tokyo",     tz: "Asia/Tokyo" },
    { city: "Londres",   tz: "Europe/London" },
  ];

  return (
    <div className="p-8 flex flex-col items-center gap-8">
      {/* Horloge principale */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-end gap-1 tabular-nums">
          <span className="text-[6rem] font-bold leading-none text-[var(--text-1)] tracking-tight">{time.h}</span>
          <span className="text-[4rem] font-light text-[var(--accent)] mb-2">:</span>
          <span className="text-[6rem] font-bold leading-none text-[var(--text-1)] tracking-tight">{time.m}</span>
          <span className="text-[4rem] font-light text-[var(--accent)] mb-2">:</span>
          <span className="text-[3rem] font-light leading-none text-[var(--text-3)] mb-1">{time.s}</span>
        </div>
        <p className="text-lg font-medium text-[var(--text-2)] capitalize">{time.day}</p>
        <p className="text-[var(--text-3)]">{time.date}</p>
      </div>

      {/* Fuseaux horaires */}
      <div className="w-full grid grid-cols-2 gap-3 max-w-md">
        {zones.map((z) => {
          const t = new Date().toLocaleTimeString("fr-FR", { timeZone: z.tz, hour: "2-digit", minute: "2-digit" });
          return (
            <div key={z.city} className="stat-card flex items-center justify-between">
              <span className="text-sm text-[var(--text-2)]">{z.city}</span>
              <span className="text-sm font-bold tabular-nums text-[var(--text-1)]">{t}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
