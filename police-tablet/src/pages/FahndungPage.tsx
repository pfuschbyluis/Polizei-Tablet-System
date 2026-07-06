import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, User, Car, Crosshair, MapPin, AlertTriangle } from 'lucide-react';
import { useData } from '../context/DataContext';
import { Card, SearchBar, StatusBadge, Tabs, Badge, EmptyState } from '../components/ui';
import type { WantedType } from '../types';

const typeIcons = { person: User, fahrzeug: Car, waffe: Crosshair };
const typeLabels = { person: 'Personenfahndung', fahrzeug: 'Fahrzeugfahndung', waffe: 'Waffenfahndung' };

export default function FahndungPage() {
  const { wanted } = useData();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<WantedType | 'all'>('all');

  const active = wanted.filter((w) => w.active);
  const filtered = active.filter((w) => {
    const q = search.toLowerCase();
    const matchSearch = w.targetName.toLowerCase().includes(q) || w.description.toLowerCase().includes(q);
    const matchType = typeFilter === 'all' || w.type === typeFilter;
    return matchSearch && matchType;
  });

  const tabs = [
    { id: 'all', label: `Alle (${active.length})` },
    { id: 'person', label: `Personen (${active.filter((w) => w.type === 'person').length})` },
    { id: 'fahrzeug', label: `Fahrzeuge (${active.filter((w) => w.type === 'fahrzeug').length})` },
    { id: 'waffe', label: `Waffen (${active.filter((w) => w.type === 'waffe').length})` },
  ];

  const getDetailLink = (w: typeof wanted[0]) => {
    if (w.type === 'person') return `/personen/${w.targetId}`;
    if (w.type === 'fahrzeug') return `/fahrzeuge/${w.targetId}`;
    return `/waffen/${w.targetId}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-police-50">Fahndungssystem</h1>
        <p className="mt-1 text-sm text-police-400">{active.length} aktive Fahndungen</p>
      </div>

      <Tabs
        tabs={tabs}
        activeTab={typeFilter}
        onChange={(id) => setTypeFilter(id as WantedType | 'all')}
      />

      <SearchBar value={search} onChange={setSearch} placeholder="Name, Kennzeichen oder Beschreibung..." />

      {filtered.length === 0 ? (
        <Card><EmptyState icon={Search} title="Keine Fahndungen gefunden" /></Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((w) => {
            const Icon = typeIcons[w.type];
            const isCritical = w.priority === 'kritisch' || w.priority === 'hoch';
            return (
              <Link
                key={w.id}
                to={getDetailLink(w)}
                className={`block rounded-xl border p-5 transition-all hover:border-police-accent/30 ${
                  isCritical ? 'border-red-500/30 bg-red-500/5' : 'border-police-700/40 bg-police-900/40'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`rounded-lg p-3 ${isCritical ? 'bg-red-500/10' : 'bg-police-800/50'}`}>
                    <Icon className={`h-5 w-5 ${isCritical ? 'text-red-400' : 'text-police-accent'}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="blue">{typeLabels[w.type]}</Badge>
                      <StatusBadge status={w.priority} />
                      {isCritical && (
                        <span className="flex items-center gap-1 text-xs text-red-400">
                          <AlertTriangle className="h-3 w-3" /> Vorsicht
                        </span>
                      )}
                    </div>
                    <h3 className="mt-2 text-lg font-semibold text-police-50">{w.targetName}</h3>
                    <p className="mt-1 text-sm text-police-300">{w.description}</p>
                    <div className="mt-3 flex flex-wrap gap-4 text-xs text-police-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {w.lastKnownLocation}
                      </span>
                      <span>Einheit: {w.responsibleUnit}</span>
                      <span>Ausgestellt: {new Date(w.issuedAt).toLocaleDateString('de-DE')}</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
