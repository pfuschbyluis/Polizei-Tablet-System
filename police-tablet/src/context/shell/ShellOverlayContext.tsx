import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

interface ShellOverlayContextType {
  startOpen: boolean;
  setStartOpen: (open: boolean) => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  quickSettingsOpen: boolean;
  setQuickSettingsOpen: (open: boolean) => void;
  notificationsOpen: boolean;
  setNotificationsOpen: (open: boolean) => void;
  calendarOpen: boolean;
  setCalendarOpen: (open: boolean) => void;
  contextMenu: { x: number; y: number } | null;
  setContextMenu: (menu: { x: number; y: number } | null) => void;
  virtualDesktop: number;
  setVirtualDesktop: (index: number) => void;
  closeAllOverlays: () => void;
}

const ShellOverlayContext = createContext<ShellOverlayContextType | null>(null);

export function ShellOverlayProvider({ children }: { children: ReactNode }) {
  const [startOpen, setStartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [quickSettingsOpen, setQuickSettingsOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [virtualDesktop, setVirtualDesktop] = useState(1);

  const closeAllOverlays = useCallback(() => {
    setStartOpen(false);
    setSearchOpen(false);
    setQuickSettingsOpen(false);
    setNotificationsOpen(false);
    setCalendarOpen(false);
    setContextMenu(null);
  }, []);

  const value = useMemo(
    () => ({
      startOpen,
      setStartOpen,
      searchOpen,
      setSearchOpen,
      quickSettingsOpen,
      setQuickSettingsOpen,
      notificationsOpen,
      setNotificationsOpen,
      calendarOpen,
      setCalendarOpen,
      contextMenu,
      setContextMenu,
      virtualDesktop,
      setVirtualDesktop,
      closeAllOverlays,
    }),
    [
      startOpen,
      searchOpen,
      quickSettingsOpen,
      notificationsOpen,
      calendarOpen,
      contextMenu,
      virtualDesktop,
      closeAllOverlays,
    ]
  );

  return <ShellOverlayContext.Provider value={value}>{children}</ShellOverlayContext.Provider>;
}

export function useShellOverlays() {
  const ctx = useContext(ShellOverlayContext);
  if (!ctx) throw new Error('useShellOverlays must be used within ShellOverlayProvider');
  return ctx;
}
