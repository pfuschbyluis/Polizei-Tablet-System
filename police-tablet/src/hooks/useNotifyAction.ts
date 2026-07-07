import { useCallback } from 'react';
import { useNotify, type NotifyType } from '../context/NotifyContext';

interface NotifyActionOptions {
  success?: string;
  error?: string;
  warning?: string;
  info?: string;
  /** Wenn gesetzt, wird bei Erfolg nur bei truthy Rückgabewert notify gezeigt */
  successIf?: boolean;
}

export function useNotifyAction() {
  const { notify } = useNotify();

  const run = useCallback(
    async <T>(
      action: () => Promise<T>,
      options: NotifyActionOptions = {}
    ): Promise<{ ok: true; data: T } | { ok: false; error: string }> => {
      try {
        const data = await action();
        const showSuccess = options.successIf !== undefined ? options.successIf : true;
        if (options.success && showSuccess) {
          notify(options.success, 'success');
        }
        return { ok: true, data };
      } catch (err) {
        const message = err instanceof Error ? err.message : options.error ?? 'Aktion fehlgeschlagen.';
        notify(message, 'error');
        return { ok: false, error: message };
      }
    },
    [notify]
  );

  const warn = useCallback(
    (message: string) => {
      notify(message, 'warning');
    },
    [notify]
  );

  const info = useCallback(
    (message: string) => {
      notify(message, 'info');
    },
    [notify]
  );

  const toast = useCallback(
    (message: string, type: NotifyType = 'info') => {
      notify(message, type);
    },
    [notify]
  );

  return { run, warn, info, toast, notify };
}
