import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
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

const typeClass: Record<NotifyType, string> = {
  error: 'flux-notify--error',
  success: 'flux-notify--success',
  warning: 'flux-notify--warning',
  info: 'flux-notify--info',
};

const typeIcons: Record<NotifyType, 'alert' | 'check' | 'bell'> = {
  error: 'alert',
  success: 'check',
  warning: 'alert',
  info: 'bell',
};

function NotifyContainer({ items, onDismiss }: { items: NotifyItem[]; onDismiss: (id: string) => void }) {
  const [root, setRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setRoot(document.getElementById('flux-notify-root'));
  }, []);

  if (!root || items.length === 0) return null;

  return createPortal(
    <div className="flux-notify-stack">
      {items.map((item) => (
        <div
          key={item.id}
          className={`flux-notify ${typeClass[item.type]}`}
          role="alert"
        >
          <Icon name={typeIcons[item.type]} size={18} className="flux-notify-icon shrink-0" />
          <p className="flux-notify-text flex-1">{item.message}</p>
          <button
            type="button"
            onClick={() => onDismiss(item.id)}
            className="flux-notify-close"
            aria-label="Schließen"
          >
            <Icon name="close" size={14} />
          </button>
        </div>
      ))}
    </div>,
    root
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
    window.setTimeout(() => dismiss(id), 5000);
  }, [dismiss]);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <NotifyContext.Provider value={value}>
      <NotifyContainer items={items} onDismiss={dismiss} />
      {children}
    </NotifyContext.Provider>
  );
}

export function useNotify() {
  const ctx = useContext(NotifyContext);
  if (!ctx) throw new Error('useNotify must be used within NotifyProvider');
  return ctx;
}
