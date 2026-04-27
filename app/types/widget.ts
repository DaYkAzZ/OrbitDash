// ─── Widget Types ────────────────────────────────────────────────────────────

export type WidgetMode = 'inplace' | 'focus' | 'fullscreen';

export type WidgetType = 'clock' | 'poll' | 'rss' | 'crypto' | 'note';

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
  expiresAt?: string; // ISO date
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

export type WidgetData =
  | ClockWidgetData
  | PollWidgetData
  | RssWidgetData
  | NoteWidgetData
  | Record<string, unknown>;

// Contrat d'interface principal pour un widget
export interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  position: number;        // position dans la grille (0-based)
  focusable: boolean;      // peut-il apparaître en zone centrale ?
  fullscreenable: boolean; // peut-il passer en plein écran ?
  data: WidgetData;
  createdAt: string;
  updatedAt: string;
}

// Props passées à chaque widget selon son mode d'affichage
export interface WidgetProps {
  widget: Widget;
  mode: WidgetMode;
  onFocus?: () => void;      // demande à passer en focus
  onFullscreen?: () => void; // demande à passer en fullscreen
  onClose?: () => void;      // fermer le focus/fullscreen
}
