/**
 * Route API Next.js – proxy NewsAPI.
 * Contourne la restriction CORS de NewsAPI qui bloque les appels navigateur.
 * L'appel est fait côté serveur avec la clé secrète.
 *
 * GET /api/ainews?q=artificial+intelligence&pageSize=20
 */

import { NextRequest, NextResponse } from 'next/server';

const NEWS_KEY = process.env.NEWSAPI_KEY ?? process.env.NEXT_PUBLIC_NEWSAPI_KEY ?? '';

export async function GET(req: NextRequest) {
  if (!NEWS_KEY) {
    return NextResponse.json(
      { error: 'NEWSAPI_KEY manquante dans les variables d\'environnement.' },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') ?? 'artificial intelligence';
  const pageSize = searchParams.get('pageSize') ?? '20';

  const url = new URL('https://newsapi.org/v2/everything');
  url.searchParams.set('q', q);
  url.searchParams.set('pageSize', pageSize);
  url.searchParams.set('language', 'fr');
  url.searchParams.set('sortBy', 'publishedAt');
  url.searchParams.set('apiKey', NEWS_KEY);

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 1800 } }); // cache 30 min
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 502 });
  }
}
