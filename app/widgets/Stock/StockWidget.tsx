"use client";

/**
 * StockWidget – cours de bourse en temps réel (Finnhub API)
 * + actualités financières liées au symbole.
 *
 * API utilisée : https://finnhub.io (clé gratuite)
 * Variable d'env nécessaire : NEXT_PUBLIC_FINNHUB_KEY
 *
 * Modes :
 *  - inplace  : prix actuel + variation du jour
 *  - focus    : graphique sparkline 7 jours + top 5 actus
 *  - fullscreen : graphique étendu + toutes les actus
 */

import { useEffect, useState, useCallback } from "react";
import type { WidgetProps, StockData } from "../../types";
import { Card } from "../../components/ui";

const FINNHUB_KEY = process.env.NEXT_PUBLIC_FINNHUB_KEY ?? "";

interface Quote {
  c: number; // current price
  d: number; // change
  dp: number; // change percent
  h: number; // high
  l: number; // low
  o: number; // open
  pc: number; // previous close
}

interface NewsItem {
  id: number;
  headline: string;
  source: string;
  url: string;
  datetime: number; // unix timestamp
  summary: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(n: number) {
  return n.toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatPct(n: number) {
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
}

function timeAgo(ts: number) {
  const diff = Date.now() / 1000 - ts;
  if (diff < 3600) return `${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}j`;
}

// ── Micro sparkline SVG ───────────────────────────────────────────────────────

function Sparkline({
  values,
  positive,
}: {
  values: number[];
  positive: boolean;
}) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const w = 100;
  const h = 32;
  const pts = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="w-full h-8"
      preserveAspectRatio="none"
    >
      <polyline
        points={pts}
        fill="none"
        stroke={positive ? "#22c55e" : "#ef4444"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ── Composant principal ────────────────────────────────────────────────────────

export function StockWidget({
  widget,
  mode,
  onFocus,
  onFullscreen,
  onClose,
}: WidgetProps) {
  const data = widget.data as StockData;
  const [quote, setQuote] = useState<Quote | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [candles, setCandles] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!FINNHUB_KEY) {
      setError("Clé Finnhub manquante (NEXT_PUBLIC_FINNHUB_KEY)");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      // Quote
      const qRes = await fetch(
        `https://finnhub.io/api/v1/quote?symbol=${data.symbol}&token=${FINNHUB_KEY}`,
      );
      const q: Quote = await qRes.json();
      setQuote(q);

      // News (catégorie générale pour les indices)
      const now = Math.floor(Date.now() / 1000);
      const weekAgo = now - 7 * 86400;
      const nRes = await fetch(
        `https://finnhub.io/api/v1/company-news?symbol=${data.symbol}&from=${new Date(weekAgo * 1000).toISOString().split("T")[0]}&to=${new Date().toISOString().split("T")[0]}&token=${FINNHUB_KEY}`,
      );
      const nData: NewsItem[] = await nRes.json();
      setNews(Array.isArray(nData) ? nData.slice(0, 20) : []);

      // Candles hebdomadaires (résolution journalière)
      const cRes = await fetch(
        `https://finnhub.io/api/v1/stock/candle?symbol=${data.symbol}&resolution=D&from=${weekAgo}&to=${now}&token=${FINNHUB_KEY}`,
      );
      const cData = await cRes.json();
      if (cData.c) setCandles(cData.c as number[]);
    } catch {
      setError("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, [data.symbol]);

  useEffect(() => {
    const run = window.setTimeout(fetchData, 0);
    // Refresh toutes les 60 secondes
    const id = setInterval(fetchData, 60_000);
    return () => {
      clearInterval(id);
      window.clearTimeout(run);
    };
  }, [fetchData]);

  const positive = (quote?.d ?? 0) >= 0;
  const color = positive ? "text-green-400" : "text-red-400";
  const bg = positive ? "bg-green-500/10" : "bg-red-500/10";

  // ── Loading / Error ──────────────────────────────────────────────────────
  if (loading && !quote) {
    return (
      <Card className="flex h-full items-center justify-center">
        <span className="animate-pulse text-xs text-zinc-500">Chargement…</span>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center">
        <span className="text-2xl">⚠️</span>
        <p className="text-xs text-red-400">{error}</p>
      </Card>
    );
  }

  // ── In-place ──────────────────────────────────────────────────────────────
  if (mode === "compact") {
    return (
      <Card
        hoverable={true}
        onClick={onFocus}
        className="flex h-full flex-col justify-between p-4 gap-2"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">
              {data.label}
            </p>
            <p className="text-2xl font-bold tabular-nums text-white dark:text-white">
              {quote ? formatPrice(quote.c) : "—"}
            </p>
          </div>
          <span
            className={`rounded-lg px-2 py-0.5 text-xs font-semibold ${bg} ${color}`}
          >
            {quote ? formatPct(quote.dp) : "—"}
          </span>
        </div>

        <Sparkline values={candles} positive={positive} />

        <p className={`text-xs font-medium ${color}`}>
          {quote ? (positive ? "▲" : "▼") : ""}{" "}
          {quote ? formatPrice(Math.abs(quote.d)) : ""}
        </p>
      </Card>
    );
  }

  // ── Focus ─────────────────────────────────────────────────────────────────
  if (mode === "expanded") {
    return (
      <div className="flex flex-col gap-4 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {data.label}
            </h2>
            <p className="text-xs text-zinc-500">{data.symbol}</p>
          </div>
          <div className="flex gap-2">
            {onFullscreen && (
              <button
                onClick={onFullscreen}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-black/10 dark:hover:bg-white/10 hover:text-foreground"
              >
                ⛶
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-zinc-400 hover:bg-black/10 dark:hover:bg-white/10 hover:text-foreground"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Actuel", value: quote ? formatPrice(quote.c) : "—" },
            {
              label: "Variation",
              value: quote ? formatPct(quote.dp) : "—",
              colored: true,
            },
            { label: "Ouverture", value: quote ? formatPrice(quote.o) : "—" },
            {
              label: "Clôture préc.",
              value: quote ? formatPrice(quote.pc) : "—",
            },
            { label: "Haut", value: quote ? formatPrice(quote.h) : "—" },
            { label: "Bas", value: quote ? formatPrice(quote.l) : "—" },
          ].map(({ label, value, colored }) => (
            <div
              key={label}
              className="rounded-xl bg-zinc-100 dark:bg-zinc-800/60 p-3"
            >
              <p className="text-xs text-zinc-500">{label}</p>
              <p
                className={`text-sm font-semibold ${colored ? color : "text-foreground"}`}
              >
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Sparkline */}
        <div className="rounded-xl bg-zinc-100 dark:bg-zinc-800/60 p-3">
          <p className="mb-2 text-xs text-zinc-500">7 derniers jours</p>
          <Sparkline values={candles} positive={positive} />
        </div>

        {/* Top actus */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Actualités
          </p>
          <div className="flex flex-col gap-2">
            {news.slice(0, 5).map((n) => (
              <a
                key={n.id}
                href={n.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-xl border border-zinc-200 dark:border-zinc-700/50 bg-zinc-50 dark:bg-zinc-800/40 p-3 hover:border-indigo-400/50 transition-colors"
              >
                <p className="text-xs font-medium text-foreground group-hover:text-indigo-400 line-clamp-2">
                  {n.headline}
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  {n.source} · {timeAgo(n.datetime)}
                </p>
              </a>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Fullscreen ─────────────────────────────────────────────────────────────
  return (
    <div className="flex w-full max-w-3xl flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">{data.label}</h1>
          <p className="text-zinc-400">{data.symbol}</p>
        </div>
        <div className="text-right">
          <p className="text-4xl font-bold tabular-nums text-white">
            {quote ? formatPrice(quote.c) : "—"}
          </p>
          <p className={`text-lg font-semibold ${color}`}>
            {quote ? formatPct(quote.dp) : ""} (
            {quote ? formatPrice(Math.abs(quote.d)) : ""})
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-zinc-800/60 p-4">
        <p className="mb-3 text-xs text-zinc-500">Évolution sur 7 jours</p>
        <Sparkline values={candles} positive={positive} />
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Ouverture", value: quote ? formatPrice(quote.o) : "—" },
          { label: "Haut", value: quote ? formatPrice(quote.h) : "—" },
          { label: "Bas", value: quote ? formatPrice(quote.l) : "—" },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="rounded-xl bg-zinc-800/60 p-3 text-center"
          >
            <p className="text-xs text-zinc-500">{label}</p>
            <p className="text-sm font-semibold text-white">{value}</p>
          </div>
        ))}
      </div>

      <div>
        <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-400">
          Actualités financières
        </p>
        <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
          {news.map((n) => (
            <a
              key={n.id}
              href={n.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-xl border border-zinc-700/50 bg-zinc-800/40 p-3 hover:border-indigo-400/50 transition-colors"
            >
              <p className="text-sm font-medium text-white group-hover:text-indigo-400 line-clamp-2">
                {n.headline}
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                {n.source} · {timeAgo(n.datetime)}
              </p>
            </a>
          ))}
        </div>
      </div>

      <button
        onClick={onClose}
        className="mx-auto text-sm text-zinc-500 hover:text-white"
      >
        Quitter le plein écran
      </button>
    </div>
  );
}
