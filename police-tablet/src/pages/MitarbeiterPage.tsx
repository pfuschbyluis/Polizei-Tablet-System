import { useState } from 'react';
import Icon from '../components/icons/Icon';
import { useAuth } from '../context/AuthContext';
import { RANK_LABELS, UNITS, type Rank, type EmployeeInput } from '../types';
import {
  Card,
  Button,
  Input,
  Select,
  Modal,
  Badge,
  EmptyState,
  SearchBar,
} from '../components/ui';

const emptyForm: EmployeeInput = {
  badgeNumber: '',
  password: '',
  name: '',
  rank: 'beamter',
  unit: UNITS[0],
  active: true,
};

export default function MitarbeiterPage() {
  const { employees, permissions, currentOfficer, createEmployee, updateEmployee, deleteEmployee } =
    useAuth();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EmployeeInput>(emptyForm);
  const [error, setError] = useState('');

  if (!permissions.viewEmployees) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Icon name="shield" size={40} className="text-text-muted" />
        <p className="mt-4 text-text-secondary">Kein Zugriff auf Mitarbeiterverwaltung</p>
      </div>
    );
  }

  const filtered = employees.filter((e) => {
    const q = search.toLowerCase();
    return (
      e.name.toLowerCase().includes(q) ||
      e.badgeNumber.toLowerCase().includes(q) ||
      e.unit.toLowerCase().includes(q)
    );
  });

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
    setShowModal(true);
  };

  const openEdit = (emp: typeof employees[0]) => {
    setEditingId(emp.id);
    setForm({
      badgeNumber: emp.badgeNumber,
      password: '',
      name: emp.name,
      rank: emp.rank,
      unit: emp.unit,
      active: emp.active,
    });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.badgeNumber.trim() || !form.name.trim()) {
      setError('Dienstnummer und Name sind Pflichtfelder.');
      return;
    }
    if (!editingId && !form.password) {
      setError('Passwort ist erforderlich.');
      return;
    }

    let ok: boolean;
    if (editingId) {
      const payload: Partial<EmployeeInput> = { ...form };
      if (!payload.password) delete payload.password;
      ok = await updateEmployee(editingId, payload);
    } else {
      ok = await createEmployee(form);
    }

    if (ok) {
      setShowModal(false);
      setForm(emptyForm);
    } else {
      setError(editingId ? 'Speichern fehlgeschlagen.' : 'Dienstnummer bereits vergeben.');
    }
  };

  const handleDelete = async (id: string) => {
    if (id === currentOfficer?.id) {
      setError('Eigener Account kann nicht gelöscht werden.');
      return;
    }
    if (confirm('Mitarbeiter wirklich löschen?')) {
      await deleteEmployee(id);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Mitarbeiter</h1>
          <p className="page-subtitle">{employees.length} registrierte Beamte</p>
        </div>
        {permissions.manageEmployees && (
          <Button onClick={openCreate} size="sm">
            <Icon name="user-plus" size={16} /> Neuer Mitarbeiter
          </Button>
        )}
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="Name, Dienstnummer oder Einheit..." />

      {employees.length === 0 ? (
        <Card>
          <EmptyState
            icon="user-cog"
            title="Keine Mitarbeiter"
            description="Lege den ersten Mitarbeiter an, um Zugänge zu verwalten."
          />
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState icon="user-cog" title="Keine Treffer" description="Passen Sie die Suche an." />
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((emp) => (
            <Card key={emp.id} padding className="!p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent-light">
                    <Icon name="user-cog" size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-text-primary">{emp.name}</p>
                    <p className="font-mono text-xs text-accent-light">{emp.badgeNumber}</p>
                    <p className="truncate text-xs text-text-secondary">{emp.unit}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <Badge variant="blue">{RANK_LABELS[emp.rank]}</Badge>
                  {!emp.active && <Badge variant="red">Inaktiv</Badge>}
                </div>
              </div>
              {permissions.manageEmployees && (
                <div className="mt-4 flex gap-2 border-t border-border pt-3">
                  <Button variant="secondary" size="sm" className="flex-1" onClick={() => openEdit(emp)}>
                    <Icon name="pencil" size={14} /> Bearbeiten
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(emp.id)}
                    disabled={emp.id === currentOfficer?.id}
                  >
                    <Icon name="trash" size={14} />
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingId ? 'Mitarbeiter bearbeiten' : 'Neuer Mitarbeiter'}
      >
        <div className="space-y-4">
          <Input
            label="Vollständiger Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Max Mustermann"
          />
          <Input
            label="Dienstnummer"
            value={form.badgeNumber}
            onChange={(e) => setForm({ ...form, badgeNumber: e.target.value })}
            placeholder="PD-0000"
            disabled={!!editingId}
          />
          <Input
            label={editingId ? 'Neues Passwort (leer = unverändert)' : 'Passwort'}
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="••••••••"
          />
          <Select
            label="Rang"
            value={form.rank}
            onChange={(e) => setForm({ ...form, rank: e.target.value as Rank })}
            options={Object.entries(RANK_LABELS).map(([value, label]) => ({ value, label }))}
          />
          <Select
            label="Einheit"
            value={form.unit}
            onChange={(e) => setForm({ ...form, unit: e.target.value })}
            options={UNITS.map((u) => ({ value: u, label: u }))}
          />
          {editingId && (
            <Select
              label="Status"
              value={form.active ? 'active' : 'inactive'}
              onChange={(e) => setForm({ ...form, active: e.target.value === 'active' })}
              options={[
                { value: 'active', label: 'Aktiv' },
                { value: 'inactive', label: 'Inaktiv' },
              ]}
            />
          )}
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button className="w-full" onClick={handleSubmit}>
            {editingId ? 'Speichern' : 'Mitarbeiter anlegen'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
