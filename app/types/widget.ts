/** Types de widgets supportés */
export type WidgetType =
  | "clock" | "weather" | "stock" | "ainews"
  | "notes" | "mood" | "music" | "activity"
  | "crypto" | "timer" | "quote";

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
  metadata: { createdAt: number; updatedAt: number; lastAccessedAt: number; accessCount: number };
  settings: { showBorder: boolean; showShadow: boolean; customColor?: string; refreshInterval?: number };
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
  updateWidgetData: (widgetId: string, data: Partial<Record<string, any>>) => void;
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
