import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
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
import { useAuth } from './AuthContext';
import { useFiveM } from './FiveMContext';
import { fetchNui, isFiveM } from '../utils/fivem';

interface InitialDataPayload {
  persons: Person[];
  cases: CaseFile[];
  weapons: Weapon[];
  vehicles: Vehicle[];
  wanted: WantedEntry[];
  internalMessages: InternalMessage[];
}

interface DataContextType {
  persons: Person[];
  cases: CaseFile[];
  weapons: Weapon[];
  vehicles: Vehicle[];
  wanted: WantedEntry[];
  internalMessages: InternalMessage[];
  isLoading: boolean;
  getPerson: (id: string) => Person | undefined;
  getCase: (id: string) => CaseFile | undefined;
  getWeapon: (id: string) => Weapon | undefined;
  getVehicle: (id: string) => Vehicle | undefined;
  addPersonNote: (personId: string, note: Omit<OfficerNote, 'id'>) => Promise<void>;
  createCase: (data: Omit<CaseFile, 'id' | 'caseNumber' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateCaseStatus: (caseId: string, status: CaseStatus) => Promise<void>;
  addCaseEvidence: (caseId: string, evidence: Omit<Evidence, 'id'>) => Promise<void>;
  addCaseWitness: (caseId: string, witness: Omit<Witness, 'id'>) => Promise<void>;
  addCaseParticipant: (caseId: string, participant: CaseParticipant) => Promise<void>;
  addCaseNote: (caseId: string, note: Omit<OfficerNote, 'id'>) => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

function generateCaseNumber(): string {
  const num = Math.floor(Math.random() * 900000) + 100000;
  return `AZ-${new Date().getFullYear()}-${num}`;
}

export function DataProvider({ children }: { children: ReactNode }) {
  const { logAction } = useAudit();
  const { isAuthenticated } = useAuth();
  const { isInGame } = useFiveM();
  const [persons, setPersons] = useState<Person[]>([]);
  const [cases, setCases] = useState<CaseFile[]>([]);
  const [weapons, setWeapons] = useState<Weapon[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [wanted, setWanted] = useState<WantedEntry[]>([]);
  const [internalMessages, setInternalMessages] = useState<InternalMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const applyInitialData = useCallback((data: InitialDataPayload) => {
    setPersons(data.persons ?? []);
    setCases(data.cases ?? []);
    setWeapons(data.weapons ?? []);
    setVehicles(data.vehicles ?? []);
    setWanted(data.wanted ?? []);
    setInternalMessages(data.internalMessages ?? []);
  }, []);

  const resetData = useCallback(() => {
    setPersons([]);
    setCases([]);
    setWeapons([]);
    setVehicles([]);
    setWanted([]);
    setInternalMessages([]);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      resetData();
      return;
    }

    if (!isInGame) return;

    let cancelled = false;
    setIsLoading(true);

    fetchNui<{ success: boolean; data?: InitialDataPayload }>('getInitialData', {})
      .then((result) => {
        if (cancelled) return;
        if (result.success && result.data) {
          applyInitialData(result.data);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isInGame, applyInitialData, resetData]);

  const getPerson = useCallback((id: string) => persons.find((p) => p.id === id), [persons]);
  const getCase = useCallback((id: string) => cases.find((c) => c.id === id), [cases]);
  const getWeapon = useCallback((id: string) => weapons.find((w) => w.id === id), [weapons]);
  const getVehicle = useCallback((id: string) => vehicles.find((v) => v.id === id), [vehicles]);

  const addPersonNote = useCallback(
    async (personId: string, note: Omit<OfficerNote, 'id'>) => {
      if (isFiveM()) {
        const result = await fetchNui<{ success: boolean; note?: OfficerNote }>('addPersonNote', {
          personId,
          note,
        });
        if (result.success && result.note) {
          setPersons((prev) =>
            prev.map((p) =>
              p.id === personId ? { ...p, notes: [...p.notes, result.note!] } : p
            )
          );
        }
      } else {
        setPersons((prev) =>
          prev.map((p) =>
            p.id === personId
              ? { ...p, notes: [...p.notes, { ...note, id: `note-${Date.now()}` }] }
              : p
          )
        );
      }
      logAction('Notiz hinzugefügt', 'Personenakte', `Person ${personId}`);
    },
    [logAction]
  );

  const createCase = useCallback(
    async (data: Omit<CaseFile, 'id' | 'caseNumber' | 'createdAt' | 'updatedAt'>) => {
      if (isFiveM()) {
        const result = await fetchNui<{ success: boolean; caseFile?: CaseFile }>('createCase', data);
        if (result.success && result.caseFile) {
          setCases((prev) => [result.caseFile!, ...prev]);
          logAction('Akte erstellt', 'Akten', result.caseFile.caseNumber);
          return result.caseFile.id;
        }
        throw new Error('Akte konnte nicht erstellt werden.');
      }

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
    async (caseId: string, status: CaseStatus) => {
      if (isFiveM()) {
        const result = await fetchNui<{ success: boolean; caseFile?: CaseFile }>('updateCaseStatus', {
          caseId,
          status,
        });
        if (result.success && result.caseFile) {
          setCases((prev) => prev.map((c) => (c.id === caseId ? result.caseFile! : c)));
        }
      } else {
        setCases((prev) =>
          prev.map((c) =>
            c.id === caseId
              ? { ...c, status, updatedAt: new Date().toISOString().split('T')[0] }
              : c
          )
        );
      }
      logAction('Status geändert', 'Akten', `${caseId} → ${status}`);
    },
    [logAction]
  );

  const addCaseEvidence = useCallback(
    async (caseId: string, evidence: Omit<Evidence, 'id'>) => {
      if (isFiveM()) {
        const result = await fetchNui<{ success: boolean; caseFile?: CaseFile }>('addCaseEvidence', {
          caseId,
          evidence,
        });
        if (result.success && result.caseFile) {
          setCases((prev) => prev.map((c) => (c.id === caseId ? result.caseFile! : c)));
        }
      } else {
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
      }
      logAction('Beweis hochgeladen', 'Akten', caseId);
    },
    [logAction]
  );

  const addCaseWitness = useCallback(
    async (caseId: string, witness: Omit<Witness, 'id'>) => {
      if (isFiveM()) {
        const result = await fetchNui<{ success: boolean; caseFile?: CaseFile }>('addCaseWitness', {
          caseId,
          witness,
        });
        if (result.success && result.caseFile) {
          setCases((prev) => prev.map((c) => (c.id === caseId ? result.caseFile! : c)));
        }
      } else {
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
      }
      logAction('Zeuge eingetragen', 'Akten', caseId);
    },
    [logAction]
  );

  const addCaseParticipant = useCallback(
    async (caseId: string, participant: CaseParticipant) => {
      if (isFiveM()) {
        const result = await fetchNui<{ success: boolean; caseFile?: CaseFile }>('addCaseParticipant', {
          caseId,
          participant,
        });
        if (result.success && result.caseFile) {
          setCases((prev) => prev.map((c) => (c.id === caseId ? result.caseFile! : c)));
        }
      } else {
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
      }
      logAction('Beteiligter hinzugefügt', 'Akten', caseId);
    },
    [logAction]
  );

  const addCaseNote = useCallback(
    async (caseId: string, note: Omit<OfficerNote, 'id'>) => {
      if (isFiveM()) {
        const result = await fetchNui<{ success: boolean; caseFile?: CaseFile }>('addCaseNote', {
          caseId,
          note,
        });
        if (result.success && result.caseFile) {
          setCases((prev) => prev.map((c) => (c.id === caseId ? result.caseFile! : c)));
        }
      } else {
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
      }
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
        isLoading,
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
