import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { IconName } from '../components/icons/Icon';
import Icon from '../components/icons/Icon';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useNotify } from '../context/NotifyContext';
import { UNITS } from '../types';
import { Card, SearchBar, StatusBadge, Tabs, Badge, EmptyState, Button, Modal, Input } from '../components/ui';
import type { WantedType, WantedPriority } from '../types';

const typeIcons: Record<WantedType, IconName> = { person: 'user', fahrzeug: 'car', waffe: 'crosshair' };
const typeLabels = { person: 'Personenfahndung', fahrzeug: 'Fahrzeugfahndung', waffe: 'Waffenfahndung' };

export default function FahndungPage() {
  const { wanted, persons, vehicles, weapons, createWanted, updateWanted } = useData();
  const { permissions, currentOfficer } = useAuth();
  const { notify } = useNotify();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<WantedType | 'all'>('all');
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    type: 'person' as WantedType,
    targetId: '',
    priority: 'mittel' as WantedPriority,
    description: '',
    lastKnownLocation: '',
    responsibleUnit: currentOfficer?.unit ?? UNITS[0],
  });

  const active = wanted.filter((w) => w.active);
  const filtered = active.filter((w) => {
    const q = search.toLowerCase();
    const matchSearch = w.targetName.toLowerCase().includes(q) || w.description.toLowerCase().includes(q);
    const matchType = typeFilter === 'all' || w.type === typeFilter;
    return matchSearch && matchType;
  });

  const tabs = [
    { id: 'all', label: `Alle (${active.length})` },
    { id: 'person', label: `Personen (${active.filter((w) => w.type === 'person').length})` },
    { id: 'fahrzeug', label: `Fahrzeuge (${active.filter((w) => w.type === 'fahrzeug').length})` },
    { id: 'waffe', label: `Waffen (${active.filter((w) => w.type === 'waffe').length})` },
  ];

  const getDetailLink = (w: typeof wanted[0]) => {
    if (w.type === 'person') return `/personen/${w.targetId}`;
    if (w.type === 'fahrzeug') return `/fahrzeuge/${w.targetId}`;
    return `/waffen/${w.targetId}`;
  };

  const getTargetsForType = (type: WantedType) => {
    if (type === 'person') return persons.map((p) => ({ id: p.id, name: `${p.firstName} ${p.lastName}` }));
    if (type === 'fahrzeug') return vehicles.map((v) => ({ id: v.id, name: v.plate }));
    return weapons.map((w) => ({ id: w.id, name: w.serialNumber }));
  };

  const openCreate = () => {
    const targets = getTargetsForType('person');
    setForm({
      type: 'person',
      targetId: targets[0]?.id ?? '',
      priority: 'mittel',
      description: '',
      lastKnownLocation: '',
      responsibleUnit: currentOfficer?.unit ?? UNITS[0],
    });
    setShowModal(true);
  };

  const handleTypeChange = (type: WantedType) => {
    const targets = getTargetsForType(type);
    setForm((prev) => ({ ...prev, type, targetId: targets[0]?.id ?? '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.targetId || !form.description.trim()) {
      notify('Bitte Ziel und Beschreibung angeben.', 'warning');
      return;
    }
    const targets = getTargetsForType(form.type);
    const target = targets.find((t) => t.id === form.targetId);
    if (!target) {
      notify('Ziel nicht gefunden.', 'error');
      return;
    }
    setIsSaving(true);
    try {
      await createWanted({
        type: form.type,
        targetId: form.targetId,
        targetName: target.name,
        priority: form.priority,
        description: form.description.trim(),
        lastKnownLocation: form.lastKnownLocation.trim() || 'Unbekannt',
        responsibleUnit: form.responsibleUnit,
      });
      setShowModal(false);
      notify('Fahndung erstellt.', 'success');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Speichern fehlgeschlagen.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeactivate = async (entryId: string) => {
    try {
      await updateWanted(entryId, { active: false });
      notify('Fahndung beendet.', 'success');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Aktion fehlgeschlagen.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="page-title">Fahndungssystem</h1>
          <p className="page-subtitle">{active.length} aktive Fahndungen</p>
        </div>
        {permissions.editWanted && (
          <Button onClick={openCreate}>
            <Icon name="plus" size={16} /> Fahndung erstellen
          </Button>
        )}
      </div>

      <Tabs
        tabs={tabs}
        activeTab={typeFilter}
        onChange={(id) => setTypeFilter(id as WantedType | 'all')}
      />

      <SearchBar value={search} onChange={setSearch} placeholder="Name, Kennzeichen oder Beschreibung..." />

      {filtered.length === 0 ? (
        <Card><EmptyState icon="search" title="Keine Fahndungen gefunden" /></Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((w) => {
            const iconName = typeIcons[w.type];
            const isCritical = w.priority === 'kritisch' || w.priority === 'hoch';
            return (
              <div
                key={w.id}
                className={`rounded-xl border p-5 transition-all ${
                  isCritical ? 'border-danger/30 bg-danger/5' : 'border-border bg-surface-card/60'
                }`}
              >
                <div className="flex items-start gap-4">
                  <Link to={getDetailLink(w)} className="flex flex-1 items-start gap-4 hover:opacity-90">
                    <div className={`rounded-lg p-3 ${isCritical ? 'bg-danger/10' : 'bg-surface-tertiary/60'}`}>
                      <Icon
                        name={iconName}
                        size={20}
                        className={isCritical ? 'text-danger' : 'text-accent-light'}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="blue">{typeLabels[w.type]}</Badge>
                        <StatusBadge status={w.priority} />
                        {isCritical && (
                          <span className="flex items-center gap-1 text-xs text-danger">
                            <Icon name="alert" size={12} /> Vorsicht
                          </span>
                        )}
                      </div>
                      <h3 className="mt-2 text-lg font-semibold text-text-primary">{w.targetName}</h3>
                      <p className="mt-1 text-sm text-text-secondary">{w.description}</p>
                      <div className="mt-3 flex flex-wrap gap-4 text-xs text-text-secondary">
                        <span className="flex items-center gap-1">
                          <Icon name="map-pin" size={12} /> {w.lastKnownLocation}
                        </span>
                        <span>Einheit: {w.responsibleUnit}</span>
                        <span>Ausgestellt: {new Date(w.issuedAt).toLocaleDateString('de-DE')}</span>
                      </div>
                    </div>
                  </Link>
                  {permissions.editWanted && (
                    <Button variant="ghost" size="sm" onClick={() => handleDeactivate(w.id)} className="text-danger shrink-0">
                      Beenden
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Fahndung erstellen" size="md">
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-text-secondary">Fahndungstyp *</label>
            <select
              value={form.type}
              onChange={(e) => handleTypeChange(e.target.value as WantedType)}
              className="w-full rounded-lg border border-border bg-surface-tertiary/60 px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
            >
              <option value="person">Person</option>
              <option value="fahrzeug">Fahrzeug</option>
              <option value="waffe">Waffe</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-text-secondary">Ziel *</label>
            <select
              value={form.targetId}
              onChange={(e) => setForm({ ...form, targetId: e.target.value })}
              className="w-full rounded-lg border border-border bg-surface-tertiary/60 px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
            >
              {getTargetsForType(form.type).length === 0 ? (
                <option value="">Keine Einträge verfügbar</option>
              ) : (
                getTargetsForType(form.type).map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))
              )}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-text-secondary">Priorität</label>
            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value as WantedPriority })}
              className="w-full rounded-lg border border-border bg-surface-tertiary/60 px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
            >
              <option value="niedrig">Niedrig</option>
              <option value="mittel">Mittel</option>
              <option value="hoch">Hoch</option>
              <option value="kritisch">Kritisch</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-text-secondary">Beschreibung *</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full rounded-lg border border-border bg-surface-tertiary/60 px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
              placeholder="Grund der Fahndung..."
            />
          </div>
          <Input
            label="Letzter bekannter Ort"
            value={form.lastKnownLocation}
            onChange={(e) => setForm({ ...form, lastKnownLocation: e.target.value })}
            placeholder="Unbekannt"
          />
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-text-secondary">Zuständige Einheit</label>
            <select
              value={form.responsibleUnit}
              onChange={(e) => setForm({ ...form, responsibleUnit: e.target.value })}
              className="w-full rounded-lg border border-border bg-surface-tertiary/60 px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
            >
              {UNITS.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setShowModal(false)} className="flex-1">Abbrechen</Button>
            <Button type="submit" className="flex-1" disabled={isSaving || getTargetsForType(form.type).length === 0}>
              {isSaving ? 'Speichern…' : 'Erstellen'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
