import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  ACCENT_PRESETS,
  DEFAULT_SHELL_SETTINGS,
  DEFAULT_SHORTCUTS,
  WALLPAPERS,
  type AccentPreset,
  type DesktopShortcut,
  type FontScale,
  type NotificationRecord,
  type ShellSettings,
  type TaskbarAlign,
  type TaskbarPosition,
  type WindowBounds,
  type WindowChromeState,
} from '../types/shell';

const STORAGE_KEY = 'polis-shell-settings';
const SHORTCUTS_KEY = 'polis-desktop-shortcuts';

interface ShellContextType {
  settings: ShellSettings;
  updateSettings: (patch: Partial<ShellSettings>) => void;
  wallpaperCss: string;
  shortcuts: DesktopShortcut[];
  togglePin: (id: string) => void;
  windowState: WindowChromeState;
  setWindowState: (state: WindowChromeState) => void;
  windowBounds: WindowBounds;
  setWindowBounds: (bounds: WindowBounds) => void;
  isWindowFocused: boolean;
  setWindowFocused: (focused: boolean) => void;
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
  notificationHistory: NotificationRecord[];
  pushNotification: (record: Omit<NotificationRecord, 'id' | 'timestamp'>) => void;
  clearNotifications: () => void;
  closeAllOverlays: () => void;
  systemStatus: {
    wifi: boolean;
    bluetooth: boolean;
    volume: number;
    brightness: number;
    battery: number;
    location: boolean;
  };
  setSystemStatus: (patch: Partial<ShellContextType['systemStatus']>) => void;
}

const ShellContext = createContext<ShellContextType | null>(null);

const DEFAULT_BOUNDS: WindowBounds = { x: 0, y: 0, width: 0, height: 0 };

function loadSettings(): ShellSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SHELL_SETTINGS;
    return { ...DEFAULT_SHELL_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SHELL_SETTINGS;
  }
}

function loadShortcuts(): DesktopShortcut[] {
  try {
    const raw = localStorage.getItem(SHORTCUTS_KEY);
    if (!raw) return DEFAULT_SHORTCUTS;
    return JSON.parse(raw) as DesktopShortcut[];
  } catch {
    return DEFAULT_SHORTCUTS;
  }
}

function applyShellCss(settings: ShellSettings) {
  const root = document.documentElement;
  const accent = ACCENT_PRESETS[settings.accent];
  root.style.setProperty('--flux-accent', accent.accent);
  root.style.setProperty('--flux-accent-hover', accent.hover);
  root.style.setProperty('--flux-accent-light', accent.light);
  root.style.setProperty('--flux-accent-subtle', accent.subtle);
  root.style.setProperty('--flux-shell-transparency', String(settings.transparency / 100));
  root.style.setProperty('--flux-wallpaper', WALLPAPERS[settings.wallpaperIndex]?.css ?? WALLPAPERS[0].css);
  root.setAttribute('data-font-scale', settings.fontScale);
  root.setAttribute('data-taskbar-position', settings.taskbarPosition);
  root.setAttribute('data-taskbar-align', settings.taskbarAlign);
}

export function ShellProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<ShellSettings>(loadSettings);
  const [shortcuts, setShortcuts] = useState<DesktopShortcut[]>(loadShortcuts);
  const [windowState, setWindowState] = useState<WindowChromeState>('normal');
  const [windowBounds, setWindowBounds] = useState<WindowBounds>(DEFAULT_BOUNDS);
  const [isWindowFocused, setWindowFocused] = useState(true);
  const [startOpen, setStartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [quickSettingsOpen, setQuickSettingsOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [virtualDesktop, setVirtualDesktop] = useState(1);
  const [notificationHistory, setNotificationHistory] = useState<NotificationRecord[]>([]);
  const [systemStatus, setSystemStatusState] = useState({
    wifi: true,
    bluetooth: false,
    volume: 72,
    brightness: 85,
    battery: 94,
    location: true,
  });

  useLayoutEffect(() => {
    applyShellCss(settings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(SHORTCUTS_KEY, JSON.stringify(shortcuts));
  }, [shortcuts]);

  useEffect(() => {
    if (!settings.autoWallpaper) return;
    const timer = window.setInterval(() => {
      setSettings((prev) => ({
        ...prev,
        wallpaperIndex: (prev.wallpaperIndex + 1) % WALLPAPERS.length,
      }));
    }, 60000);
    return () => window.clearInterval(timer);
  }, [settings.autoWallpaper]);

  const updateSettings = useCallback((patch: Partial<ShellSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const togglePin = useCallback((id: string) => {
    setShortcuts((prev) =>
      prev.map((s) => (s.id === id ? { ...s, pinned: !s.pinned } : s))
    );
  }, []);

  const closeAllOverlays = useCallback(() => {
    setStartOpen(false);
    setSearchOpen(false);
    setQuickSettingsOpen(false);
    setNotificationsOpen(false);
    setCalendarOpen(false);
    setContextMenu(null);
  }, []);

  const pushNotification = useCallback((record: Omit<NotificationRecord, 'id' | 'timestamp'>) => {
    const item: NotificationRecord = {
      ...record,
      id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: Date.now(),
    };
    setNotificationHistory((prev) => [item, ...prev].slice(0, 50));
  }, []);

  const clearNotifications = useCallback(() => setNotificationHistory([]), []);

  const setSystemStatus = useCallback((patch: Partial<ShellContextType['systemStatus']>) => {
    setSystemStatusState((prev) => ({ ...prev, ...patch }));
  }, []);

  const wallpaperCss = WALLPAPERS[settings.wallpaperIndex]?.css ?? WALLPAPERS[0].css;

  const value = useMemo(
    () => ({
      settings,
      updateSettings,
      wallpaperCss,
      shortcuts,
      togglePin,
      windowState,
      setWindowState,
      windowBounds,
      setWindowBounds,
      isWindowFocused,
      setWindowFocused,
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
      notificationHistory,
      pushNotification,
      clearNotifications,
      closeAllOverlays,
      systemStatus,
      setSystemStatus,
    }),
    [
      settings,
      updateSettings,
      wallpaperCss,
      shortcuts,
      togglePin,
      windowState,
      windowBounds,
      isWindowFocused,
      startOpen,
      searchOpen,
      quickSettingsOpen,
      notificationsOpen,
      calendarOpen,
      contextMenu,
      virtualDesktop,
      notificationHistory,
      pushNotification,
      clearNotifications,
      closeAllOverlays,
      systemStatus,
      setSystemStatus,
    ]
  );

  return <ShellContext.Provider value={value}>{children}</ShellContext.Provider>;
}

export function useShell() {
  const ctx = useContext(ShellContext);
  if (!ctx) throw new Error('useShell must be used within ShellProvider');
  return ctx;
}

export type { ShellSettings, TaskbarPosition, TaskbarAlign, AccentPreset, FontScale };
