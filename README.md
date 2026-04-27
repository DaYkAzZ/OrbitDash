# 🛰️ OrbitDash

Tableau de bord dynamique et ultra-personnalisable — projet React/Next.js.

## Stack

| Outil | Rôle |
|---|---|
| Next.js 16 (App Router) | Framework React |
| Tailwind CSS 4 | Styles |
| Zustand | State management global |
| Supabase | Backend & base de données |
| TypeScript | Typage strict |

---

## Installation

```bash
npm install
# puis copier .env.local et renseigner les clés Supabase
npm run dev
```

---

## Configuration Supabase

### 1. Créer la table `widgets`

```sql
create table widgets (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  title text not null,
  position integer not null default 0,
  focusable boolean not null default true,
  fullscreenable boolean not null default true,
  data jsonb not null default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS : lecture publique, écriture authentifiée
alter table widgets enable row level security;
create policy "read all" on widgets for select using (true);
create policy "write authenticated" on widgets for all using (auth.role() = 'authenticated');
```

### 2. Fonction pour le swap de positions

```sql
create or replace function swap_widget_positions(id_a uuid, pos_a int, id_b uuid, pos_b int)
returns void language plpgsql as $$
begin
  update widgets set position = pos_b where id = id_a;
  update widgets set position = pos_a where id = id_b;
end;
$$;
```

### 3. Seed de démo (optionnel)

```sql
insert into widgets (type, title, position, focusable, fullscreenable, data) values
  ('clock', 'Paris', 0, true, true, '{"timezone":"Europe/Paris","showSeconds":true,"format24h":true}'),
  ('poll', 'Sondage du jour', 1, true, true, '{"question":"Quel est votre langage préféré ?","options":[{"id":"1","label":"TypeScript","votes":12},{"id":"2","label":"Python","votes":8},{"id":"3","label":"Rust","votes":5}],"allowMultiple":false}');
```

---

## Architecture

```
app/
├── types/          ← Contrats TypeScript (Widget, User, Theme)
├── services/       ← Accès Supabase (widgetService.ts)
├── store/          ← Zustand (useWidgetStore) + Contexts (Theme, Auth)
├── hooks/          ← Hooks métier (useWidgets)
├── widgets/        ← Un dossier par type de widget (Clock, Poll…)
│   └── WidgetRenderer.tsx  ← Résoud dynamiquement le bon composant
├── components/
│   ├── ui/         ← Composants génériques (Button, Card, Input)
│   └── layout/     ← Navbar, WidgetGrid, FocusZone, FullscreenOverlay
├── admin/          ← Page administration
└── page.tsx        ← Dashboard principal
```

### Circulation des données

```
Supabase DB
  ↕ widgetService (CRUD)
  ↕ useWidgetStore (Zustand)
    ↕ WidgetGrid     → WidgetRenderer → [Clock|Poll|…]Widget (mode: inplace)
    ↕ FocusZone      → WidgetRenderer → [Clock|Poll|…]Widget (mode: focus)
    ↕ FullscreenOverlay → WidgetRenderer → [Clock|Poll|…]Widget (mode: fullscreen)
  ↕ AdminPage        → editWidget / addWidget / removeWidget
```

---

## Ajouter un nouveau widget

1. Créer `app/widgets/MonWidget/MonWidget.tsx` qui accepte `WidgetProps`
2. Exporter dans `app/widgets/MonWidget/index.ts`
3. L'enregistrer dans `app/widgets/WidgetRenderer.tsx` → `WIDGET_MAP`
4. Ajouter le type dans `app/types/widget.ts`

---

## Équipe

| Nom | GitHub |
|---|---|
| … | … |
