import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  MapPin,
  Phone,
  AlertTriangle,
  Car,
  Crosshair,
  Radio,
  MessageSquare,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Card, Button, StatusBadge, Badge, Input, EmptyState } from '../components/ui';

export default function PersonDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { getPerson, getVehicle, getWeapon, operations, addPersonNote } = useData();
  const { currentOfficer, permissions } = useAuth();
  const [newNote, setNewNote] = useState('');

  const person = getPerson(id!);
  if (!person) {
    return (
      <div className="text-center py-20">
        <p className="text-police-400">Person nicht gefunden</p>
        <Link to="/personen" className="mt-4 text-police-accent hover:underline text-sm">
          Zurück zur Übersicht
        </Link>
      </div>
    );
  }

  const linkedVehicles = person.linkedVehicleIds.map((vid) => getVehicle(vid)).filter(Boolean);
  const linkedWeapons = person.linkedWeaponIds.map((wid) => getWeapon(wid)).filter(Boolean);
  const opHistory = operations.filter((o) => person.operationHistoryIds.includes(o.id));

  const handleAddNote = () => {
    if (!newNote.trim() || !permissions.editPersons) return;
    addPersonNote(person.id, {
      officerId: currentOfficer.id,
      officerName: currentOfficer.name,
      date: new Date().toISOString().split('T')[0],
      content: newNote.trim(),
    });
    setNewNote('');
  };

  return (
    <div className="space-y-6">
      <Link to="/personen" className="inline-flex items-center gap-2 text-sm text-police-400 hover:text-police-accent">
        <ArrowLeft className="h-4 w-4" /> Zurück
      </Link>

      <div className="flex items-start gap-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-police-800 border border-police-700/50">
          <User className="h-10 w-10 text-police-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-police-50">
            {person.firstName} {person.lastName}
          </h1>
          <p className="text-sm text-police-400">Personen-ID: {person.id}</p>
          {person.arrestWarrants.some((w) => w.active) && (
            <div className="mt-2 flex items-center gap-2 text-red-400">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">Aktiver Haftbefehl</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Stammdaten">
          <dl className="space-y-3">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-police-500" />
              <div>
                <dt className="text-xs text-police-500">Geburtsdatum</dt>
                <dd className="text-sm text-police-100">
                  {new Date(person.dateOfBirth).toLocaleDateString('de-DE')}
                </dd>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-police-500" />
              <div>
                <dt className="text-xs text-police-500">Adresse</dt>
                <dd className="text-sm text-police-100">
                  {person.address}, {person.city}
                </dd>
              </div>
            </div>
            {person.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-police-500" />
                <div>
                  <dt className="text-xs text-police-500">Telefon</dt>
                  <dd className="text-sm text-police-100">{person.phone}</dd>
                </div>
              </div>
            )}
          </dl>
        </Card>

        <Card title="Offene Haftbefehle">
          {person.arrestWarrants.filter((w) => w.active).length === 0 ? (
            <p className="text-sm text-police-500">Keine aktiven Haftbefehle</p>
          ) : (
            <div className="space-y-3">
              {person.arrestWarrants
                .filter((w) => w.active)
                .map((w) => (
                  <div key={w.id} className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
                    <p className="text-sm font-medium text-red-300">{w.reason}</p>
                    <p className="mt-1 text-xs text-police-400">
                      Ausgestellt: {new Date(w.issuedDate).toLocaleDateString('de-DE')} · {w.issuingJudge}
                    </p>
                  </div>
                ))}
            </div>
          )}
        </Card>

        <Card title="Vorstrafen">
          {person.priorConvictions.length === 0 ? (
            <p className="text-sm text-police-500">Keine Vorstrafen registriert</p>
          ) : (
            <div className="space-y-2">
              {person.priorConvictions.map((pc) => (
                <div key={pc.id} className="flex justify-between rounded-lg bg-police-800/40 px-4 py-3">
                  <div>
                    <p className="text-sm text-police-100">{pc.offense}</p>
                    <p className="text-xs text-police-400">{pc.sentence}</p>
                  </div>
                  <span className="text-xs text-police-500">
                    {new Date(pc.date).toLocaleDateString('de-DE')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="Verknüpfte Fahrzeuge">
          {linkedVehicles.length === 0 ? (
            <EmptyState icon={Car} title="Keine Fahrzeuge verknüpft" />
          ) : (
            <div className="space-y-2">
              {linkedVehicles.map((v) => (
                <Link
                  key={v!.id}
                  to={`/fahrzeuge/${v!.id}`}
                  className="flex items-center justify-between rounded-lg bg-police-800/40 px-4 py-3 hover:bg-police-800/60"
                >
                  <div>
                    <span className="font-mono text-sm text-police-accent">{v!.plate}</span>
                    <p className="text-xs text-police-400">
                      {v!.brand} {v!.model} · {v!.color}
                    </p>
                  </div>
                  {v!.isWanted && <StatusBadge status="gesucht" />}
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card title="Verknüpfte Waffen">
          {linkedWeapons.length === 0 ? (
            <EmptyState icon={Crosshair} title="Keine Waffen verknüpft" />
          ) : (
            <div className="space-y-2">
              {linkedWeapons.map((w) => (
                <Link
                  key={w!.id}
                  to={`/waffen/${w!.id}`}
                  className="flex items-center justify-between rounded-lg bg-police-800/40 px-4 py-3 hover:bg-police-800/60"
                >
                  <div>
                    <span className="font-mono text-sm text-police-accent">{w!.serialNumber}</span>
                    <p className="text-xs text-police-400">
                      {w!.type} · {w!.caliber}
                    </p>
                  </div>
                  <StatusBadge status={w!.licenseStatus} />
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card title="Einsatzhistorie">
          {opHistory.length === 0 ? (
            <EmptyState icon={Radio} title="Keine Einsätze" />
          ) : (
            <div className="space-y-2">
              {opHistory.map((op) => (
                <Link
                  key={op.id}
                  to={`/einsaetze/${op.id}`}
                  className="block rounded-lg bg-police-800/40 px-4 py-3 hover:bg-police-800/60"
                >
                  <span className="font-mono text-xs text-police-accent">{op.code}</span>
                  <p className="text-sm text-police-100">{op.title}</p>
                  <StatusBadge status={op.status} />
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card title="Beamtennotizen">
        <div className="space-y-4">
          {person.notes.map((note) => (
            <div key={note.id} className="rounded-lg border border-police-700/30 bg-police-800/30 p-4">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-3.5 w-3.5 text-police-500" />
                <span className="text-xs font-medium text-police-300">{note.officerName}</span>
                <Badge variant="gray">{note.date}</Badge>
              </div>
              <p className="text-sm text-police-200">{note.content}</p>
            </div>
          ))}

          {permissions.editPersons && (
            <div className="flex gap-3 pt-2">
              <Input
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Neue Notiz hinzufügen..."
                className="flex-1"
              />
              <Button onClick={handleAddNote} disabled={!newNote.trim()}>
                Speichern
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
