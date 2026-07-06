import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Icon from '../components/icons/Icon';
import { useData } from '../context/DataContext';
import { Card, SearchBar, StatusBadge, EmptyState, Badge } from '../components/ui';

export default function FahrzeugePage() {
  const { id } = useParams();
  const { vehicles, getVehicle, getPerson, getCase } = useData();
  const [search, setSearch] = useState('');

  if (id) {
    const vehicle = getVehicle(id);
    if (!vehicle) return <p className="text-text-secondary py-20 text-center">Fahrzeug nicht gefunden</p>;
    const owner = getPerson(vehicle.ownerId);
    const linkedCases = vehicle.linkedCaseIds.map((cid) => getCase(cid)).filter(Boolean);

    return (
      <div className="space-y-6">
        <Link to="/fahrzeuge" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-accent">
          <Icon name="arrow-left" size={16} /> Zurück
        </Link>
        <div className="flex items-center gap-4">
          <Icon name="car" size={32} className="text-accent-light" />
          <div>
            <h1 className="page-title font-mono">{vehicle.plate}</h1>
            <p className="text-sm text-text-secondary">{vehicle.brand} {vehicle.model} · {vehicle.color}</p>
          </div>
          {vehicle.isWanted && (
            <div className="flex items-center gap-2 text-danger ml-auto">
              <Icon name="alert" size={20} />
              <span className="font-medium">Fahndung aktiv</span>
            </div>
          )}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="Fahrzeugdaten">
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-text-muted">Kennzeichen</dt><dd className="font-mono text-text-primary">{vehicle.plate}</dd></div>
              <div className="flex justify-between"><dt className="text-text-muted">Marke / Modell</dt><dd className="text-text-primary">{vehicle.brand} {vehicle.model}</dd></div>
              <div className="flex justify-between"><dt className="text-text-muted">Farbe</dt><dd className="text-text-primary">{vehicle.color}</dd></div>
              <div className="flex justify-between items-center"><dt className="text-text-muted">Versicherung</dt><dd><StatusBadge status={vehicle.insuranceStatus} /></dd></div>
              <div className="flex justify-between items-center"><dt className="text-text-muted">Zulassung</dt><dd><StatusBadge status={vehicle.registrationStatus} /></dd></div>
              <div className="flex justify-between"><dt className="text-text-muted">Registriert am</dt><dd className="text-text-primary">{vehicle.registeredAt}</dd></div>
            </dl>
          </Card>
          <Card title="Fahrzeughalter">
            {owner && (
              <Link to={`/personen/${owner.id}`} className="block rounded-lg bg-surface-tertiary/40 p-4 hover:bg-surface-hover/60">
                <p className="font-medium text-text-primary">{owner.firstName} {owner.lastName}</p>
                <p className="text-xs text-text-secondary">{owner.address}, {owner.city}</p>
              </Link>
            )}
          </Card>
          <Card title="Verknüpfte Fälle" className="lg:col-span-2">
            {linkedCases.length === 0 ? (
              <EmptyState icon="car" title="Keine verknüpften Fälle" />
            ) : (
              linkedCases.map((c) => (
                <Link key={c!.id} to={`/akten/${c!.id}`} className="block rounded-lg bg-surface-tertiary/40 p-3 mb-2 hover:bg-surface-hover/60">
                  <span className="font-mono text-xs text-accent-light">{c!.caseNumber}</span>
                  <p className="text-sm text-text-primary">{c!.title}</p>
                </Link>
              ))
            )}
          </Card>
        </div>
      </div>
    );
  }

  const filtered = vehicles.filter((v) => {
    const q = search.toLowerCase();
    return v.plate.toLowerCase().includes(q) || v.model.toLowerCase().includes(q) || v.brand.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Fahrzeuganmeldung</h1>
        <p className="page-subtitle">{vehicles.length} Fahrzeuge registriert</p>
      </div>
      <SearchBar value={search} onChange={setSearch} placeholder="Kennzeichen, Marke oder Modell..." />
      <div className="grid gap-3 md:grid-cols-2">
        {filtered.map((v) => {
          const owner = getPerson(v.ownerId);
          return (
            <Link
              key={v.id}
              to={`/fahrzeuge/${v.id}`}
              className={`rounded-xl border p-5 transition-all hover:border-accent/30 ${
                v.isWanted ? 'border-danger/30 bg-danger/5' : 'border-border bg-surface-card/60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-lg text-accent-light">{v.plate}</span>
                  <p className="mt-1 text-sm text-text-primary">{v.brand} {v.model}</p>
                  <p className="text-xs text-text-secondary">{v.color}</p>
                </div>
                <div className="flex flex-col gap-1 items-end">
                  <StatusBadge status={v.registrationStatus} />
                  {v.isWanted && <Badge variant="red">Fahndung</Badge>}
                </div>
              </div>
              <p className="mt-3 text-xs text-text-secondary">
                Halter: {owner ? `${owner.firstName} ${owner.lastName}` : 'Unbekannt'}
              </p>
            </Link>
          );
        })}
      </div>
      {filtered.length === 0 && (
        <Card><EmptyState icon="car" title="Keine Fahrzeuge gefunden" /></Card>
      )}
    </div>
  );
}
