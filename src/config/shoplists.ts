export const SHOP_LISTS = [
  { id: 'vw5dyqy9acd4kaeq', name: 'Mercado', icon: 'shopping-basket' as const },
  { id: 'vw6ce87aydosur28', name: 'Produtos', icon: 'shopping-bag' as const },
] as const;

export type ShopListId = typeof SHOP_LISTS[number]['id'];

export const DEFAULT_SHOP_LIST_ID: ShopListId = SHOP_LISTS[0].id;

const STORAGE_KEY = 'compras_app_selected_shoplist';

export function getStoredShopListId(): ShopListId {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && SHOP_LISTS.some(s => s.id === stored)) {
    return stored as ShopListId;
  }
  return DEFAULT_SHOP_LIST_ID;
}

export function storeShopListId(id: ShopListId) {
  localStorage.setItem(STORAGE_KEY, id);
}