"use client";
import { useState } from "react";
import type { WidgetConfig } from "@/app/types";
import { useWidgetStore } from "@/app/store/useWidgetStore";

const QUOTES = [
  { text: "L'intelligence, c'est la capacité de s'adapter au changement.", author: "Stephen Hawking", cat: "Science" },
  { text: "Le succès, c'est se relever une fois de plus qu'on ne tombe.", author: "Winston Churchill", cat: "Succès" },
  { text: "La créativité, c'est l'intelligence qui s'amuse.", author: "Albert Einstein", cat: "Créativité" },
  { text: "Ne comptez pas les jours, faites que les jours comptent.", author: "Muhammad Ali", cat: "Motivation" },
  { text: "Votre temps est limité, ne le gâchez pas en vivant la vie de quelqu'un d'autre.", author: "Steve Jobs", cat: "Vie" },
];

export function QuoteWidgetExpanded({ widget, onClose }: { widget: WidgetConfig; onClose: () => void }) {
  const { updateWidgetData } = useWidgetStore();
  const [idx, setIdx] = useState(0);

  const q = QUOTES[idx % QUOTES.length];

  const next = () => {
    const ni = (idx + 1) % QUOTES.length;
    setIdx(ni);
    updateWidgetData(widget.id, { text: QUOTES[ni].text, author: QUOTES[ni].author, category: QUOTES[ni].cat });
  };

  return (
    <div className="p-10 flex flex-col items-center gap-8 min-h-[300px] justify-center">
      <div className="text-6xl text-[var(--accent)] opacity-30 self-start">"</div>
      <blockquote className="text-xl font-medium text-[var(--text-1)] text-center leading-relaxed max-w-xl -mt-8">
        {q.text}
      </blockquote>
      <footer className="flex flex-col items-center gap-1">
        <p className="text-sm font-semibold text-[var(--text-2)]">— {q.author}</p>
        <span className="badge badge-accent">{q.cat}</span>
      </footer>
      <button onClick={next}
        className="mt-2 px-5 py-2 rounded-xl border border-[var(--border)] text-sm text-[var(--text-2)] hover:bg-[var(--bg-hover)] transition-colors font-medium">
        Nouvelle citation ✨
      </button>
    </div>
  );
}
