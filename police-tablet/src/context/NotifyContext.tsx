import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import Icon from '../components/icons/Icon';

export type NotifyType = 'error' | 'success' | 'info' | 'warning';

interface NotifyItem {
  id: string;
  message: string;
  type: NotifyType;
}

interface NotifyContextType {
  notify: (message: string, type?: NotifyType) => void;
}

const NotifyContext = createContext<NotifyContextType | null>(null);

const typeStyles: Record<NotifyType, string> = {
  error: 'border-danger/40 bg-danger/12 text-danger',
  success: 'border-success/40 bg-success/12 text-success',
  warning: 'border-warning/40 bg-warning/12 text-warning',
  info: 'border-accent/40 bg-accent/12 text-accent-light',
};

const typeIcons: Record<NotifyType, 'alert' | 'check' | 'bell'> = {
  error: 'alert',
  success: 'check',
  warning: 'alert',
  info: 'bell',
};

function NotifyContainer({ items, onDismiss }: { items: NotifyItem[]; onDismiss: (id: string) => void }) {
  if (items.length === 0) return null;

  return (
    <div className="flux-notify-stack pointer-events-none absolute inset-x-0 top-3 z-[100] flex flex-col items-center gap-2 px-4">
      {items.map((item) => (
        <div
          key={item.id}
          className={`flux-notify pointer-events-auto flex w-full max-w-sm items-start gap-2.5 rounded-xl border px-4 py-3 text-sm shadow-lg backdrop-blur-sm ${typeStyles[item.type]}`}
          role="alert"
        >
          <Icon name={typeIcons[item.type]} size={18} className="mt-0.5 shrink-0" />
          <p className="flex-1 leading-snug">{item.message}</p>
          <button
            type="button"
            onClick={() => onDismiss(item.id)}
            className="shrink-0 rounded-md p-0.5 opacity-70 transition-opacity hover:opacity-100"
            aria-label="Schließen"
          >
            <Icon name="close" size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

export function NotifyProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<NotifyItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const notify = useCallback((message: string, type: NotifyType = 'info') => {
    const id = `notify-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setItems((prev) => [...prev.slice(-4), { id, message, type }]);
    window.setTimeout(() => dismiss(id), 4500);
  }, [dismiss]);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <NotifyContext.Provider value={value}>
      <div className="relative flex h-full min-h-0 flex-col">
        <NotifyContainer items={items} onDismiss={dismiss} />
        {children}
      </div>
    </NotifyContext.Provider>
  );
}

export function useNotify() {
  const ctx = useContext(NotifyContext);
  if (!ctx) throw new Error('useNotify must be used within NotifyProvider');
  return ctx;
}
