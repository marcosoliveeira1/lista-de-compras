import { AuthGuard } from './components/AuthGuard';
import {
  useShoppingList,
  useCompletedItems,
  useAddItem,
  useToggleItem,
  useDeleteItem
} from './hooks/use-shopping-list';
import { ShoppingBag } from 'lucide-react';

import { Header } from './components/Header';
import { ItemCard } from './components/ItemCard';
import { AddItemForm } from './components/AddItemForm';
import { SkeletonList } from './components/SkeletonList';

function ShoppingList() {
  const { data: items, isLoading, isError, isFetching } = useShoppingList();
  const { data: completedItems = [] } = useCompletedItems();

  const addItem = useAddItem();
  const toggleItem = useToggleItem();
  const deleteItem = useDeleteItem();

  if (isLoading) {
    return <SkeletonList />;
  }

  if (isError) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-slate-50">
        <div className="p-6 text-center text-red-500 bg-red-50 rounded-2xl max-w-xs">
          <p className="font-semibold">Ops! Ocorreu um erro.</p>
          <p className="text-sm mt-1 opacity-80">Não foi possível carregar a lista offline.</p>
        </div>
      </div>
    );
  }

  const pendingItems = items?.filter((i) => !i.checked) || [];

  return (
    <div className="max-w-md mx-auto flex flex-col min-h-[100dvh] bg-slate-50 relative selection:bg-blue-200">

      <Header pendingCount={pendingItems.length} isFetching={isFetching} />

      <main className="flex-1 overflow-y-auto no-scrollbar px-4 pt-6 pb-32">
        {/* Seção: Itens Pendentes */}
        <div className="space-y-3">
          {pendingItems.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onToggle={toggleItem.mutate}
              onDelete={deleteItem.mutate}
            />
          ))}
        </div>

        {/* Estado Vazio */}
        {pendingItems.length === 0 && completedItems.length === 0 && (
          <div className="text-center flex flex-col items-center justify-center mt-20 px-6 opacity-60">
            <ShoppingBag className="w-16 h-16 text-slate-300 mb-4" />
            <p className="text-slate-500 font-medium text-lg">Sua lista está vazia</p>
            <p className="text-slate-400 text-sm mt-1">Adicione itens abaixo para começar.</p>
          </div>
        )}

        {/* Seção: Já Comprados */}
        {completedItems.length > 0 && (
          <div className="mt-10 mb-4">
            <h2 className="text-sm font-bold text-slate-500 tracking-tight mb-3 px-2 flex items-center gap-2">
              Já Comprados
              <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-xs">
                {completedItems.length}
              </span>
            </h2>
            <div className="space-y-3">
              {completedItems.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  isCompleted
                  onToggle={toggleItem.mutate}
                  onDelete={deleteItem.mutate}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      <AddItemForm onAdd={addItem.mutate} />

    </div>
  );
}

export default function App() {
  return (
    <AuthGuard>
      <ShoppingList />
    </AuthGuard>
  );
}