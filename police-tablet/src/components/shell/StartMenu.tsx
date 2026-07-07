import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../icons/Icon';
import PoliceIcon from '../icons/PoliceIcon';
import { useAuth } from '../../context/AuthContext';
import { useShell } from '../../context/ShellContext';
import { DEFAULT_SHORTCUTS } from '../../shell/constants';

export default function StartMenu() {
  const navigate = useNavigate();
  const { startOpen, setStartOpen, closeAllOverlays } = useShell();
  const { currentOfficer, logout, isAuthenticated } = useAuth();
  const [query, setQuery] = useState('');

  const apps = useMemo(() => {
    const q = query.toLowerCase().trim();
    return DEFAULT_SHORTCUTS.filter((a) => !q || a.label.toLowerCase().includes(q));
  }, [query]);

  if (!startOpen) return null;

  const openApp = (route: string) => {
    closeAllOverlays();
    setStartOpen(false);
    navigate(route);
  };

  return (
    <div className="flux-start-menu" onClick={(e) => e.stopPropagation()}>
      <div className="flux-start-menu__search">
        <Icon name="search" size={16} className="text-text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Apps und Akten suchen..."
          autoFocus
        />
      </div>
      <div className="flux-start-menu__section">
        <p className="flux-start-menu__heading">Angeheftet</p>
        <div className="flux-start-menu__grid">
          {apps.map((app) => (
            <button key={app.id} type="button" className="flux-start-menu__app" onClick={() => openApp(app.route)}>
              <span className="flux-start-menu__app-icon">
                {app.id === 'polis' ? <PoliceIcon size={28} /> : <Icon name={app.icon} size={24} className="text-accent-light" />}
              </span>
              <span>{app.label}</span>
            </button>
          ))}
        </div>
      </div>
      {isAuthenticated && currentOfficer && (
        <div className="flux-start-menu__footer">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-text-primary">{currentOfficer.name}</p>
            <p className="text-xs text-text-muted">{currentOfficer.badgeNumber}</p>
          </div>
          <button
            type="button"
            className="flux-shell-icon-btn"
            title="Abmelden"
            onClick={() => {
              closeAllOverlays();
              logout();
            }}
          >
            <Icon name="logout" size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
