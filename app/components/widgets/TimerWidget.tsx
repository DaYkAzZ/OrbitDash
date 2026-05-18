"use client";
import { useEffect, useRef, useState } from "react";
import type { WidgetConfig } from "@/app/types";
import { useWidgetStore } from "@/app/store/useWidgetStore";

export function TimerWidgetExpanded({ widget, onClose }: { widget: WidgetConfig; onClose: () => void }) {
  const { updateWidgetData } = useWidgetStore();
  const [seconds, setSeconds] = useState(widget.data.secondsLeft ?? 25 * 60);
  const [running, setRunning] = useState(false);
  const [mode, setMode] = useState<"work" | "break">("work");
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      ref.current = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) {
            clearInterval(ref.current!);
            setRunning(false);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      clearInterval(ref.current!);
    }
    return () => clearInterval(ref.current!);
  }, [running]);

  const reset = () => {
    setRunning(false);
    const s = mode === "work" ? (widget.data.workMinutes ?? 25) * 60 : (widget.data.breakMinutes ?? 5) * 60;
    setSeconds(s);
  };

  const total = mode === "work" ? (widget.data.workMinutes ?? 25) * 60 : (widget.data.breakMinutes ?? 5) * 60;
  const pct = Math.round(((total - seconds) / total) * 100);
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;

  const circumference = 2 * Math.PI * 54;

  return (
    <div className="p-8 flex flex-col items-center gap-8">
      {/* Mode tabs */}
      <div className="flex gap-2 p-1 rounded-xl bg-[var(--bg-hover)]">
        {(["work", "break"] as const).map((m) => (
          <button key={m} onClick={() => { setMode(m); reset(); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === m ? "bg-[var(--bg-card)] text-[var(--text-1)] shadow-sm" : "text-[var(--text-3)]"}`}>
            {m === "work" ? "🎯 Travail" : "☕ Pause"}
          </button>
        ))}
      </div>

      {/* Timer circulaire */}
      <div className="relative flex items-center justify-center">
        <svg width="140" height="140" className="-rotate-90">
          <circle cx="70" cy="70" r="54" fill="none" stroke="var(--border)" strokeWidth="8" />
          <circle cx="70" cy="70" r="54" fill="none" stroke="var(--accent)" strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - (circumference * pct) / 100}
            style={{ transition: "stroke-dashoffset 1s linear" }}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <p className="text-4xl font-bold tabular-nums text-[var(--text-1)]">
            {String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
          </p>
          <p className="text-xs text-[var(--text-3)] mt-1">Session {widget.data.session ?? 1}/{widget.data.totalSessions ?? 4}</p>
        </div>
      </div>

      {/* Contrôles */}
      <div className="flex gap-3">
        <button onClick={reset} className="btn-icon w-11 h-11 rounded-xl border border-[var(--border)]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
        </button>
        <button onClick={() => setRunning((r) => !r)}
          className="h-11 px-8 rounded-xl bg-[var(--accent)] text-white font-semibold hover:bg-[var(--accent-hover)] transition-colors shadow-sm">
          {running ? "⏸ Pause" : "▶ Démarrer"}
        </button>
      </div>

      <p className="text-xs text-[var(--text-3)] text-center max-w-xs">
        Technique Pomodoro : 25 min de travail, puis 5 min de pause
      </p>
    </div>
  );
}
