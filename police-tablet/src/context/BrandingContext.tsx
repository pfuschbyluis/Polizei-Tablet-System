import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { fetchNui, isFiveM, type NuiMessage } from '../utils/fivem';

export interface BrandingState {
  customIconUrl: string;
}

interface BrandingContextType {
  customIconUrl: string;
  isLoading: boolean;
  refreshBranding: () => Promise<void>;
  updateBranding: (customIconUrl: string) => Promise<{ success: boolean; error?: string }>;
}

const BrandingContext = createContext<BrandingContextType | null>(null);

const DEV_STORAGE_KEY = 'polis-custom-icon-url';

function readDevIconUrl(): string {
  try {
    return localStorage.getItem(DEV_STORAGE_KEY) ?? '';
  } catch {
    return '';
  }
}

function writeDevIconUrl(url: string) {
  try {
    if (url) {
      localStorage.setItem(DEV_STORAGE_KEY, url);
    } else {
      localStorage.removeItem(DEV_STORAGE_KEY);
    }
  } catch {
    /* ignore */
  }
}

export function BrandingProvider({ children }: { children: ReactNode }) {
  const [customIconUrl, setCustomIconUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const applyBranding = useCallback((branding?: BrandingState | null) => {
    setCustomIconUrl(branding?.customIconUrl?.trim() ?? '');
  }, []);

  const refreshBranding = useCallback(async () => {
    if (!isFiveM()) {
      applyBranding({ customIconUrl: readDevIconUrl() });
      return;
    }

    setIsLoading(true);
    try {
      const result = await fetchNui<{ success: boolean; branding?: BrandingState; error?: string }>(
        'getBranding',
        {}
      );
      if (result.success && result.branding) {
        applyBranding(result.branding);
      }
    } finally {
      setIsLoading(false);
    }
  }, [applyBranding]);

  const updateBranding = useCallback(async (url: string) => {
    const trimmed = url.trim();

    if (!isFiveM()) {
      writeDevIconUrl(trimmed);
      applyBranding({ customIconUrl: trimmed });
      return { success: true };
    }

    try {
      const result = await fetchNui<{ success: boolean; branding?: BrandingState; error?: string }>(
        'updateBranding',
        { customIconUrl: trimmed }
      );
      if (result.success && result.branding) {
        applyBranding(result.branding);
        return { success: true };
      }
      return { success: false, error: result.error ?? 'Speichern fehlgeschlagen.' };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Verbindungsfehler.',
      };
    }
  }, [applyBranding]);

  useEffect(() => {
    refreshBranding();
  }, [refreshBranding]);

  useEffect(() => {
    const handler = (event: MessageEvent<NuiMessage>) => {
      const msg = event.data;
      if (msg?.action === 'brandingUpdated' && msg.data) {
        applyBranding(msg.data as BrandingState);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [applyBranding]);

  const value = useMemo(
    () => ({
      customIconUrl,
      isLoading,
      refreshBranding,
      updateBranding,
    }),
    [customIconUrl, isLoading, refreshBranding, updateBranding]
  );

  return <BrandingContext.Provider value={value}>{children}</BrandingContext.Provider>;
}

export function useBranding() {
  const ctx = useContext(BrandingContext);
  if (!ctx) throw new Error('useBranding must be used within BrandingProvider');
  return ctx;
}
