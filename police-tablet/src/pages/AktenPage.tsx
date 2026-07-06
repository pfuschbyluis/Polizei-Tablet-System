import { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/icons/Icon';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Card, SearchBar, StatusBadge, Button, EmptyState } from '../components/ui';

export default function AktenPage() {
  const { cases } = useData();
  const { permissions } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = cases.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch =
      c.caseNumber.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q) ||
      c.offense.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Akten-System</h1>
          <p className="page-subtitle">{cases.length} Akten im System</p>
        </div>
        {permissions.createCases && (
          <Link to="/akten/neu">
            <Button size="sm">
              <Icon name="plus" size={16} /> Neue Akte
            </Button>
          </Link>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <SearchBar value={search} onChange={setSearch} placeholder="Aktenzeichen, Titel oder Delikt..." />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-border bg-surface-tertiary/60 px-4 py-2 text-sm text-text-primary"
        >
          <option value="all">Alle Status</option>
          <option value="offen">Offen</option>
          <option value="in_bearbeitung">In Bearbeitung</option>
          <option value="abgeschlossen">Abgeschlossen</option>
        </select>
      </div>

      {cases.length === 0 ? (
        <Card>
          <EmptyState
            icon="folder"
            title="Noch keine Akten"
            description="Erstelle eine neue Akte über den Button oben."
          />
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState icon="folder" title="Keine Akten gefunden" description="Passen Sie Ihre Suche an." />
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((c) => (
            <Link
              key={c.id}
              to={`/akten/${c.id}`}
              className="flex items-center justify-between rounded-xl border border-border bg-surface-card/60 p-4 hover:border-accent/30 transition-all"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm text-accent-light">{c.caseNumber}</span>
                  <StatusBadge status={c.status} />
                  <span className="text-xs text-text-muted">{c.offense}</span>
                </div>
                <p className="mt-1 truncate font-medium text-text-primary">{c.title}</p>
                <p className="text-xs text-text-secondary">
                  Zuständig: {c.assignedOfficerName} · Aktualisiert: {c.updatedAt}
                </p>
              </div>
              <Icon name="chevron-right" size={20} className="shrink-0 text-text-muted" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
