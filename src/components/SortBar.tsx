import { ArrowDownWideNarrow, ArrowUpNarrowWide } from 'lucide-react';
import type { SortConfig, SortField } from '../lib/sort';
import { cn } from '../lib/utils';

const FIELDS: { id: SortField; label: string }[] = [
  { id: 'order', label: 'Ordem' },
  { id: 'date', label: 'Data' },
  { id: 'alpha', label: 'A-Z' },
];

interface SortBarProps {
  sort: SortConfig;
  onChange: (sort: SortConfig) => void;
  showDate: boolean;
}

export function SortBar({ sort, onChange, showDate }: SortBarProps) {
  const fields = FIELDS.filter((f) => f.id !== 'date' || showDate);
  const DirectionIcon = sort.direction === 'asc' ? ArrowUpNarrowWide : ArrowDownWideNarrow;

  return (
    <div className="flex items-center justify-between gap-2 mb-4 px-1">
      <div className="flex bg-slate-200/60 p-1 rounded-xl">
        {fields.map((field) => (
          <button
            key={field.id}
            onClick={() => onChange({ ...sort, field: field.id })}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-lg transition-colors cursor-pointer",
              sort.field === field.id
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            {field.label}
          </button>
        ))}
      </div>
      <button
        onClick={() => onChange({ ...sort, direction: sort.direction === 'asc' ? 'desc' : 'asc' })}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-200/60 rounded-xl hover:text-slate-800 transition-colors cursor-pointer"
        aria-label={sort.direction === 'asc' ? 'Crescente' : 'Decrescente'}
      >
        <DirectionIcon className="w-4 h-4" />
        {sort.direction === 'asc' ? 'Asc' : 'Desc'}
      </button>
    </div>
  );
}
