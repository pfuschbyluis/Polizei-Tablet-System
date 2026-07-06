import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { OFFENSES } from '../types';
import { OFFICERS } from '../data/mockData';
import { Card, Button, Input, Select } from '../components/ui';

export default function AkteCreatePage() {
  const navigate = useNavigate();
  const { createCase } = useData();
  const { currentOfficer, permissions } = useAuth();

  const [form, setForm] = useState({
    title: '',
    offense: OFFENSES[0],
    description: '',
    assignedOfficerId: currentOfficer.id,
  });

  if (!permissions.createCases) {
    return (
      <div className="text-center py-20">
        <p className="text-police-400">Keine Berechtigung zum Erstellen von Akten</p>
        <Link to="/akten" className="mt-4 text-police-accent hover:underline text-sm">Zurück</Link>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    const id = createCase({
      title: form.title.trim(),
      offense: form.offense,
      status: 'offen',
      assignedOfficerId: form.assignedOfficerId,
      participants: [],
      evidence: [],
      witnesses: [],
      internalNotes: [],
      linkedVehicleIds: [],
      description: form.description.trim() || 'Keine Beschreibung.',
    });
    navigate(`/akten/${id}`);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link to="/akten" className="inline-flex items-center gap-2 text-sm text-police-400 hover:text-police-accent">
        <ArrowLeft className="h-4 w-4" /> Zurück
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-police-50">Neue Akte erstellen</h1>
        <p className="mt-1 text-sm text-police-400">Ermittlungsakte anlegen</p>
      </div>

      <Card title="Akteninformationen">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Titel"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="z.B. Raubüberfall Juwelier..."
            required
          />
          <Select
            label="Tatvorwurf"
            value={form.offense}
            onChange={(e) => setForm({ ...form, offense: e.target.value })}
            options={OFFENSES.map((o) => ({ value: o, label: o }))}
          />
          <Select
            label="Zuständiger Beamter"
            value={form.assignedOfficerId}
            onChange={(e) => setForm({ ...form, assignedOfficerId: e.target.value })}
            options={OFFICERS.filter((o) => o.rank === 'ermittler' || o.rank === 'admin').map((o) => ({
              value: o.id,
              label: o.name,
            }))}
          />
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-police-300">Beschreibung</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              className="w-full rounded-lg border border-police-600/50 bg-police-800/80 px-3 py-2 text-sm text-police-100 placeholder:text-police-500 focus:border-police-accent focus:outline-none focus:ring-1 focus:ring-police-accent/50"
              placeholder="Sachverhalt beschreiben..."
            />
          </div>
          <Button type="submit" className="w-full">
            Akte anlegen
          </Button>
        </form>
      </Card>
    </div>
  );
}
