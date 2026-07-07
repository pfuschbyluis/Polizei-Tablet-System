import { useCallback } from 'react';
import DesktopContextMenu from './DesktopContextMenu';
import DesktopIcon from './DesktopIcon';
import DesktopWidgets from './DesktopWidgets';
import { useShell } from '../../context/ShellContext';

export default function DesktopSurface() {
  const { shortcuts, wallpaperCss, setContextMenu, closeAllOverlays } = useShell();

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest('.flux-desktop-icon')) return;
      e.preventDefault();
      closeAllOverlays();
      setContextMenu({ x: e.clientX, y: e.clientY });
    },
    [closeAllOverlays, setContextMenu]
  );

  return (
    <div
      className="flux-desktop-surface"
      style={{ background: wallpaperCss }}
      onContextMenu={handleContextMenu}
      onClick={() => closeAllOverlays()}
    >
      <div className="flux-desktop-icons">
        {shortcuts.map((shortcut) => (
          <DesktopIcon key={shortcut.id} shortcut={shortcut} />
        ))}
      </div>
      <DesktopWidgets />
      <DesktopContextMenu />
    </div>
  );
}
