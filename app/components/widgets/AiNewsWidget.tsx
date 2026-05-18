"use client";
import type { WidgetConfig } from "@/app/types";

const CATEGORY_COLORS: Record<string, string> = {
  LLM: "#6366f1", Recherche: "#0ea5e9", Startups: "#f59e0b", Société: "#10b981", Sécurité: "#ef4444",
};

export function AiNewsWidgetExpanded({ widget, onClose }: { widget: WidgetConfig; onClose: () => void }) {
  const articles = widget.data.articles ?? [];
  return (
    <div className="p-6 space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-3)]">
        Dernières actualités IA
      </p>
      {articles.map((a: any, i: number) => (
        <div key={a.id ?? i} className="p-4 rounded-xl border border-[var(--border)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer group">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className="badge"
                  style={{ background: (CATEGORY_COLORS[a.category] ?? "#6366f1") + "18", color: CATEGORY_COLORS[a.category] ?? "#6366f1" }}
                >
                  {a.category}
                </span>
                <span className="text-[10px] text-[var(--text-3)]">{a.time}</span>
              </div>
              <p className="text-sm font-semibold text-[var(--text-1)] line-clamp-2 group-hover:text-[var(--accent)] transition-colors">
                {a.title}
              </p>
              <p className="text-xs text-[var(--text-3)] mt-1">{a.source}</p>
            </div>
            <svg width="14" height="14" className="text-[var(--text-3)] flex-none mt-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </div>
        </div>
      ))}
    </div>
  );
}
