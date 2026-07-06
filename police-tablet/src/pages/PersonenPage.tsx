import { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/icons/Icon';
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
    <div className="space-y-5">
      <div>
        <h1 className="page-title">Personenakte</h1>
        <p className="page-subtitle">{persons.length} Personen im Register</p>
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="Name, Adresse oder Stadt suchen..." />

      {persons.length === 0 ? (
        <Card>
          <EmptyState
            icon="user"
            title="Keine Personen registriert"
            description="Personenakten werden über das Spiel-Backend befüllt."
          />
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState icon="user" title="Keine Personen gefunden" description="Passen Sie Ihre Suche an." />
        </Card>
      ) : (
        <div className="grid gap-2">
          {filtered.map((person) => {
            const hasWarrant = person.arrestWarrants.some((w) => w.active);
            return (
              <Link
                key={person.id}
                to={`/personen/${person.id}`}
                className="flex items-center justify-between rounded-xl border border-border bg-surface-card/60 p-4 hover:border-accent/30 transition-all"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-tertiary text-text-secondary">
                    <Icon name="user" size={20} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-text-primary">
                        {person.firstName} {person.lastName}
                      </h3>
                      {hasWarrant && (
                        <span className="flex items-center gap-1 text-xs text-danger">
                          <Icon name="alert" size={12} /> Haftbefehl
                        </span>
                      )}
                    </div>
                    <p className="truncate text-sm text-text-secondary">
                      *{new Date(person.dateOfBirth).toLocaleDateString('de-DE')} · {person.address}, {person.city}
                    </p>
                    <div className="mt-1 flex gap-2">
                      {person.priorConvictions.length > 0 && (
                        <Badge variant="yellow">Vorbestraft</Badge>
                      )}
                    </div>
                  </div>
                </div>
                <Icon name="chevron-right" size={20} className="shrink-0 text-text-muted" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
