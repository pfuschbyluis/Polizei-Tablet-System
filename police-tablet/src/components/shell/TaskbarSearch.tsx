import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../icons/Icon';
import PoliceIcon from '../icons/PoliceIcon';
import { useShell } from '../../context/ShellContext';
import { DEFAULT_SHORTCUTS } from '../../types/shell';

export default function TaskbarSearch() {
  const { searchOpen, setSearchOpen, closeAllOverlays } = useShell();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return DEFAULT_SHORTCUTS.slice(0, 5);
    return DEFAULT_SHORTCUTS.filter((a) => a.label.toLowerCase().includes(q));
  }, [query]);

  if (!searchOpen) return null;

  return (
    <div className="flux-search-panel" onClick={(e) => e.stopPropagation()}>
      <div className="flux-search-panel__input">
        <Icon name="search" size={18} className="text-text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Programme, Akten und Personen suchen..."
          autoFocus
        />
        <button type="button" className="flux-shell-icon-btn" onClick={() => setSearchOpen(false)}>
          <Icon name="close" size={14} />
        </button>
      </div>
      <div className="flux-search-panel__results">
        {results.map((item) => (
          <button
            key={item.id}
            type="button"
            className="flux-search-panel__result"
            onClick={() => {
              closeAllOverlays();
              navigate(item.route);
            }}
          >
            {item.id === 'polis' ? <PoliceIcon size={20} /> : <Icon name={item.icon} size={18} />}
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
