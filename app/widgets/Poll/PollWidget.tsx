"use client";

import { useState } from "react";
import type { WidgetProps } from "../../types";
import type { AnyWidgetData } from "../../types";
import { Card, Button } from "../../components/ui";
import { useWidgetStore } from "../../store";

export function PollWidget({
  widget,
  mode,
  onFocus,
  onFullscreen,
  onClose,
}: WidgetProps) {
  const data = widget.data as AnyWidgetData;
  const updateWidgetData = useWidgetStore((s) => s.updateWidgetData);
  const [voted, setVoted] = useState<string | null>(null);

  const totalVotes = data.options.reduce((acc, o) => acc + o.votes, 0);

  const handleVote = async (optionId: string) => {
    if (voted) return;
    setVoted(optionId);
    const updatedOptions = data.options.map((o) =>
      o.id === optionId ? { ...o, votes: o.votes + 1 } : o,
    );
    await updateWidgetData(widget.id, { options: updatedOptions });
  };

  // ── In-place ──────────────────────────────────────────────────────────────
  if (mode === "compact") {
    // Montre la question + un seul vote rapide
    const topOption = data.options[0];
    return (
      <Card
        hoverable={true}
        onClick={onFocus}
        className="flex h-full flex-col gap-3 p-4"
      >
        <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">
          Sondage
        </p>
        <p className="text-sm font-semibold text-white leading-snug">
          {data.question}
        </p>

        {!voted ? (
          <div className="flex flex-col gap-2 mt-auto">
            {data.options.slice(0, 2).map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleVote(opt.id)}
                className="w-full rounded-lg bg-zinc-700/60 px-3 py-1.5 text-left text-xs text-zinc-200
                           hover:bg-indigo-600/40 hover:text-white transition-colors"
              >
                {opt.label}
              </button>
            ))}
            {data.options.length > 2 && (
              <button
                onClick={onFocus}
                className="text-xs text-indigo-400 hover:text-indigo-300 text-center mt-1"
              >
                Voir tout →
              </button>
            )}
          </div>
        ) : (
          <p className="mt-auto text-xs text-indigo-400">✓ Vote enregistré !</p>
        )}
      </Card>
    );
  }

  // ── Focus ─────────────────────────────────────────────────────────────────
  if (mode === "expanded") {
    return (
      <div className="flex flex-col gap-4 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">{widget.title}</h2>
          <div className="flex gap-2">
            {onFullscreen && (
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

        <p className="text-base font-medium text-white">{data.question}</p>

        <div className="flex flex-col gap-3">
          {data.options.map((opt) => {
            const pct = totalVotes
              ? Math.round((opt.votes / totalVotes) * 100)
              : 0;
            return (
              <div key={opt.id} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-sm">
                  <button
                    onClick={() => handleVote(opt.id)}
                    disabled={!!voted}
                    className={[
                      "text-left text-sm",
                      voted === opt.id
                        ? "text-indigo-400 font-medium"
                        : "text-zinc-200 hover:text-white",
                      voted ? "cursor-default" : "cursor-pointer",
                    ].join(" ")}
                  >
                    {opt.label}
                  </button>
                  <span className="text-xs text-zinc-500">
                    {pct}% ({opt.votes})
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-zinc-700">
                  <div
                    className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-zinc-500 mt-2">
          {totalVotes} vote{totalVotes !== 1 ? "s" : ""} au total
        </p>
      </div>
    );
  }

  // ── Fullscreen ─────────────────────────────────────────────────────────────
  return (
    <div className="flex w-full max-w-lg flex-col gap-6">
      <h2 className="text-2xl font-bold text-white text-center">
        {data.question}
      </h2>

      <div className="flex flex-col gap-4">
        {data.options.map((opt) => {
          const pct = totalVotes
            ? Math.round((opt.votes / totalVotes) * 100)
            : 0;
          return (
            <div key={opt.id} className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Button
                  variant={voted === opt.id ? "primary" : "secondary"}
                  onClick={() => handleVote(opt.id)}
                  disabled={!!voted}
                  className="text-left"
                >
                  {opt.label}
                </Button>
                <span className="text-zinc-400 text-sm">{pct}%</span>
              </div>
              <div className="h-2 rounded-full bg-zinc-700">
                <div
                  className="h-full rounded-full bg-indigo-500 transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-center text-sm text-zinc-500">{totalVotes} votes</p>
      <button
        onClick={onClose}
        className="mx-auto mt-4 text-sm text-zinc-500 hover:text-white"
      >
        Quitter le plein écran
      </button>
    </div>
  );
}
