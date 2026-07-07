import { useNavigate } from 'react-router-dom';
import Icon from '../icons/Icon';
import PoliceIcon from '../icons/PoliceIcon';
import { useShell } from '../../context/ShellContext';
import type { DesktopShortcut } from '../../types/shell';

interface DesktopIconProps {
  shortcut: DesktopShortcut;
}

export default function DesktopIcon({ shortcut }: DesktopIconProps) {
  const navigate = useNavigate();
  const { closeAllOverlays } = useShell();

  return (
    <button
      type="button"
      className="flux-desktop-icon group"
      onClick={() => {
        closeAllOverlays();
        navigate(shortcut.route);
      }}
      title={shortcut.label}
    >
      <span className="flux-desktop-icon__glyph">
        {shortcut.id === 'polis' ? (
          <PoliceIcon size={36} prominent />
        ) : (
          <Icon name={shortcut.icon} size={32} className="text-accent-light" />
        )}
      </span>
      <span className="flux-desktop-icon__label">{shortcut.label}</span>
    </button>
  );
}
