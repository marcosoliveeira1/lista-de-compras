import { Checkbox } from './ui/checkbox';
import type { ShoppingItem } from '../types';
import { Trash2, GripVertical, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { cn } from '../lib/utils';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { nextPriority, type Priority } from '../lib/sort';

interface ItemCardProps {
  item: ShoppingItem;
  isCompleted?: boolean;
  dragDisabled?: boolean;
  onToggle: (item: ShoppingItem) => void;
  onDelete: (id: string) => void;
  onPriorityChange?: (id: string, priority: Priority) => void;
}

export function ItemCard({ item, isCompleted, dragDisabled, onToggle, onDelete, onPriorityChange }: ItemCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: item.id,
    disabled: isCompleted || dragDisabled
  });

  const priority = item.priority ?? 0;
  const PriorityIcon = priority === 1 ? ArrowUp : priority === -1 ? ArrowDown : Minus;

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-slate-100 transition-all duration-300",
        isCompleted ? "opacity-70 bg-slate-50/80" : "hover:shadow-md",
        isDragging && "z-50 shadow-xl border-blue-200 scale-105 opacity-90 rotate-1"
      )}
    >
      <div className="flex items-center gap-4 flex-1">
        <Checkbox
          checked={item.checked}
          onCheckedChange={(checked) => onToggle({ ...item, checked: checked as boolean })}
        />
        <div className="flex flex-col min-w-0">
          <span
            className={cn(
              "text-lg font-medium transition-all duration-300 truncate",
              item.checked ? "line-through text-slate-400" : "text-slate-700"
            )}
          >
            {item.label}
          </span>
          {item.maxValue !== undefined && (
            <span
              className={cn(
                "text-sm font-medium transition-all duration-300",
                item.checked ? "text-slate-400" : "text-emerald-600"
              )}
            >
              máx {item.maxValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          )}
        </div>
      </div>


      <div className="flex items-center gap-1">
        {!isCompleted && onPriorityChange && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPriorityChange(item.id, nextPriority(priority));
            }}
            className={cn(
              "p-2 rounded-full transition-all active:scale-95 cursor-pointer",
              priority === 1 && "text-orange-500 bg-orange-50",
              priority === -1 && "text-slate-400 bg-slate-100",
              priority === 0 && "text-slate-200 hover:text-slate-400"
            )}
            aria-label={priority === 1 ? 'Prioritário' : priority === -1 ? 'Pode esperar' : 'Sem prioridade'}
          >
            <PriorityIcon className="w-5 h-5" />
          </button>
        )}

        {!isCompleted && !dragDisabled && (
          <button
            {...attributes}
            {...listeners}
            className="p-2 text-slate-300 cursor-grab active:cursor-grabbing hover:text-slate-500 touch-none"
            aria-label="Reordenar item"
          >
            <GripVertical className="w-5 h-5" />
          </button>
        )}

        {isCompleted && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item.id);
            }}
            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all active:scale-95"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}