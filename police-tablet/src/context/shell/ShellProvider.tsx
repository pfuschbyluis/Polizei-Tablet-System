import type { ReactNode } from 'react';
import { ShellNotificationsProvider } from './ShellNotificationsContext';
import { ShellOverlayProvider } from './ShellOverlayContext';
import { ShellSettingsProvider } from './ShellSettingsContext';
import { ShellShortcutsProvider } from './ShellShortcutsContext';
import { SystemStatusProvider } from './SystemStatusContext';
import { WindowChromeProvider } from './WindowChromeContext';

export function ShellProvider({ children }: { children: ReactNode }) {
  return (
    <ShellSettingsProvider>
      <ShellShortcutsProvider>
        <WindowChromeProvider>
          <ShellOverlayProvider>
            <ShellNotificationsProvider>
              <SystemStatusProvider>{children}</SystemStatusProvider>
            </ShellNotificationsProvider>
          </ShellOverlayProvider>
        </WindowChromeProvider>
      </ShellShortcutsProvider>
    </ShellSettingsProvider>
  );
}
