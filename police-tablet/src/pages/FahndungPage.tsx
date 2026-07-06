import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { IconName } from '../components/icons/Icon';
import Icon from '../components/icons/Icon';
import { useData } from '../context/DataContext';
import { Card, SearchBar, StatusBadge, Tabs, Badge, EmptyState } from '../components/ui';
import type { WantedType } from '../types';

const typeIcons: Record<WantedType, IconName> = { person: 'user', fahrzeug: 'car', waffe: 'crosshair' };
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
        <h1 className="page-title">Fahndungssystem</h1>
        <p className="page-subtitle">{active.length} aktive Fahndungen</p>
      </div>

      <Tabs
        tabs={tabs}
        activeTab={typeFilter}
        onChange={(id) => setTypeFilter(id as WantedType | 'all')}
      />

      <SearchBar value={search} onChange={setSearch} placeholder="Name, Kennzeichen oder Beschreibung..." />

      {filtered.length === 0 ? (
        <Card><EmptyState icon="search" title="Keine Fahndungen gefunden" /></Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((w) => {
            const iconName = typeIcons[w.type];
            const isCritical = w.priority === 'kritisch' || w.priority === 'hoch';
            return (
              <Link
                key={w.id}
                to={getDetailLink(w)}
                className={`block rounded-xl border p-5 transition-all hover:border-accent/30 ${
                  isCritical ? 'border-danger/30 bg-danger/5' : 'border-border bg-surface-card/60'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`rounded-lg p-3 ${isCritical ? 'bg-danger/10' : 'bg-surface-tertiary/60'}`}>
                    <Icon
                      name={iconName}
                      size={20}
                      className={isCritical ? 'text-danger' : 'text-accent-light'}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="blue">{typeLabels[w.type]}</Badge>
                      <StatusBadge status={w.priority} />
                      {isCritical && (
                        <span className="flex items-center gap-1 text-xs text-danger">
                          <Icon name="alert" size={12} /> Vorsicht
                        </span>
                      )}
                    </div>
                    <h3 className="mt-2 text-lg font-semibold text-text-primary">{w.targetName}</h3>
                    <p className="mt-1 text-sm text-text-secondary">{w.description}</p>
                    <div className="mt-3 flex flex-wrap gap-4 text-xs text-text-secondary">
                      <span className="flex items-center gap-1">
                        <Icon name="map-pin" size={12} /> {w.lastKnownLocation}
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
