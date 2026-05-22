"use client";
import { useState } from "react";
import type { WidgetConfig } from "@/app/types";
import { useWidgetStore } from "@/app/store/useWidgetStore";

export function NotesWidgetExpanded({ widget, onClose }: { widget: WidgetConfig; onClose: () => void }) {
  const { updateWidgetData } = useWidgetStore();
  const [content, setContent] = useState(widget.data.content ?? "");

  const save = () => updateWidgetData(widget.id, { content, lastModified: Date.now() });

  return (
    <div className="p-6 flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between">
        <p className="text-xs text-[var(--text-3)]">
          {content.split(" ").filter(Boolean).length} mots · {content.length} caractères
        </p>
        <button
          onClick={save}
          className="px-3 py-1.5 rounded-lg bg-[var(--accent)] text-white text-xs font-semibold hover:bg-[var(--accent-hover)] transition-colors"
        >
          Sauvegarder
        </button>
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onBlur={save}
        placeholder="Commencez à écrire…"
        className="flex-1 min-h-[300px] w-full rounded-xl border border-[var(--border)] bg-[var(--bg-hover)] p-4 text-sm text-[var(--text-1)] placeholder-[var(--text-3)] resize-none focus:outline-none focus:border-[var(--accent)] transition-colors leading-relaxed"
      />
    </div>
  );
}
