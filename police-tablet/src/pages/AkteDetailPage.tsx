import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Icon from '../components/icons/Icon';
import PersonSelect from '../components/cases/PersonSelect';
import EvidenceForm from '../components/cases/EvidenceForm';
import EvidenceItem from '../components/cases/EvidenceItem';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useNotifyAction } from '../hooks/useNotifyAction';
import {
  Card,
  Button,
  StatusBadge,
  Badge,
  Input,
  Select,
  Modal,
  Tabs,
  EmptyState,
} from '../components/ui';
import { PARTICIPANT_ROLE_OPTIONS } from '../types';

export default function AkteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const {
    getCase,
    getPerson,
    getVehicle,
    persons,
    updateCaseStatus,
    addCaseEvidence,
    addCaseWitness,
    addCaseParticipant,
    addCaseNote,
    ensureCaseDetail,
  } = useData();
  const { currentOfficer, permissions } = useAuth();
  const { run, warn } = useNotifyAction();

  const [activeTab, setActiveTab] = useState('overview');
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [showWitnessModal, setShowWitnessModal] = useState(false);
  const [showParticipantModal, setShowParticipantModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);

  const [witnessForm, setWitnessForm] = useState({ name: '', phone: '', statement: '' });
  const [participantForm, setParticipantForm] = useState({ personId: '', role: 'verdächtig' as const });
  const [noteForm, setNoteForm] = useState('');

  useEffect(() => {
    if (id) void ensureCaseDetail(id);
  }, [id, ensureCaseDetail]);

  if (!currentOfficer) return null;

  const caseFile = getCase(id!);
  if (!caseFile) {
    return (
      <div className="text-center py-20">
        <p className="text-text-secondary">Akte nicht gefunden</p>
        <Link to="/akten" className="mt-4 text-accent hover:underline text-sm">Zurück</Link>
      </div>
    );
  }

  const linkedVehicles = caseFile.linkedVehicleIds.map((vid) => getVehicle(vid)).filter(Boolean);

  const tabs = [
    { id: 'overview', label: 'Übersicht' },
    { id: 'evidence', label: `Beweise (${caseFile.evidence.length})` },
    { id: 'witnesses', label: `Zeugen (${caseFile.witnesses.length})` },
    { id: 'participants', label: `Beteiligte (${caseFile.participants.length})` },
    { id: 'notes', label: 'Interne Notizen' },
  ];

  return (
    <div className="space-y-6">
      <Link to="/akten" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-accent">
        <Icon name="arrow-left" size={16} /> Zurück
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-lg text-accent-light">{caseFile.caseNumber}</span>
            <StatusBadge status={caseFile.status} />
          </div>
          <h1 className="mt-1 page-title">{caseFile.title}</h1>
          <p className="text-sm text-text-secondary">
            {caseFile.offense} · Zuständig: {caseFile.assignedOfficerName} · Erstellt: {caseFile.createdAt}
          </p>
        </div>
        {permissions.editCases && (
          <Select
            label="Status ändern"
            value={caseFile.status}
            onChange={async (e) => {
              await run(
                () => updateCaseStatus(caseFile.id, e.target.value as typeof caseFile.status),
                { success: 'Status aktualisiert.' }
              );
            }}
            options={[
              { value: 'offen', label: 'Offen' },
              { value: 'in_bearbeitung', label: 'In Bearbeitung' },
              { value: 'abgeschlossen', label: 'Abgeschlossen' },
            ]}
          />
        )}
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'overview' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="Beschreibung">
            <p className="text-sm text-text-primary leading-relaxed">{caseFile.description}</p>
          </Card>
          <Card title="Verknüpfte Fahrzeuge">
            {linkedVehicles.length === 0 ? (
              <EmptyState icon="car" title="Keine Fahrzeuge" />
            ) : (
              linkedVehicles.map((v) => (
                <Link key={v!.id} to={`/fahrzeuge/${v!.id}`} className="block rounded-lg bg-surface-tertiary/40 p-3 mb-2">
                  <span className="font-mono text-accent-light">{v!.plate}</span>
                  <p className="text-xs text-text-secondary">{v!.brand} {v!.model}</p>
                </Link>
              ))
            )}
          </Card>
        </div>
      )}

      {activeTab === 'evidence' && (
        <Card
          title="Beweismittel"
          action={
            permissions.editCases && (
              <Button size="sm" onClick={() => setShowEvidenceModal(true)}>
                <Icon name="upload" size={14} /> Beweis hinzufügen
              </Button>
            )
          }
        >
          {caseFile.evidence.length === 0 ? (
            <EmptyState icon="file" title="Keine Beweise" description="Link oder Datei als Beweismittel hinterlegen." />
          ) : (
            <div className="space-y-3">
              {caseFile.evidence.map((ev) => (
                <EvidenceItem key={ev.id} evidence={ev} />
              ))}
            </div>
          )}
        </Card>
      )}

      {activeTab === 'witnesses' && (
        <Card
          title="Zeugen"
          action={
            permissions.editCases && (
              <Button size="sm" onClick={() => setShowWitnessModal(true)}>
                <Icon name="eye" size={14} /> Zeuge eintragen
              </Button>
            )
          }
        >
          {caseFile.witnesses.length === 0 ? (
            <EmptyState icon="eye" title="Keine Zeugen" />
          ) : (
            caseFile.witnesses.map((w) => (
              <div key={w.id} className="rounded-lg bg-surface-tertiary/40 p-4 mb-3">
                <p className="font-medium text-text-primary">{w.name}</p>
                <p className="text-xs text-text-secondary">{w.phone}</p>
                <p className="mt-2 text-sm text-text-primary">{w.statement}</p>
              </div>
            ))
          )}
        </Card>
      )}

      {activeTab === 'participants' && (
        <Card
          title="Beteiligte Personen"
          action={
            permissions.editCases && (
              <Button size="sm" onClick={() => setShowParticipantModal(true)}>
                <Icon name="users" size={14} /> Person hinzufügen
              </Button>
            )
          }
        >
          {caseFile.participants.length === 0 ? (
            <EmptyState icon="users" title="Keine Beteiligten" />
          ) : (
            caseFile.participants.map((p, i) => {
              const person = getPerson(p.personId);
              return (
                <Link
                  key={i}
                  to={`/personen/${p.personId}`}
                  className="flex items-center justify-between rounded-lg bg-surface-tertiary/40 p-4 mb-2 hover:bg-surface-hover/60"
                >
                  <span className="text-sm text-text-primary">
                    {person ? `${person.firstName} ${person.lastName}` : p.personId}
                  </span>
                  <Badge variant="blue">{p.role}</Badge>
                </Link>
              );
            })
          )}
        </Card>
      )}

      {activeTab === 'notes' && (
        <Card
          title="Interne Notizen"
          action={
            permissions.editCases && (
              <Button size="sm" onClick={() => setShowNoteModal(true)}>
                <Icon name="message" size={14} /> Notiz
              </Button>
            )
          }
        >
          {caseFile.internalNotes.length === 0 ? (
            <EmptyState icon="message" title="Keine Notizen" />
          ) : (
            caseFile.internalNotes.map((n) => (
              <div key={n.id} className="rounded-lg border border-border p-4 mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-text-secondary">{n.officerName}</span>
                  <Badge variant="gray">{n.date}</Badge>
                </div>
                <p className="text-sm text-text-primary">{n.content}</p>
              </div>
            ))
          )}
        </Card>
      )}

      <Modal isOpen={showEvidenceModal} onClose={() => setShowEvidenceModal(false)} title="Beweis hinzufügen">
        {showEvidenceModal && (
          <EvidenceForm
            onCancel={() => setShowEvidenceModal(false)}
            onSubmit={async (values) => {
            const result = await run(
              () =>
                addCaseEvidence(caseFile.id, {
                  ...values,
                  uploadedBy: currentOfficer.name,
                  uploadedAt: new Date().toISOString().split('T')[0],
                }),
              { success: 'Beweis gespeichert.' }
            );
            if (result.ok) {
              setShowEvidenceModal(false);
            }
          }}
          />
        )}
      </Modal>

      <Modal isOpen={showWitnessModal} onClose={() => setShowWitnessModal(false)} title="Zeuge eintragen">
        <div className="space-y-4">
          <Input label="Name" value={witnessForm.name} onChange={(e) => setWitnessForm({ ...witnessForm, name: e.target.value })} />
          <Input label="Telefon" value={witnessForm.phone} onChange={(e) => setWitnessForm({ ...witnessForm, phone: e.target.value })} />
          <Input label="Aussage" value={witnessForm.statement} onChange={(e) => setWitnessForm({ ...witnessForm, statement: e.target.value })} />
          <Button
            className="w-full"
            onClick={async () => {
              if (!witnessForm.name.trim()) {
                warn('Bitte einen Namen angeben.');
                return;
              }
              const result = await run(
                () => addCaseWitness(caseFile.id, witnessForm),
                { success: 'Zeuge eingetragen.' }
              );
              if (result.ok) {
                setWitnessForm({ name: '', phone: '', statement: '' });
                setShowWitnessModal(false);
              }
            }}
          >
            Speichern
          </Button>
        </div>
      </Modal>

      <Modal isOpen={showParticipantModal} onClose={() => setShowParticipantModal(false)} title="Beteiligte Person">
        <div className="space-y-4">
          <PersonSelect
            label="Person aus dem System"
            persons={persons}
            value={participantForm.personId}
            onChange={(personId) => setParticipantForm({ ...participantForm, personId })}
            excludeIds={caseFile.participants.map((p) => p.personId)}
          />
          <Select
            label="Rolle"
            value={participantForm.role}
            onChange={(e) => setParticipantForm({ ...participantForm, role: e.target.value as typeof participantForm.role })}
            options={PARTICIPANT_ROLE_OPTIONS}
          />
          <Button
            className="w-full"
            onClick={async () => {
              if (!participantForm.personId) {
                warn('Bitte eine Person auswählen.');
                return;
              }
              const result = await run(
                () => addCaseParticipant(caseFile.id, participantForm),
                { success: 'Beteiligter hinzugefügt.' }
              );
              if (result.ok) {
                setParticipantForm({ personId: '', role: 'verdächtig' });
                setShowParticipantModal(false);
              }
            }}
          >
            Hinzufügen
          </Button>
        </div>
      </Modal>

      <Modal isOpen={showNoteModal} onClose={() => setShowNoteModal(false)} title="Interne Notiz">
        <div className="space-y-4">
          <Input label="Notiz" value={noteForm} onChange={(e) => setNoteForm(e.target.value)} />
          <Button
            className="w-full"
            onClick={async () => {
              if (!noteForm.trim()) {
                warn('Bitte eine Notiz eingeben.');
                return;
              }
              const result = await run(
                () =>
                  addCaseNote(caseFile.id, {
                    officerId: currentOfficer.id,
                    officerName: currentOfficer.name,
                    date: new Date().toISOString().split('T')[0],
                    content: noteForm.trim(),
                  }),
                { success: 'Notiz gespeichert.' }
              );
              if (result.ok) {
                setNoteForm('');
                setShowNoteModal(false);
              }
            }}
          >
            Speichern
          </Button>
        </div>
      </Modal>
    </div>
  );
}
