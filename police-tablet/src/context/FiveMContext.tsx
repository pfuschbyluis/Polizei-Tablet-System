import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { fetchNui, isFiveM, type NuiMessage, type NuiOpenPayload } from '../utils/fivem';

interface FiveMContextType {
  visible: boolean;
  isInGame: boolean;
  close: () => void;
  openPayload: NuiOpenPayload | null;
}

const FiveMContext = createContext<FiveMContextType | null>(null);

export function FiveMProvider({ children }: { children: ReactNode }) {
  const isInGame = isFiveM();
  const [visible, setVisible] = useState(!isInGame);
  const [openPayload, setOpenPayload] = useState<NuiOpenPayload | null>(null);

  const close = useCallback(() => {
    setVisible(false);
    if (isInGame) {
      fetchNui('close');
    }
  }, [isInGame]);

  useEffect(() => {
    const handler = (event: MessageEvent<NuiMessage>) => {
      const msg = event.data;
      if (!msg?.action) return;

      if (msg.action === 'open') {
        setOpenPayload(msg.data ?? null);
        setVisible(true);
      }
      if (msg.action === 'close') {
        setVisible(false);
      }
      if (msg.action === 'setOfficer') {
        setOpenPayload({ officer: msg.data });
      }
    };

    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && visible && isInGame) {
        close();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [visible, isInGame, close]);

  useEffect(() => {
    if (isInGame) {
      fetchNui('ready');
    }
  }, [isInGame]);

  return (
    <FiveMContext.Provider value={{ visible, isInGame, close, openPayload }}>
      {children}
    </FiveMContext.Provider>
  );
}

export function useFiveM() {
  const ctx = useContext(FiveMContext);
  if (!ctx) throw new Error('useFiveM must be used within FiveMProvider');
  return ctx;
}
