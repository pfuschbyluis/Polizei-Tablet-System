import { Link } from 'react-router-dom';
import {
  Radio,
  FolderOpen,
  Search,
  Car,
  Megaphone,
  Users,
  Crosshair,
  ArrowRight,
  AlertTriangle,
  Inbox,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { Card, StatCard, StatusBadge, Badge } from '../components/ui';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { operations, cases, wanted, vehicles, internalMessages } = useData();
  const { permissions } = useAuth();

  const activeOps = operations.filter((o) => o.status === 'aktiv');
  const openCases = cases.filter((c) => c.status !== 'abgeschlossen');
  const activeWanted = wanted.filter((w) => w.active);
  const wantedPersons = activeWanted.filter((w) => w.type === 'person');
  const wantedVehicles = vehicles.filter((v) => v.isWanted);

  const quickLinks = [
    { to: '/personen', icon: Users, label: 'Personensuche', show: permissions.viewPersons },
    { to: '/akten/neu', icon: FolderOpen, label: 'Neue Akte', show: permissions.createCases },
    { to: '/fahndung', icon: Search, label: 'Fahndung', show: permissions.viewWanted },
    { to: '/einsaetze', icon: Radio, label: 'Einsatz erstellen', show: permissions.createOperations },
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
        <h1 className="text-xl font-bold text-police-50 sm:text-2xl">Einsatzzentrale</h1>
        <p className="mt-1 text-sm text-police-400">Übersicht aller laufenden Vorgänge</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <StatCard title="Aktive Einsätze" value={activeOps.length} icon={Radio} color="red" />
        <StatCard title="Offene Akten" value={openCases.length} icon={FolderOpen} color="blue" />
        <StatCard title="Fahndungen" value={activeWanted.length} icon={Search} color="yellow" />
        <StatCard title="Fahrzeugmeldungen" value={wantedVehicles.length} icon={Car} color="purple" />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card title="Aktuelle Einsätze" className="lg:col-span-2">
          <div className="space-y-2">
            {activeOps.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <Inbox className="h-8 w-8 text-police-600" />
                <p className="mt-3 text-sm text-police-500">Keine aktiven Einsätze</p>
              </div>
            ) : (
              activeOps.map((op) => (
                <Link
                  key={op.id}
                  to={`/einsaetze/${op.id}`}
                  className="flex items-center justify-between rounded-lg border border-police-700/30 bg-police-800/30 p-3 hover:border-police-accent/30 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs text-police-accent">{op.code}</span>
                      <StatusBadge status={op.status} />
                      <StatusBadge status={op.priority} />
                    </div>
                    <p className="mt-1 truncate text-sm font-medium text-police-100">{op.title}</p>
                    <p className="truncate text-xs text-police-400">{op.location}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-police-500" />
                </Link>
              ))
            )}
          </div>
        </Card>

        <Card title="Schnellzugriff">
          <div className="grid grid-cols-2 gap-2">
            {quickLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="flex flex-col items-center gap-2 rounded-lg border border-police-700/30 bg-police-800/30 p-3 hover:border-police-accent/30 hover:bg-police-accent/5 transition-all text-center"
              >
                <link.icon className="h-5 w-5 text-police-accent" />
                <span className="text-xs font-medium text-police-300">{link.label}</span>
              </Link>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Gesuchte Personen">
          {wantedPersons.length === 0 ? (
            <p className="py-6 text-center text-sm text-police-500">Keine aktiven Personenfahndungen</p>
          ) : (
            <div className="space-y-2">
              {wantedPersons.slice(0, 4).map((w) => (
                <div
                  key={w.id}
                  className="flex items-center justify-between rounded-lg bg-police-800/30 px-3 py-2.5"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-police-100">{w.targetName}</p>
                      <p className="truncate text-xs text-police-400">{w.lastKnownLocation}</p>
                    </div>
                  </div>
                  <StatusBadge status={w.priority} />
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="Offene Akten">
          {openCases.length === 0 ? (
            <p className="py-6 text-center text-sm text-police-500">Keine offenen Akten</p>
          ) : (
            <div className="space-y-2">
              {openCases.slice(0, 4).map((c) => (
                <Link
                  key={c.id}
                  to={`/akten/${c.id}`}
                  className="flex items-center justify-between rounded-lg bg-police-800/30 px-3 py-2.5 hover:bg-police-800/50 transition-colors"
                >
                  <div className="min-w-0">
                    <span className="font-mono text-xs text-police-accent">{c.caseNumber}</span>
                    <p className="truncate text-sm text-police-100">{c.title}</p>
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
          <p className="py-6 text-center text-sm text-police-500">Keine Meldungen vorhanden</p>
        ) : (
          <div className="space-y-3">
            {internalMessages.map((msg) => (
              <div
                key={msg.id}
                className="flex gap-3 rounded-lg border border-police-700/30 bg-police-800/20 p-3"
              >
                <Megaphone
                  className={`h-5 w-5 shrink-0 ${
                    msg.priority === 'dringend'
                      ? 'text-red-400'
                      : msg.priority === 'warnung'
                        ? 'text-amber-400'
                        : 'text-blue-400'
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-police-100">{msg.title}</p>
                    <Badge variant={priorityColors[msg.priority]}>{msg.priority}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-police-400">{msg.content}</p>
                  <p className="mt-2 text-[10px] text-police-500">
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
