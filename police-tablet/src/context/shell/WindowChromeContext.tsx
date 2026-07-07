import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { DEFAULT_WINDOW_BOUNDS } from '../../shell/constants';
import type { WindowBounds, WindowChromeState } from '../../types/shell';

interface WindowChromeContextType {
  windowState: WindowChromeState;
  setWindowState: (state: WindowChromeState) => void;
  windowBounds: WindowBounds;
  setWindowBounds: (bounds: WindowBounds) => void;
  isWindowFocused: boolean;
  setWindowFocused: (focused: boolean) => void;
}

const WindowChromeContext = createContext<WindowChromeContextType | null>(null);

export function WindowChromeProvider({ children }: { children: ReactNode }) {
  const [windowState, setWindowState] = useState<WindowChromeState>('normal');
  const [windowBounds, setWindowBounds] = useState<WindowBounds>(DEFAULT_WINDOW_BOUNDS);
  const [isWindowFocused, setWindowFocused] = useState(true);

  const value = useMemo(
    () => ({
      windowState,
      setWindowState,
      windowBounds,
      setWindowBounds,
      isWindowFocused,
      setWindowFocused,
    }),
    [windowState, windowBounds, isWindowFocused]
  );

  return <WindowChromeContext.Provider value={value}>{children}</WindowChromeContext.Provider>;
}

export function useWindowChrome() {
  const ctx = useContext(WindowChromeContext);
  if (!ctx) throw new Error('useWindowChrome must be used within WindowChromeProvider');
  return ctx;
}
