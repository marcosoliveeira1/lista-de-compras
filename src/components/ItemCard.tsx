import { Checkbox } from './ui/checkbox';
import type { ShoppingItem } from '../types';
import { Trash2 } from 'lucide-react';

interface ItemCardProps {
  item: ShoppingItem;
  isCompleted?: boolean;
  onToggle: (item: ShoppingItem) => void;
  onDelete: (id: string) => void;
}

export function ItemCard({ item, isCompleted, onToggle, onDelete }: ItemCardProps) {
  return (
    <div
      className={`group flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-slate-100 transition-all duration-300 ${isCompleted ? 'opacity-70 bg-slate-50/80' : 'hover:shadow-md'
        }`}
    >
      <label className="flex items-center gap-4 flex-1 cursor-pointer">
        <Checkbox
          checked={item.checked}
          onCheckedChange={(checked) => onToggle({ ...item, checked: checked as boolean })}
        />
        <span
          className={`text-lg font-medium transition-all duration-300 ${item.checked ? 'line-through text-slate-400' : 'text-slate-700'
            }`}
        >
          {item.label}
        </span>
      </label>

      {isCompleted && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(item.id);
          }}
          className="p-2 ml-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all active:scale-95"
          aria-label="Deletar permanentemente"
          title="Excluir permanentemente"
        >
          <Trash2 className="w-5 h-5" />
        </button>)}
    </div>
  );
}