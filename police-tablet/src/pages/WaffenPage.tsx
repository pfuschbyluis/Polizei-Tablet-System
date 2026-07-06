import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Icon from '../components/icons/Icon';
import { useData } from '../context/DataContext';
import { Card, SearchBar, StatusBadge, EmptyState, Badge } from '../components/ui';

export default function WaffenPage() {
  const { id } = useParams();
  const { weapons, getWeapon, getPerson } = useData();
  const [search, setSearch] = useState('');

  if (id) {
    const weapon = getWeapon(id);
    if (!weapon) return <p className="text-text-secondary py-20 text-center">Waffe nicht gefunden</p>;
    const owner = weapon.ownerId ? getPerson(weapon.ownerId) : null;

    return (
      <div className="space-y-6">
        <Link to="/waffen" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-accent">
          <Icon name="arrow-left" size={16} /> Zurück
        </Link>
        <div className="flex items-center gap-4">
          <Icon name="crosshair" size={32} className="text-accent-light" />
          <div>
            <h1 className="page-title font-mono">{weapon.serialNumber}</h1>
            <p className="text-sm text-text-secondary">{weapon.type} · {weapon.caliber}</p>
          </div>
          {weapon.isWanted && (
            <div className="flex items-center gap-2 text-danger ml-auto">
              <Icon name="alert" size={20} />
              <span className="font-medium">Gesuchte Waffe</span>
            </div>
          )}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="Registrierungsdaten">
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-text-muted">Seriennummer</dt><dd className="font-mono text-text-primary">{weapon.serialNumber}</dd></div>
              <div className="flex justify-between"><dt className="text-text-muted">Waffenart</dt><dd className="text-text-primary">{weapon.type}</dd></div>
              <div className="flex justify-between"><dt className="text-text-muted">Kaliber</dt><dd className="text-text-primary">{weapon.caliber}</dd></div>
              <div className="flex justify-between"><dt className="text-text-muted">Registriert am</dt><dd className="text-text-primary">{weapon.registeredAt}</dd></div>
              <div className="flex justify-between items-center"><dt className="text-text-muted">Lizenzstatus</dt><dd><StatusBadge status={weapon.licenseStatus} /></dd></div>
              {weapon.licenseExpiry && (
                <div className="flex justify-between"><dt className="text-text-muted">Lizenz gültig bis</dt><dd className="text-text-primary">{weapon.licenseExpiry}</dd></div>
              )}
            </dl>
          </Card>
          <Card title="Registrierter Besitzer">
            {owner ? (
              <Link to={`/personen/${owner.id}`} className="block rounded-lg bg-surface-tertiary/40 p-4 hover:bg-surface-hover/60">
                <p className="font-medium text-text-primary">{owner.firstName} {owner.lastName}</p>
                <p className="text-xs text-text-secondary">{owner.address}, {owner.city}</p>
              </Link>
            ) : (
              <p className="text-sm text-text-muted">Kein registrierter Besitzer</p>
            )}
            {weapon.notes && <p className="mt-4 text-sm text-text-secondary">{weapon.notes}</p>}
          </Card>
        </div>
      </div>
    );
  }

  const filtered = weapons.filter((w) => {
    const q = search.toLowerCase();
    return w.serialNumber.toLowerCase().includes(q) || w.type.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Waffenregistrierung</h1>
        <p className="page-subtitle">{weapons.length} Waffen registriert</p>
      </div>
      <SearchBar value={search} onChange={setSearch} placeholder="Seriennummer oder Waffenart..." />
      <div className="grid gap-3 md:grid-cols-2">
        {filtered.map((w) => {
          const owner = w.ownerId ? getPerson(w.ownerId) : null;
          return (
            <Link
              key={w.id}
              to={`/waffen/${w.id}`}
              className={`rounded-xl border p-5 transition-all hover:border-accent/30 ${
                w.isWanted ? 'border-danger/30 bg-danger/5' : 'border-border bg-surface-card/60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-sm text-accent-light">{w.serialNumber}</span>
                  <p className="mt-1 font-medium text-text-primary">{w.type}</p>
                  <p className="text-xs text-text-secondary">{w.caliber}</p>
                </div>
                <StatusBadge status={w.licenseStatus} />
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-text-secondary">
                  {owner ? `${owner.firstName} ${owner.lastName}` : 'Kein Besitzer'}
                </span>
                {w.isWanted && <Badge variant="red">Gesucht</Badge>}
              </div>
            </Link>
          );
        })}
      </div>
      {filtered.length === 0 && (
        <Card><EmptyState icon="crosshair" title="Keine Waffen gefunden" /></Card>
      )}
    </div>
  );
}
