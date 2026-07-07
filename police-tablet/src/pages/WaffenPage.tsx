import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Icon from '../components/icons/Icon';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useNotify } from '../context/NotifyContext';
import type { LicenseStatus } from '../types';
import { Card, Button, StatusBadge, Badge, Input, EmptyState, Modal } from '../components/ui';

const emptyWeaponForm = () => ({
  serialNumber: '',
  type: '',
  caliber: '',
  ownerId: '',
  licenseStatus: 'gültig' as LicenseStatus,
  licenseExpiry: '',
  notes: '',
});

export default function WaffenPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { weapons, getWeapon, getPerson, persons, createWeapon, updateWeapon } = useData();
  const { permissions } = useAuth();
  const { notify } = useNotify();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyWeaponForm());

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyWeaponForm());
    setShowModal(true);
  };

  const openEdit = (weapon: NonNullable<ReturnType<typeof getWeapon>>) => {
    setEditingId(weapon.id);
    setForm({
      serialNumber: weapon.serialNumber,
      type: weapon.type,
      caliber: weapon.caliber,
      ownerId: weapon.ownerId ?? '',
      licenseStatus: weapon.licenseStatus,
      licenseExpiry: weapon.licenseExpiry ?? '',
      notes: weapon.notes,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.serialNumber.trim() || !form.type.trim() || !form.caliber.trim()) {
      notify('Bitte Seriennummer, Waffenart und Kaliber angeben.', 'warning');
      return;
    }
    setIsSaving(true);
    try {
      const payload = {
        serialNumber: form.serialNumber.trim(),
        type: form.type.trim(),
        caliber: form.caliber.trim(),
        ownerId: form.ownerId || null,
        licenseStatus: form.licenseStatus,
        licenseExpiry: form.licenseExpiry || null,
        notes: form.notes.trim(),
      };
      if (editingId) {
        await updateWeapon(editingId, payload);
        notify('Waffe aktualisiert.', 'success');
      } else {
        const newId = await createWeapon(payload);
        notify('Waffe registriert.', 'success');
        setShowModal(false);
        navigate(`/waffen/${newId}`);
        return;
      }
      setShowModal(false);
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Speichern fehlgeschlagen.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (id) {
    const weapon = getWeapon(id);
    if (!weapon) return <p className="text-text-secondary py-20 text-center">Waffe nicht gefunden</p>;
    const owner = weapon.ownerId ? getPerson(weapon.ownerId) : null;

    return (
      <div className="space-y-6">
        <Link to="/waffen" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-accent">
          <Icon name="arrow-left" size={16} /> Zurück
        </Link>
        <div className="flex items-center gap-4">
          <Icon name="crosshair" size={32} className="text-accent-light" />
          <div className="flex-1">
            <h1 className="page-title font-mono">{weapon.serialNumber}</h1>
            <p className="text-sm text-text-secondary">{weapon.type} · {weapon.caliber}</p>
          </div>
          {weapon.isWanted && (
            <div className="flex items-center gap-2 text-danger">
              <Icon name="alert" size={20} />
              <span className="font-medium">Gesuchte Waffe</span>
            </div>
          )}
          {permissions.editWeapons && (
            <Button variant="secondary" size="sm" onClick={() => openEdit(weapon)}>
              Bearbeiten
            </Button>
          )}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="Registrierungsdaten">
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-text-muted">Seriennummer</dt><dd className="font-mono text-text-primary">{weapon.serialNumber}</dd></div>
              <div className="flex justify-between"><dt className="text-text-muted">Waffenart</dt><dd className="text-text-primary">{weapon.type}</dd></div>
              <div className="flex justify-between"><dt className="text-text-muted">Kaliber</dt><dd className="text-text-primary">{weapon.caliber}</dd></div>
              <div className="flex justify-between"><dt className="text-text-muted">Registriert am</dt><dd className="text-text-primary">{weapon.registeredAt}</dd></div>
              <div className="flex justify-between items-center"><dt className="text-text-muted">Lizenzstatus</dt><dd><StatusBadge status={weapon.licenseStatus} /></dd></div>
              {weapon.licenseExpiry && (
                <div className="flex justify-between"><dt className="text-text-muted">Lizenz gültig bis</dt><dd className="text-text-primary">{weapon.licenseExpiry}</dd></div>
              )}
            </dl>
          </Card>
          <Card title="Registrierter Besitzer">
            {owner ? (
              <Link to={`/personen/${owner.id}`} className="block rounded-lg bg-surface-tertiary/40 p-4 hover:bg-surface-hover/60">
                <p className="font-medium text-text-primary">{owner.firstName} {owner.lastName}</p>
                <p className="text-xs text-text-secondary">{owner.address}, {owner.city}</p>
              </Link>
            ) : (
              <p className="text-sm text-text-muted">Kein registrierter Besitzer</p>
            )}
            {weapon.notes && <p className="mt-4 text-sm text-text-secondary">{weapon.notes}</p>}
          </Card>
        </div>

        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Waffe bearbeiten" size="md">
          <WeaponForm
            form={form}
            setForm={setForm}
            persons={persons}
            isSaving={isSaving}
            onSubmit={handleSubmit}
            onCancel={() => setShowModal(false)}
            submitLabel="Speichern"
          />
        </Modal>
      </div>
    );
  }

  const filtered = weapons.filter((w) => {
    const q = search.toLowerCase();
    return w.serialNumber.toLowerCase().includes(q) || w.type.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="page-title">Waffenregistrierung</h1>
          <p className="page-subtitle">{weapons.length} Waffen registriert</p>
        </div>
        {permissions.editWeapons && (
          <Button onClick={openCreate}>
            <Icon name="plus" size={16} /> Waffe registrieren
          </Button>
        )}
      </div>
      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Seriennummer oder Waffenart..."
      />
      <div className="grid gap-3 md:grid-cols-2">
        {filtered.map((w) => {
          const owner = w.ownerId ? getPerson(w.ownerId) : null;
          return (
            <Link
              key={w.id}
              to={`/waffen/${w.id}`}
              className={`rounded-xl border p-5 transition-all hover:border-accent/30 ${
                w.isWanted ? 'border-danger/30 bg-danger/5' : 'border-border bg-surface-card/60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-sm text-accent-light">{w.serialNumber}</span>
                  <p className="mt-1 font-medium text-text-primary">{w.type}</p>
                  <p className="text-xs text-text-secondary">{w.caliber}</p>
                </div>
                <StatusBadge status={w.licenseStatus} />
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-text-secondary">
                  {owner ? `${owner.firstName} ${owner.lastName}` : 'Kein Besitzer'}
                </span>
                {w.isWanted && <Badge variant="red">Gesucht</Badge>}
              </div>
            </Link>
          );
        })}
      </div>
      {filtered.length === 0 && (
        <Card><EmptyState icon="crosshair" title="Keine Waffen gefunden" /></Card>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Waffe registrieren" size="md">
        <WeaponForm
          form={form}
          setForm={setForm}
          persons={persons}
          isSaving={isSaving}
          onSubmit={handleSubmit}
          onCancel={() => setShowModal(false)}
          submitLabel="Registrieren"
        />
      </Modal>
    </div>
  );
}

function WeaponForm({
  form,
  setForm,
  persons,
  isSaving,
  onSubmit,
  onCancel,
  submitLabel,
}: {
  form: ReturnType<typeof emptyWeaponForm>;
  setForm: React.Dispatch<React.SetStateAction<ReturnType<typeof emptyWeaponForm>>>;
  persons: { id: string; firstName: string; lastName: string }[];
  isSaving: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  submitLabel: string;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <Input label="Seriennummer *" value={form.serialNumber} onChange={(e) => setForm({ ...form, serialNumber: e.target.value })} placeholder="WPN-2026-001" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Waffenart *" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} placeholder="Pistole" />
        <Input label="Kaliber *" value={form.caliber} onChange={(e) => setForm({ ...form, caliber: e.target.value })} placeholder="9mm" />
      </div>
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-text-secondary">Besitzer</label>
        <select
          value={form.ownerId}
          onChange={(e) => setForm({ ...form, ownerId: e.target.value })}
          className="w-full rounded-lg border border-border bg-surface-tertiary/60 px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
        >
          <option value="">Kein Besitzer</option>
          {persons.map((p) => (
            <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
          ))}
        </select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-text-secondary">Lizenzstatus</label>
          <select
            value={form.licenseStatus}
            onChange={(e) => setForm({ ...form, licenseStatus: e.target.value as typeof form.licenseStatus })}
            className="w-full rounded-lg border border-border bg-surface-tertiary/60 px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
          >
            <option value="gültig">Gültig</option>
            <option value="abgelaufen">Abgelaufen</option>
            <option value="entzogen">Entzogen</option>
            <option value="gesucht">Gesucht</option>
          </select>
        </div>
        <Input label="Lizenz gültig bis" type="date" value={form.licenseExpiry} onChange={(e) => setForm({ ...form, licenseExpiry: e.target.value })} />
      </div>
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-text-secondary">Notizen</label>
        <textarea
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          rows={3}
          className="w-full rounded-lg border border-border bg-surface-tertiary/60 px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
          placeholder="Optionale Anmerkungen..."
        />
      </div>
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">Abbrechen</Button>
        <Button type="submit" className="flex-1" disabled={isSaving}>{isSaving ? 'Speichern…' : submitLabel}</Button>
      </div>
    </form>
  );
}
