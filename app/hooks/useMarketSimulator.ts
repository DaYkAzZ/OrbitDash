"use client";

/**
 * useMarketSimulator — Simule des prix boursiers/crypto en temps réel
 * sans appel API. Marche aléatoire avec :
 *  - Volatilité propre à chaque actif
 *  - Tendance de fond (bull/bear aléatoire par session)
 *  - Micro-corrections pour rester réaliste
 *  - Pause le week-end pour la bourse (pas pour la crypto)
 */

import { useEffect, useRef } from "react";
import { useWidgetStore } from "@/app/store/useWidgetStore";

// Volatilité annualisée approximative par actif (en %)
const VOLATILITY: Record<string, number> = {
  CAC40: 0.9,  DAX: 1.0,  SP500: 0.8,  NVDA: 2.8,  AAPL: 1.4,
  BTC: 3.2,  ETH: 3.8,  SOL: 5.0,  BNB: 2.5,
};

// Tendance de fond par session (générée une fois au montage)
const sessionTrend: Record<string, number> = {};

function getVolatility(symbol: string) {
  return (VOLATILITY[symbol] ?? 1.5) / 100;
}

function getTrend(symbol: string) {
  if (!sessionTrend[symbol]) {
    // Tendance entre -0.3% et +0.3% par minute (session aléatoire)
    sessionTrend[symbol] = (Math.random() - 0.48) * 0.003;
  }
  return sessionTrend[symbol];
}

/** Génère un tick de prix réaliste */
function nextPrice(current: number, symbol: string, dt: number): number {
  const vol = getVolatility(symbol);
  const trend = getTrend(symbol);
  // Mouvement brownien géométrique discret
  const shock = (Math.random() + Math.random() - 1) * vol * Math.sqrt(dt / 60);
  const drift = trend * dt;
  // Micro-correction mean-reversion (évite la dérive infinie)
  return current * (1 + drift + shock);
}

export function useMarketSimulator() {
  const { widgets, updateWidgetData } = useWidgetStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevPricesRef = useRef<Record<string, number>>({});

  useEffect(() => {
    // Tick toutes les 2.5 secondes
    const INTERVAL = 2500;

    intervalRef.current = setInterval(() => {
      const { widgets: currentWidgets } = useWidgetStore.getState();

      currentWidgets.forEach((widget) => {
        if (widget.type !== "stock" && widget.type !== "crypto") return;

        const items: any[] = widget.data.items ?? [];
        if (!items.length) return;

        let changed = false;
        const updatedItems = items.map((item: any) => {
          const sym = item.symbol;
          // Initialise le prix de référence si premier tick
          if (!prevPricesRef.current[sym]) {
            prevPricesRef.current[sym] = item.price;
          }

          const oldPrice = prevPricesRef.current[sym];
          const newPrice = nextPrice(oldPrice, sym, INTERVAL / 1000);
          prevPricesRef.current[sym] = newPrice;

          // Prix d'ouverture (simulé = prix de départ de la session)
          const openKey = `open_${sym}`;
          if (!prevPricesRef.current[openKey]) {
            prevPricesRef.current[openKey] = item.price;
          }
          const openPrice = prevPricesRef.current[openKey];

          const change = newPrice - openPrice;
          const pct = (change / openPrice) * 100;
          const trend = newPrice >= oldPrice ? "up" : "down";

          changed = true;
          return {
            ...item,
            price: Math.max(newPrice, 0.01),
            change: parseFloat(change.toFixed(2)),
            pct: parseFloat(pct.toFixed(2)),
            trend,
          };
        });

        if (changed) {
          updateWidgetData(widget.id, { items: updatedItems });
        }
      });
    }, INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []); // monte une seule fois
}
