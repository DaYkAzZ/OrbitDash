// ─── Widget Types ────────────────────────────────────────────────────────────

export type WidgetMode = "inplace" | "focus" | "fullscreen";

export type WidgetType =
  | "clock"
  | "poll"
  | "rss"
  | "crypto"
  | "note"
  | "stock"
  | "weather"
  | "ainews";

// Data spécifiques à chaque type de widget
export interface ClockWidgetData {
  timezone: string;
  showSeconds: boolean;
  format24h: boolean;
}

export interface PollOption {
  id: string;
  label: string;
  votes: number;
}

export interface PollWidgetData {
  question: string;
  options: PollOption[];
  expiresAt?: string;
  allowMultiple: boolean;
}

export interface RssWidgetData {
  feedUrl: string;
  maxItems: number;
  title: string;
}

export interface NoteWidgetData {
  content: string;
  color: string;
}

// ── Bourse ───────────────────────────────────────────────────────────────────
export interface StockWidgetData {
  /** Symbole Finnhub, ex: "^FCHI" pour CAC40 */
  symbol: string;
  /** Nom affiché */
  label: string;
  /** Couleur d'accent hex */
  accentColor?: string;
}

// ── Météo ─────────────────────────────────────────────────────────────────────
export interface WeatherWidgetData {
  /** Nom de la ville tel que l'API Open-Meteo la reconnaît */
  city: string;
  /** Latitude */
  lat: number;
  /** Longitude */
  lon: number;
  /** Unité de température : "celsius" | "fahrenheit" */
  unit: "celsius" | "fahrenheit";
}

// ── Actus IA ──────────────────────────────────────────────────────────────────
export interface AiNewsWidgetData {
  /** Nombre max d'articles affichés en focus */
  maxItems: number;
  /** Mots-clés de recherche */
  keywords: string;
}

export type WidgetData =
  | ClockWidgetData
  | PollWidgetData
  | RssWidgetData
  | NoteWidgetData
  | StockWidgetData
  | WeatherWidgetData
  | AiNewsWidgetData
  | Record<string, unknown>;

// Contrat d'interface principal pour un widget
export interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  position: number;
  focusable: boolean;
  fullscreenable: boolean;
  data: WidgetData;
  createdAt: string;
  updatedAt: string;
}

// Props passées à chaque widget selon son mode d'affichage
export interface WidgetProps {
  widget: Widget;
  mode: WidgetMode;
  onFocus?: () => void;
  onFullscreen?: () => void;
  onClose?: () => void;
}
