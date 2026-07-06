import { NavLink } from 'react-router-dom';
import type { IconName } from '../icons/Icon';
import Icon from '../icons/Icon';
import { useAuth } from '../../context/AuthContext';
import { useFiveM } from '../../context/FiveMContext';
import { useState } from 'react';

const navItems: { to: string; icon: IconName; label: string; perm: 'viewDashboard' | 'viewPersons' | 'viewCases' | 'viewWeapons' | 'viewVehicles' | 'viewWanted' | 'viewEmployees' | 'viewAuditLog' }[] = [
  { to: '/', icon: 'dashboard', label: 'Dashboard', perm: 'viewDashboard' },
  { to: '/personen', icon: 'users', label: 'Personen', perm: 'viewPersons' },
  { to: '/akten', icon: 'folder', label: 'Akten', perm: 'viewCases' },
  { to: '/waffen', icon: 'crosshair', label: 'Waffen', perm: 'viewWeapons' },
  { to: '/fahrzeuge', icon: 'car', label: 'Fahrzeuge', perm: 'viewVehicles' },
  { to: '/fahndung', icon: 'wanted', label: 'Fahndung', perm: 'viewWanted' },
  { to: '/mitarbeiter', icon: 'user-cog', label: 'Mitarbeiter', perm: 'viewEmployees' },
  { to: '/protokoll', icon: 'scroll', label: 'Protokoll', perm: 'viewAuditLog' },
];

export default function Sidebar() {
  const { permissions, logout } = useAuth();
  const { isInGame } = useFiveM();
  const [collapsed, setCollapsed] = useState(isInGame);

  const visibleItems = navItems.filter((item) => permissions[item.perm]);

  return (
    <aside
      className={`flex shrink-0 flex-col border-r border-border bg-surface/95 transition-all duration-200 ${
        collapsed ? 'w-[52px]' : isInGame ? 'w-48' : 'w-56'
      }`}
    >
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-2 pt-3">
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              `flex items-center rounded-lg transition-all duration-150 ${
                collapsed ? 'justify-center px-2 py-2' : 'gap-2.5 px-3 py-2'
              } text-sm ${
                isActive
                  ? 'bg-accent-subtle text-accent-light font-medium'
                  : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary font-normal'
              }`
            }
          >
            <Icon name={item.icon} size={17} className="shrink-0" />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="shrink-0 border-t border-border p-2 space-y-0.5">
        <button
          type="button"
          onClick={logout}
          title="Abmelden"
          className={`flux-sidebar-logout flex w-full items-center rounded-lg text-sm text-text-secondary transition-all ${
            collapsed ? 'justify-center px-2 py-2' : 'gap-2.5 px-3 py-2'
          }`}
        >
          <Icon name="logout" size={17} className="shrink-0 pointer-events-none" />
          {!collapsed && <span>Abmelden</span>}
        </button>
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-center rounded-lg py-2 text-text-muted hover:bg-surface-hover hover:text-text-secondary transition-colors"
        >
          <Icon name={collapsed ? 'chevron-right' : 'chevron-left'} size={16} />
        </button>
      </div>
    </aside>
  );
}
