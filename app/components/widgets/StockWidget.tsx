"use client";
import type { WidgetConfig } from "@/app/types";

export function StockWidgetExpanded({ widget, onClose }: { widget: WidgetConfig; onClose: () => void }) {
  const { items = [], news = [] } = widget.data;

  return (
    <div className="p-6 space-y-5">
      {/* Indices */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-3)]">Indices & Actions</p>
        {items.map((s: any) => (
          <div key={s.symbol} className="flex items-center justify-between p-3 rounded-xl border border-[var(--border)] hover:bg-[var(--bg-hover)] transition-colors">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${s.trend === "up" ? "bg-[var(--green-light)] text-[var(--green)]" : "bg-[var(--red-light)] text-[var(--red)]"}`}>
                {s.trend === "up" ? "↑" : "↓"}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[var(--text-1)]">{s.name}</p>
                <p className="text-xs text-[var(--text-3)]">{s.symbol}</p>
              </div>
            </div>
            <div className="text-right flex-none ml-4">
              <p className="text-sm font-bold tabular-nums text-[var(--text-1)]">{s.price.toLocaleString("fr-FR")}</p>
              <p className={`text-xs font-medium ${s.trend === "up" ? "text-[var(--green)]" : "text-[var(--red)]"}`}>
                {s.change > 0 ? "+" : ""}{s.change.toFixed(2)} ({s.pct > 0 ? "+" : ""}{s.pct.toFixed(2)}%)
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* News */}
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
