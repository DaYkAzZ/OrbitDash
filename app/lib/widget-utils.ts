/**
 * Utilitaires pour les widgets
 */

export function generateWidgetId(): string {
  return `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function getWidgetIcon(type: string): string {
  const icons: Record<string, string> = {
    clock: "Clock",
    weather: "Cloud",
    stock: "TrendingUp",
    mood: "Smile",
    notes: "FileText",
    music: "Music",
    activity: "Activity",
    ainews: "Zap",
  };
  return icons[type] || "Box";
}

export function getWidgetTitle(type: string): string {
  const titles: Record<string, string> = {
    clock: "Horloge",
    weather: "Météo",
    stock: "Bourse & Crypto",
    mood: "Humeur",
    notes: "Notes",
    music: "Musique",
    activity: "Activité",
    ainews: "Actualités IA",
  };
  return titles[type] || "Widget";
}

export function getWidgetDescription(type: string): string {
  const descriptions: Record<string, string> = {
    clock: "Affiche l'heure et la date en temps réel",
    weather: "Conditions météorologiques actuelles",
    stock: "Indices boursiers et cryptomonnaies",
    mood: "Ton humeur et celle des autres utilisateurs",
    notes: "Prenez des notes rapidement",
    music: "Lecteur de musique",
    activity: "Suivi des activités et tâches",
    ainews: "Dernières actualités sur l'IA",
  };
  return descriptions[type] || "";
}

export function formatNumber(num: number, decimals: number = 2): string {
  return num.toFixed(decimals);
}

export function formatPercent(num: number, decimals: number = 1): string {
  return `${num > 0 ? "+" : ""}${num.toFixed(decimals)}%`;
}

export function formatDate(date: Date | number, format: string = "fr"): string {
  const d = typeof date === "number" ? new Date(date) : date;
  if (format === "fr") {
    return d.toLocaleDateString("fr-FR");
  }
  return d.toLocaleDateString();
}

export function formatTime(
  date: Date | number,
  format24h: boolean = true,
): string {
  const d = typeof date === "number" ? new Date(date) : date;
  return d.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: !format24h,
  });
}

export function truncateText(text: string, maxLength: number = 100): string {
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

export function getColorByTrend(trend: "up" | "down" | "neutral"): string {
  switch (trend) {
    case "up":
      return "#22c55e";
    case "down":
      return "#ef4444";
    case "neutral":
      return "#6b7280";
    default:
      return "#9ca3af";
  }
}

export function getEmojiByMood(mood: string): string {
  const emojis: Record<string, string> = {
    happy: "😊",
    sad: "😢",
    neutral: "😐",
    energetic: "⚡",
    calm: "😌",
    focused: "🎯",
    stressed: "😰",
  };
  return emojis[mood] || "😐";
}
