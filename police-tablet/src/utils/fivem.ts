export function isFiveM(): boolean {
  return typeof (window as Window & { invokeNative?: unknown }).invokeNative === 'function';
}

export function getResourceName(): string {
  if (isFiveM()) {
    return (window as Window & { GetParentResourceName?: () => string }).GetParentResourceName?.() ?? 'polis';
  }
  return 'polis';
}

export async function fetchNui<T = unknown>(event: string, data?: unknown): Promise<T> {
  if (!isFiveM()) {
    return {} as T;
  }

  const response = await fetch(`https://${getResourceName()}/${event}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data ?? {}),
  });

  return response.json() as Promise<T>;
}

export interface NuiOpenPayload {
  officer?: {
    id: string;
    badgeNumber: string;
    name: string;
    rank: string;
    unit: string;
  };
}

export type NuiMessage =
  | { action: 'open'; data?: NuiOpenPayload }
  | { action: 'close' }
  | { action: 'setOfficer'; data: NuiOpenPayload['officer'] };

declare global {
  interface Window {
    GetParentResourceName?: () => string;
  }
}
