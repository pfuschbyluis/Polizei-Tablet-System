import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type {
  Person,
  CaseFile,
  Weapon,
  Vehicle,
  WantedEntry,
  Operation,
  OfficerNote,
  Evidence,
  Witness,
  CaseParticipant,
  CaseStatus,
  OperationStatus,
} from '../types';
import {
  PERSONS,
  CASES,
  WEAPONS,
  VEHICLES,
  WANTED,
  OPERATIONS,
} from '../data/mockData';
import { useAudit } from './AuditContext';

interface DataContextType {
  persons: Person[];
  cases: CaseFile[];
  weapons: Weapon[];
  vehicles: Vehicle[];
  wanted: WantedEntry[];
  operations: Operation[];
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
  createOperation: (data: Omit<Operation, 'id' | 'code' | 'createdAt' | 'updatedAt'>) => string;
  updateOperationStatus: (opId: string, status: OperationStatus) => void;
  updateOperationReport: (opId: string, report: string) => void;
  updateOperationUnits: (opId: string, units: Operation['assignedUnits']) => void;
}

const DataContext = createContext<DataContextType | null>(null);

function generateCaseNumber(): string {
  const num = Math.floor(Math.random() * 900000) + 100000;
  return `AZ-2026-${num}`;
}

function generateOpCode(): string {
  const num = Math.floor(Math.random() * 9000) + 1000;
  return `E-2026-${num}`;
}

export function DataProvider({ children }: { children: ReactNode }) {
  const { logAction } = useAudit();
  const [persons, setPersons] = useState<Person[]>(PERSONS);
  const [cases, setCases] = useState<CaseFile[]>(CASES);
  const [weapons] = useState<Weapon[]>(WEAPONS);
  const [vehicles] = useState<Vehicle[]>(VEHICLES);
  const [wanted] = useState<WantedEntry[]>(WANTED);
  const [operations, setOperations] = useState<Operation[]>(OPERATIONS);

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

  const createOperation = useCallback(
    (data: Omit<Operation, 'id' | 'code' | 'createdAt' | 'updatedAt'>) => {
      const id = `ops-${Date.now()}`;
      const now = new Date().toISOString();
      const newOp: Operation = {
        ...data,
        id,
        code: generateOpCode(),
        createdAt: now,
        updatedAt: now,
      };
      setOperations((prev) => [newOp, ...prev]);
      logAction('Einsatz erstellt', 'Einsätze', newOp.code);
      return id;
    },
    [logAction]
  );

  const updateOperationStatus = useCallback(
    (opId: string, status: OperationStatus) => {
      setOperations((prev) =>
        prev.map((o) =>
          o.id === opId ? { ...o, status, updatedAt: new Date().toISOString() } : o
        )
      );
      logAction('Einsatzstatus geändert', 'Einsätze', `${opId} → ${status}`);
    },
    [logAction]
  );

  const updateOperationReport = useCallback(
    (opId: string, report: string) => {
      setOperations((prev) =>
        prev.map((o) =>
          o.id === opId ? { ...o, report, updatedAt: new Date().toISOString() } : o
        )
      );
      logAction('Einsatzbericht aktualisiert', 'Einsätze', opId);
    },
    [logAction]
  );

  const updateOperationUnits = useCallback(
    (opId: string, units: Operation['assignedUnits']) => {
      setOperations((prev) =>
        prev.map((o) =>
          o.id === opId
            ? { ...o, assignedUnits: units, updatedAt: new Date().toISOString() }
            : o
        )
      );
      logAction('Einheiten zugewiesen', 'Einsätze', opId);
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
        operations,
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
        createOperation,
        updateOperationStatus,
        updateOperationReport,
        updateOperationUnits,
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
