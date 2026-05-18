"use client";

/**
 * AiNewsWidget – dernières actualités sur l'IA via NewsAPI.
 *
 * API : https://newsapi.org (clé gratuite — 100 req/jour)
 * Variable d'env : NEXT_PUBLIC_NEWSAPI_KEY
 *
 * Attention : NewsAPI bloque les appels côté navigateur en production.
 * → Un proxy Next.js /api/ainews est fourni pour contourner cette limite.
 *
 * Modes :
 *  - inplace  : 1 article titre + source
 *  - focus    : liste des 10 derniers articles avec résumé
 *  - fullscreen : liste complète avec image
 */

import { useEffect, useState, useCallback } from "react";
import type { WidgetProps, AiNewsData } from "../../types";
import { Card } from "../../components/ui";

interface Article {
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  source: { name: string };
  publishedAt: string;
}

function timeAgo(dateStr: string) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 3600) return `${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}j`;
}

export function AiNewsWidget({
  widget,
  mode,
  onFocus,
  onFullscreen,
  onClose,
}: WidgetProps) {
  const data = widget.data as AiNewsData;
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = useCallback(async () => {
    try {
      setLoading(true);
      // Appel via notre proxy Next.js (évite le blocage CORS de NewsAPI)
      const keywords = Array.isArray(data.keywords)
        ? data.keywords.join(" OR ")
        : String(data.keywords);
      const pageSize = 20; // Default limit
      const res = await fetch(
        `/api/ainews?q=${encodeURIComponent(keywords)}&pageSize=${pageSize}`,
      );
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const json = await res.json();
      setArticles(json.articles ?? []);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [data.keywords]);

  useEffect(() => {
    const run = window.setTimeout(fetchNews, 0);
    const id = setInterval(fetchNews, 30 * 60_000); // refresh 30 min
    return () => {
      clearInterval(id);
      window.clearTimeout(run);
    };
  }, [fetchNews]);

  if (loading && articles.length === 0) {
    return (
      <Card className="flex h-full items-center justify-center">
        <span className="animate-pulse text-xs text-zinc-500">Actus IA…</span>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center">
        <span className="text-2xl">📰</span>
        <p className="text-xs text-red-400">{error}</p>
        <p className="text-xs text-zinc-600">
          Vérifiez NEXT_PUBLIC_NEWSAPI_KEY
        </p>
      </Card>
    );
  }

  const first = articles[0];

  // ── In-place ──────────────────────────────────────────────────────────────
  if (mode === "compact") {
    return (
      <Card
        hoverable={true}
        onClick={onFocus}
        className="flex h-full flex-col justify-between gap-2 p-4"
      >
        <div className="flex items-center gap-1">
          <span className="text-sm">🤖</span>
          <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">
            Actus IA
          </p>
        </div>

        {first ? (
          <>
            <p className="text-sm font-semibold text-foreground line-clamp-3 leading-snug">
              {first.title}
            </p>
            <p className="text-xs text-zinc-500">
              {first.source.name} · {timeAgo(first.publishedAt)}
            </p>
          </>
        ) : (
          <p className="text-xs text-zinc-600">Aucun article</p>
        )}
      </Card>
    );
  }

  // ── Focus ─────────────────────────────────────────────────────────────────
  if (mode === "focus") {
    return (
      <div className="flex flex-col gap-4 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">🤖 Actus IA</h2>
          <div className="flex gap-2">
            {widget.fullscreenable && (
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

        <div className="flex flex-col gap-3 overflow-y-auto max-h-[480px] pr-1">
          {articles.slice(0, 10).map((article, i) => (
            <a
              key={i}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col gap-1 rounded-xl border border-zinc-200 dark:border-zinc-700/50 bg-zinc-50 dark:bg-zinc-800/40 p-3 hover:border-indigo-400/50 transition-colors"
            >
              <p className="text-sm font-medium text-foreground group-hover:text-indigo-400 line-clamp-2">
                {article.title}
              </p>
              {article.description && (
                <p className="text-xs text-zinc-500 line-clamp-2">
                  {article.description}
                </p>
              )}
              <p className="text-xs text-zinc-500">
                {article.source.name} · {timeAgo(article.publishedAt)}
              </p>
            </a>
          ))}
        </div>
      </div>
    );
  }

  // ── Fullscreen ─────────────────────────────────────────────────────────────
  return (
    <div className="flex w-full max-w-3xl flex-col gap-4 p-6">
      <h1 className="text-2xl font-bold text-white">🤖 Dernières actus IA</h1>
      <p className="text-sm text-zinc-400">Source : {data.keywords}</p>

      <div className="grid gap-4 sm:grid-cols-2 max-h-[70vh] overflow-y-auto pr-1">
        {articles.map((article, i) => (
          <a
            key={i}
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col gap-2 rounded-2xl border border-zinc-700/50 bg-zinc-800/40 overflow-hidden hover:border-indigo-400/50 transition-colors"
          >
            {article.urlToImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={article.urlToImage}
                alt=""
                className="h-32 w-full object-cover"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            )}
            <div className="flex flex-col gap-1 p-3">
              <p className="text-sm font-semibold text-white group-hover:text-indigo-400 line-clamp-2">
                {article.title}
              </p>
              {article.description && (
                <p className="text-xs text-zinc-400 line-clamp-2">
                  {article.description}
                </p>
              )}
              <p className="text-xs text-zinc-500 mt-1">
                {article.source.name} · {timeAgo(article.publishedAt)}
              </p>
            </div>
          </a>
        ))}
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
