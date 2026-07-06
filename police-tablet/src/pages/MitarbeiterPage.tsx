import { useState } from 'react';
import Icon from '../components/icons/Icon';
import { useAuth } from '../context/AuthContext';
import { useNotify } from '../context/NotifyContext';
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
  ConfirmDialog,
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
  const { notify } = useNotify();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EmployeeInput>(emptyForm);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const closeModal = () => {
    if (isSaving) return;
    setShowModal(false);
    setError('');
  };

  const handleSubmit = async () => {
    if (!form.badgeNumber.trim() || !form.name.trim()) {
      const message = 'Fehlende Daten eingeben';
      setError(message);
      notify(message, 'warning');
      return;
    }
    if (!editingId && !form.password) {
      const message = 'Passwort ist erforderlich';
      setError(message);
      notify(message, 'warning');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      let result: { success: boolean; error?: string };
      if (editingId) {
        const payload: Partial<EmployeeInput> = { ...form };
        if (!payload.password) delete payload.password;
        result = await updateEmployee(editingId, payload);
      } else {
        result = await createEmployee(form);
      }

      if (result.success) {
        notify(editingId ? 'Mitarbeiter gespeichert' : 'Mitarbeiter angelegt', 'success');
        setShowModal(false);
        setForm(emptyForm);
      } else {
        const message = result.error ?? (editingId ? 'Speichern fehlgeschlagen.' : 'Dienstnummer bereits vergeben.');
        setError(message);
        notify(message, 'error');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const openDeleteConfirm = (id: string) => {
    if (id === currentOfficer?.id) {
      notify('Eigener Account kann nicht gelöscht werden.', 'warning');
      return;
    }
    setDeleteTargetId(id);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;

    setIsDeleting(true);
    try {
      const result = await deleteEmployee(deleteTargetId);
      if (result.success) {
        notify('Mitarbeiter gelöscht', 'success');
        setShowDeleteConfirm(false);
        setDeleteTargetId(null);
      } else {
        notify(result.error ?? 'Löschen fehlgeschlagen.', 'error');
      }
    } finally {
      setIsDeleting(false);
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
                    onClick={() => openDeleteConfirm(emp.id)}
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
        onClose={closeModal}
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
          <Button className="w-full" onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? 'Speichern...' : editingId ? 'Speichern' : 'Mitarbeiter anlegen'}
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Mitarbeiter löschen"
        message="Möchten Sie diesen Mitarbeiter wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden."
        confirmLabel={isDeleting ? 'Löschen...' : 'Löschen'}
        onConfirm={handleDelete}
        onCancel={() => {
          if (isDeleting) return;
          setShowDeleteConfirm(false);
          setDeleteTargetId(null);
        }}
      />
    </div>
  );
}
