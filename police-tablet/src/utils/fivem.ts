export function isFiveM(): boolean {
  return typeof (window as Window & { invokeNative?: unknown }).invokeNative === 'function';
}

export function getResourceName(): string {
  if (isFiveM()) {
    return (window as Window & { GetParentResourceName?: () => string }).GetParentResourceName?.() ?? 'polis';
  }
  return 'polis';
}

const NUI_TIMEOUT_MS = 15000;
const SESSION_KEY = 'polis-session-token';

export function getSessionToken(): string | null {
  try {
    return sessionStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

export function setSessionToken(token: string | null) {
  try {
    if (token) {
      sessionStorage.setItem(SESSION_KEY, token);
    } else {
      sessionStorage.removeItem(SESSION_KEY);
    }
  } catch {
    /* ignore */
  }
}

export async function fetchNui<T = unknown>(event: string, data?: unknown): Promise<T> {
  if (!isFiveM()) {
    return {} as T;
  }

  const sessionToken = getSessionToken();
  const base =
    data && typeof data === 'object' && !Array.isArray(data)
      ? (data as Record<string, unknown>)
      : {};
  const payload = sessionToken ? { ...base, sessionToken } : base;

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), NUI_TIMEOUT_MS);

  try {
    const response = await fetch(`https://${getResourceName()}/${event}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload ?? {}),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`NUI request failed (${response.status})`);
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('Zeitüberschreitung – Server antwortet nicht.');
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export interface NuiOpenPayload {
  officer?: {
    id: string;
    badgeNumber: string;
    name: string;
    rank: string;
  };
}

export type NuiMessage =
  | { action: 'open'; data?: NuiOpenPayload }
  | { action: 'close' }
  | { action: 'setOfficer'; data: NuiOpenPayload['officer'] }
  | { action: 'brandingUpdated'; data: { customIconUrl: string } };

declare global {
  interface Window {
    GetParentResourceName?: () => string;
  }
}
