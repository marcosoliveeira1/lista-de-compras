import { useState } from 'react';
import { Plus } from 'lucide-react';

interface AddItemFormProps {
  onAdd: (label: string) => void;
}

export function AddItemForm({ onAdd }: AddItemFormProps) {
  const [label, setLabel] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;
    onAdd(label.trim());
    setLabel('');
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent pointer-events-none pb-safe">
      <form
        onSubmit={handleSubmit}
        className="max-w-md mx-auto bg-white p-2 rounded-full shadow-lg border border-slate-200 flex gap-2 pointer-events-auto items-center"
      >
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Adicionar novo item..."
          className="flex-1 px-4 py-2 outline-none bg-transparent text-slate-700 placeholder:text-slate-400 text-lg"
          autoComplete="off"
        />
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