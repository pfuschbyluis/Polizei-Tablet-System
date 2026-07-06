import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Crosshair, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useData } from '../context/DataContext';
import { Card, SearchBar, StatusBadge, EmptyState, Badge } from '../components/ui';

export default function WaffenPage() {
  const { id } = useParams();
  const { weapons, getWeapon, getPerson } = useData();
  const [search, setSearch] = useState('');

  if (id) {
    const weapon = getWeapon(id);
    if (!weapon) return <p className="text-police-400 py-20 text-center">Waffe nicht gefunden</p>;
    const owner = weapon.ownerId ? getPerson(weapon.ownerId) : null;

    return (
      <div className="space-y-6">
        <Link to="/waffen" className="inline-flex items-center gap-2 text-sm text-police-400 hover:text-police-accent">
          <ArrowLeft className="h-4 w-4" /> Zurück
        </Link>
        <div className="flex items-center gap-4">
          <Crosshair className="h-8 w-8 text-police-accent" />
          <div>
            <h1 className="text-2xl font-bold text-police-50 font-mono">{weapon.serialNumber}</h1>
            <p className="text-sm text-police-400">{weapon.type} · {weapon.caliber}</p>
          </div>
          {weapon.isWanted && (
            <div className="flex items-center gap-2 text-red-400 ml-auto">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">Gesuchte Waffe</span>
            </div>
          )}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="Registrierungsdaten">
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-police-500">Seriennummer</dt><dd className="font-mono text-police-100">{weapon.serialNumber}</dd></div>
              <div className="flex justify-between"><dt className="text-police-500">Waffenart</dt><dd className="text-police-100">{weapon.type}</dd></div>
              <div className="flex justify-between"><dt className="text-police-500">Kaliber</dt><dd className="text-police-100">{weapon.caliber}</dd></div>
              <div className="flex justify-between"><dt className="text-police-500">Registriert am</dt><dd className="text-police-100">{weapon.registeredAt}</dd></div>
              <div className="flex justify-between items-center"><dt className="text-police-500">Lizenzstatus</dt><dd><StatusBadge status={weapon.licenseStatus} /></dd></div>
              {weapon.licenseExpiry && (
                <div className="flex justify-between"><dt className="text-police-500">Lizenz gültig bis</dt><dd className="text-police-100">{weapon.licenseExpiry}</dd></div>
              )}
            </dl>
          </Card>
          <Card title="Registrierter Besitzer">
            {owner ? (
              <Link to={`/personen/${owner.id}`} className="block rounded-lg bg-police-800/40 p-4 hover:bg-police-800/60">
                <p className="font-medium text-police-100">{owner.firstName} {owner.lastName}</p>
                <p className="text-xs text-police-400">{owner.address}, {owner.city}</p>
              </Link>
            ) : (
              <p className="text-sm text-police-500">Kein registrierter Besitzer</p>
            )}
            {weapon.notes && <p className="mt-4 text-sm text-police-400">{weapon.notes}</p>}
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
        <h1 className="text-2xl font-bold text-police-50">Waffenregistrierung</h1>
        <p className="mt-1 text-sm text-police-400">{weapons.length} Waffen registriert</p>
      </div>
      <SearchBar value={search} onChange={setSearch} placeholder="Seriennummer oder Waffenart..." />
      <div className="grid gap-3 md:grid-cols-2">
        {filtered.map((w) => {
          const owner = w.ownerId ? getPerson(w.ownerId) : null;
          return (
            <Link
              key={w.id}
              to={`/waffen/${w.id}`}
              className={`rounded-xl border p-5 transition-all hover:border-police-accent/30 ${
                w.isWanted ? 'border-red-500/30 bg-red-500/5' : 'border-police-700/40 bg-police-900/40'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-sm text-police-accent">{w.serialNumber}</span>
                  <p className="mt-1 font-medium text-police-100">{w.type}</p>
                  <p className="text-xs text-police-400">{w.caliber}</p>
                </div>
                <StatusBadge status={w.licenseStatus} />
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-police-400">
                  {owner ? `${owner.firstName} ${owner.lastName}` : 'Kein Besitzer'}
                </span>
                {w.isWanted && <Badge variant="red">Gesucht</Badge>}
              </div>
            </Link>
          );
        })}
      </div>
      {filtered.length === 0 && (
        <Card><EmptyState icon={Crosshair} title="Keine Waffen gefunden" /></Card>
      )}
    </div>
  );
}
