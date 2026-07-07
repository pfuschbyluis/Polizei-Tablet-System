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
import PoliceIcon from '../components/icons/PoliceIcon';

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
  error: 'flux-os-toast--error',
  success: 'flux-os-toast--success',
  warning: 'flux-os-toast--warning',
  info: 'flux-os-toast--info',
};

const typeIcons: Record<NotifyType, 'alert' | 'check' | 'bell'> = {
  error: 'alert',
  success: 'check',
  warning: 'alert',
  info: 'bell',
};

const typeTitles: Record<NotifyType, string> = {
  error: 'Fehler',
  warning: 'Warnung',
  success: 'Erfolgreich',
  info: 'POLIS System',
};

function NotifyContainer({ items, onDismiss }: { items: NotifyItem[]; onDismiss: (id: string) => void }) {
  const [root, setRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setRoot(document.getElementById('flux-notify-root'));
  }, []);

  if (!root || items.length === 0) return null;

  return createPortal(
    <div className="flux-os-toast-stack">
      {items.map((item) => (
        <div
          key={item.id}
          className={`flux-os-toast ${typeClass[item.type]}`}
          role="alert"
        >
          <div className="flux-os-toast-accent" aria-hidden />
          <div className="flux-os-toast-app-icon">
            <PoliceIcon size={16} />
          </div>
          <div className="flux-os-toast-body">
            <p className="flux-os-toast-title">{typeTitles[item.type]}</p>
            <p className="flux-os-toast-message">{item.message}</p>
          </div>
          <div className="flux-os-toast-type-icon" aria-hidden>
            <Icon name={typeIcons[item.type]} size={16} />
          </div>
          <button
            type="button"
            onClick={() => onDismiss(item.id)}
            className="flux-os-toast-close"
            aria-label="Schließen"
          >
            <Icon name="close" size={12} />
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
    setItems((prev) => [...prev.slice(-3), { id, message, type }]);
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
