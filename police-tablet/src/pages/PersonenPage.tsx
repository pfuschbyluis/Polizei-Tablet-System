import { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, AlertTriangle, ChevronRight } from 'lucide-react';
import { useData } from '../context/DataContext';
import { Card, SearchBar, EmptyState, Badge } from '../components/ui';

export default function PersonenPage() {
  const { persons } = useData();
  const [search, setSearch] = useState('');

  const filtered = persons.filter((p) => {
    const q = search.toLowerCase();
    const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
    return fullName.includes(q) || p.address.toLowerCase().includes(q) || p.city.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-police-50">Personenakte</h1>
        <p className="mt-1 text-sm text-police-400">{persons.length} Personen im Register</p>
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="Name, Adresse oder Stadt suchen..." />

      {filtered.length === 0 ? (
        <Card>
          <EmptyState icon={User} title="Keine Personen gefunden" description="Passen Sie Ihre Suche an." />
        </Card>
      ) : (
        <div className="grid gap-3">
          {filtered.map((person) => {
            const hasWarrant = person.arrestWarrants.some((w) => w.active);
            return (
              <Link
                key={person.id}
                to={`/personen/${person.id}`}
                className="flex items-center justify-between rounded-xl border border-police-700/40 bg-police-900/40 p-5 hover:border-police-accent/30 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-police-800 text-police-300">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-police-100">
                        {person.firstName} {person.lastName}
                      </h3>
                      {hasWarrant && (
                        <span className="flex items-center gap-1 text-xs text-red-400">
                          <AlertTriangle className="h-3 w-3" /> Haftbefehl
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-police-400">
                      *{new Date(person.dateOfBirth).toLocaleDateString('de-DE')} · {person.address}, {person.city}
                    </p>
                    <div className="mt-1 flex gap-2">
                      {person.priorConvictions.length > 0 && (
                        <Badge variant="yellow">Vorbestraft</Badge>
                      )}
                      {person.linkedVehicleIds.length > 0 && (
                        <span className="text-xs text-police-500">{person.linkedVehicleIds.length} Fahrzeug(e)</span>
                      )}
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-police-500" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
