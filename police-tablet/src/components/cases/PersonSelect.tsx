import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Person } from '../../types';
import SearchBar from '../ui/SearchBar';

interface PersonSelectProps {
  label?: string;
  persons: Person[];
  value: string;
  onChange: (personId: string) => void;
  excludeIds?: string[];
  disabled?: boolean;
}

export default function PersonSelect({
  label,
  persons,
  value,
  onChange,
  excludeIds = [],
  disabled = false,
}: PersonSelectProps) {
  const [search, setSearch] = useState('');

  const available = useMemo(() => {
    const excluded = new Set(excludeIds);
    const q = search.toLowerCase().trim();
    return persons
      .filter((p) => !excluded.has(p.id))
      .filter((p) => {
        if (!q) return true;
        const name = `${p.firstName} ${p.lastName}`.toLowerCase();
        return (
          name.includes(q) ||
          p.city.toLowerCase().includes(q) ||
          p.address.toLowerCase().includes(q) ||
          (p.phone ?? '').toLowerCase().includes(q)
        );
      })
      .sort((a, b) =>
        `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`, 'de')
      );
  }, [persons, excludeIds, search]);

  const selected = persons.find((p) => p.id === value);

  return (
    <div className="space-y-2">
      {label && <label className="block text-xs font-medium text-text-secondary">{label}</label>}

      {persons.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border px-4 py-5 text-center text-sm text-text-muted">
          Keine Personen im System.{' '}
          <Link to="/personen" className="text-accent hover:underline">
            Person anlegen
          </Link>
        </div>
      ) : (
        <>
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Name, Adresse oder Stadt suchen..."
          />
          <div className="max-h-52 overflow-y-auto rounded-lg border border-border bg-surface-tertiary/40">
            {available.length === 0 ? (
              <p className="px-3 py-4 text-center text-sm text-text-muted">
                Keine passenden Personen gefunden.
              </p>
            ) : (
              available.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => onChange(p.id)}
                  className={`flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm transition-colors ${
                    value === p.id
                      ? 'bg-accent-subtle text-accent-light font-medium'
                      : 'text-text-primary hover:bg-surface-hover/60'
                  }`}
                >
                  <span>
                    {p.firstName} {p.lastName}
                  </span>
                  <span className="shrink-0 text-xs text-text-muted">{p.city}</span>
                </button>
              ))
            )}
          </div>
          {selected && (
            <p className="text-xs text-text-secondary">
              Ausgewählt:{' '}
              <span className="font-medium text-text-primary">
                {selected.firstName} {selected.lastName}
              </span>
            </p>
          )}
        </>
      )}
    </div>
  );
}
