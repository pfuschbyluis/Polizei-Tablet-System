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
  ChevronLeft,
  ChevronRight,
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
  { to: '/protokoll', icon: ScrollText, label: 'Protokoll', perm: 'viewAuditLog' as const },
];

export default function Sidebar() {
  const { permissions } = useAuth();
  const { isInGame } = useFiveM();
  const [collapsed, setCollapsed] = useState(isInGame);

  const visibleItems = navItems.filter((item) => permissions[item.perm]);

  return (
    <aside
      className={`flex shrink-0 flex-col border-r border-police-700/50 bg-police-950/90 transition-all duration-300 ${
        collapsed ? 'w-[60px]' : isInGame ? 'w-52' : 'w-60'
      }`}
    >
      <div
        className={`flex items-center border-b border-police-700/50 ${
          collapsed ? 'justify-center px-2 py-4' : 'gap-3 px-4 py-4'
        }`}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-police-accent/20">
          <Shield className="h-4 w-4 text-police-accent" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <h1 className="truncate text-sm font-bold tracking-wide text-police-50">POLIS</h1>
            <p className="truncate text-[10px] uppercase tracking-widest text-police-500">Polizei-Tablet</p>
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
              `flex items-center rounded-lg transition-all ${
                collapsed ? 'justify-center px-2 py-2.5' : 'gap-2.5 px-3 py-2'
              } text-sm font-medium ${
                isActive
                  ? 'bg-police-accent/15 text-police-accent border border-police-accent/20'
                  : 'text-police-400 hover:bg-police-800/60 hover:text-police-200 border border-transparent'
              }`
            }
          >
            <item.icon className="h-[17px] w-[17px] shrink-0" />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex shrink-0 items-center justify-center border-t border-police-700/50 p-2.5 text-police-500 hover:text-police-300 transition-colors"
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>
    </aside>
  );
}
