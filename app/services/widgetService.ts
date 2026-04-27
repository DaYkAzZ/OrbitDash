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

// ─── Lecture ──────────────────────────────────────────────────────────────────

export async function fetchWidgets(): Promise<Widget[]> {
  const { data, error } = await supabase
    .from('widgets')
    .select('*')
    .order('position', { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as Widget[];
}

export async function fetchWidgetById(id: string): Promise<Widget> {
  const { data, error } = await supabase
    .from('widgets')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  return data as Widget;
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
  return data as Widget;
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
  return data as Widget;
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
