import type { NotifyType } from '../../../context/NotifyContext';

export const toastTypeClass: Record<NotifyType, string> = {
  error: 'flux-os-toast--error',
  success: 'flux-os-toast--success',
  warning: 'flux-os-toast--warning',
  info: 'flux-os-toast--info',
};

export const toastTypeIcons: Record<NotifyType, 'alert' | 'check' | 'bell'> = {
  error: 'alert',
  success: 'check',
  warning: 'alert',
  info: 'bell',
};

export const toastTypeTitles: Record<NotifyType, string> = {
  error: 'Fehler',
  warning: 'Warnung',
  success: 'Erfolgreich',
  info: 'POLIS System',
};
