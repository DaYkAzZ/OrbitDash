# 🛰️ OrbitDash - Smart Dashboard Ultra-Moderne

Un dashboard intelligent, fluide et ultra-moderne construit avec **Next.js 15**, **React 19**, **TypeScript**, **TailwindCSS** et **Framer Motion**.

## ✨ Caractéristiques

### 🎯 Système de Widgets Complet

- **7 widgets prédéfinis** : Horloge, Météo, Bourse, Humeur, Notes, Musique, Activité, Actualités IA
- **Système modulaire et extensible** : Facile d'ajouter de nouveaux widgets
- **Gestion d'état centralisée** avec Zustand
- **Persistance localStorage** automatique

### 🎨 Design Premium

- **Dark mode premium** minimaliste
- **Glassmorphism subtil** avec gradients élégants
- **Animations fluides** avec Framer Motion
- **Responsive** : Desktop, Tablette, Mobile
- **Inspirations** : Vercel, Linear, Arc Browser, Apple Dashboard

### 🔄 Interactions Intuitives

- **Clic sur widget** → Expansion en zone centrale
- **Drag & drop** (préparé)
- **Suppression facile** des widgets
- **Favoris et Épinglage** (préparé)
- **Réorganisation** intuitive

### 📊 Visualisations

- **Graphiques en temps réel**
- **Statistiques animées**
- **Indicateurs colorés** (rouge/vert dynamique)
- **Micro-interactions** fluides

## 🏗️ Architecture

```
/app
├── /components              # Composants React
│   ├── DashboardHeader.tsx  # Barre supérieure
│   ├── DashboardLayout.tsx  # Layout principal
│   ├── ExpandedWidgetView.tsx
│   ├── LoadingScreen.tsx
│   ├── Providers.tsx
│   └── /widgets             # Widgets individuels
│       ├── CompactWidget.tsx
│       ├── ClockWidget.tsx
│       ├── WeatherWidget.tsx
│       ├── StockWidget.tsx
│       ├── MoodWidget.tsx
│       ├── NotesWidget.tsx
│       ├── MusicWidget.tsx
│       ├── ActivityWidget.tsx
│       └── AiNewsWidget.tsx
├── /store                   # État global Zustand
│   ├── useWidgetStore.ts    # Store principal
│   └── useThemeStore.ts
├── /types                   # Types TypeScript
│   ├── widget.ts
│   ├── theme.ts
│   └── user.ts
├── /lib                     # Utilitaires
│   └── widget-utils.ts
├── /services                # Services (API, etc.)
├── layout.tsx               # Layout racine
├── page.tsx                 # Dashboard principal
└── globals.css              # Styles globaux
```

## 🎯 Types TypeScript Completos

### WidgetConfig

Configuration complète d'un widget avec:

- `id`, `type`, `title`, `position`
- `data` (données spécifiques au type)
- `metadata` (timestamps, accès count)
- `settings` (personnalisation)

### WidgetData

Types spécialisés:

- `WeatherData` - Informations météo
- `StockData` - Données boursières
- `MoodData` - Données d'humeur
- `NotesData` - Contenu des notes
- `ClockData` - Info horloge
- `MusicData` - Info musicale
- `ActivityData` - Stats d'activité
- `AiNewsData` - Actualités

## 🚀 Store Zustand

### useWidgetStore

État centralisé avec actions:

```typescript
// État
widgets: WidgetConfig[]
expandedWidgetId: string | null
isLoading: boolean
error: string | null

// Actions principales
addWidget(type, position) → string
removeWidget(widgetId) → void
expandWidget(widgetId) → void
collapseWidget() → void
updateWidgetData(widgetId, data) → void
toggleFavorite(widgetId) → void
togglePin(widgetId) → void
loadWidgets() → void
saveWidgets() → void
```

## 🎨 Design System

### Couleurs

- **Dark base** : `#09090b` (zinc-950)
- **Card** : `#18181b` (zinc-900)
- **Borders** : `#3f3f46` (zinc-700)
- **Purple accent** : `#a855f7`
- **Blue accent** : `#3b82f6`

### Composants

- **Widgets compacts** : 160px min-height
- **Widgets expandés** : Modal jusqu'à 4xl
- **Spacing** : Système 4px (TailwindCSS)
- **Corners** : 12px radius (rounded-xl)

## 🎬 Animations Framer Motion

### Principes

- **Smooth springs** pour le naturel
- **Stagger children** pour la séquence
- **Hover states** subtiles
- **Exit animations** fluides

### Patterns

```typescript
// Scale on hover
whileHover={{ scale: 1.02 }}

// Pop on click
whileTap={{ scale: 0.95 }}

// Stagger children
variants={{
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}}
```

## 📱 Responsive Design

### Breakpoints

- **Mobile** : < 768px (widgets verticaux)
- **Tablet** : 768px - 1024px (2 colonnes)
- **Desktop** : > 1024px (layout complet)

## 🔧 Configuration

### localStorage

Clé: `orbit-widgets`
Format: `{ widgets: WidgetConfig[] }`
Auto-synchronisé à chaque modification

## 📦 Installation

```bash
# Install dependencies
npm install

# Development
npm run dev

# Build
npm run build

# Production
npm start
```

## 🎓 Guide de Développement

### Ajouter un Nouveau Widget

1. **Créer le type de données** dans `app/types/widget.ts`
2. **Ajouter au WidgetType** enum
3. **Créer le composant expandé** :
   ```typescript
   export function NewWidget({ widget, onClose }: NewWidgetProps) {
     return <div>...</div>
   }
   ```
4. **Ajouter dans ExpandedWidgetView.tsx**
5. **Ajouter l'export** dans `components/index.ts`

### Mettre à jour les Styles

- **Globaux** : `app/globals.css`
- **Composants** : Classes TailwindCSS inline
- **Animations** : Framer Motion dans les composants

### Ajouter une Nouvelle Route

1. Créer un dossier dans `/app`
2. Ajouter `page.tsx`
3. Importer les composants nécessaires
4. Les routes sont auto-générées avec App Router

## 🚀 Déploiement

### Vercel (Recommandé)

```bash
vercel deploy
```

### Autres plateformes

```bash
npm run build
npm start
```

## 🎯 Feuille de Route

- ✅ Architecture core
- ✅ 7 widgets de base
- ✅ Animations Framer Motion
- ✅ Persistance localStorage
- ⬜ Drag & drop amélioration
- ⬜ API réelle météo/stocks
- ⬜ Authentification optionnelle
- ⬜ Sync multi-devices
- ⬜ Notifications
- ⬜ Mode focus avancé

## 📝 Licence

MIT - Libre d'utilisation

## 🙋 Support

Pour des questions, créez une issue sur le repository.

---

**OrbitDash** - Votre hub intelligent personnel. 🚀
