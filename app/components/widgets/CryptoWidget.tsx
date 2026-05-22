"use client";

import { useState, useMemo } from "react";
import type { WidgetConfig } from "@/app/types";

/* ── Utilitaires graphiques (identiques à StockWidget) ────────────────────── */
function generateChartData(basePrice: number, pct: number, days = 30) {
  const points: { day: number; price: number }[] = [];
  const startPrice = basePrice / (1 + pct / 100);
  let price = startPrice;
  const volatility = Math.abs(pct) * 0.3 + 0.6; // crypto plus volatile
  for (let i = 0; i <= days; i++) {
    const trend = (pct / 100 / days) * basePrice;
    const noise = (Math.random() - 0.48) * volatility * basePrice * 0.012;
    price = Math.max(price + trend + noise, basePrice * 0.3);
    points.push({ day: i, price });
  }
  points[points.length - 1].price = basePrice;
  return points;
}

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
  const fillPts = `0,${height} ${pts} ${W},${height}`;
  const color = positive ? "#16a34a" : "#dc2626";
  const id = `crypto-fill-${positive}`;
  return (
    <svg viewBox={`0 0 ${W} ${height}`} className="w-full" style={{ height }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={fillPts} fill={`url(#${id})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FullChart({ data, positive, symbol }: { data: { day:number; price:number }[]; positive: boolean; symbol: string }) {
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
  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-xl overflow-hidden" style={{ height: H }}
        onMouseLeave={() => setHoverIdx(null)}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const idx = Math.round(((e.clientX - rect.left) / rect.width) * (data.length - 1));
          setHoverIdx(Math.max(0, Math.min(data.length - 1, idx)));
        }}>
        <defs>
          <linearGradient id="cf" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.12" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={fillPts} fill="url(#cf)" />
        <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {hoverIdx !== null && (
          <>
            <line x1={toX(hoverIdx)} y1={0} x2={toX(hoverIdx)} y2={H} stroke={color} strokeWidth="1" strokeDasharray="3,3" opacity="0.6" />
            <circle cx={toX(hoverIdx)} cy={toY(data[hoverIdx].price)} r="4" fill={color} stroke="white" strokeWidth="2" />
          </>
        )}
      </svg>
      {hoverIdx !== null && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none">
          <div className="px-2.5 py-1.5 rounded-lg bg-[var(--text-1)] text-white text-xs font-semibold shadow-lg whitespace-nowrap">
            ${data[hoverIdx].price.toLocaleString("en-US", { maximumFractionDigits: 0 })}
            <span className="text-[10px] font-normal opacity-60 ml-1">J-{data.length - 1 - hoverIdx}</span>
          </div>
        </div>
      )}
      <div className="flex justify-between text-[10px] text-[var(--text-3)] mt-1 px-0.5">
        <span>${min.toLocaleString("en-US", { maximumFractionDigits: 0 })}</span>
        <span className="font-medium text-[var(--text-2)]">{symbol}</span>
        <span>${max.toLocaleString("en-US", { maximumFractionDigits: 0 })}</span>
      </div>
    </div>
  );
}

const PERIODS = [{ label: "7J", days: 7 }, { label: "1M", days: 30 }, { label: "3M", days: 90 }, { label: "1A", days: 365 }];

const CRYPTO_ICONS: Record<string, string> = { BTC: "₿", ETH: "Ξ", SOL: "◎", BNB: "B" };

function AssetDetail({ item, onBack }: { item: any; onBack: () => void }) {
  const [period, setPeriod] = useState(1);
  const positive = item.trend === "up";
  const chartData = useMemo(() => generateChartData(item.price, item.pct, PERIODS[period].days), [item.price, item.pct, period]);
  return (
    <div className="p-6 space-y-5">
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-[var(--text-3)] hover:text-[var(--text-1)] transition-colors">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        Retour
      </button>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold"
            style={{ background: positive ? "var(--green-light)" : "var(--red-light)", color: positive ? "var(--green)" : "var(--red)" }}>
            {CRYPTO_ICONS[item.symbol] ?? item.symbol[0]}
          </div>
          <div>
            <p className="text-xl font-bold text-[var(--text-1)]">{item.name}</p>
            <p className="text-sm text-[var(--text-3)]">{item.symbol} · Cryptomonnaie</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold tabular-nums text-[var(--text-1)]">
            ${item.price.toLocaleString("en-US", { maximumFractionDigits: item.price > 100 ? 0 : 2 })}
          </p>
          <p className={`text-sm font-semibold ${positive ? "text-[var(--green)]" : "text-[var(--red)]"}`}>
            {item.change > 0 ? "+" : ""}${Math.abs(item.change).toLocaleString()} ({item.pct > 0 ? "+" : ""}{item.pct.toFixed(2)}%)
          </p>
        </div>
      </div>
      <div className="flex gap-1">
        {PERIODS.map((p, i) => (
          <button key={p.label} onClick={() => setPeriod(i)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${period === i ? "bg-[var(--accent)] text-white" : "bg-[var(--bg-hover)] text-[var(--text-2)] hover:bg-[var(--bg-active)]"}`}>
            {p.label}
          </button>
        ))}
      </div>
      <FullChart data={chartData} positive={positive} symbol={item.symbol} />
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Prix d'ouverture", value: `$${(item.price - item.change).toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
          { label: "Variation 24h",   value: `${item.change > 0 ? "+" : ""}$${Math.abs(item.change).toLocaleString()}` },
          { label: "Variation %",     value: `${item.pct > 0 ? "+" : ""}${item.pct.toFixed(2)}%` },
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

export function CryptoWidgetExpanded({ widget, onClose }: { widget: WidgetConfig; onClose: () => void }) {
  const { items = [] } = widget.data;
  const [selected, setSelected] = useState<any | null>(null);

  if (selected) return <AssetDetail item={selected} onBack={() => setSelected(null)} />;

  return (
    <div className="p-6 space-y-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-3)]">
        Cryptomonnaies — cliquez pour voir la courbe
      </p>
      <div className="space-y-2">
        {items.map((s: any) => {
          const positive = s.trend === "up";
          const chartData = generateChartData(s.price, s.pct, 30);
          return (
            <button key={s.symbol} onClick={() => setSelected(s)}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-[var(--border)] hover:border-[var(--accent)]/40 hover:bg-[var(--bg-hover)] transition-all group text-left">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold flex-none ${positive ? "bg-[var(--green-light)] text-[var(--green)]" : "bg-[var(--red-light)] text-[var(--red)]"}`}>
                  {CRYPTO_ICONS[s.symbol] ?? s.symbol[0]}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--text-1)] truncate">{s.name}</p>
                  <p className="text-xs text-[var(--text-3)]">{s.symbol}</p>
                </div>
              </div>
              <div className="w-20 h-8 mx-4 flex-none opacity-70 group-hover:opacity-100 transition-opacity">
                <Sparkline data={chartData} positive={positive} height={32} />
              </div>
              <div className="text-right flex-none">
                <p className="text-sm font-bold tabular-nums text-[var(--text-1)]">
                  ${s.price.toLocaleString("en-US", { maximumFractionDigits: s.price > 100 ? 0 : 2 })}
                </p>
                <p className={`text-xs font-medium ${positive ? "text-[var(--green)]" : "text-[var(--red)]"}`}>
                  {s.pct > 0 ? "+" : ""}{s.pct.toFixed(2)}%
                </p>
              </div>
              <svg width="14" height="14" className="text-[var(--text-3)] ml-2 flex-none opacity-0 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          );
        })}
      </div>
    </div>
  );
}
