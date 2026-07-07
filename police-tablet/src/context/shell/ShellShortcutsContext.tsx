import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { loadShortcuts, saveShortcuts } from '../../shell/storage';
import type { DesktopShortcut } from '../../types/shell';

interface ShellShortcutsContextType {
  shortcuts: DesktopShortcut[];
  togglePin: (id: string) => void;
}

const ShellShortcutsContext = createContext<ShellShortcutsContextType | null>(null);

export function ShellShortcutsProvider({ children }: { children: ReactNode }) {
  const [shortcuts, setShortcuts] = useState<DesktopShortcut[]>(loadShortcuts);

  useEffect(() => {
    saveShortcuts(shortcuts);
  }, [shortcuts]);

  const togglePin = useCallback((id: string) => {
    setShortcuts((prev) =>
      prev.map((s) => (s.id === id ? { ...s, pinned: !s.pinned } : s))
    );
  }, []);

  const value = useMemo(() => ({ shortcuts, togglePin }), [shortcuts, togglePin]);

  return <ShellShortcutsContext.Provider value={value}>{children}</ShellShortcutsContext.Provider>;
}

export function useShellShortcuts() {
  const ctx = useContext(ShellShortcutsContext);
  if (!ctx) throw new Error('useShellShortcuts must be used within ShellShortcutsProvider');
  return ctx;
}
