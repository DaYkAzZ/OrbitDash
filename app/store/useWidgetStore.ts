import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { WidgetConfig, WidgetType, WidgetPosition, WidgetStoreState } from "@/app/types";

// Types disponibles par défaut (admin peut en ajouter/retirer)
const DEFAULT_AVAILABLE: WidgetType[] = [
  "clock","weather","stock","crypto","ainews","notes","mood","activity","music","timer","quote"
];

interface ExtendedWidgetStore extends WidgetStoreState {
  availableTypes: WidgetType[];
  enableType:  (type: WidgetType) => void;
  disableType: (type: WidgetType) => void;
}

export const useWidgetStore = create<ExtendedWidgetStore>()(
  persist(
    (set, get) => ({
      widgets: [],
      expandedWidgetId: null,
      isLoading: false,
      error: null,
      availableTypes: DEFAULT_AVAILABLE,

      enableType: (type) =>
        set((s) => ({
          availableTypes: s.availableTypes.includes(type)
            ? s.availableTypes
            : [...s.availableTypes, type],
        })),

      disableType: (type) =>
        set((s) => ({
          availableTypes: s.availableTypes.filter((t) => t !== type),
          // Retire aussi les widgets actifs de ce type
          widgets: s.widgets.filter((w) => w.type !== type),
          expandedWidgetId:
            s.widgets.find((w) => w.id === s.expandedWidgetId)?.type === type
              ? null
              : s.expandedWidgetId,
        })),

      addWidget: (type, position) => {
        // Ne peut ajouter que si le type est disponible
        if (!get().availableTypes.includes(type)) return "";
        const id = `widget-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        const widget = createDefaultWidget(type, position, id);
        set((s) => ({ widgets: [...s.widgets, { ...widget, order: s.widgets.length }] }));
        get().saveWidgets();
        return id;
      },

      removeWidget: (id) => {
        set((s) => ({
          widgets: s.widgets.filter((w) => w.id !== id),
          expandedWidgetId: s.expandedWidgetId === id ? null : s.expandedWidgetId,
        }));
        get().saveWidgets();
      },

      expandWidget:   (id) => set({ expandedWidgetId: id }),
      collapseWidget: ()   => set({ expandedWidgetId: null }),

      toggleFavorite: (id) => {
        set((s) => ({
          widgets: s.widgets.map((w) => w.id === id ? { ...w, isFavorite: !w.isFavorite } : w),
        }));
        get().saveWidgets();
      },

      updateWidgetData: (id, data) => {
        set((s) => ({
          widgets: s.widgets.map((w) =>
            w.id === id
              ? { ...w, data: { ...w.data, ...data }, metadata: { ...w.metadata, updatedAt: Date.now() } }
              : w
          ),
        }));
        get().saveWidgets();
      },

      reorderWidgets: (widgets) => { set({ widgets }); get().saveWidgets(); },

      loadWidgets: () => {
        set({ isLoading: true });
        try {
          if (typeof window === "undefined") { set({ isLoading: false }); return; }
          const stored = localStorage.getItem("orbitdash-v2");
          if (stored) {
            const data = JSON.parse(stored);
            set({
              widgets: data.widgets || [],
              availableTypes: data.availableTypes ?? DEFAULT_AVAILABLE,
              isLoading: false,
            });
          } else {
            set({ widgets: createDefaultDashboard(), availableTypes: DEFAULT_AVAILABLE, isLoading: false });
            get().saveWidgets();
          }
        } catch { set({ isLoading: false, widgets: createDefaultDashboard() }); }
      },

      saveWidgets: () => {
        if (typeof window === "undefined") return;
        localStorage.setItem("orbitdash-v2", JSON.stringify({
          widgets: get().widgets,
          availableTypes: get().availableTypes,
        }));
      },

      resetWidgets: () => {
        set({ widgets: createDefaultDashboard(), expandedWidgetId: null, availableTypes: DEFAULT_AVAILABLE });
        get().saveWidgets();
      },

      getWidget: (id) => get().widgets.find((w) => w.id === id),
    }),
    { name: "orbitdash-v2", version: 3 }
  )
);

// ── Catalogue ──────────────────────────────────────────────────────────────
export const WIDGET_CATALOG = [
  { type: "clock",    title: "Horloge",    description: "Heure & date en temps réel",   icon: "🕐", category: "temps",          color: "#7C3AED" },
  { type: "weather",  title: "Météo",      description: "Conditions météo locales",      icon: "🌤", category: "info",           color: "#3B82F6" },
  { type: "stock",    title: "Bourse",     description: "CAC40 & indices boursiers",     icon: "📈", category: "finance",        color: "#10B981" },
  { type: "crypto",   title: "Crypto",     description: "BTC, ETH & cryptos",           icon: "₿",  category: "finance",        color: "#F5A623" },
  { type: "ainews",   title: "Actus IA",   description: "Dernières news sur l'IA",      icon: "🤖", category: "info",           color: "#8B5CF6" },
  { type: "notes",    title: "Notes",      description: "Notes rapides & mémos",        icon: "📝", category: "productivité",   color: "#F5A623" },
  { type: "mood",     title: "Humeur",     description: "Suivez votre humeur du jour",  icon: "😊", category: "productivité",   color: "#F43F5E" },
  { type: "activity", title: "Activité",   description: "Suivi des tâches & objectifs", icon: "📊", category: "productivité",   color: "#10B981" },
  { type: "music",    title: "Musique",    description: "Lecteur de musique",           icon: "🎵", category: "divertissement", color: "#F43F5E" },
  { type: "timer",    title: "Minuteur",   description: "Pomodoro & compte à rebours",  icon: "⏱", category: "productivité",   color: "#7C3AED" },
  { type: "quote",    title: "Citation",   description: "Citation inspirante du jour",  icon: "💬", category: "divertissement", color: "#3B82F6" },
] as const;

// ── createDefaultWidget ────────────────────────────────────────────────────
function base(type: WidgetType, position: WidgetPosition, id: string): WidgetConfig {
  const now = Date.now();
  const cat = WIDGET_CATALOG.find((c) => c.type === type);
  return {
    id, type, position, order: 0,
    title: cat?.title ?? type, description: cat?.description ?? "",
    icon: cat?.icon ?? "📦",
    isExpanded: false, isFavorite: false, isPinned: false, displayMode: "compact",
    data: {},
    metadata: { createdAt: now, updatedAt: now, lastAccessedAt: now, accessCount: 0 },
    settings: { showBorder: true, showShadow: true },
  };
}

export function createDefaultWidget(type: WidgetType, position: WidgetPosition, id: string): WidgetConfig {
  const now = Date.now();
  const b = base(type, position, id);
  switch (type) {
    case "clock":   return { ...b, data: { timezone: "Europe/Paris", format24h: true } };
    case "weather": return { ...b, data: { lat: 48.8566, lon: 2.3522, city: "Paris", temperature: 17, condition: "Partiellement nuageux", humidity: 62, windSpeed: 14, icon: "02d", forecast: [{day:"Jeu",high:19,low:13,icon:"01d"},{day:"Ven",high:21,low:14,icon:"03d"},{day:"Sam",high:18,low:12,icon:"10d"},{day:"Dim",high:16,low:11,icon:"09d"},{day:"Lun",high:20,low:14,icon:"01d"}] } };
    case "stock":   return { ...b, data: { items: [{symbol:"CAC40",name:"CAC 40",price:8012.45,change:+42.30,pct:+0.53,trend:"up"},{symbol:"DAX",name:"DAX",price:18204.82,change:-85.10,pct:-0.46,trend:"down"},{symbol:"SP500",name:"S&P 500",price:5247.68,change:+18.90,pct:+0.36,trend:"up"},{symbol:"NVDA",name:"NVIDIA",price:873.21,change:+24.50,pct:+2.89,trend:"up"},{symbol:"AAPL",name:"Apple",price:182.45,change:-1.20,pct:-0.65,trend:"down"}], news: [{title:"Les banques centrales maintiennent leurs taux",source:"Les Echos",time:"2h"},{title:"Le CAC40 atteint un nouveau record annuel",source:"BFM Bourse",time:"4h"}] } };
    case "crypto":  return { ...b, data: { items: [{symbol:"BTC",name:"Bitcoin",price:67420,change:+1240,pct:+1.87,trend:"up"},{symbol:"ETH",name:"Ethereum",price:3521,change:+87,pct:+2.53,trend:"up"},{symbol:"SOL",name:"Solana",price:148.3,change:-3.2,pct:-2.11,trend:"down"},{symbol:"BNB",name:"BNB",price:582,change:+8.4,pct:+1.46,trend:"up"}] } };
    case "ainews":  return { ...b, data: { articles: [{id:"1",title:"OpenAI dévoile GPT-5 avec des capacités de raisonnement avancées",source:"TechCrunch",time:"1h",category:"LLM",img:""},{id:"2",title:"Google DeepMind annonce une percée en biologie moléculaire",source:"Nature",time:"3h",category:"Recherche",img:""},{id:"3",title:"Mistral AI lève 500M€ pour accélérer son développement",source:"Les Echos",time:"5h",category:"Startups",img:""},{id:"4",title:"L'IA générative transforme le marché du travail européen",source:"Le Monde",time:"8h",category:"Société",img:""},{id:"5",title:"Anthropic publie une nouvelle étude sur la sécurité des modèles",source:"Wired",time:"12h",category:"Sécurité",img:""}] } };
    case "notes":   return { ...b, data: { content: "Bienvenue sur OrbitDash !\n• Cliquez sur un widget pour le détailler\n• Ajoutez vos propres widgets\n• Personnalisez votre dashboard", lastModified: now } };
    case "mood":    return { ...b, data: { current: "happy", emoji: "😊", intensity: 7, note: "", history: [{mood:"happy",emoji:"😊",time:"9h00"},{mood:"focused",emoji:"🎯",time:"11h00"},{mood:"energetic",emoji:"⚡",time:"14h00"}], stats: {happy:42,focused:28,energetic:18,calm:7,stressed:5} } };
    case "activity":return { ...b, data: { tasksCompleted: 7, tasksTotal: 12, streak: 12, todayMinutes: 240, focusSessions: 4, tasks: [{id:"t1",label:"Revue du dashboard",done:true},{id:"t2",label:"Déploiement staging",done:true},{id:"t3",label:"Code review PR #42",done:false},{id:"t4",label:"Réunion équipe 15h",done:false},{id:"t5",label:"Rédiger documentation",done:false}] } };
    case "music":   return { ...b, data: { track: {title:"Synthwave Dreams",artist:"The Architects",album:"Future Horizons",duration:245,progress:98}, isPlaying: true, volume: 75, shuffle: false, repeat: "off", queue: [{title:"Digital Horizon",artist:"Neon Lights"},{title:"Electric Pulse",artist:"Cyber Wave"}] } };
    case "timer":   return { ...b, data: { mode: "pomodoro", workMinutes: 25, breakMinutes: 5, secondsLeft: 25*60, isRunning: false, session: 1, totalSessions: 4 } };
    case "quote":   return { ...b, data: { text: "L'intelligence, c'est la capacité de s'adapter au changement.", author: "Stephen Hawking", category: "Science" } };
    default: return b;
  }
}

function createDefaultDashboard(): WidgetConfig[] {
  const now = Date.now();
  return [
    { ...createDefaultWidget("clock",    "left",   `clock-${now}`),    order: 0 },
    { ...createDefaultWidget("weather",  "left",   `weather-${now}`),  order: 1 },
    { ...createDefaultWidget("mood",     "left",   `mood-${now}`),     order: 2 },
    { ...createDefaultWidget("stock",    "right",  `stock-${now}`),    order: 3 },
    { ...createDefaultWidget("ainews",   "right",  `ainews-${now}`),   order: 4 },
    { ...createDefaultWidget("activity", "right",  `activity-${now}`), order: 5 },
    { ...createDefaultWidget("notes",    "bottom", `notes-${now}`),    order: 6 },
    { ...createDefaultWidget("music",    "bottom", `music-${now}`),    order: 7 },
  ];
}
