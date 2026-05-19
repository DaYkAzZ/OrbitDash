/** Types de widgets supportés */
export type WidgetType =
  | "clock"
  | "weather"
  | "stock"
  | "ainews"
  | "notes"
  | "mood"
  | "music"
  | "activity"
  | "crypto"
  | "timer"
  | "quote";

export type WidgetPosition = "left" | "right" | "top" | "bottom" | "center";
export type WidgetDisplayMode = "compact" | "expanded" | "fullscreen";

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  description: string;
  icon: string;
  position: WidgetPosition;
  order: number;
  isExpanded: boolean;
  isFavorite: boolean;
  isPinned: boolean;
  displayMode: WidgetDisplayMode;
  data: Record<string, any>;
  metadata: {
    createdAt: number;
    updatedAt: number;
    lastAccessedAt: number;
    accessCount: number;
  };
  settings: {
    showBorder: boolean;
    showShadow: boolean;
    customColor?: string;
    refreshInterval?: number;
  };
}

/** Props pour les composants widget */
export interface WidgetProps {
  widget: WidgetConfig;
  mode: WidgetDisplayMode;
  onFocus?: () => void;
  onFullscreen?: () => void;
  onClose?: () => void;
}

export interface WidgetStoreState {
  widgets: WidgetConfig[];
  expandedWidgetId: string | null;
  isLoading: boolean;
  error: string | null;
  addWidget: (type: WidgetType, position: WidgetPosition) => string;
  removeWidget: (widgetId: string) => void;
  expandWidget: (widgetId: string) => void;
  collapseWidget: () => void;
  toggleFavorite: (widgetId: string) => void;
  updateWidgetData: (
    widgetId: string,
    data: Partial<Record<string, any>>,
  ) => void;
  reorderWidgets: (widgets: WidgetConfig[]) => void;
  loadWidgets: () => void;
  saveWidgets: () => void;
  resetWidgets: () => void;
  getWidget: (widgetId: string) => WidgetConfig | undefined;
}

export interface WidgetCatalogItem {
  type: WidgetType;
  title: string;
  description: string;
  icon: string;
  category: "temps" | "finance" | "info" | "productivité" | "divertissement";
  color: string;
}

// Widget Data Types
export interface ClockData {
  timezone: string;
  format24h: boolean;
  showSeconds: boolean;
}

export interface WeatherData {
  city: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  icon: string;
}

export interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  history?: Array<{ date: string; price: number }>;
}

export interface AiNewsData {
  articles: Array<{
    id: string;
    title: string;
    description: string;
    source: string;
    url: string;
    imageUrl: string;
    publishedAt: number;
  }>;
  keywords: string[];
  lastUpdated: number;
}

export interface NotesData {
  text: string;
  tags: string[];
  color: string;
}

export interface MoodData {
  currentMood: string;
  history: Array<{ date: string; mood: string }>;
  stats: Record<string, number>;
}

export interface MusicData {
  track: string;
  artist: string;
  album: string;
  duration: number;
  progress: number;
}

export interface ActivityData {
  tasks: Array<{ id: string; title: string; completed: boolean }>;
  progress: number;
}

export interface CryptoData {
  symbol: string;
  price: number;
  change24h: number;
  history?: Array<{ date: string; price: number }>;
}

export interface TimerData {
  duration: number;
  elapsed: number;
  isRunning: boolean;
}

export interface QuoteData {
  text: string;
  author: string;
}
