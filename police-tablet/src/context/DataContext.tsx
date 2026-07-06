import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type {
  Person,
  CaseFile,
  Weapon,
  Vehicle,
  WantedEntry,
  OfficerNote,
  Evidence,
  Witness,
  CaseParticipant,
  CaseStatus,
  InternalMessage,
} from '../types';
import { useAudit } from './AuditContext';

interface DataContextType {
  persons: Person[];
  cases: CaseFile[];
  weapons: Weapon[];
  vehicles: Vehicle[];
  wanted: WantedEntry[];
  internalMessages: InternalMessage[];
  getPerson: (id: string) => Person | undefined;
  getCase: (id: string) => CaseFile | undefined;
  getWeapon: (id: string) => Weapon | undefined;
  getVehicle: (id: string) => Vehicle | undefined;
  addPersonNote: (personId: string, note: Omit<OfficerNote, 'id'>) => void;
  createCase: (data: Omit<CaseFile, 'id' | 'caseNumber' | 'createdAt' | 'updatedAt'>) => string;
  updateCaseStatus: (caseId: string, status: CaseStatus) => void;
  addCaseEvidence: (caseId: string, evidence: Omit<Evidence, 'id'>) => void;
  addCaseWitness: (caseId: string, witness: Omit<Witness, 'id'>) => void;
  addCaseParticipant: (caseId: string, participant: CaseParticipant) => void;
  addCaseNote: (caseId: string, note: Omit<OfficerNote, 'id'>) => void;
}

const DataContext = createContext<DataContextType | null>(null);

function generateCaseNumber(): string {
  const num = Math.floor(Math.random() * 900000) + 100000;
  return `AZ-${new Date().getFullYear()}-${num}`;
}

export function DataProvider({ children }: { children: ReactNode }) {
  const { logAction } = useAudit();
  const [persons, setPersons] = useState<Person[]>([]);
  const [cases, setCases] = useState<CaseFile[]>([]);
  const [weapons] = useState<Weapon[]>([]);
  const [vehicles] = useState<Vehicle[]>([]);
  const [wanted] = useState<WantedEntry[]>([]);
  const [internalMessages] = useState<InternalMessage[]>([]);

  const getPerson = useCallback((id: string) => persons.find((p) => p.id === id), [persons]);
  const getCase = useCallback((id: string) => cases.find((c) => c.id === id), [cases]);
  const getWeapon = useCallback((id: string) => weapons.find((w) => w.id === id), [weapons]);
  const getVehicle = useCallback((id: string) => vehicles.find((v) => v.id === id), [vehicles]);

  const addPersonNote = useCallback(
    (personId: string, note: Omit<OfficerNote, 'id'>) => {
      setPersons((prev) =>
        prev.map((p) =>
          p.id === personId
            ? { ...p, notes: [...p.notes, { ...note, id: `note-${Date.now()}` }] }
            : p
        )
      );
      logAction('Notiz hinzugefügt', 'Personenakte', `Person ${personId}`);
    },
    [logAction]
  );

  const createCase = useCallback(
    (data: Omit<CaseFile, 'id' | 'caseNumber' | 'createdAt' | 'updatedAt'>) => {
      const id = `case-${Date.now()}`;
      const now = new Date().toISOString().split('T')[0];
      const newCase: CaseFile = {
        ...data,
        id,
        caseNumber: generateCaseNumber(),
        createdAt: now,
        updatedAt: now,
      };
      setCases((prev) => [newCase, ...prev]);
      logAction('Akte erstellt', 'Akten', newCase.caseNumber);
      return id;
    },
    [logAction]
  );

  const updateCaseStatus = useCallback(
    (caseId: string, status: CaseStatus) => {
      setCases((prev) =>
        prev.map((c) =>
          c.id === caseId
            ? { ...c, status, updatedAt: new Date().toISOString().split('T')[0] }
            : c
        )
      );
      logAction('Status geändert', 'Akten', `${caseId} → ${status}`);
    },
    [logAction]
  );

  const addCaseEvidence = useCallback(
    (caseId: string, evidence: Omit<Evidence, 'id'>) => {
      setCases((prev) =>
        prev.map((c) =>
          c.id === caseId
            ? {
                ...c,
                evidence: [...c.evidence, { ...evidence, id: `ev-${Date.now()}` }],
                updatedAt: new Date().toISOString().split('T')[0],
              }
            : c
        )
      );
      logAction('Beweis hochgeladen', 'Akten', caseId);
    },
    [logAction]
  );

  const addCaseWitness = useCallback(
    (caseId: string, witness: Omit<Witness, 'id'>) => {
      setCases((prev) =>
        prev.map((c) =>
          c.id === caseId
            ? {
                ...c,
                witnesses: [...c.witnesses, { ...witness, id: `wit-${Date.now()}` }],
                updatedAt: new Date().toISOString().split('T')[0],
              }
            : c
        )
      );
      logAction('Zeuge eingetragen', 'Akten', caseId);
    },
    [logAction]
  );

  const addCaseParticipant = useCallback(
    (caseId: string, participant: CaseParticipant) => {
      setCases((prev) =>
        prev.map((c) =>
          c.id === caseId
            ? {
                ...c,
                participants: [...c.participants, participant],
                updatedAt: new Date().toISOString().split('T')[0],
              }
            : c
        )
      );
      logAction('Beteiligter hinzugefügt', 'Akten', caseId);
    },
    [logAction]
  );

  const addCaseNote = useCallback(
    (caseId: string, note: Omit<OfficerNote, 'id'>) => {
      setCases((prev) =>
        prev.map((c) =>
          c.id === caseId
            ? {
                ...c,
                internalNotes: [...c.internalNotes, { ...note, id: `inote-${Date.now()}` }],
                updatedAt: new Date().toISOString().split('T')[0],
              }
            : c
        )
      );
      logAction('Interne Notiz', 'Akten', caseId);
    },
    [logAction]
  );

  return (
    <DataContext.Provider
      value={{
        persons,
        cases,
        weapons,
        vehicles,
        wanted,
        internalMessages,
        getPerson,
        getCase,
        getWeapon,
        getVehicle,
        addPersonNote,
        createCase,
        updateCaseStatus,
        addCaseEvidence,
        addCaseWitness,
        addCaseParticipant,
        addCaseNote,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
