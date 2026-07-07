import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useShell } from '../../context/ShellContext';
import { WALLPAPERS } from '../../shell/constants';

export default function DesktopContextMenu() {
  const { contextMenu, setContextMenu, updateSettings, settings, setVirtualDesktop, virtualDesktop } =
    useShell();
  const navigate = useNavigate();

  if (!contextMenu) return null;

  const items = [
    {
      label: 'Aktualisieren',
      action: () => window.location.reload(),
    },
    {
      label: 'Nächster Hintergrund',
      action: () =>
        updateSettings({ wallpaperIndex: (settings.wallpaperIndex + 1) % WALLPAPERS.length }),
    },
    {
      label: 'Personalisierung',
      action: () => {
        setContextMenu(null);
        navigate('/einstellungen');
      },
    },
    {
      label: `Desktop ${virtualDesktop} · Neuer Desktop`,
      action: () => setVirtualDesktop(virtualDesktop + 1),
    },
  ];

  return createPortal(
    <div
      className="flux-context-menu"
      style={{ left: contextMenu.x, top: contextMenu.y }}
      onClick={(e) => e.stopPropagation()}
    >
      {items.map((item) => (
        <button key={item.label} type="button" className="flux-context-menu__item" onClick={item.action}>
          {item.label}
        </button>
      ))}
    </div>,
    document.body
  );
}
