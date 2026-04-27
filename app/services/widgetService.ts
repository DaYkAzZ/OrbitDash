/**
 * widgetService – couche d'accès aux données pour les widgets.
 * Toutes les fonctions retournent des données typées ou lèvent une Error.
 *
 * Table Supabase attendue : `widgets`
 * Colonnes : id, type, title, position, focusable, fullscreenable, data (jsonb),
 *            created_at, updated_at
 */

import { supabase } from './supabase';
import type { Widget } from '../types';
import type { RealtimeChannel } from '@supabase/supabase-js';

type WidgetRow = {
  id: string;
  type: Widget['type'];
  title: string;
  position: number;
  focusable: boolean;
  fullscreenable: boolean;
  data: Widget['data'];
  created_at: string;
  updated_at: string;
};

function mapRowToWidget(row: WidgetRow): Widget {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    position: row.position,
    focusable: row.focusable,
    fullscreenable: row.fullscreenable,
    data: row.data,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ─── Lecture ──────────────────────────────────────────────────────────────────

export async function fetchWidgets(): Promise<Widget[]> {
  const { data, error } = await supabase
    .from('widgets')
    .select('*')
    .order('position', { ascending: true });

  if (error) throw new Error(error.message);
  return ((data ?? []) as WidgetRow[]).map(mapRowToWidget);
}

export async function fetchWidgetById(id: string): Promise<Widget> {
  const { data, error } = await supabase
    .from('widgets')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  return mapRowToWidget(data as WidgetRow);
}

// ─── Création ─────────────────────────────────────────────────────────────────

export async function createWidget(
  payload: Omit<Widget, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Widget> {
  const { data, error } = await supabase
    .from('widgets')
    .insert([payload])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapRowToWidget(data as WidgetRow);
}

// ─── Mise à jour ──────────────────────────────────────────────────────────────

export async function updateWidget(
  id: string,
  payload: Partial<Omit<Widget, 'id' | 'createdAt'>>
): Promise<Widget> {
  const { data, error } = await supabase
    .from('widgets')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapRowToWidget(data as WidgetRow);
}

// ─── Suppression ──────────────────────────────────────────────────────────────

export async function deleteWidget(id: string): Promise<void> {
  const { error } = await supabase.from('widgets').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// ─── Swap de positions (pour le Drag & Swap admin) ────────────────────────────

export async function swapWidgetPositions(
  idA: string,
  posA: number,
  idB: string,
  posB: number
): Promise<void> {
  const { error } = await supabase.rpc('swap_widget_positions', {
    id_a: idA,
    pos_a: posA,
    id_b: idB,
    pos_b: posB,
  });
  if (error) throw new Error(error.message);
}

export function subscribeToWidgets(onChange: () => void): RealtimeChannel {
  return supabase
    .channel('widgets-live-updates')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'widgets' },
      () => onChange()
    )
    .subscribe();
}

export function unsubscribeFromWidgets(channel: RealtimeChannel): void {
  supabase.removeChannel(channel);
}
