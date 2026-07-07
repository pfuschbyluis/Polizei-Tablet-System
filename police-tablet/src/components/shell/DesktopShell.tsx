import type { ReactNode } from 'react';
import DesktopSurface from './DesktopSurface';
import ShellOverlayBackdrop from './ShellOverlayBackdrop';
import Taskbar from './Taskbar';
import WindowFrame from './window/WindowFrame';

interface DesktopShellProps {
  children: ReactNode;
}

export default function DesktopShell({ children }: DesktopShellProps) {
  return (
    <div className="flux-desktop-shell">
      <DesktopSurface />
      <ShellOverlayBackdrop />
      <div className="flux-window-layer">
        <WindowFrame>{children}</WindowFrame>
      </div>
      <Taskbar />
    </div>
  );
}
