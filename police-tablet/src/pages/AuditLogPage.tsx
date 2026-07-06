import { useState } from 'react';
import Icon from '../components/icons/Icon';
import { useAudit } from '../context/AuditContext';
import { Card, SearchBar, Badge, EmptyState } from '../components/ui';

export default function AuditLogPage() {
  const { entries } = useAudit();
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');

  const modules = [...new Set(entries.map((e) => e.module))];

  const filtered = entries.filter((e) => {
    const q = search.toLowerCase();
    const matchSearch =
      e.action.toLowerCase().includes(q) ||
      e.details.toLowerCase().includes(q) ||
      e.officerName.toLowerCase().includes(q);
    const matchModule = moduleFilter === 'all' || e.module === moduleFilter;
    return matchSearch && matchModule;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Änderungsprotokoll</h1>
        <p className="page-subtitle">
          Protokollierung aller Systemänderungen · Nur für Administratoren
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <SearchBar value={search} onChange={setSearch} placeholder="Aktion, Beamter oder Details..." />
        </div>
        <div className="flex items-center gap-2">
          <Icon name="filter" size={16} className="text-text-muted" />
          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="rounded-lg border border-border bg-surface-tertiary/60 px-4 py-2 text-sm text-text-primary"
          >
            <option value="all">Alle Module</option>
            {modules.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      <Card padding={false}>
        {filtered.length === 0 ? (
          <EmptyState icon="scroll" title="Keine Einträge" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-text-muted">
                  <th className="px-5 py-3">Zeitstempel</th>
                  <th className="px-5 py-3">Beamter</th>
                  <th className="px-5 py-3">Modul</th>
                  <th className="px-5 py-3">Aktion</th>
                  <th className="px-5 py-3">Details</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((entry) => (
                  <tr key={entry.id} className="border-b border-border/50 hover:bg-surface-hover/40">
                    <td className="px-5 py-3 font-mono text-xs text-text-secondary whitespace-nowrap">
                      {new Date(entry.timestamp).toLocaleString('de-DE')}
                    </td>
                    <td className="px-5 py-3 text-text-primary">{entry.officerName}</td>
                    <td className="px-5 py-3">
                      <Badge variant="blue">{entry.module}</Badge>
                    </td>
                    <td className="px-5 py-3 text-text-primary">{entry.action}</td>
                    <td className="px-5 py-3 text-text-secondary max-w-xs truncate">{entry.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
