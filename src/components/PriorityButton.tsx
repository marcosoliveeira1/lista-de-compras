import { useEffect, useRef, useState } from 'react';
import { ArrowUp, ArrowDown, Minus, Check } from 'lucide-react';
import { cn } from '../lib/utils';
import { togglePriority, type Priority } from '../lib/sort';
import { useHaptics } from '../hooks/use-haptics';

export const PRIORITY_CONFIRM_MS = 3000;
const LONG_PRESS_MS = 500;
const MENU_HEIGHT = 156;

const STYLES: Record<Priority, { icon: typeof ArrowUp; button: string; ring: string; label: string }> = {
  1: { icon: ArrowUp, button: "text-orange-500 bg-orange-50", ring: "text-orange-400", label: 'Prioritário' },
  0: { icon: Minus, button: "text-slate-300 hover:text-slate-400", ring: "text-slate-400", label: 'Sem prioridade' },
  [-1]: { icon: ArrowDown, button: "text-sky-600 bg-sky-50", ring: "text-sky-500", label: 'Pode esperar' },
};

const MENU_OPTIONS: Priority[] = [1, 0, -1];

interface PriorityButtonProps {
  priority: Priority;
  onConfirm: (priority: Priority) => void;
  // Avisa enquanto há troca aguardando os 3s, para a lista segurar as atualizações
  onPendingChange?: (pending: boolean) => void;
}

// Clique alterna prioritário/neutro e só confirma após 3s sem cliques; segurar abre o menu com as 3 opções
export function PriorityButton({ priority, onConfirm, onPendingChange }: PriorityButtonProps) {
  const [pending, setPending] = useState<Priority | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [cycle, setCycle] = useState(0);
  const [menuPosition, setMenuPosition] = useState<React.CSSProperties | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const pressTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const longPressed = useRef(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { trigger } = useHaptics();

  const shown = pending ?? priority;
  const isWaiting = pending !== null && !confirmed;
  const style = STYLES[shown];
  const Icon = style.icon;

  const onPendingChangeRef = useRef(onPendingChange);
  useEffect(() => {
    onPendingChangeRef.current = onPendingChange;
  });

  useEffect(() => {
    onPendingChangeRef.current?.(isWaiting);
  }, [isWaiting]);

  useEffect(() => () => {
    clearTimeout(timer.current);
    clearTimeout(pressTimer.current);
    onPendingChangeRef.current?.(false);
  }, []);

  // Segura o valor até a lista refletir a mudança (que pode esperar outras trocas pendentes)
  const [lastPriority, setLastPriority] = useState(priority);
  if (priority !== lastPriority) {
    setLastPriority(priority);
    if (confirmed) setPending(null);
  }

  const commit = (next: Priority) => {
    setConfirmed(true);
    // Sem foco, o navegador não rola a lista atrás do item quando ele muda de posição
    buttonRef.current?.blur();
    if (next !== priority) onConfirm(next);
    else setPending(null);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (longPressed.current) {
      longPressed.current = false;
      return;
    }
    const next = togglePriority(shown);
    setPending(next);
    setConfirmed(false);
    setCycle((c) => c + 1);

    clearTimeout(timer.current);
    timer.current = setTimeout(() => commit(next), PRIORITY_CONFIRM_MS);
  };

  const openMenu = () => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    longPressed.current = true;
    trigger('nudge');
    const right = window.innerWidth - rect.right;
    setMenuPosition(
      rect.bottom + MENU_HEIGHT > window.innerHeight
        ? { right, bottom: window.innerHeight - rect.top + 4 }
        : { right, top: rect.bottom + 4 }
    );
  };

  const handlePointerDown = () => {
    longPressed.current = false;
    clearTimeout(pressTimer.current);
    pressTimer.current = setTimeout(openMenu, LONG_PRESS_MS);
  };

  const cancelPress = () => clearTimeout(pressTimer.current);

  const handleSelect = (next: Priority) => {
    setMenuPosition(null);
    clearTimeout(timer.current);
    setPending(next);
    commit(next);
  };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onPointerUp={cancelPress}
        onPointerLeave={cancelPress}
        onPointerCancel={cancelPress}
        onContextMenu={(e) => e.preventDefault()}
        className={cn(
          "relative p-2 rounded-full transition-all active:scale-95 cursor-pointer select-none [-webkit-touch-callout:none]",
          isWaiting ? style.ring : style.button
        )}
        aria-label={style.label}
        aria-haspopup="menu"
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

      {menuPosition && (
        <div className="fixed inset-0 z-50" onClick={() => setMenuPosition(null)}>
          <div
            role="menu"
            style={menuPosition}
            onClick={(e) => e.stopPropagation()}
            className="fixed w-48 p-1.5 bg-white rounded-2xl shadow-xl border border-slate-100 flex flex-col"
          >
            {MENU_OPTIONS.map((option) => {
              const { icon: OptionIcon, button, label } = STYLES[option];
              return (
                <button
                  key={option}
                  type="button"
                  role="menuitem"
                  onClick={() => handleSelect(option)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-slate-700 hover:bg-slate-50 active:bg-slate-100"
                >
                  <span className={cn("p-1 rounded-full", button)}>
                    <OptionIcon className="w-4 h-4" />
                  </span>
                  <span className="flex-1">{label}</span>
                  {option === shown && <Check className="w-4 h-4 text-blue-600" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
