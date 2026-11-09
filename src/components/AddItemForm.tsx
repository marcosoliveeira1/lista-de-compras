import { useState } from 'react';
import { Plus, ListFilter } from 'lucide-react';
import { cn } from '../lib/utils';

interface AddItemFormProps {
  onAdd: (label: string, maxValue?: number, condition?: string) => void;
  // Valor máximo e condição só existem na lista Produtos
  isProductsList?: boolean;
}

export function AddItemForm({ onAdd, isProductsList }: AddItemFormProps) {
  const [label, setLabel] = useState('');
  const [maxValue, setMaxValue] = useState('');
  const [condition, setCondition] = useState('');
  const [showCondition, setShowCondition] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;

    const parsed = parseFloat(maxValue.replace(',', '.'));
    const max = isProductsList && Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
    const cond = isProductsList ? condition.trim() || undefined : undefined;

    onAdd(label.trim(), max, cond);
    setLabel('');
    setMaxValue('');
    setCondition('');
    setShowCondition(false);
  };

  return (
    <div className="p-4 bg-slate-50 shrink-0 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-slate-200/50">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <div className="w-full bg-white p-2 rounded-full shadow-sm border border-slate-200 flex gap-2 items-center">
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Adicionar novo item..."
            className="flex-1 min-w-0 px-4 py-2 outline-none bg-transparent text-slate-700 placeholder:text-slate-400 text-lg"
            autoComplete="off"
          />
          {isProductsList && (
            <div className="flex items-center gap-1 flex-shrink-0 text-slate-700">
              <span className="text-slate-400 text-lg">R$</span>
              <input
                type="text"
                inputMode="decimal"
                value={maxValue}
                onChange={(e) => setMaxValue(e.target.value)}
                placeholder="máx"
                className="w-16 px-1 py-2 outline-none bg-transparent text-slate-700 placeholder:text-slate-400 text-lg text-right"
                autoComplete="off"
                aria-label="Valor máximo"
              />
            </div>
          )}
          {isProductsList && (
            <button
              type="button"
              onClick={() => setShowCondition((v) => !v)}
              className={cn(
                "w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center transition-all active:scale-95",
                showCondition || condition.trim() ? "text-blue-600 bg-blue-50" : "text-slate-400 hover:text-slate-500"
              )}
              aria-label="Condição do item"
              aria-expanded={showCondition}
            >
              <ListFilter className="w-5 h-5" />
            </button>
          )}
          <button
            type="submit"
            disabled={!label.trim()}
            className="bg-blue-600 text-white w-12 h-12 flex-shrink-0 rounded-full hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 transition-all flex items-center justify-center active:scale-95"
            aria-label="Adicionar item"
          >
            <Plus className="w-6 h-6" strokeWidth={2.5} />
          </button>
        </div>
        {isProductsList && showCondition && (
          <textarea
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            placeholder="Condição (opcional). Ex.: Só tipo forno (oven), 11L ou mais"
            rows={2}
            className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 shadow-sm outline-none text-slate-700 placeholder:text-slate-400 resize-none focus:border-blue-300"
            aria-label="Condição"
          />
        )}
      </form>
    </div>
  );
}
