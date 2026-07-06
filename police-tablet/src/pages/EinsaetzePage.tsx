import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Radio, Plus, ArrowLeft, MapPin, Users } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { RADIO_CODES, UNITS } from '../types';
import {
  Card,
  Button,
  StatusBadge,
  SearchBar,
  Modal,
  Input,
  Select,
  EmptyState,
} from '../components/ui';
import type { OperationStatus, WantedPriority } from '../types';

export default function EinsaetzePage() {
  const { id } = useParams();
  const {
    operations,
    createOperation,
    updateOperationStatus,
    updateOperationReport,
    updateOperationUnits,
    getCase,
  } = useData();
  const { permissions, currentOfficer } = useAuth();
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [createForm, setCreateForm] = useState({
    title: '',
    location: '',
    priority: 'mittel' as WantedPriority,
    radioCode: RADIO_CODES[0],
    status: 'geplant' as OperationStatus,
  });

  const [reportEdit, setReportEdit] = useState('');

  if (!currentOfficer) return null;

  if (id) {
    const op = operations.find((o) => o.id === id);
    if (!op) return <p className="text-police-400 py-20 text-center">Einsatz nicht gefunden</p>;

    const linkedCases = op.linkedCaseIds.map((cid) => getCase(cid)).filter(Boolean);

    return (
      <div className="space-y-6">
        <Link to="/einsaetze" className="inline-flex items-center gap-2 text-sm text-police-400 hover:text-police-accent">
          <ArrowLeft className="h-4 w-4" /> Zurück
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-lg text-police-accent">{op.code}</span>
              <StatusBadge status={op.status} />
              <StatusBadge status={op.priority} />
              <span className="rounded-md bg-police-800 px-2 py-0.5 font-mono text-xs text-police-300">
                Funk: {op.radioCode}
              </span>
            </div>
            <h1 className="mt-1 text-2xl font-bold text-police-50">{op.title}</h1>
            <p className="flex items-center gap-1 text-sm text-police-400">
              <MapPin className="h-3.5 w-3.5" /> {op.location}
            </p>
          </div>
          {permissions.editOperations && (
            <Select
              label="Status"
              value={op.status}
              onChange={(e) => updateOperationStatus(op.id, e.target.value as OperationStatus)}
              options={[
                { value: 'geplant', label: 'Geplant' },
                { value: 'aktiv', label: 'Aktiv' },
                { value: 'abgeschlossen', label: 'Abgeschlossen' },
                { value: 'abgebrochen', label: 'Abgebrochen' },
              ]}
            />
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="Zugewiesene Einheiten">
            {permissions.editOperations && (
              <div className="mb-4 space-y-2">
                {UNITS.map((unit) => (
                  <label key={unit} className="flex items-center gap-2 text-sm text-police-300">
                    <input
                      type="checkbox"
                      checked={op.assignedUnits.some((u) => u.unitName === unit)}
                      onChange={(e) => {
                        const current = op.assignedUnits.map((u) => u.unitName);
                        const next = e.target.checked
                          ? [...new Set([...current, unit])]
                          : current.filter((u) => u !== unit);
                        updateOperationUnits(
                          op.id,
                          next.map((name, i) => ({
                            unitId: `unit-${i}`,
                            unitName: name,
                            officers: [],
                          }))
                        );
                      }}
                      className="rounded border-police-600"
                    />
                    {unit}
                  </label>
                ))}
              </div>
            )}
            {op.assignedUnits.length === 0 ? (
              <EmptyState icon={Users} title="Keine Einheiten zugewiesen" />
            ) : (
              op.assignedUnits.map((u) => (
                <div key={u.unitId} className="rounded-lg bg-police-800/40 p-3 mb-2">
                  <p className="font-medium text-police-100">{u.unitName}</p>
                  {u.officers.length > 0 && (
                    <p className="text-xs text-police-400">{u.officers.join(', ')}</p>
                  )}
                </div>
              ))
            )}
          </Card>

          <Card title="Standort">
            <div className="rounded-lg bg-police-800/40 p-6 text-center">
              <MapPin className="mx-auto h-8 w-8 text-police-accent mb-3" />
              <p className="text-sm font-medium text-police-100">{op.location}</p>
              {op.coordinates && (
                <p className="mt-1 text-xs text-police-500 font-mono">
                  {op.coordinates.lat.toFixed(4)}, {op.coordinates.lng.toFixed(4)}
                </p>
              )}
              <p className="mt-4 text-xs text-police-500">Kartenansicht simuliert · Fiktive Koordinaten</p>
            </div>
          </Card>

          <Card title="Einsatzbericht" className="lg:col-span-2">
            {permissions.editOperations ? (
              <div className="space-y-3">
                <textarea
                  value={reportEdit || op.report}
                  onChange={(e) => setReportEdit(e.target.value)}
                  rows={5}
                  className="w-full rounded-lg border border-police-600/50 bg-police-800/80 px-3 py-2 text-sm text-police-100 focus:border-police-accent focus:outline-none"
                  placeholder="Einsatzbericht verfassen..."
                />
                <Button
                  onClick={() => {
                    updateOperationReport(op.id, reportEdit || op.report);
                    setReportEdit('');
                  }}
                >
                  Bericht speichern
                </Button>
              </div>
            ) : (
              <p className="text-sm text-police-300">{op.report || 'Noch kein Bericht vorhanden.'}</p>
            )}
          </Card>

          {linkedCases.length > 0 && (
            <Card title="Verknüpfte Akten" className="lg:col-span-2">
              {linkedCases.map((c) => (
                <Link key={c!.id} to={`/akten/${c!.id}`} className="block rounded-lg bg-police-800/40 p-3 mb-2 hover:bg-police-800/60">
                  <span className="font-mono text-xs text-police-accent">{c!.caseNumber}</span>
                  <p className="text-sm text-police-100">{c!.title}</p>
                </Link>
              ))}
            </Card>
          )}
        </div>
      </div>
    );
  }

  const filtered = operations.filter((o) => {
    const q = search.toLowerCase();
    const matchSearch = o.code.toLowerCase().includes(q) || o.title.toLowerCase().includes(q) || o.location.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-police-50">Einsatzverwaltung</h1>
          <p className="mt-1 text-sm text-police-400">{operations.length} Einsätze im System</p>
        </div>
        {permissions.createOperations && (
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4" /> Einsatz erstellen
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <SearchBar value={search} onChange={setSearch} placeholder="Code, Titel oder Standort..." />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-police-600/50 bg-police-800/80 px-4 py-2 text-sm text-police-100"
        >
          <option value="all">Alle Status</option>
          <option value="geplant">Geplant</option>
          <option value="aktiv">Aktiv</option>
          <option value="abgeschlossen">Abgeschlossen</option>
          <option value="abgebrochen">Abgebrochen</option>
        </select>
      </div>

      <div className="space-y-3">
        {filtered.map((op) => (
          <Link
            key={op.id}
            to={`/einsaetze/${op.id}`}
            className="flex items-center justify-between rounded-xl border border-police-700/40 bg-police-900/40 p-5 hover:border-police-accent/30 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className={`rounded-lg p-2.5 ${op.status === 'aktiv' ? 'bg-red-500/10' : 'bg-police-800/50'}`}>
                <Radio className={`h-5 w-5 ${op.status === 'aktiv' ? 'text-red-400' : 'text-police-accent'}`} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-police-accent">{op.code}</span>
                  <StatusBadge status={op.status} />
                  <StatusBadge status={op.priority} />
                </div>
                <p className="font-medium text-police-100">{op.title}</p>
                <p className="text-xs text-police-400">{op.location}</p>
              </div>
            </div>
            <span className="font-mono text-xs text-police-500">{op.radioCode}</span>
          </Link>
        ))}
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Neuen Einsatz erstellen">
        <div className="space-y-4">
          <Input label="Titel" value={createForm.title} onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })} />
          <Input label="Standort" value={createForm.location} onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })} />
          <Select
            label="Priorität"
            value={createForm.priority}
            onChange={(e) => setCreateForm({ ...createForm, priority: e.target.value as WantedPriority })}
            options={[
              { value: 'niedrig', label: 'Niedrig' },
              { value: 'mittel', label: 'Mittel' },
              { value: 'hoch', label: 'Hoch' },
              { value: 'kritisch', label: 'Kritisch' },
            ]}
          />
          <Select
            label="Funkcode"
            value={createForm.radioCode}
            onChange={(e) => setCreateForm({ ...createForm, radioCode: e.target.value })}
            options={RADIO_CODES.map((c) => ({ value: c, label: c }))}
          />
          <Button
            className="w-full"
            onClick={() => {
              if (!createForm.title || !createForm.location) return;
              createOperation({
                title: createForm.title,
                location: createForm.location,
                status: 'geplant',
                priority: createForm.priority,
                assignedUnits: [{ unitId: 'unit-new', unitName: currentOfficer.unit, officers: [currentOfficer.name] }],
                radioCode: createForm.radioCode,
                report: '',
                linkedCaseIds: [],
              });
              setCreateForm({ title: '', location: '', priority: 'mittel', radioCode: RADIO_CODES[0], status: 'geplant' });
              setShowCreate(false);
            }}
          >
            Einsatz anlegen
          </Button>
        </div>
      </Modal>
    </div>
  );
}
