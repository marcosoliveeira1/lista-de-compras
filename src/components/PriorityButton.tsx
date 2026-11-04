import { useEffect, useRef, useState } from 'react';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { cn } from '../lib/utils';
import { nextPriority, type Priority } from '../lib/sort';

export const PRIORITY_CONFIRM_MS = 3000;

const STYLES: Record<Priority, { icon: typeof ArrowUp; button: string; ring: string; label: string }> = {
  1: { icon: ArrowUp, button: "text-orange-500 bg-orange-50", ring: "text-orange-400", label: 'Prioritário' },
  0: { icon: Minus, button: "text-slate-300 hover:text-slate-400", ring: "text-slate-400", label: 'Sem prioridade' },
  [-1]: { icon: ArrowDown, button: "text-sky-600 bg-sky-50", ring: "text-sky-500", label: 'Pode esperar' },
};

interface PriorityButtonProps {
  priority: Priority;
  onConfirm: (priority: Priority) => void;
}

// Cada clique troca a seta e reinicia o anel; só confirma após 3s sem cliques
export function PriorityButton({ priority, onConfirm }: PriorityButtonProps) {
  const [pending, setPending] = useState<Priority | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [cycle, setCycle] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const shown = pending ?? priority;
  const isWaiting = pending !== null && !confirmed;
  const style = STYLES[shown];
  const Icon = style.icon;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = nextPriority(shown);
    setPending(next);
    setConfirmed(false);
    setCycle((c) => c + 1);

    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setConfirmed(true);
      if (next !== priority) onConfirm(next);
      // Segura o valor até a lista refletir a mudança, evitando piscar o antigo
      timer.current = setTimeout(() => setPending(null), 1000);
    }, PRIORITY_CONFIRM_MS);
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "relative p-2 rounded-full transition-all active:scale-95 cursor-pointer",
        isWaiting ? style.ring : style.button
      )}
      aria-label={style.label}
    >
      {isWaiting && (
        <svg key={cycle} viewBox="0 0 36 36" className={cn("absolute inset-0 w-full h-full -rotate-90", style.ring)}>
          <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeOpacity="0.15" strokeWidth="2.5" />
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray={100}
            className="animate-priority-fill"
            style={{ animationDuration: `${PRIORITY_CONFIRM_MS}ms` }}
          />
        </svg>
      )}
      <Icon className="relative w-5 h-5" />
    </button>
  );
}
