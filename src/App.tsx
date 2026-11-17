import { useEffect, useRef, useState } from 'react';
import { AuthGuard } from './components/AuthGuard';
import {
  useShoppingList,
  useCompletedItems,
  useAddItem,
  useToggleItem,
  useDeleteItem,
  useReorderItems,
  useSetPriority,
  useUpdateItem,
  isOptimisticItem
} from './hooks/use-shopping-list';
import { ShoppingBag } from 'lucide-react';
import { Header } from './components/Header';
import { ItemCard } from './components/ItemCard';
import { AddItemForm } from './components/AddItemForm';
import { EditItemSheet } from './components/EditItemSheet';
import { SkeletonList } from './components/SkeletonList';
import { SortBar } from './components/SortBar';
import type { ShoppingItem } from './types';
import { getStoredSort, hasItemDates, sortItems, storeSort, type Priority, type SortConfig } from './lib/sort';
import { useQueryClient } from '@tanstack/react-query';
import { useHaptics } from './hooks/use-haptics';
import { getStoredShopListId, storeShopListId, PRODUCTS_SHOP_LIST_ID, type ShopListId } from './config/shoplists';

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

// Itens novos (fora do snapshot) vão para o topo, como no add otimista
function applyFrozenOrder(items: ShoppingItem[], order: string[]) {
  const position = new Map(order.map((id, index) => [id, index]));
  return [...items].sort((a, b) => (position.get(a.id) ?? -1) - (position.get(b.id) ?? -1));
}

function ShoppingList() {
  const [selectedShopListId, setSelectedShopListId] = useState<ShopListId>(getStoredShopListId);
  const queryClient = useQueryClient();
  const { trigger } = useHaptics();
  const { data: items = [], isLoading, isError, isFetching } = useShoppingList(selectedShopListId);
  const { data: completedItems = [] } = useCompletedItems();
  const [sort, setSort] = useState<SortConfig>(getStoredSort);
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null);
  const isProductsList = selectedShopListId === PRODUCTS_SHOP_LIST_ID;

  const showDateSort = hasItemDates(items) || hasItemDates(completedItems);
  const activeSort: SortConfig = sort.field === 'date' && !showDateSort ? { ...sort, field: 'order' } : sort;
  // Arrastar só faz sentido na ordem manual crescente
  const canDrag = activeSort.field === 'order' && activeSort.direction === 'asc';

  // Enquanto alguma prioridade aguarda os 3s, a lista não muda de ordem nem recebe as trocas já confirmadas
  const [pendingPriorityIds, setPendingPriorityIds] = useState<ReadonlySet<string>>(new Set());
  const queuedPriorities = useRef(new Map<string, Priority>());
  const [queueVersion, setQueueVersion] = useState(0);
  const [frozenOrder, setFrozenOrder] = useState<string[] | null>(null);
  const isPriorityPending = pendingPriorityIds.size > 0;

  const liveSortedItems = sortItems(items, activeSort);
  if (isPriorityPending && !frozenOrder) setFrozenOrder(liveSortedItems.map((item) => item.id));
  if (!isPriorityPending && frozenOrder) setFrozenOrder(null);

  const sortedItems = frozenOrder ? applyFrozenOrder(liveSortedItems, frozenOrder) : liveSortedItems;
  const sortedCompleted = sortItems(completedItems, activeSort);

  const addItem = useAddItem(selectedShopListId);
  const toggleItem = useToggleItem(selectedShopListId);
  const deleteItem = useDeleteItem(selectedShopListId);
  const reorderItems = useReorderItems(selectedShopListId);
  const setPriority = useSetPriority(selectedShopListId);
  const updateItem = useUpdateItem(selectedShopListId);

  const flushPriorities = () => {
    queuedPriorities.current.forEach((priority, id) => setPriority.mutate({ id, priority }));
    queuedPriorities.current.clear();
  };

  // O confirm vem de um setTimeout com closure antiga: quem decide enviar é o effect, com o estado atual
  useEffect(() => {
    if (!isPriorityPending) flushPriorities();
  }, [isPriorityPending, queueVersion]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePriorityChange = (id: string, priority: Priority) => {
    queuedPriorities.current.set(id, priority);
    setQueueVersion((v) => v + 1);
  };

  const handlePriorityPendingChange = (id: string, pending: boolean) => {
    setPendingPriorityIds((prev) => {
      if (prev.has(id) === pending) return prev;
      const next = new Set(prev);
      if (pending) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  // Item otimista ainda não tem o Id do NocoDB: editar mandaria PUT para id inexistente
  const getEditHandler = (item: ShoppingItem) =>
    isProductsList && !isOptimisticItem(item) ? setEditingItem : undefined;

  const handleShopListChange = (id: ShopListId) => {
    // A fila usa o hook da lista atual; envia antes de trocar
    flushPriorities();
    storeShopListId(id);
    setSelectedShopListId(id);
  };

  const handleSortChange = (newSort: SortConfig) => {
    trigger('nudge');
    storeSort(newSort);
    setSort(newSort);
  };

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
      const oldIndex = sortedItems.findIndex((i) => i.id === active.id);
      const newIndex = sortedItems.findIndex((i) => i.id === over.id);

      const newList = arrayMove(sortedItems, oldIndex, newIndex).map((item, index) => ({ ...item, order: index }));

      queryClient.setQueryData(['shopping-list', selectedShopListId], newList);

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
      <Header selectedShopListId={selectedShopListId} onShopListChange={handleShopListChange} pendingCount={items.length} isFetching={isFetching} />

      <main className="flex-1 overflow-y-auto no-scrollbar [overflow-anchor:none] px-4 pt-6 pb-6">
        {(items.length > 1 || completedItems.length > 1) && (
          <SortBar sort={activeSort} onChange={handleSortChange} showDate={showDateSort} />
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={sortedItems} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {sortedItems.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  dragDisabled={!canDrag}
                  onToggle={toggleItem.mutate}
                  onDelete={deleteItem.mutate}
                  onPriorityChange={handlePriorityChange}
                  onPriorityPendingChange={handlePriorityPendingChange}
                  showCondition={isProductsList}
                  onEdit={getEditHandler(item)}
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
              {sortedCompleted.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  isCompleted
                  onToggle={toggleItem.mutate}
                  onDelete={deleteItem.mutate}
                  showCondition={isProductsList}
                  onEdit={getEditHandler(item)}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      <AddItemForm
        onAdd={(label, maxValue, condition) => addItem.mutate({ label, maxValue, condition })}
        isProductsList={isProductsList}
      />

      {editingItem && (
        <EditItemSheet
          item={editingItem}
          onCancel={() => setEditingItem(null)}
          onSave={(edits) => {
            updateItem.mutate({ id: editingItem.id, ...edits });
            setEditingItem(null);
          }}
        />
      )}
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