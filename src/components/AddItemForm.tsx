import { useState } from 'react';
import { Plus } from 'lucide-react';

interface AddItemFormProps {
  onAdd: (label: string, maxValue?: number) => void;
  showMaxValue?: boolean;
}

export function AddItemForm({ onAdd, showMaxValue }: AddItemFormProps) {
  const [label, setLabel] = useState('');
  const [maxValue, setMaxValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;

    const parsed = parseFloat(maxValue.replace(',', '.'));
    const max = showMaxValue && Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;

    onAdd(label.trim(), max);
    setLabel('');
    setMaxValue('');
  };

  return (
    <div className="p-4 bg-slate-50 shrink-0 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-slate-200/50">
      <form
        onSubmit={handleSubmit}
        className="w-full bg-white p-2 rounded-full shadow-sm border border-slate-200 flex gap-2 items-center"
      >
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Adicionar novo item..."
          className="flex-1 min-w-0 px-4 py-2 outline-none bg-transparent text-slate-700 placeholder:text-slate-400 text-lg"
          autoComplete="off"
        />
        {showMaxValue && (
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
        <button
          type="submit"
          disabled={!label.trim()}
          className="bg-blue-600 text-white w-12 h-12 flex-shrink-0 rounded-full hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 transition-all flex items-center justify-center active:scale-95"
          aria-label="Adicionar item"
        >
          <Plus className="w-6 h-6" strokeWidth={2.5} />
        </button>
      </form>
    </div>
  );
}
