import { useCallback } from 'react';
import DesktopIcon from './DesktopIcon';
import DesktopContextMenu from './DesktopContextMenu';
import { useShell } from '../../context/ShellContext';
import { WALLPAPERS } from '../../types/shell';

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
      <div className="flux-desktop-widgets">
        <div className="flux-desktop-widget">
          <p className="flux-desktop-widget__title">Wetter</p>
          <p className="flux-desktop-widget__value">12°C · Bewölkt</p>
          <p className="flux-desktop-widget__sub">Los Santos</p>
        </div>
        <div className="flux-desktop-widget">
          <p className="flux-desktop-widget__title">System</p>
          <p className="flux-desktop-widget__value">POLIS v2</p>
          <p className="flux-desktop-widget__sub">{WALLPAPERS.length} Hintergründe</p>
        </div>
      </div>
      <DesktopContextMenu />
    </div>
  );
}
