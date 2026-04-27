/**
 * useWidgetStore – store Zustand global pour les widgets.
 *
 * Contient :
 *  - La liste des widgets (chargée depuis Supabase)
 *  - Le widget actuellement en "focus" (zone centrale)
 *  - Le widget actuellement en "fullscreen"
 *  - Les actions CRUD synchronisées avec Supabase
 */

import { create } from 'zustand';
import type { Widget, WidgetData } from '../types';
import type { RealtimeChannel } from '@supabase/supabase-js';
import {
  fetchWidgets,
  createWidget,
  updateWidget,
  deleteWidget,
  swapWidgetPositions,
  subscribeToWidgets,
  unsubscribeFromWidgets,
} from '../services';

interface WidgetStore {
  // ── État ────────────────────────────────────────────────────────────────────
  widgets: Widget[];
  focusedWidgetId: string | null;
  fullscreenWidgetId: string | null;
  isLoading: boolean;
  error: string | null;
  realtimeChannel: RealtimeChannel | null;

  // ── Chargement ──────────────────────────────────────────────────────────────
  loadWidgets: () => Promise<void>;
  initRealtime: () => void;
  stopRealtime: () => void;

  // ── Focus / Fullscreen ──────────────────────────────────────────────────────
  setFocus: (id: string | null) => void;
  setFullscreen: (id: string | null) => void;

  // ── CRUD ────────────────────────────────────────────────────────────────────
  addWidget: (payload: Omit<Widget, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  editWidget: (id: string, payload: Partial<Omit<Widget, 'id' | 'createdAt'>>) => Promise<void>;
  removeWidget: (id: string) => Promise<void>;
  swapPositions: (idA: string, posA: number, idB: string, posB: number) => Promise<void>;

  // ── Raccourci pour modifier uniquement la data ───────────────────────────────
  updateWidgetData: (id: string, data: Partial<WidgetData>) => Promise<void>;
}

export const useWidgetStore = create<WidgetStore>((set, get) => ({
  widgets: [],
  focusedWidgetId: null,
  fullscreenWidgetId: null,
  isLoading: false,
  error: null,
  realtimeChannel: null,

  // ── Chargement ──────────────────────────────────────────────────────────────
  loadWidgets: async () => {
    set({ isLoading: true, error: null });
    try {
      const widgets = await fetchWidgets();
      set({ widgets, isLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  initRealtime: () => {
    const existing = get().realtimeChannel;
    if (existing) return;

    const channel = subscribeToWidgets(() => {
      get().loadWidgets();
    });

    set({ realtimeChannel: channel });
  },

  stopRealtime: () => {
    const channel = get().realtimeChannel;
    if (!channel) return;
    unsubscribeFromWidgets(channel);
    set({ realtimeChannel: null });
  },

  // ── Focus / Fullscreen ──────────────────────────────────────────────────────
  setFocus: (id) => set({ focusedWidgetId: id }),
  setFullscreen: (id) => set({ fullscreenWidgetId: id }),

  // ── CRUD ────────────────────────────────────────────────────────────────────
  addWidget: async (payload) => {
    const widget = await createWidget(payload);
    set((s) => ({ widgets: [...s.widgets, widget] }));
  },

  editWidget: async (id, payload) => {
    const updated = await updateWidget(id, payload);
    set((s) => ({
      widgets: s.widgets.map((w) => (w.id === id ? updated : w)),
    }));
  },

  removeWidget: async (id) => {
    await deleteWidget(id);
    set((s) => ({
      widgets: s.widgets.filter((w) => w.id !== id),
      focusedWidgetId: s.focusedWidgetId === id ? null : s.focusedWidgetId,
      fullscreenWidgetId: s.fullscreenWidgetId === id ? null : s.fullscreenWidgetId,
    }));
  },

  swapPositions: async (idA, posA, idB, posB) => {
    await swapWidgetPositions(idA, posA, idB, posB);
    set((s) => ({
      widgets: s.widgets.map((w) => {
        if (w.id === idA) return { ...w, position: posB };
        if (w.id === idB) return { ...w, position: posA };
        return w;
      }),
    }));
  },

  updateWidgetData: async (id, data) => {
    const widget = get().widgets.find((w) => w.id === id);
    if (!widget) return;
    const newData = { ...widget.data, ...data } as WidgetData;
    await get().editWidget(id, { data: newData });
  },
}));
