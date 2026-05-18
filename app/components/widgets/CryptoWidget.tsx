"use client";
import type { WidgetConfig } from "@/app/types";

export function CryptoWidgetExpanded({ widget, onClose }: { widget: WidgetConfig; onClose: () => void }) {
  const { items = [] } = widget.data;
  return (
    <div className="p-6 space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-3)]">Cryptomonnaies</p>
      {items.map((s: any) => (
        <div key={s.symbol} className="flex items-center justify-between p-3 rounded-xl border border-[var(--border)] hover:bg-[var(--bg-hover)] transition-colors">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${s.trend === "up" ? "bg-[var(--green-light)] text-[var(--green)]" : "bg-[var(--red-light)] text-[var(--red)]"}`}>
              {s.symbol[0]}
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--text-1)]">{s.name}</p>
              <p className="text-xs text-[var(--text-3)]">{s.symbol}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold tabular-nums text-[var(--text-1)]">${s.price.toLocaleString()}</p>
            <p className={`text-xs font-medium ${s.trend === "up" ? "text-[var(--green)]" : "text-[var(--red)]"}`}>
              {s.pct > 0 ? "+" : ""}{s.pct.toFixed(2)}%
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
