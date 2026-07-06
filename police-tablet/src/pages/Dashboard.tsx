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
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { INTERNAL_MESSAGES } from '../data/mockData';
import { Card, StatCard, StatusBadge, Badge } from '../components/ui';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { operations, cases, wanted, vehicles } = useData();
  const { permissions } = useAuth();

  const activeOps = operations.filter((o) => o.status === 'aktiv');
  const openCases = cases.filter((c) => c.status !== 'abgeschlossen');
  const activeWanted = wanted.filter((w) => w.active);
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-police-50">Einsatzzentrale</h1>
        <p className="mt-1 text-sm text-police-400">
          Übersicht aller laufenden Vorgänge · Polizeidirektion Viktorstadt
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard title="Aktive Einsätze" value={activeOps.length} icon={Radio} color="red" trend={`${operations.length} gesamt`} />
        <StatCard title="Offene Akten" value={openCases.length} icon={FolderOpen} color="blue" trend={`${cases.length} gesamt`} />
        <StatCard title="Fahndungen" value={activeWanted.length} icon={Search} color="yellow" />
        <StatCard title="Fahrzeugmeldungen" value={wantedVehicles.length} icon={Car} color="purple" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Aktuelle Einsätze" className="lg:col-span-2">
          <div className="space-y-3">
            {activeOps.length === 0 ? (
              <p className="text-sm text-police-500 py-4 text-center">Keine aktiven Einsätze</p>
            ) : (
              activeOps.map((op) => (
                <Link
                  key={op.id}
                  to={`/einsaetze/${op.id}`}
                  className="flex items-center justify-between rounded-lg border border-police-700/30 bg-police-800/30 p-4 hover:border-police-accent/30 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-police-accent">{op.code}</span>
                      <StatusBadge status={op.status} />
                      <StatusBadge status={op.priority} />
                    </div>
                    <p className="mt-1 text-sm font-medium text-police-100">{op.title}</p>
                    <p className="text-xs text-police-400">{op.location}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-police-500" />
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
                className="flex flex-col items-center gap-2 rounded-lg border border-police-700/30 bg-police-800/30 p-4 hover:border-police-accent/30 hover:bg-police-accent/5 transition-all text-center"
              >
                <link.icon className="h-5 w-5 text-police-accent" />
                <span className="text-xs font-medium text-police-300">{link.label}</span>
              </Link>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Gesuchte Personen">
          <div className="space-y-2">
            {activeWanted
              .filter((w) => w.type === 'person')
              .slice(0, 4)
              .map((w) => (
                <div
                  key={w.id}
                  className="flex items-center justify-between rounded-lg bg-police-800/30 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                    <div>
                      <p className="text-sm font-medium text-police-100">{w.targetName}</p>
                      <p className="text-xs text-police-400">{w.lastKnownLocation}</p>
                    </div>
                  </div>
                  <StatusBadge status={w.priority} />
                </div>
              ))}
          </div>
        </Card>

        <Card title="Offene Akten">
          <div className="space-y-2">
            {openCases.slice(0, 4).map((c) => (
              <Link
                key={c.id}
                to={`/akten/${c.id}`}
                className="flex items-center justify-between rounded-lg bg-police-800/30 px-4 py-3 hover:bg-police-800/50 transition-colors"
              >
                <div>
                  <span className="font-mono text-xs text-police-accent">{c.caseNumber}</span>
                  <p className="text-sm text-police-100">{c.title}</p>
                </div>
                <StatusBadge status={c.status} />
              </Link>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Interne Polizeimeldungen" subtitle="Mitteilungen der Leitstelle">
        <div className="space-y-3">
          {INTERNAL_MESSAGES.map((msg) => (
            <div
              key={msg.id}
              className="flex gap-4 rounded-lg border border-police-700/30 bg-police-800/20 p-4"
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
              <div className="flex-1">
                <div className="flex items-center gap-2">
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
      </Card>
    </div>
  );
}
