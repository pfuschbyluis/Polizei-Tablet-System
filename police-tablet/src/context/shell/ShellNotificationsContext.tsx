import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { NotificationRecord } from '../../types/shell';

interface ShellNotificationsContextType {
  notificationHistory: NotificationRecord[];
  pushNotification: (record: Omit<NotificationRecord, 'id' | 'timestamp'>) => void;
  clearNotifications: () => void;
}

const ShellNotificationsContext = createContext<ShellNotificationsContextType | null>(null);

export function ShellNotificationsProvider({ children }: { children: ReactNode }) {
  const [notificationHistory, setNotificationHistory] = useState<NotificationRecord[]>([]);

  const pushNotification = useCallback((record: Omit<NotificationRecord, 'id' | 'timestamp'>) => {
    const item: NotificationRecord = {
      ...record,
      id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: Date.now(),
    };
    setNotificationHistory((prev) => [item, ...prev].slice(0, 50));
  }, []);

  const clearNotifications = useCallback(() => setNotificationHistory([]), []);

  const value = useMemo(
    () => ({ notificationHistory, pushNotification, clearNotifications }),
    [notificationHistory, pushNotification, clearNotifications]
  );

  return (
    <ShellNotificationsContext.Provider value={value}>{children}</ShellNotificationsContext.Provider>
  );
}

export function useShellNotifications() {
  const ctx = useContext(ShellNotificationsContext);
  if (!ctx) throw new Error('useShellNotifications must be used within ShellNotificationsProvider');
  return ctx;
}
