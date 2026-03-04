import { AuthGuard } from './components/AuthGuard';
import {
  useShoppingList,
  useCompletedItems,
  useAddItem,
  useToggleItem,
  useDeleteItem,
  useReorderItems
} from './hooks/use-shopping-list';
import { ShoppingBag } from 'lucide-react';
import { Header } from './components/Header';
import { ItemCard } from './components/ItemCard';
import { AddItemForm } from './components/AddItemForm';
import { SkeletonList } from './components/SkeletonList';
import { useQueryClient } from '@tanstack/react-query';
import { useHaptics } from './hooks/use-haptics';

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';

import type { DragEndEvent } from '@dnd-kit/core';

import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

function ShoppingList() {
  const queryClient = useQueryClient();
  const { trigger } = useHaptics();
  const { data: items = [], isLoading, isError, isFetching } = useShoppingList();
  const { data: completedItems = [] } = useCompletedItems();

  const addItem = useAddItem();
  const toggleItem = useToggleItem();
  const deleteItem = useDeleteItem();
  const reorderItems = useReorderItems();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      trigger('nudge');
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);

      const newList = arrayMove(items, oldIndex, newIndex);

      queryClient.setQueryData(['shopping-list'], newList);

      const idsOrder = newList.map(item => item.id);
      reorderItems.mutate(idsOrder);
    }


  };

  if (isLoading) return <SkeletonList />;

  if (isError) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-slate-50">
        <div className="p-6 text-center text-red-500 bg-red-50 rounded-2xl max-w-xs">
          <p className="font-semibold">Ops! Erro ao carregar.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto flex flex-col h-[100dvh] overflow-hidden bg-slate-50 relative">
      <Header pendingCount={items.length} isFetching={isFetching} />

      <main className="flex-1 overflow-y-auto no-scrollbar px-4 pt-6 pb-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={items} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {items.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onToggle={toggleItem.mutate}
                  onDelete={deleteItem.mutate}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {items.length === 0 && completedItems.length === 0 && (
          <div className="text-center flex flex-col items-center justify-center mt-20 opacity-60">
            <ShoppingBag className="w-16 h-16 text-slate-300 mb-4" />
            <p className="text-slate-500 font-medium">Sua lista está vazia</p>
          </div>
        )}

        {completedItems.length > 0 && (
          <div className="mt-10 mb-4">
            <h2 className="text-sm font-bold text-slate-500 mb-3 px-2 flex items-center gap-2">
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