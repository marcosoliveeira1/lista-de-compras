import { RefreshCw, ShoppingBag } from 'lucide-react';

interface HeaderProps {
  pendingCount: number;
  isFetching: boolean;
}

export function Header({ pendingCount, isFetching }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 backdrop-blur-md bg-slate-50/80 px-6 py-5 border-b border-slate-200/50 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div className="bg-blue-100 p-2 rounded-xl">
          <ShoppingBag className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 leading-none tracking-tight">Compras</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            {pendingCount} {pendingCount === 1 ? 'pendente' : 'pendentes'}
          </p>
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