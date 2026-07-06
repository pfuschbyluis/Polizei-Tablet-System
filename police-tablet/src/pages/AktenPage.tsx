import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FolderOpen, Plus, ChevronRight } from 'lucide-react';
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
          <h1 className="text-xl font-bold text-police-50 sm:text-2xl">Akten-System</h1>
          <p className="mt-1 text-sm text-police-400">{cases.length} Akten im System</p>
        </div>
        {permissions.createCases && (
          <Link to="/akten/neu">
            <Button size="sm">
              <Plus className="h-4 w-4" /> Neue Akte
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
          className="rounded-lg border border-police-600/50 bg-police-800/80 px-4 py-2 text-sm text-police-100"
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
            icon={FolderOpen}
            title="Noch keine Akten"
            description="Erstelle eine neue Akte über den Button oben."
          />
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState icon={FolderOpen} title="Keine Akten gefunden" description="Passen Sie Ihre Suche an." />
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((c) => (
            <Link
              key={c.id}
              to={`/akten/${c.id}`}
              className="flex items-center justify-between rounded-xl border border-police-700/40 bg-police-900/40 p-4 hover:border-police-accent/30 transition-all"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm text-police-accent">{c.caseNumber}</span>
                  <StatusBadge status={c.status} />
                  <span className="text-xs text-police-500">{c.offense}</span>
                </div>
                <p className="mt-1 truncate font-medium text-police-100">{c.title}</p>
                <p className="text-xs text-police-400">
                  Zuständig: {c.assignedOfficerName} · Aktualisiert: {c.updatedAt}
                </p>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-police-500" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
