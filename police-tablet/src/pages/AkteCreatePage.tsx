import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Icon from '../components/icons/Icon';
import CaseParticipantPicker from '../components/cases/CaseParticipantPicker';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useNotifyAction } from '../hooks/useNotifyAction';
import type { CaseParticipant } from '../types';
import { OFFENSES } from '../types';
import { Card, Button, Input, Select } from '../components/ui';

export default function AkteCreatePage() {
  const navigate = useNavigate();
  const { createCase, persons } = useData();
  const { currentOfficer, permissions } = useAuth();
  const { run, warn } = useNotifyAction();

  const [form, setForm] = useState({
    title: '',
    offense: OFFENSES[0],
    description: '',
  });
  const [participants, setParticipants] = useState<CaseParticipant[]>([]);

  if (!currentOfficer) return null;

  if (!permissions.createCases) {
    return (
      <div className="text-center py-20">
        <p className="text-text-secondary">Keine Berechtigung zum Erstellen von Akten</p>
        <Link to="/akten" className="mt-4 text-accent hover:underline text-sm">Zurück</Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      warn('Bitte einen Titel angeben.');
      return;
    }
    const result = await run(
      () =>
        createCase({
          title: form.title.trim(),
          offense: form.offense,
          status: 'offen',
          assignedOfficerId: currentOfficer.id,
          assignedOfficerName: currentOfficer.name,
          participants,
          evidence: [],
          witnesses: [],
          internalNotes: [],
          linkedVehicleIds: [],
          description: form.description.trim() || 'Keine Beschreibung.',
        }).then((id) => {
          navigate(`/akten/${id}`);
        }),
      { success: 'Akte erfolgreich erstellt.' }
    );
    if (!result.ok) return;
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link to="/akten" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-accent">
        <Icon name="arrow-left" size={16} /> Zurück
      </Link>

      <div>
        <h1 className="page-title">Neue Akte erstellen</h1>
        <p className="page-subtitle">Ermittlungsakte anlegen</p>
      </div>

      <Card title="Akteninformationen">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Titel"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="z.B. Raubüberfall..."
            required
          />
          <Select
            label="Tatvorwurf"
            value={form.offense}
            onChange={(e) => setForm({ ...form, offense: e.target.value })}
            options={OFFENSES.map((o) => ({ value: o, label: o }))}
          />
          <div className="rounded-lg border border-border bg-surface-tertiary/40 px-4 py-3">
            <p className="text-xs text-text-muted">Zuständiger Beamter</p>
            <p className="text-sm font-medium text-text-primary">{currentOfficer.name}</p>
            <p className="text-xs text-text-secondary">{currentOfficer.badgeNumber}</p>
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-text-secondary">Beschreibung</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              className="w-full rounded-lg border border-border bg-surface-tertiary/60 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
              placeholder="Sachverhalt beschreiben..."
            />
          </div>
          <Button type="submit" className="w-full">
            Akte anlegen
          </Button>
        </form>
      </Card>

      <Card title="Beteiligte Personen">
        <p className="mb-4 text-sm text-text-secondary">
          Wählen Sie Personen aus, die bereits im System hinterlegt sind.
        </p>
        <CaseParticipantPicker
          persons={persons}
          participants={participants}
          onChange={setParticipants}
        />
      </Card>
    </div>
  );
}
