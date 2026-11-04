import { useRef, useState, useEffect } from 'react';
import { RefreshCw, ShoppingBag, ShoppingBasket, ChevronDown, RotateCw } from 'lucide-react';
import { SHOP_LISTS, type ShopListId } from '../config/shoplists';
import { cn } from '../lib/utils';

const iconMap = {
  'shopping-basket': ShoppingBasket,
  'shopping-bag': ShoppingBag,
};

interface HeaderProps {
  selectedShopListId: ShopListId;
  onShopListChange: (id: ShopListId) => void;
  pendingCount: number;
  isFetching: boolean;
}

// Remove service worker e caches do PWA pra baixar o código mais recente do servidor
async function forceAppUpdate() {
  try {
    const registrations = (await navigator.serviceWorker?.getRegistrations()) ?? [];
    await Promise.all(registrations.map((r) => r.unregister()));
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    }
  } finally {
    window.location.reload();
  }
}

export function Header({ selectedShopListId, onShopListChange, pendingCount, isFetching }: HeaderProps) {
  const [openMenu, setOpenMenu] = useState<'lists' | 'app' | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isOpen = openMenu === 'lists';

  const selected = SHOP_LISTS.find(s => s.id === selectedShopListId) ?? SHOP_LISTS[0];
  const Icon = iconMap[selected.icon];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    }
    if (openMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [openMenu]);

  return (
    <header className="sticky top-0 z-10 backdrop-blur-md bg-slate-50/80 px-6 py-5 border-b border-slate-200/50 flex justify-between items-center">
      <div ref={dropdownRef} className="flex items-center gap-3">
        <div className="relative">
          <button
            onClick={() => setOpenMenu(prev => prev === 'app' ? null : 'app')}
            className="bg-blue-100 p-2 rounded-xl cursor-pointer active:scale-95 transition-transform"
            aria-label="Opções"
          >
            <Icon className="w-6 h-6 text-blue-600" />
          </button>

          {openMenu === 'app' && (
            <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50 animate-in fade-in slide-in-from-top-1">
              <button
                onClick={() => {
                  setIsUpdating(true);
                  forceAppUpdate();
                }}
                disabled={isUpdating}
                className="w-full flex items-center gap-2 text-left px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-60"
              >
                <RotateCw className={cn("w-4 h-4 text-slate-500", isUpdating && "animate-spin")} />
                {isUpdating ? 'Atualizando...' : 'Atualizar app'}
              </button>
            </div>
          )}
        </div>
        <div className="relative">
          <button
            onClick={() => setOpenMenu(prev => prev === 'lists' ? null : 'lists')}
            className="flex items-center gap-1.5 group cursor-pointer"
          >
            <h1 className="text-xl font-bold text-slate-900 leading-none tracking-tight">
              {selected.name}
            </h1>
            <ChevronDown
              className={cn(
                "w-4 h-4 text-slate-400 transition-transform duration-200",
                isOpen && "rotate-180"
              )}
            />
          </button>
          <p className="text-sm text-slate-500 font-medium mt-1">
            {pendingCount} {pendingCount === 1 ? 'pendente' : 'pendentes'}
          </p>

          {isOpen && (
            <div className="absolute top-full left-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50 animate-in fade-in slide-in-from-top-1">
              {SHOP_LISTS.map((shopList) => (
                <button
                  key={shopList.id}
                  onClick={() => {
                    onShopListChange(shopList.id);
                    setOpenMenu(null);
                  }}
                  className={cn(
                    "w-full text-left px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer",
                    shopList.id === selectedShopListId
                      ? "bg-blue-50 text-blue-600"
                      : "text-slate-700 hover:bg-slate-50"
                  )}
                >
                  {shopList.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      {isFetching && (
        <div className="bg-blue-50 p-2 rounded-full" title="Sincronizando em background">
          <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
        </div>
      )}
    </header>
  );
}