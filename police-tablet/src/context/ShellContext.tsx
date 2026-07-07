import { useShellNotifications } from './shell/ShellNotificationsContext';
import { useShellOverlays } from './shell/ShellOverlayContext';
import { useShellSettings } from './shell/ShellSettingsContext';
import { useShellShortcuts } from './shell/ShellShortcutsContext';
import { useSystemStatus } from './shell/SystemStatusContext';
import { useWindowChrome } from './shell/WindowChromeContext';

export { ShellProvider } from './shell/ShellProvider';

export function useShell() {
  return {
    ...useShellSettings(),
    ...useShellShortcuts(),
    ...useWindowChrome(),
    ...useShellOverlays(),
    ...useShellNotifications(),
    ...useSystemStatus(),
  };
}

export type {
  ShellSettings,
  TaskbarPosition,
  TaskbarAlign,
  AccentPreset,
  FontScale,
} from '../types/shell';
