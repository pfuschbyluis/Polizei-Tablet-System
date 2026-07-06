import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  Crosshair,
  Car,
  Search,
  Radio,
  Shield,
  ScrollText,
  UserCog,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFiveM } from '../../context/FiveMContext';
import { useState } from 'react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', perm: 'viewDashboard' as const },
  { to: '/personen', icon: Users, label: 'Personen', perm: 'viewPersons' as const },
  { to: '/akten', icon: FolderOpen, label: 'Akten', perm: 'viewCases' as const },
  { to: '/waffen', icon: Crosshair, label: 'Waffen', perm: 'viewWeapons' as const },
  { to: '/fahrzeuge', icon: Car, label: 'Fahrzeuge', perm: 'viewVehicles' as const },
  { to: '/fahndung', icon: Search, label: 'Fahndung', perm: 'viewWanted' as const },
  { to: '/einsaetze', icon: Radio, label: 'Einsätze', perm: 'viewOperations' as const },
  { to: '/mitarbeiter', icon: UserCog, label: 'Mitarbeiter', perm: 'viewEmployees' as const },
  { to: '/protokoll', icon: ScrollText, label: 'Protokoll', perm: 'viewAuditLog' as const },
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
      <div
        className={`flex items-center border-b border-border ${
          collapsed ? 'justify-center px-2 py-3.5' : 'gap-2.5 px-4 py-4'
        }`}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/15">
          <Shield className="h-4 w-4 text-accent-light" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold text-text-primary">POLIS</h1>
            <p className="truncate text-[10px] text-text-muted">Polizei-System</p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
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
            <item.icon className="h-[17px] w-[17px] shrink-0" />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border p-2 space-y-0.5">
        <button
          onClick={logout}
          title="Abmelden"
          className={`flex w-full items-center rounded-lg text-sm text-text-secondary hover:bg-danger/10 hover:text-danger transition-all ${
            collapsed ? 'justify-center px-2 py-2' : 'gap-2.5 px-3 py-2'
          }`}
        >
          <LogOut className="h-[17px] w-[17px] shrink-0" />
          {!collapsed && <span>Abmelden</span>}
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-center rounded-lg py-2 text-text-muted hover:bg-surface-hover hover:text-text-secondary transition-colors"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  );
}
