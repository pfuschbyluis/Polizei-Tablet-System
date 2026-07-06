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
import { useState } from 'react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', perm: 'viewDashboard' as const },
  { to: '/personen', icon: Users, label: 'Personenakte', perm: 'viewPersons' as const },
  { to: '/akten', icon: FolderOpen, label: 'Akten', perm: 'viewCases' as const },
  { to: '/waffen', icon: Crosshair, label: 'Waffen', perm: 'viewWeapons' as const },
  { to: '/fahrzeuge', icon: Car, label: 'Fahrzeuge', perm: 'viewVehicles' as const },
  { to: '/fahndung', icon: Search, label: 'Fahndung', perm: 'viewWanted' as const },
  { to: '/einsaetze', icon: Radio, label: 'Einsätze', perm: 'viewOperations' as const },
  { to: '/protokoll', icon: ScrollText, label: 'Protokoll', perm: 'viewAuditLog' as const },
];

export default function Sidebar() {
  const { permissions } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const visibleItems = navItems.filter((item) => permissions[item.perm]);

  return (
    <aside
      className={`flex flex-col border-r border-police-700/50 bg-police-950/80 backdrop-blur-md transition-all duration-300 ${
        collapsed ? 'w-[72px]' : 'w-64'
      }`}
    >
      <div className="flex items-center gap-3 border-b border-police-700/50 px-4 py-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-police-accent/20">
          <Shield className="h-5 w-5 text-police-accent" />
        </div>
        {!collapsed && (
          <div>
            <h1 className="text-sm font-bold tracking-wide text-police-50">POLIS</h1>
            <p className="text-[10px] uppercase tracking-widest text-police-500">Viktorstadt PD</p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? 'bg-police-accent/15 text-police-accent border border-police-accent/20'
                  : 'text-police-400 hover:bg-police-800/60 hover:text-police-200'
              }`
            }
          >
            <item.icon className="h-[18px] w-[18px] shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center border-t border-police-700/50 p-3 text-police-500 hover:text-police-300 transition-colors"
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>
    </aside>
  );
}
