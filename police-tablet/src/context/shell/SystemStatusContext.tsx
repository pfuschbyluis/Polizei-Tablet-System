import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { SystemStatus } from '../../types/shell';

interface SystemStatusContextType {
  systemStatus: SystemStatus;
  setSystemStatus: (patch: Partial<SystemStatus>) => void;
}

const SystemStatusContext = createContext<SystemStatusContextType | null>(null);

const DEFAULT_SYSTEM_STATUS: SystemStatus = {
  wifi: true,
  bluetooth: false,
  volume: 72,
  brightness: 85,
  battery: 94,
  location: true,
};

export function SystemStatusProvider({ children }: { children: ReactNode }) {
  const [systemStatus, setSystemStatusState] = useState<SystemStatus>(DEFAULT_SYSTEM_STATUS);

  const setSystemStatus = useCallback((patch: Partial<SystemStatus>) => {
    setSystemStatusState((prev) => ({ ...prev, ...patch }));
  }, []);

  const value = useMemo(
    () => ({ systemStatus, setSystemStatus }),
    [systemStatus, setSystemStatus]
  );

  return <SystemStatusContext.Provider value={value}>{children}</SystemStatusContext.Provider>;
}

export function useSystemStatus() {
  const ctx = useContext(SystemStatusContext);
  if (!ctx) throw new Error('useSystemStatus must be used within SystemStatusProvider');
  return ctx;
}
