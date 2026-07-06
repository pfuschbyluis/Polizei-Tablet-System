import { Link } from 'react-router-dom';
import {
  FolderOpen,
  Search,
  Car,
  Megaphone,
  Users,
  Crosshair,
  AlertTriangle,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { Card, StatCard, StatusBadge, Badge } from '../components/ui';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { cases, wanted, vehicles, internalMessages } = useData();
  const { permissions } = useAuth();

  const openCases = cases.filter((c) => c.status !== 'abgeschlossen');
  const activeWanted = wanted.filter((w) => w.active);
  const wantedPersons = activeWanted.filter((w) => w.type === 'person');
  const wantedVehicles = vehicles.filter((v) => v.isWanted);

  const quickLinks = [
    { to: '/personen', icon: Users, label: 'Personensuche', show: permissions.viewPersons },
    { to: '/akten/neu', icon: FolderOpen, label: 'Neue Akte', show: permissions.createCases },
    { to: '/fahndung', icon: Search, label: 'Fahndung', show: permissions.viewWanted },
    { to: '/waffen', icon: Crosshair, label: 'Waffenregister', show: permissions.viewWeapons },
    { to: '/fahrzeuge', icon: Car, label: 'Fahrzeugregister', show: permissions.viewVehicles },
  ].filter((l) => l.show);

  const priorityColors = {
    info: 'blue' as const,
    warnung: 'yellow' as const,
    dringend: 'red' as const,
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Übersicht aller laufenden Vorgänge</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:gap-4">
        <StatCard title="Offene Akten" value={openCases.length} icon={FolderOpen} color="blue" />
        <StatCard title="Fahndungen" value={activeWanted.length} icon={Search} color="yellow" />
        <StatCard title="Fahrzeugmeldungen" value={wantedVehicles.length} icon={Car} color="purple" />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card title="Schnellzugriff" className="lg:col-span-1">
          <div className="grid grid-cols-2 gap-2">
            {quickLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="flex flex-col items-center gap-2 rounded-lg border border-border bg-surface-tertiary/40 p-3 hover:border-accent/30 hover:bg-accent-subtle transition-all text-center"
              >
                <link.icon className="h-5 w-5 text-accent-light" />
                <span className="text-xs font-medium text-text-secondary">{link.label}</span>
              </Link>
            ))}
          </div>
        </Card>

        <Card title="Gesuchte Personen" className="lg:col-span-1">
          {wantedPersons.length === 0 ? (
            <p className="py-6 text-center text-sm text-text-muted">Keine aktiven Personenfahndungen</p>
          ) : (
            <div className="space-y-2">
              {wantedPersons.slice(0, 4).map((w) => (
                <div
                  key={w.id}
                  className="flex items-center justify-between rounded-lg bg-surface-tertiary/40 px-3 py-2.5"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-danger" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-text-primary">{w.targetName}</p>
                      <p className="truncate text-xs text-text-secondary">{w.lastKnownLocation}</p>
                    </div>
                  </div>
                  <StatusBadge status={w.priority} />
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="Offene Akten" className="lg:col-span-1">
          {openCases.length === 0 ? (
            <p className="py-6 text-center text-sm text-text-muted">Keine offenen Akten</p>
          ) : (
            <div className="space-y-2">
              {openCases.slice(0, 4).map((c) => (
                <Link
                  key={c.id}
                  to={`/akten/${c.id}`}
                  className="flex items-center justify-between rounded-lg bg-surface-tertiary/40 px-3 py-2.5 hover:bg-surface-hover transition-colors"
                >
                  <div className="min-w-0">
                    <span className="font-mono text-xs text-accent-light">{c.caseNumber}</span>
                    <p className="truncate text-sm text-text-primary">{c.title}</p>
                  </div>
                  <StatusBadge status={c.status} />
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card title="Interne Polizeimeldungen" subtitle="Mitteilungen der Leitstelle">
        {internalMessages.length === 0 ? (
          <p className="py-6 text-center text-sm text-text-muted">Keine Meldungen vorhanden</p>
        ) : (
          <div className="space-y-3">
            {internalMessages.map((msg) => (
              <div
                key={msg.id}
                className="flex gap-3 rounded-lg border border-border bg-surface-tertiary/30 p-3"
              >
                <Megaphone
                  className={`h-5 w-5 shrink-0 ${
                    msg.priority === 'dringend'
                      ? 'text-danger'
                      : msg.priority === 'warnung'
                        ? 'text-warning'
                        : 'text-accent-light'
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-text-primary">{msg.title}</p>
                    <Badge variant={priorityColors[msg.priority]}>{msg.priority}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-text-secondary">{msg.content}</p>
                  <p className="mt-2 text-[10px] text-text-muted">
                    {msg.author} · {msg.date}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
