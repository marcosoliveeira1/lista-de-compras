import { useRef, useState, useEffect } from 'react';
import { RefreshCw, ShoppingBag, ShoppingBasket, ChevronDown } from 'lucide-react';
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

export function Header({ selectedShopListId, onShopListChange, pendingCount, isFetching }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selected = SHOP_LISTS.find(s => s.id === selectedShopListId) ?? SHOP_LISTS[0];
  const Icon = iconMap[selected.icon];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <header className="sticky top-0 z-10 backdrop-blur-md bg-slate-50/80 px-6 py-5 border-b border-slate-200/50 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div className="bg-blue-100 p-2 rounded-xl">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setIsOpen(prev => !prev)}
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
                    setIsOpen(false);
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