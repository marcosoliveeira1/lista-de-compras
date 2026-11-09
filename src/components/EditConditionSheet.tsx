import { useEffect, useState } from 'react';
import type { ShoppingItem } from '../types';

interface EditConditionSheetProps {
  item: ShoppingItem;
  onCancel: () => void;
  // Texto vazio remove a condição
  onSave: (condition?: string) => void;
}

export function EditConditionSheet({ item, onCancel, onSave }: EditConditionSheetProps) {
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
    onSave(condition.trim() || undefined);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-slate-900/30 animate-in fade-in" onClick={onCancel} />
      <form
        onSubmit={handleSubmit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-condition-title"
        className="relative w-full max-w-md bg-white rounded-t-3xl shadow-xl p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] flex flex-col gap-4"
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Condição</p>
          <h2 id="edit-condition-title" className="text-lg font-semibold text-slate-700 truncate">
            {item.label}
          </h2>
        </div>
        <textarea
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
          placeholder="Só tipo forno (oven), 11L ou mais"
          rows={4}
          autoFocus
          className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 outline-none text-slate-700 placeholder:text-slate-400 resize-none focus:border-blue-300"
          aria-label="Condição"
        />
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
            className="flex-1 h-12 rounded-full bg-blue-600 text-white font-medium hover:bg-blue-700 transition-all active:scale-95"
          >
            Salvar
          </button>
        </div>
      </form>
    </div>
  );
}
