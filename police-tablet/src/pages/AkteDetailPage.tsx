import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  Users,
  Upload,
  Eye,
  MessageSquare,
  Car,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
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
  } = useData();
  const { currentOfficer, permissions } = useAuth();

  const [activeTab, setActiveTab] = useState('overview');
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [showWitnessModal, setShowWitnessModal] = useState(false);
  const [showParticipantModal, setShowParticipantModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);

  const [evidenceForm, setEvidenceForm] = useState({ name: '', type: 'Dokument', description: '' });
  const [witnessForm, setWitnessForm] = useState({ name: '', phone: '', statement: '' });
  const [participantForm, setParticipantForm] = useState({ personId: '', role: 'verdächtig' as const });
  const [noteForm, setNoteForm] = useState('');

  if (!currentOfficer) return null;

  const caseFile = getCase(id!);
  if (!caseFile) {
    return (
      <div className="text-center py-20">
        <p className="text-police-400">Akte nicht gefunden</p>
        <Link to="/akten" className="mt-4 text-police-accent hover:underline text-sm">Zurück</Link>
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
      <Link to="/akten" className="inline-flex items-center gap-2 text-sm text-police-400 hover:text-police-accent">
        <ArrowLeft className="h-4 w-4" /> Zurück
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-lg text-police-accent">{caseFile.caseNumber}</span>
            <StatusBadge status={caseFile.status} />
          </div>
          <h1 className="mt-1 text-2xl font-bold text-police-50">{caseFile.title}</h1>
          <p className="text-sm text-police-400">
            {caseFile.offense} · Zuständig: {caseFile.assignedOfficerName} · Erstellt: {caseFile.createdAt}
          </p>
        </div>
        {permissions.editCases && (
          <Select
            label="Status ändern"
            value={caseFile.status}
            onChange={(e) => updateCaseStatus(caseFile.id, e.target.value as typeof caseFile.status)}
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
            <p className="text-sm text-police-200 leading-relaxed">{caseFile.description}</p>
          </Card>
          <Card title="Verknüpfte Fahrzeuge">
            {linkedVehicles.length === 0 ? (
              <EmptyState icon={Car} title="Keine Fahrzeuge" />
            ) : (
              linkedVehicles.map((v) => (
                <Link key={v!.id} to={`/fahrzeuge/${v!.id}`} className="block rounded-lg bg-police-800/40 p-3 mb-2">
                  <span className="font-mono text-police-accent">{v!.plate}</span>
                  <p className="text-xs text-police-400">{v!.brand} {v!.model}</p>
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
                <Upload className="h-3.5 w-3.5" /> Hochladen
              </Button>
            )
          }
        >
          {caseFile.evidence.length === 0 ? (
            <EmptyState icon={FileText} title="Keine Beweise" description="Laden Sie Beweismittel hoch." />
          ) : (
            <div className="space-y-3">
              {caseFile.evidence.map((ev) => (
                <div key={ev.id} className="flex items-start gap-4 rounded-lg bg-police-800/40 p-4">
                  <FileText className="h-5 w-5 text-police-accent shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-police-100">{ev.name}</p>
                    <p className="text-xs text-police-400">{ev.description}</p>
                    <p className="mt-1 text-[10px] text-police-500">
                      {ev.type} · {ev.uploadedBy} · {ev.uploadedAt}
                    </p>
                  </div>
                </div>
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
                <Eye className="h-3.5 w-3.5" /> Zeuge eintragen
              </Button>
            )
          }
        >
          {caseFile.witnesses.length === 0 ? (
            <EmptyState icon={Eye} title="Keine Zeugen" />
          ) : (
            caseFile.witnesses.map((w) => (
              <div key={w.id} className="rounded-lg bg-police-800/40 p-4 mb-3">
                <p className="font-medium text-police-100">{w.name}</p>
                <p className="text-xs text-police-400">{w.phone}</p>
                <p className="mt-2 text-sm text-police-300">{w.statement}</p>
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
                <Users className="h-3.5 w-3.5" /> Person hinzufügen
              </Button>
            )
          }
        >
          {caseFile.participants.length === 0 ? (
            <EmptyState icon={Users} title="Keine Beteiligten" />
          ) : (
            caseFile.participants.map((p, i) => {
              const person = getPerson(p.personId);
              return (
                <Link
                  key={i}
                  to={`/personen/${p.personId}`}
                  className="flex items-center justify-between rounded-lg bg-police-800/40 p-4 mb-2 hover:bg-police-800/60"
                >
                  <span className="text-sm text-police-100">
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
                <MessageSquare className="h-3.5 w-3.5" /> Notiz
              </Button>
            )
          }
        >
          {caseFile.internalNotes.length === 0 ? (
            <EmptyState icon={MessageSquare} title="Keine Notizen" />
          ) : (
            caseFile.internalNotes.map((n) => (
              <div key={n.id} className="rounded-lg border border-police-700/30 p-4 mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-police-300">{n.officerName}</span>
                  <Badge variant="gray">{n.date}</Badge>
                </div>
                <p className="text-sm text-police-200">{n.content}</p>
              </div>
            ))
          )}
        </Card>
      )}

      <Modal isOpen={showEvidenceModal} onClose={() => setShowEvidenceModal(false)} title="Beweis hochladen">
        <div className="space-y-4">
          <Input label="Dateiname" value={evidenceForm.name} onChange={(e) => setEvidenceForm({ ...evidenceForm, name: e.target.value })} />
          <Select
            label="Typ"
            value={evidenceForm.type}
            onChange={(e) => setEvidenceForm({ ...evidenceForm, type: e.target.value })}
            options={[
              { value: 'Dokument', label: 'Dokument' },
              { value: 'Video', label: 'Video' },
              { value: 'Foto', label: 'Foto' },
              { value: 'Forensik', label: 'Forensik' },
            ]}
          />
          <Input label="Beschreibung" value={evidenceForm.description} onChange={(e) => setEvidenceForm({ ...evidenceForm, description: e.target.value })} />
          <div className="rounded-lg border border-dashed border-police-600/50 p-8 text-center text-sm text-police-500">
            Datei-Upload simuliert · Nur fiktive Daten
          </div>
          <Button
            className="w-full"
            onClick={() => {
              if (!evidenceForm.name) return;
              addCaseEvidence(caseFile.id, {
                ...evidenceForm,
                uploadedBy: currentOfficer.name,
                uploadedAt: new Date().toISOString().split('T')[0],
              });
              setEvidenceForm({ name: '', type: 'Dokument', description: '' });
              setShowEvidenceModal(false);
            }}
          >
            Speichern
          </Button>
        </div>
      </Modal>

      <Modal isOpen={showWitnessModal} onClose={() => setShowWitnessModal(false)} title="Zeuge eintragen">
        <div className="space-y-4">
          <Input label="Name" value={witnessForm.name} onChange={(e) => setWitnessForm({ ...witnessForm, name: e.target.value })} />
          <Input label="Telefon" value={witnessForm.phone} onChange={(e) => setWitnessForm({ ...witnessForm, phone: e.target.value })} />
          <Input label="Aussage" value={witnessForm.statement} onChange={(e) => setWitnessForm({ ...witnessForm, statement: e.target.value })} />
          <Button
            className="w-full"
            onClick={() => {
              if (!witnessForm.name) return;
              addCaseWitness(caseFile.id, witnessForm);
              setWitnessForm({ name: '', phone: '', statement: '' });
              setShowWitnessModal(false);
            }}
          >
            Speichern
          </Button>
        </div>
      </Modal>

      <Modal isOpen={showParticipantModal} onClose={() => setShowParticipantModal(false)} title="Beteiligte Person">
        <div className="space-y-4">
          <Select
            label="Person"
            value={participantForm.personId}
            onChange={(e) => setParticipantForm({ ...participantForm, personId: e.target.value })}
            options={[
              { value: '', label: 'Auswählen...' },
              ...persons.map((p) => ({
                value: p.id,
                label: `${p.firstName} ${p.lastName}`,
              })),
            ]}
          />
          <Select
            label="Rolle"
            value={participantForm.role}
            onChange={(e) => setParticipantForm({ ...participantForm, role: e.target.value as typeof participantForm.role })}
            options={[
              { value: 'verdächtig', label: 'Verdächtig' },
              { value: 'opfer', label: 'Opfer' },
              { value: 'zeuge', label: 'Zeuge' },
              { value: 'beteiligt', label: 'Beteiligt' },
            ]}
          />
          <Button
            className="w-full"
            onClick={() => {
              if (!participantForm.personId) return;
              addCaseParticipant(caseFile.id, participantForm);
              setParticipantForm({ personId: '', role: 'verdächtig' });
              setShowParticipantModal(false);
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
            onClick={() => {
              if (!noteForm.trim()) return;
              addCaseNote(caseFile.id, {
                officerId: currentOfficer.id,
                officerName: currentOfficer.name,
                date: new Date().toISOString().split('T')[0],
                content: noteForm.trim(),
              });
              setNoteForm('');
              setShowNoteModal(false);
            }}
          >
            Speichern
          </Button>
        </div>
      </Modal>
    </div>
  );
}
