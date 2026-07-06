import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Car, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useData } from '../context/DataContext';
import { Card, SearchBar, StatusBadge, EmptyState, Badge } from '../components/ui';

export default function FahrzeugePage() {
  const { id } = useParams();
  const { vehicles, getVehicle, getPerson, getCase } = useData();
  const [search, setSearch] = useState('');

  if (id) {
    const vehicle = getVehicle(id);
    if (!vehicle) return <p className="text-police-400 py-20 text-center">Fahrzeug nicht gefunden</p>;
    const owner = getPerson(vehicle.ownerId);
    const linkedCases = vehicle.linkedCaseIds.map((cid) => getCase(cid)).filter(Boolean);

    return (
      <div className="space-y-6">
        <Link to="/fahrzeuge" className="inline-flex items-center gap-2 text-sm text-police-400 hover:text-police-accent">
          <ArrowLeft className="h-4 w-4" /> Zurück
        </Link>
        <div className="flex items-center gap-4">
          <Car className="h-8 w-8 text-police-accent" />
          <div>
            <h1 className="text-2xl font-bold text-police-50 font-mono">{vehicle.plate}</h1>
            <p className="text-sm text-police-400">{vehicle.brand} {vehicle.model} · {vehicle.color}</p>
          </div>
          {vehicle.isWanted && (
            <div className="flex items-center gap-2 text-red-400 ml-auto">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">Fahndung aktiv</span>
            </div>
          )}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="Fahrzeugdaten">
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-police-500">Kennzeichen</dt><dd className="font-mono text-police-100">{vehicle.plate}</dd></div>
              <div className="flex justify-between"><dt className="text-police-500">Marke / Modell</dt><dd className="text-police-100">{vehicle.brand} {vehicle.model}</dd></div>
              <div className="flex justify-between"><dt className="text-police-500">Farbe</dt><dd className="text-police-100">{vehicle.color}</dd></div>
              <div className="flex justify-between items-center"><dt className="text-police-500">Versicherung</dt><dd><StatusBadge status={vehicle.insuranceStatus} /></dd></div>
              <div className="flex justify-between items-center"><dt className="text-police-500">Zulassung</dt><dd><StatusBadge status={vehicle.registrationStatus} /></dd></div>
              <div className="flex justify-between"><dt className="text-police-500">Registriert am</dt><dd className="text-police-100">{vehicle.registeredAt}</dd></div>
            </dl>
          </Card>
          <Card title="Fahrzeughalter">
            {owner && (
              <Link to={`/personen/${owner.id}`} className="block rounded-lg bg-police-800/40 p-4 hover:bg-police-800/60">
                <p className="font-medium text-police-100">{owner.firstName} {owner.lastName}</p>
                <p className="text-xs text-police-400">{owner.address}, {owner.city}</p>
              </Link>
            )}
          </Card>
          <Card title="Verknüpfte Fälle" className="lg:col-span-2">
            {linkedCases.length === 0 ? (
              <EmptyState icon={Car} title="Keine verknüpften Fälle" />
            ) : (
              linkedCases.map((c) => (
                <Link key={c!.id} to={`/akten/${c!.id}`} className="block rounded-lg bg-police-800/40 p-3 mb-2 hover:bg-police-800/60">
                  <span className="font-mono text-xs text-police-accent">{c!.caseNumber}</span>
                  <p className="text-sm text-police-100">{c!.title}</p>
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
        <h1 className="text-2xl font-bold text-police-50">Fahrzeuganmeldung</h1>
        <p className="mt-1 text-sm text-police-400">{vehicles.length} Fahrzeuge registriert</p>
      </div>
      <SearchBar value={search} onChange={setSearch} placeholder="Kennzeichen, Marke oder Modell..." />
      <div className="grid gap-3 md:grid-cols-2">
        {filtered.map((v) => {
          const owner = getPerson(v.ownerId);
          return (
            <Link
              key={v.id}
              to={`/fahrzeuge/${v.id}`}
              className={`rounded-xl border p-5 transition-all hover:border-police-accent/30 ${
                v.isWanted ? 'border-red-500/30 bg-red-500/5' : 'border-police-700/40 bg-police-900/40'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-lg text-police-accent">{v.plate}</span>
                  <p className="mt-1 text-sm text-police-100">{v.brand} {v.model}</p>
                  <p className="text-xs text-police-400">{v.color}</p>
                </div>
                <div className="flex flex-col gap-1 items-end">
                  <StatusBadge status={v.registrationStatus} />
                  {v.isWanted && <Badge variant="red">Fahndung</Badge>}
                </div>
              </div>
              <p className="mt-3 text-xs text-police-400">
                Halter: {owner ? `${owner.firstName} ${owner.lastName}` : 'Unbekannt'}
              </p>
            </Link>
          );
        })}
      </div>
      {filtered.length === 0 && (
        <Card><EmptyState icon={Car} title="Keine Fahrzeuge gefunden" /></Card>
      )}
    </div>
  );
}
