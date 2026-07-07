import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Icon from '../components/icons/Icon';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useNotify } from '../context/NotifyContext';
import { Card, Button, StatusBadge, EmptyState, Badge, Input, Modal } from '../components/ui';
import type { InsuranceStatus, RegistrationStatus } from '../types';

export default function FahrzeugePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { vehicles, getVehicle, getPerson, getCase, persons, createVehicle, updateVehicle } = useData();
  const { permissions } = useAuth();
  const { notify } = useNotify();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    plate: '',
    ownerId: '',
    brand: '',
    model: '',
    color: '',
    insuranceStatus: 'gültig' as InsuranceStatus,
    registrationStatus: 'zugelassen' as RegistrationStatus,
  });

  const openCreate = () => {
    setEditingId(null);
    setForm({ plate: '', ownerId: persons[0]?.id ?? '', brand: '', model: '', color: '', insuranceStatus: 'gültig', registrationStatus: 'zugelassen' });
    setShowModal(true);
  };

  const openEdit = (vehicle: NonNullable<ReturnType<typeof getVehicle>>) => {
    setEditingId(vehicle.id);
    setForm({
      plate: vehicle.plate,
      ownerId: vehicle.ownerId,
      brand: vehicle.brand,
      model: vehicle.model,
      color: vehicle.color,
      insuranceStatus: vehicle.insuranceStatus,
      registrationStatus: vehicle.registrationStatus,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.plate.trim() || !form.ownerId || !form.brand.trim() || !form.model.trim() || !form.color.trim()) {
      notify('Bitte alle Pflichtfelder ausfüllen.', 'warning');
      return;
    }
    setIsSaving(true);
    try {
      const payload = {
        plate: form.plate.trim(),
        ownerId: form.ownerId,
        brand: form.brand.trim(),
        model: form.model.trim(),
        color: form.color.trim(),
        insuranceStatus: form.insuranceStatus,
        registrationStatus: form.registrationStatus,
      };
      if (editingId) {
        await updateVehicle(editingId, payload);
        notify('Fahrzeug aktualisiert.', 'success');
      } else {
        const newId = await createVehicle(payload);
        notify('Fahrzeug registriert.', 'success');
        setShowModal(false);
        navigate(`/fahrzeuge/${newId}`);
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
    const vehicle = getVehicle(id);
    if (!vehicle) return <p className="text-text-secondary py-20 text-center">Fahrzeug nicht gefunden</p>;
    const owner = getPerson(vehicle.ownerId);
    const linkedCases = vehicle.linkedCaseIds.map((cid) => getCase(cid)).filter(Boolean);

    return (
      <div className="space-y-6">
        <Link to="/fahrzeuge" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-accent">
          <Icon name="arrow-left" size={16} /> Zurück
        </Link>
        <div className="flex items-center gap-4">
          <Icon name="car" size={32} className="text-accent-light" />
          <div className="flex-1">
            <h1 className="page-title font-mono">{vehicle.plate}</h1>
            <p className="text-sm text-text-secondary">{vehicle.brand} {vehicle.model} · {vehicle.color}</p>
          </div>
          {vehicle.isWanted && (
            <div className="flex items-center gap-2 text-danger">
              <Icon name="alert" size={20} />
              <span className="font-medium">Fahndung aktiv</span>
            </div>
          )}
          {permissions.editVehicles && (
            <Button variant="secondary" size="sm" onClick={() => openEdit(vehicle)}>
              Bearbeiten
            </Button>
          )}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="Fahrzeugdaten">
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-text-muted">Kennzeichen</dt><dd className="font-mono text-text-primary">{vehicle.plate}</dd></div>
              <div className="flex justify-between"><dt className="text-text-muted">Marke / Modell</dt><dd className="text-text-primary">{vehicle.brand} {vehicle.model}</dd></div>
              <div className="flex justify-between"><dt className="text-text-muted">Farbe</dt><dd className="text-text-primary">{vehicle.color}</dd></div>
              <div className="flex justify-between items-center"><dt className="text-text-muted">Versicherung</dt><dd><StatusBadge status={vehicle.insuranceStatus} /></dd></div>
              <div className="flex justify-between items-center"><dt className="text-text-muted">Zulassung</dt><dd><StatusBadge status={vehicle.registrationStatus} /></dd></div>
              <div className="flex justify-between"><dt className="text-text-muted">Registriert am</dt><dd className="text-text-primary">{vehicle.registeredAt}</dd></div>
            </dl>
          </Card>
          <Card title="Fahrzeughalter">
            {owner && (
              <Link to={`/personen/${owner.id}`} className="block rounded-lg bg-surface-tertiary/40 p-4 hover:bg-surface-hover/60">
                <p className="font-medium text-text-primary">{owner.firstName} {owner.lastName}</p>
                <p className="text-xs text-text-secondary">{owner.address}, {owner.city}</p>
              </Link>
            )}
          </Card>
          <Card title="Verknüpfte Fälle" className="lg:col-span-2">
            {linkedCases.length === 0 ? (
              <EmptyState icon="car" title="Keine verknüpften Fälle" />
            ) : (
              linkedCases.map((c) => (
                <Link key={c!.id} to={`/akten/${c!.id}`} className="block rounded-lg bg-surface-tertiary/40 p-3 mb-2 hover:bg-surface-hover/60">
                  <span className="font-mono text-xs text-accent-light">{c!.caseNumber}</span>
                  <p className="text-sm text-text-primary">{c!.title}</p>
                </Link>
              ))
            )}
          </Card>
        </div>

        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Fahrzeug bearbeiten" size="md">
          <VehicleForm form={form} setForm={setForm} persons={persons} isSaving={isSaving} onSubmit={handleSubmit} onCancel={() => setShowModal(false)} submitLabel="Speichern" />
        </Modal>
      </div>
    );
  }

  const filtered = vehicles.filter((v) => {
    const q = search.toLowerCase();
    return v.plate.toLowerCase().includes(q) || v.model.toLowerCase().includes(q) || v.brand.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="page-title">Fahrzeuganmeldung</h1>
          <p className="page-subtitle">{vehicles.length} Fahrzeuge registriert</p>
        </div>
        {permissions.editVehicles && (
          <Button onClick={openCreate} disabled={persons.length === 0}>
            <Icon name="plus" size={16} /> Fahrzeug anmelden
          </Button>
        )}
      </div>
      {persons.length === 0 && permissions.editVehicles && (
        <p className="text-sm text-text-secondary">Legen Sie zuerst eine Person an, bevor Sie ein Fahrzeug registrieren.</p>
      )}
      <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Kennzeichen, Marke oder Modell..." />
      <div className="grid gap-3 md:grid-cols-2">
        {filtered.map((v) => {
          const owner = getPerson(v.ownerId);
          return (
            <Link
              key={v.id}
              to={`/fahrzeuge/${v.id}`}
              className={`rounded-xl border p-5 transition-all hover:border-accent/30 ${
                v.isWanted ? 'border-danger/30 bg-danger/5' : 'border-border bg-surface-card/60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-lg text-accent-light">{v.plate}</span>
                  <p className="mt-1 text-sm text-text-primary">{v.brand} {v.model}</p>
                  <p className="text-xs text-text-secondary">{v.color}</p>
                </div>
                <div className="flex flex-col gap-1 items-end">
                  <StatusBadge status={v.registrationStatus} />
                  {v.isWanted && <Badge variant="red">Fahndung</Badge>}
                </div>
              </div>
              <p className="mt-3 text-xs text-text-secondary">
                Halter: {owner ? `${owner.firstName} ${owner.lastName}` : 'Unbekannt'}
              </p>
            </Link>
          );
        })}
      </div>
      {filtered.length === 0 && (
        <Card><EmptyState icon="car" title="Keine Fahrzeuge gefunden" /></Card>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Fahrzeug anmelden" size="md">
        <VehicleForm form={form} setForm={setForm} persons={persons} isSaving={isSaving} onSubmit={handleSubmit} onCancel={() => setShowModal(false)} submitLabel="Anmelden" />
      </Modal>
    </div>
  );
}

function VehicleForm({
  form,
  setForm,
  persons,
  isSaving,
  onSubmit,
  onCancel,
  submitLabel,
}: {
  form: { plate: string; ownerId: string; brand: string; model: string; color: string; insuranceStatus: InsuranceStatus; registrationStatus: RegistrationStatus };
  setForm: (f: typeof form) => void;
  persons: { id: string; firstName: string; lastName: string }[];
  isSaving: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  submitLabel: string;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <Input label="Kennzeichen *" value={form.plate} onChange={(e) => setForm({ ...form, plate: e.target.value })} placeholder="LS-AB 1234" />
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-text-secondary">Fahrzeughalter *</label>
        <select
          value={form.ownerId}
          onChange={(e) => setForm({ ...form, ownerId: e.target.value })}
          className="w-full rounded-lg border border-border bg-surface-tertiary/60 px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
        >
          <option value="">Bitte wählen…</option>
          {persons.map((p) => (
            <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
          ))}
        </select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Marke *" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="Benefactor" />
        <Input label="Modell *" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} placeholder="Schafter" />
      </div>
      <Input label="Farbe *" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} placeholder="Schwarz" />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-text-secondary">Versicherung</label>
          <select
            value={form.insuranceStatus}
            onChange={(e) => setForm({ ...form, insuranceStatus: e.target.value as InsuranceStatus })}
            className="w-full rounded-lg border border-border bg-surface-tertiary/60 px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
          >
            <option value="gültig">Gültig</option>
            <option value="abgelaufen">Abgelaufen</option>
            <option value="unbekannt">Unbekannt</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-text-secondary">Zulassung</label>
          <select
            value={form.registrationStatus}
            onChange={(e) => setForm({ ...form, registrationStatus: e.target.value as RegistrationStatus })}
            className="w-full rounded-lg border border-border bg-surface-tertiary/60 px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
          >
            <option value="zugelassen">Zugelassen</option>
            <option value="abgemeldet">Abgemeldet</option>
            <option value="gesperrt">Gesperrt</option>
          </select>
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">Abbrechen</Button>
        <Button type="submit" className="flex-1" disabled={isSaving}>{isSaving ? 'Speichern…' : submitLabel}</Button>
      </div>
    </form>
  );
}
