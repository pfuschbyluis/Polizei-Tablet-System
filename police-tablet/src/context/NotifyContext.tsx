import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import OsToastStack, { type ToastItem } from '../components/shell/toast/OsToastStack';
import { useShell } from './ShellContext';

export type NotifyType = 'error' | 'success' | 'info' | 'warning';

interface NotifyContextType {
  notify: (message: string, type?: NotifyType) => void;
}

const NotifyContext = createContext<NotifyContextType | null>(null);

export function NotifyProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const { pushNotification, settings } = useShell();

  const dismiss = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const notify = useCallback(
    (message: string, type: NotifyType = 'info') => {
      pushNotification({ message, type });
      if (settings.doNotDisturb) return;

      const id = `notify-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setItems((prev) => [...prev.slice(-3), { id, message, type }]);
      window.setTimeout(() => dismiss(id), 5000);
    },
    [dismiss, pushNotification, settings.doNotDisturb]
  );

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <NotifyContext.Provider value={value}>
      <OsToastStack items={items} onDismiss={dismiss} />
      {children}
    </NotifyContext.Provider>
  );
}

export function useNotify() {
  const ctx = useContext(NotifyContext);
  if (!ctx) throw new Error('useNotify must be used within NotifyProvider');
  return ctx;
}
