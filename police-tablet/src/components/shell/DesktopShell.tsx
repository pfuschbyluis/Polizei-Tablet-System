import type { ReactNode } from 'react';
import { useShell } from '../../context/ShellContext';
import DesktopSurface from './DesktopSurface';
import Taskbar from './Taskbar';
import WindowFrame from './window/WindowFrame';

interface DesktopShellProps {
  children: ReactNode;
}

export default function DesktopShell({ children }: DesktopShellProps) {
  const { closeAllOverlays } = useShell();

  return (
    <div className="flux-desktop-shell" onClick={() => closeAllOverlays()}>
      <DesktopSurface />
      <div className="flux-window-layer">
        <WindowFrame>{children}</WindowFrame>
      </div>
      <Taskbar />
    </div>
  );
}
