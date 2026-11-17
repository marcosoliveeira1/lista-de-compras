import { useEffect, useState } from 'react';
import type { ShoppingItem } from '../types';

export interface ItemEdits {
  label: string;
  // undefined remove o valor máximo / a condição
  maxValue?: number;
  condition?: string;
}

interface EditItemSheetProps {
  item: ShoppingItem;
  onCancel: () => void;
  onSave: (edits: ItemEdits) => void;
}

const formatMaxValue = (value?: number) =>
  value === undefined ? '' : String(value).replace('.', ',');

export function EditItemSheet({ item, onCancel, onSave }: EditItemSheetProps) {
  const [label, setLabel] = useState(item.label);
  const [maxValue, setMaxValue] = useState(formatMaxValue(item.maxValue));
  const [condition, setCondition] = useState(item.condition ?? '');

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onCancel]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;

    const parsed = parseFloat(maxValue.replace(',', '.'));
    onSave({
      label: label.trim(),
      maxValue: Number.isFinite(parsed) && parsed > 0 ? parsed : undefined,
      condition: condition.trim() || undefined,
    });
  };

  const fieldClass =
    "w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 outline-none text-slate-700 placeholder:text-slate-400 focus:border-blue-300";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-slate-900/30 animate-in fade-in" onClick={onCancel} />
      <form
        onSubmit={handleSubmit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-item-title"
        className="relative w-full max-w-md bg-white rounded-t-3xl shadow-xl p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] flex flex-col gap-4"
      >
        <h2 id="edit-item-title" className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Editar item
        </h2>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-slate-500">Nome</span>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className={fieldClass}
            autoComplete="off"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-slate-500">Valor máximo (R$)</span>
          <input
            type="text"
            inputMode="decimal"
            value={maxValue}
            onChange={(e) => setMaxValue(e.target.value)}
            placeholder="Sem limite"
            className={fieldClass}
            autoComplete="off"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-slate-500">Condição</span>
          <textarea
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            placeholder="Só tipo forno (oven), 11L ou mais"
            rows={3}
            className={`${fieldClass} resize-none`}
          />
        </label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 h-12 rounded-full bg-slate-100 text-slate-600 font-medium hover:bg-slate-200 transition-all active:scale-95"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!label.trim()}
            className="flex-1 h-12 rounded-full bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 transition-all active:scale-95"
          >
            Salvar
          </button>
        </div>
      </form>
    </div>
  );
}
