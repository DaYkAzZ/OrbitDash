# 🛰️ OrbitDash

**Dashboard ultra-personnalisable** construit avec Next.js 16, React 19, TypeScript, TailwindCSS v4 et Zustand.

---

## 🚀 Installation & démarrage

```bash
npm install
npm run dev
# Ouvrir http://localhost:3000
```

**Comptes de démo :**
| Email | Mot de passe | Rôle |
|---|---|---|
| `admin@orbitdash.dev` | `admin123` | Admin (accès /admin + layout drag) |
| `user@orbitdash.dev` | `user123` | Utilisateur standard |
| — | — | Invité (sans authentification) |

---

## 📐 Architecture

```
app/
├── page.tsx                  # Dashboard principal (zones left/right/top/bottom + focus)
├── layout.tsx                # Root layout avec Providers (Auth + Theme)
├── globals.css               # Design system (CSS vars light/dark, composants génériques)
│
├── login/page.tsx            # Page de connexion (formulaire + comptes démo)
├── admin/page.tsx            # Espace administration (protégé, role=admin uniquement)
│
├── components/
│   ├── widgets/
│   │   ├── CompactWidget.tsx       # Vue In-place (grille) – prop isFocusable
│   │   ├── ClockWidget.tsx         # Expanded view + in-place
│   │   ├── WeatherWidget.tsx       # Expanded + données admin-éditables
│   │   ├── StockWidget.tsx / CryptoWidget.tsx
│   │   ├── NotesWidget.tsx         # Édition in-place et en admin
│   │   ├── MoodWidget.tsx / ActivityWidget.tsx
│   │   ├── MusicWidget.tsx / TimerWidget.tsx / QuoteWidget.tsx / AiNewsWidget.tsx
│   ├── ExpandedWidgetModal.tsx     # Vue Focus (zone centrale) + Fullscreen
│   └── WidgetCatalogModal.tsx      # Widget Factory (ajout utilisateur)
│
├── store/
│   ├── useWidgetStore.ts     # État global Zustand + persistance localStorage
│   ├── AuthContext.tsx       # Auth simulée (admin/user/guest) + sessionStorage
│   ├── ThemeContext.tsx      # Dark/Light mode + densité (compact/spaced)
│   └── Providers.tsx         # Wrapper global
│
├── hooks/
│   ├── useDragDrop.ts        # Drag & Swap natif HTML5 (admin uniquement sur layout)
│   └── useWidgets.ts         # Hook utilitaire
│
├── types/
│   ├── widget.ts             # WidgetConfig, WidgetType, WidgetDisplayMode...
│   ├── theme.ts / user.ts
│   └── index.ts
│
└── services/                 # (prêt pour intégration API / Supabase)
```

---

## 🎯 Fonctionnalités implémentées

### A. Composants génériques
- `globals.css` : système complet de tokens CSS (`.card`, `.widget-card`, `.badge`, `.btn-primary`, `.btn-secondary`, `.btn-icon`, `.input-base`, `.textarea-base`, `.stat-card`)
- Composants réutilisables dans tous les widgets

### B. Système de Focus & 3 niveaux d'affichage
| Mode | Description |
|---|---|
| **In-place** | Widget dans la grille (sidebar/top/bottom) – interactions rapides |
| **Focus** | Clic sur widget → affichage dans la zone centrale avec données étendues |
| **Fullscreen** | Bouton ⤢ dans la zone centrale → overlay plein écran |

**Logique `isFocusable`** : `clock` et `timer` restent uniquement en mode in-place (prop `onClickOverride` = undefined dans CompactWidget → cursor-default, footer "Mode in-place uniquement")

### C. Espace Administration (`/admin`)
- Protégé : redirige vers `/login` si non connecté, ou `/` si non-admin
- **Ajouter** un widget : catalogue visuel + choix de position + `addWidget(type, pos)`
- **Modifier les données** de chaque widget (éditeurs spécialisés par type : notes, météo, humeur, citation, ou JSON brut)
- **Changer la position** d'un widget via select inline
- **Supprimer** un widget avec confirmation
- **Réinitialiser** le dashboard (avec double confirmation)
- Les modifications sont **immédiatement répercutées** sur le dashboard via Zustand

### D. Persistance
- Widgets : `localStorage` (`orbitdash-v2`) via `zustand/middleware/persist`
- Session utilisateur : `sessionStorage` (rechargement de page conserve la connexion)
- Thème : `localStorage` (`orbitdash-theme`)

---

## ⚙️ Fonctionnalités avancées

### Theme Engine
- `ThemeContext` : mode Sombre/Clair (`html.dark`) + densité Compact/Spaced (`data-density`)
- Toggle accessible depuis la navbar du dashboard
- CSS vars réactives sur tous les widgets

### Widget Factory
- `WidgetCatalogModal` : formulaire de sélection du type + position → `addWidget()`
- Accessible depuis la navbar (bouton "+ Ajouter") et la zone centrale vide

### Drag & Swap
- `useDragDrop` : HTML5 Drag API native
- Swap de position entre deux widgets (même colonne ou cross-colonne)
- Drop sur zone vide → déplacement vers cette zone

---

## 📊 Flux de données

```
Admin modifie données
       ↓
useWidgetStore.updateWidgetData()  [Zustand]
       ↓
localStorage persisted
       ↓
Dashboard re-render immédiat (reactive)
       ↓
CompactWidget + ExpandedWidgetModal affichent les nouvelles données
```

---

## 🛠️ Stack technique

| Technologie | Usage |
|---|---|
| Next.js 16 (App Router) | Framework React SSR/CSR |
| React 19 | UI |
| TypeScript | Typage strict |
| TailwindCSS v4 | Styles (via CSS vars) |
| Zustand v5 + persist | État global + localStorage |
| Framer Motion | Animations (widgets expanded) |
| Lucide React | Icônes |
