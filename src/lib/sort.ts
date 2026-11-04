import type { ShoppingItem } from '../types';

export type SortField = 'order' | 'date' | 'alpha';
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

export const DEFAULT_SORT: SortConfig = { field: 'order', direction: 'asc' };

const STORAGE_KEY = 'compras_app_sort';

// Aceita as variações de nome mais comuns vindas do backend (NocoDB / n8n)
export function getItemDate(item: ShoppingItem): number | undefined {
  const raw = item as ShoppingItem & { CreatedAt?: string; created_at?: string };
  const value = raw.createdAt ?? raw.CreatedAt ?? raw.created_at;
  if (!value) return undefined;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? undefined : time;
}

export function hasItemDates(items: ShoppingItem[]) {
  return items.some((item) => getItemDate(item) !== undefined);
}

export function sortItems(items: ShoppingItem[], { field, direction }: SortConfig): ShoppingItem[] {
  const factor = direction === 'asc' ? 1 : -1;

  // Índice original serve de fallback quando o item não tem `order`/data
  return items
    .map((item, index) => ({ item, index }))
    .sort((a, b) => {
      let diff = 0;
      if (field === 'alpha') {
        diff = a.item.label.localeCompare(b.item.label, 'pt-BR', { sensitivity: 'base' });
      } else if (field === 'date') {
        diff = (getItemDate(a.item) ?? 0) - (getItemDate(b.item) ?? 0);
      } else {
        diff = (a.item.order ?? a.index) - (b.item.order ?? b.index);
      }
      return (diff || a.index - b.index) * factor;
    })
    .map(({ item }) => item);
}

export function getStoredSort(): SortConfig {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
    if (
      stored &&
      ['order', 'date', 'alpha'].includes(stored.field) &&
      ['asc', 'desc'].includes(stored.direction)
    ) {
      return stored as SortConfig;
    }
  } catch {
    // ignora valor inválido
  }
  return DEFAULT_SORT;
}

export function storeSort(sort: SortConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sort));
}
