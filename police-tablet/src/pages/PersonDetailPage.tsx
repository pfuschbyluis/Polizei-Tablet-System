import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Icon from '../components/icons/Icon';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Card, Button, StatusBadge, Badge, Input, EmptyState } from '../components/ui';

export default function PersonDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { getPerson, getVehicle, getWeapon, addPersonNote } = useData();
  const { currentOfficer, permissions } = useAuth();
  const [newNote, setNewNote] = useState('');

  if (!currentOfficer) return null;

  const person = getPerson(id!);
  if (!person) {
    return (
      <div className="text-center py-20">
        <p className="text-text-secondary">Person nicht gefunden</p>
        <Link to="/personen" className="mt-4 text-accent hover:underline text-sm">
          Zurück zur Übersicht
        </Link>
      </div>
    );
  }

  const linkedVehicles = person.linkedVehicleIds.map((vid) => getVehicle(vid)).filter(Boolean);
  const linkedWeapons = person.linkedWeaponIds.map((wid) => getWeapon(wid)).filter(Boolean);

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
      <Link to="/personen" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-accent">
        <Icon name="arrow-left" size={16} /> Zurück
      </Link>

      <div className="flex items-start gap-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-surface-tertiary border border-border">
          <Icon name="user" size={40} className="text-text-muted" />
        </div>
        <div>
          <h1 className="page-title">
            {person.firstName} {person.lastName}
          </h1>
          <p className="text-sm text-text-secondary">Personen-ID: {person.id}</p>
          {person.arrestWarrants.some((w) => w.active) && (
            <div className="mt-2 flex items-center gap-2 text-danger">
              <Icon name="alert" size={16} />
              <span className="text-sm font-medium">Aktiver Haftbefehl</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Stammdaten">
          <dl className="space-y-3">
            <div className="flex items-center gap-3">
              <Icon name="user" size={16} className="text-text-muted" />
              <div>
                <dt className="text-xs text-text-muted">Geburtsdatum</dt>
                <dd className="text-sm text-text-primary">
                  {new Date(person.dateOfBirth).toLocaleDateString('de-DE')}
                </dd>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Icon name="map-pin" size={16} className="text-text-muted" />
              <div>
                <dt className="text-xs text-text-muted">Adresse</dt>
                <dd className="text-sm text-text-primary">
                  {person.address}, {person.city}
                </dd>
              </div>
            </div>
            {person.phone && (
              <div className="flex items-center gap-3">
                <Icon name="phone" size={16} className="text-text-muted" />
                <div>
                  <dt className="text-xs text-text-muted">Telefon</dt>
                  <dd className="text-sm text-text-primary">{person.phone}</dd>
                </div>
              </div>
            )}
          </dl>
        </Card>

        <Card title="Offene Haftbefehle">
          {person.arrestWarrants.filter((w) => w.active).length === 0 ? (
            <p className="text-sm text-text-muted">Keine aktiven Haftbefehle</p>
          ) : (
            <div className="space-y-3">
              {person.arrestWarrants
                .filter((w) => w.active)
                .map((w) => (
                  <div key={w.id} className="rounded-lg border border-danger/20 bg-danger/5 p-4">
                    <p className="text-sm font-medium text-danger">{w.reason}</p>
                    <p className="mt-1 text-xs text-text-secondary">
                      Ausgestellt: {new Date(w.issuedDate).toLocaleDateString('de-DE')} · {w.issuingJudge}
                    </p>
                  </div>
                ))}
            </div>
          )}
        </Card>

        <Card title="Vorstrafen">
          {person.priorConvictions.length === 0 ? (
            <p className="text-sm text-text-muted">Keine Vorstrafen registriert</p>
          ) : (
            <div className="space-y-2">
              {person.priorConvictions.map((pc) => (
                <div key={pc.id} className="flex justify-between rounded-lg bg-surface-tertiary/40 px-4 py-3">
                  <div>
                    <p className="text-sm text-text-primary">{pc.offense}</p>
                    <p className="text-xs text-text-secondary">{pc.sentence}</p>
                  </div>
                  <span className="text-xs text-text-muted">
                    {new Date(pc.date).toLocaleDateString('de-DE')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="Verknüpfte Fahrzeuge">
          {linkedVehicles.length === 0 ? (
            <EmptyState icon="car" title="Keine Fahrzeuge verknüpft" />
          ) : (
            <div className="space-y-2">
              {linkedVehicles.map((v) => (
                <Link
                  key={v!.id}
                  to={`/fahrzeuge/${v!.id}`}
                  className="flex items-center justify-between rounded-lg bg-surface-tertiary/40 px-4 py-3 hover:bg-surface-hover/60"
                >
                  <div>
                    <span className="font-mono text-sm text-accent-light">{v!.plate}</span>
                    <p className="text-xs text-text-secondary">
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
            <EmptyState icon="crosshair" title="Keine Waffen verknüpft" />
          ) : (
            <div className="space-y-2">
              {linkedWeapons.map((w) => (
                <Link
                  key={w!.id}
                  to={`/waffen/${w!.id}`}
                  className="flex items-center justify-between rounded-lg bg-surface-tertiary/40 px-4 py-3 hover:bg-surface-hover/60"
                >
                  <div>
                    <span className="font-mono text-sm text-accent-light">{w!.serialNumber}</span>
                    <p className="text-xs text-text-secondary">
                      {w!.type} · {w!.caliber}
                    </p>
                  </div>
                  <StatusBadge status={w!.licenseStatus} />
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card title="Beamtennotizen">
        <div className="space-y-4">
          {person.notes.map((note) => (
            <div key={note.id} className="rounded-lg border border-border bg-surface-tertiary/30 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="message" size={14} className="text-text-muted" />
                <span className="text-xs font-medium text-text-secondary">{note.officerName}</span>
                <Badge variant="gray">{note.date}</Badge>
              </div>
              <p className="text-sm text-text-primary">{note.content}</p>
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
