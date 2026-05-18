/**
 * widgetService – Mock service pour widgets
 * En production, cette couche communiquerait avec une base de données
 * Actuellement, les widgets sont gérés via Zustand + localStorage
 */

import type { WidgetConfig } from "../types";

// Mock service - actual data is managed by Zustand store
export async function fetchWidgets(): Promise<WidgetConfig[]> {
  // In production, fetch from API/database
  return [];
}

export async function fetchWidgetById(
  id: string,
): Promise<WidgetConfig | null> {
  // In production, fetch from API/database
  return null;
}

export async function createWidget(
  payload: Omit<WidgetConfig, "id" | "metadata">,
): Promise<WidgetConfig> {
  // In production, create in API/database
  throw new Error("Not implemented - use Zustand store instead");
}

export async function updateWidget(
  id: string,
  payload: Partial<WidgetConfig>,
): Promise<WidgetConfig> {
  // In production, update in API/database
  throw new Error("Not implemented - use Zustand store instead");
}

export async function deleteWidget(id: string): Promise<void> {
  // In production, delete from API/database
  throw new Error("Not implemented - use Zustand store instead");
}

export async function swapWidgetPositions(
  idA: string,
  posA: number,
  idB: string,
  posB: number,
): Promise<void> {
  // In production, call API/database RPC
  throw new Error("Not implemented - use Zustand store instead");
}
