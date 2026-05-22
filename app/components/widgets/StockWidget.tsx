"use client";

import { useState, useMemo } from "react";
import type { WidgetConfig } from "@/app/types";

/* ── Génération de données simulées réalistes ────────────────────────────────
   Marche aléatoire avec tendance cohérente avec la variation du jour.         */
function generateChartData(basePrice: number, pct: number, days = 30) {
  const points: { day: number; price: number }[] = [];
  // Prix il y a `days` jours reconstitué à rebours
  const startPrice = basePrice / (1 + pct / 100);
  let price = startPrice;
  const volatility = Math.abs(pct) * 0.3 + 0.4;

  for (let i = 0; i <= days; i++) {
    const trend = (pct / 100 / days) * basePrice;
    const noise = (Math.random() - 0.48) * volatility * basePrice * 0.01;
    price = Math.max(price + trend + noise, basePrice * 0.5);
    points.push({ day: i, price });
  }
  // S'assure que le dernier point = prix actuel
  points[points.length - 1].price = basePrice;
  return points;
}

/* ── Sparkline SVG ──────────────────────────────────────────────────────────── */
function Sparkline({ data, positive, height = 40 }: { data: { day: number; price: number }[]; positive: boolean; height?: number }) {
  if (data.length < 2) return null;
  const W = 100;
  const prices = data.map((d) => d.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;

  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = height - ((d.price - min) / range) * height;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(" ");

  const firstPt = `0,${height}`;
  const lastPt  = `${W},${height}`;
  const fillPts = `${firstPt} ${pts} ${lastPt}`;
  const color = positive ? "#16a34a" : "#dc2626";
  const fillId = `fill-${positive ? "up" : "down"}`;

  return (
    <svg viewBox={`0 0 ${W} ${height}`} className="w-full" style={{ height }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={fillPts} fill={`url(#${fillId})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── Courbe complète interactive avec hover ──────────────────────────────────── */
function FullChart({
  data,
  positive,
  symbol,
  currentPrice,
}: {
  data: { day: number; price: number }[];
  positive: boolean;
  symbol: string;
  currentPrice: number;
}) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const W = 400; const H = 120;
  const prices = data.map((d) => d.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const color = positive ? "#16a34a" : "#dc2626";

  const toX = (i: number) => (i / (data.length - 1)) * W;
  const toY = (p: number) => H - ((p - min) / range) * (H - 16) - 4;

  const pts = data.map((d, i) => `${toX(i).toFixed(1)},${toY(d.price).toFixed(1)}`).join(" ");
  const fillPts = `0,${H} ${pts} ${W},${H}`;
  const fillId = "chart-fill";

  const hovered = hoverIdx !== null ? data[hoverIdx] : null;

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full rounded-xl overflow-hidden"
        style={{ height: H }}
        onMouseLeave={() => setHoverIdx(null)}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * W;
          const idx = Math.round((x / W) * (data.length - 1));
          setHoverIdx(Math.max(0, Math.min(data.length - 1, idx)));
        }}
      >
        <defs>
          <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.12" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={fillPts} fill={`url(#${fillId})`} />
        <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

        {/* Ligne verticale hover */}
        {hoverIdx !== null && (
          <>
            <line
              x1={toX(hoverIdx)} y1={0}
              x2={toX(hoverIdx)} y2={H}
              stroke={color} strokeWidth="1" strokeDasharray="3,3" opacity="0.6"
            />
            <circle
              cx={toX(hoverIdx)} cy={toY(data[hoverIdx].price)}
              r="4" fill={color} stroke="white" strokeWidth="2"
            />
          </>
        )}
      </svg>

      {/* Tooltip */}
      {hovered && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none">
          <div className="px-2.5 py-1.5 rounded-lg bg-[var(--text-1)] text-white text-xs font-semibold shadow-lg whitespace-nowrap">
            {hovered.price.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            <span className="text-[10px] font-normal opacity-60 ml-1">J-{data.length - 1 - hovered.day}</span>
          </div>
        </div>
      )}

      {/* Axes prix */}
      <div className="flex justify-between text-[10px] text-[var(--text-3)] mt-1 px-0.5">
        <span>{min.toLocaleString("fr-FR", { maximumFractionDigits: 0 })}</span>
        <span className="font-medium text-[var(--text-2)]">{symbol}</span>
        <span>{max.toLocaleString("fr-FR", { maximumFractionDigits: 0 })}</span>
      </div>
    </div>
  );
}

/* ── Périodes de la courbe ───────────────────────────────────────────────────── */
const PERIODS: { label: string; days: number }[] = [
  { label: "7J",  days: 7 },
  { label: "1M",  days: 30 },
  { label: "3M",  days: 90 },
  { label: "1A",  days: 365 },
];

/* ── Vue détail d'un actif (avec courbe) ─────────────────────────────────────── */
function AssetDetail({ item, onBack }: { item: any; onBack: () => void }) {
  const [period, setPeriod] = useState(1); // index dans PERIODS
  const positive = item.trend === "up";

  const chartData = useMemo(
    () => generateChartData(item.price, item.pct, PERIODS[period].days),
    [item.price, item.pct, period]
  );

  return (
    <div className="p-6 space-y-5">
      {/* Back */}
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-[var(--text-3)] hover:text-[var(--text-1)] transition-colors">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        Retour
      </button>

      {/* Header actif */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xl font-bold text-[var(--text-1)]">{item.name}</p>
          <p className="text-sm text-[var(--text-3)]">{item.symbol}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold tabular-nums text-[var(--text-1)]">
            {item.price.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className={`text-sm font-semibold ${positive ? "text-[var(--green)]" : "text-[var(--red)]"}`}>
            {item.change > 0 ? "+" : ""}{item.change.toFixed(2)} ({item.pct > 0 ? "+" : ""}{item.pct.toFixed(2)}%)
          </p>
        </div>
      </div>

      {/* Sélecteur période */}
      <div className="flex gap-1">
        {PERIODS.map((p, i) => (
          <button
            key={p.label}
            onClick={() => setPeriod(i)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              period === i
                ? "bg-[var(--accent)] text-white"
                : "bg-[var(--bg-hover)] text-[var(--text-2)] hover:bg-[var(--bg-active)]"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Courbe */}
      <FullChart data={chartData} positive={positive} symbol={item.symbol} currentPrice={item.price} />

      {/* Mini stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Ouverture",  value: (item.price - item.change).toLocaleString("fr-FR", { maximumFractionDigits: 2 }) },
          { label: "Variation J", value: `${item.change > 0 ? "+" : ""}${item.change.toFixed(2)}` },
          { label: "Variation %", value: `${item.pct > 0 ? "+" : ""}${item.pct.toFixed(2)}%` },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <p className="text-[10px] text-[var(--text-3)]">{s.label}</p>
            <p className="text-sm font-bold text-[var(--text-1)] mt-0.5">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── StockWidgetExpanded ─────────────────────────────────────────────────────── */
export function StockWidgetExpanded({ widget, onClose }: { widget: WidgetConfig; onClose: () => void }) {
  const { items = [], news = [] } = widget.data;
  const [selected, setSelected] = useState<any | null>(null);

  if (selected) {
    return <AssetDetail item={selected} onBack={() => setSelected(null)} />;
  }

  return (
    <div className="p-6 space-y-5">
      {/* Liste des actifs */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-3)]">
          Indices & Actions — cliquez pour voir la courbe
        </p>
        {items.map((s: any) => {
          const positive = s.trend === "up";
          const chartData = generateChartData(s.price, s.pct, 30);
          return (
            <button
              key={s.symbol}
              onClick={() => setSelected(s)}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-[var(--border)] hover:border-[var(--accent)]/40 hover:bg-[var(--bg-hover)] transition-all group text-left"
            >
              {/* Gauche : icône + nom */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-none ${
                  positive ? "bg-[var(--green-light)] text-[var(--green)]" : "bg-[var(--red-light)] text-[var(--red)]"
                }`}>
                  {positive ? "↑" : "↓"}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--text-1)] truncate">{s.name}</p>
                  <p className="text-xs text-[var(--text-3)]">{s.symbol}</p>
                </div>
              </div>

              {/* Centre : mini sparkline */}
              <div className="w-20 h-8 mx-4 flex-none opacity-70 group-hover:opacity-100 transition-opacity">
                <Sparkline data={chartData} positive={positive} height={32} />
              </div>

              {/* Droite : prix + variation */}
              <div className="text-right flex-none">
                <p className="text-sm font-bold tabular-nums text-[var(--text-1)]">
                  {s.price.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className={`text-xs font-medium ${positive ? "text-[var(--green)]" : "text-[var(--red)]"}`}>
                  {s.pct > 0 ? "+" : ""}{s.pct.toFixed(2)}%
                </p>
              </div>

              {/* Flèche hint */}
              <svg width="14" height="14" className="text-[var(--text-3)] ml-2 flex-none opacity-0 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          );
        })}
      </div>

      {/* News financières */}
      {news.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-3)] mb-3">Actualités financières</p>
          <div className="space-y-2">
            {news.map((n: any, i: number) => (
              <div key={i} className="p-3 rounded-xl bg-[var(--bg-hover)] flex items-start gap-3">
                <span className="text-lg flex-none">📰</span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--text-1)] line-clamp-2">{n.title}</p>
                  <p className="text-xs text-[var(--text-3)] mt-1">{n.source} · {n.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
