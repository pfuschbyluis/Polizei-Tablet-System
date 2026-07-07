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
import { applyShellCss } from '../../shell/applyShellCss';
import { WALLPAPERS } from '../../shell/constants';
import { loadSettings, saveSettings } from '../../shell/storage';
import type { ShellSettings } from '../../types/shell';

interface ShellSettingsContextType {
  settings: ShellSettings;
  updateSettings: (patch: Partial<ShellSettings>) => void;
  wallpaperCss: string;
}

const ShellSettingsContext = createContext<ShellSettingsContextType | null>(null);

export function ShellSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<ShellSettings>(loadSettings);

  useLayoutEffect(() => {
    applyShellCss(settings);
    saveSettings(settings);
  }, [settings]);

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

  const wallpaperCss = WALLPAPERS[settings.wallpaperIndex]?.css ?? WALLPAPERS[0].css;

  const value = useMemo(
    () => ({ settings, updateSettings, wallpaperCss }),
    [settings, updateSettings, wallpaperCss]
  );

  return <ShellSettingsContext.Provider value={value}>{children}</ShellSettingsContext.Provider>;
}

export function useShellSettings() {
  const ctx = useContext(ShellSettingsContext);
  if (!ctx) throw new Error('useShellSettings must be used within ShellSettingsProvider');
  return ctx;
}
