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
  LicenseStatus,
  InsuranceStatus,
  RegistrationStatus,
  WantedPriority,
  WantedType,
} from '../types';
import { useAudit } from './AuditContext';
import { useAuth } from './AuthContext';
import { useFiveM } from './FiveMContext';
import { fetchNui, isFiveM } from '../utils/fivem';
import { DEV_INITIAL_DATA } from '../data/defaults';

interface InitialDataPayload {
  persons: Person[];
  cases: CaseFile[];
  weapons: Weapon[];
  vehicles: Vehicle[];
  wanted: WantedEntry[];
  internalMessages: InternalMessage[];
}

interface NuiResult {
  success: boolean;
  error?: string;
}

export interface PersonInput {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  address: string;
  city: string;
  phone?: string;
}

export interface WeaponInput {
  serialNumber: string;
  type: string;
  caliber: string;
  ownerId?: string | null;
  licenseStatus: LicenseStatus;
  licenseExpiry?: string | null;
  notes?: string;
}

export interface VehicleInput {
  plate: string;
  ownerId: string;
  brand: string;
  model: string;
  color: string;
  insuranceStatus: InsuranceStatus;
  registrationStatus: RegistrationStatus;
}

export interface WantedInput {
  type: WantedType;
  targetId: string;
  targetName: string;
  priority: WantedPriority;
  description: string;
  lastKnownLocation: string;
  responsibleUnit: string;
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
  createPerson: (data: PersonInput) => Promise<string>;
  updatePerson: (id: string, data: Partial<PersonInput>) => Promise<void>;
  createWeapon: (data: WeaponInput) => Promise<string>;
  updateWeapon: (id: string, data: Partial<WeaponInput>) => Promise<void>;
  createVehicle: (data: VehicleInput) => Promise<string>;
  updateVehicle: (id: string, data: Partial<VehicleInput>) => Promise<void>;
  createWanted: (data: WantedInput) => Promise<string>;
  updateWanted: (id: string, data: Partial<WantedInput & { active: boolean }>) => Promise<void>;
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

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

async function callNui<T extends NuiResult>(event: string, data: unknown): Promise<T> {
  const result = await fetchNui<T>(event, data);
  if (!result.success) {
    throw new Error(result.error || 'Speichern fehlgeschlagen.');
  }
  return result;
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

    if (!isInGame) {
      applyInitialData(DEV_INITIAL_DATA);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    fetchNui<{ success: boolean; data?: InitialDataPayload; error?: string }>('getInitialData', {})
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

  const linkWeaponToPerson = useCallback((personId: string, weaponId: string) => {
    setPersons((prev) =>
      prev.map((p) =>
        p.id === personId && !p.linkedWeaponIds.includes(weaponId)
          ? { ...p, linkedWeaponIds: [...p.linkedWeaponIds, weaponId] }
          : p
      )
    );
  }, []);

  const linkVehicleToPerson = useCallback((personId: string, vehicleId: string) => {
    setPersons((prev) =>
      prev.map((p) =>
        p.id === personId && !p.linkedVehicleIds.includes(vehicleId)
          ? { ...p, linkedVehicleIds: [...p.linkedVehicleIds, vehicleId] }
          : p
      )
    );
  }, []);

  const addPersonNote = useCallback(
    async (personId: string, note: Omit<OfficerNote, 'id'>) => {
      if (isFiveM()) {
        const result = await callNui<{ success: boolean; note?: OfficerNote }>('addPersonNote', {
          personId,
          note,
        });
        if (result.note) {
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
              ? { ...p, notes: [...p.notes, { ...note, id: generateId('note') }] }
              : p
          )
        );
      }
      logAction('Notiz hinzugefügt', 'Personenakte', `Person ${personId}`);
    },
    [logAction]
  );

  const createPerson = useCallback(
    async (data: PersonInput) => {
      if (isFiveM()) {
        const result = await callNui<{ success: boolean; person?: Person }>('createPerson', data);
        if (result.person) {
          setPersons((prev) => [...prev, result.person!].sort((a, b) => a.lastName.localeCompare(b.lastName)));
          logAction('Person angelegt', 'Personenakte', `${data.firstName} ${data.lastName}`);
          return result.person.id;
        }
        throw new Error('Person konnte nicht erstellt werden.');
      }

      const id = generateId('person');
      const person: Person = {
        ...data,
        id,
        priorConvictions: [],
        arrestWarrants: [],
        notes: [],
        linkedVehicleIds: [],
        linkedWeaponIds: [],
      };
      setPersons((prev) => [...prev, person].sort((a, b) => a.lastName.localeCompare(b.lastName)));
      logAction('Person angelegt', 'Personenakte', `${data.firstName} ${data.lastName}`);
      return id;
    },
    [logAction]
  );

  const updatePerson = useCallback(
    async (id: string, data: Partial<PersonInput>) => {
      if (isFiveM()) {
        const result = await callNui<{ success: boolean; person?: Person }>('updatePerson', { id, ...data });
        if (result.person) {
          setPersons((prev) => prev.map((p) => (p.id === id ? result.person! : p)));
        }
      } else {
        setPersons((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
      }
      logAction('Person bearbeitet', 'Personenakte', id);
    },
    [logAction]
  );

  const createWeapon = useCallback(
    async (data: WeaponInput) => {
      if (isFiveM()) {
        const result = await callNui<{ success: boolean; weapon?: Weapon }>('createWeapon', data);
        if (result.weapon) {
          setWeapons((prev) => [...prev, result.weapon!]);
          if (result.weapon.ownerId) linkWeaponToPerson(result.weapon.ownerId, result.weapon.id);
          logAction('Waffe registriert', 'Waffenregister', data.serialNumber);
          return result.weapon.id;
        }
        throw new Error('Waffe konnte nicht registriert werden.');
      }

      const id = generateId('wpn');
      const weapon: Weapon = {
        id,
        serialNumber: data.serialNumber,
        type: data.type,
        caliber: data.caliber,
        ownerId: data.ownerId ?? null,
        licenseStatus: data.licenseStatus,
        licenseExpiry: data.licenseExpiry ?? null,
        registeredAt: new Date().toISOString().split('T')[0],
        notes: data.notes ?? '',
        isWanted: false,
      };
      setWeapons((prev) => [...prev, weapon]);
      if (weapon.ownerId) linkWeaponToPerson(weapon.ownerId, id);
      logAction('Waffe registriert', 'Waffenregister', data.serialNumber);
      return id;
    },
    [logAction, linkWeaponToPerson]
  );

  const updateWeapon = useCallback(
    async (id: string, data: Partial<WeaponInput>) => {
      if (isFiveM()) {
        const result = await callNui<{ success: boolean; weapon?: Weapon }>('updateWeapon', { id, ...data });
        if (result.weapon) {
          setWeapons((prev) => prev.map((w) => (w.id === id ? result.weapon! : w)));
          if (result.weapon.ownerId) linkWeaponToPerson(result.weapon.ownerId, id);
        }
      } else {
        setWeapons((prev) =>
          prev.map((w) => (w.id === id ? { ...w, ...data, ownerId: data.ownerId !== undefined ? data.ownerId ?? null : w.ownerId } : w))
        );
        if (data.ownerId) linkWeaponToPerson(data.ownerId, id);
      }
      logAction('Waffe bearbeitet', 'Waffenregister', id);
    },
    [logAction, linkWeaponToPerson]
  );

  const createVehicle = useCallback(
    async (data: VehicleInput) => {
      if (isFiveM()) {
        const result = await callNui<{ success: boolean; vehicle?: Vehicle }>('createVehicle', data);
        if (result.vehicle) {
          setVehicles((prev) => [...prev, result.vehicle!]);
          linkVehicleToPerson(result.vehicle.ownerId, result.vehicle.id);
          logAction('Fahrzeug registriert', 'Fahrzeugregister', data.plate);
          return result.vehicle.id;
        }
        throw new Error('Fahrzeug konnte nicht registriert werden.');
      }

      const id = generateId('veh');
      const vehicle: Vehicle = {
        id,
        ...data,
        isWanted: false,
        linkedCaseIds: [],
        registeredAt: new Date().toISOString().split('T')[0],
      };
      setVehicles((prev) => [...prev, vehicle]);
      linkVehicleToPerson(data.ownerId, id);
      logAction('Fahrzeug registriert', 'Fahrzeugregister', data.plate);
      return id;
    },
    [logAction, linkVehicleToPerson]
  );

  const updateVehicle = useCallback(
    async (id: string, data: Partial<VehicleInput>) => {
      if (isFiveM()) {
        const result = await callNui<{ success: boolean; vehicle?: Vehicle }>('updateVehicle', { id, ...data });
        if (result.vehicle) {
          setVehicles((prev) => prev.map((v) => (v.id === id ? result.vehicle! : v)));
          linkVehicleToPerson(result.vehicle.ownerId, id);
        }
      } else {
        setVehicles((prev) => prev.map((v) => (v.id === id ? { ...v, ...data } : v)));
        if (data.ownerId) linkVehicleToPerson(data.ownerId, id);
      }
      logAction('Fahrzeug bearbeitet', 'Fahrzeugregister', id);
    },
    [logAction, linkVehicleToPerson]
  );

  const createWanted = useCallback(
    async (data: WantedInput) => {
      if (isFiveM()) {
        const result = await callNui<{ success: boolean; wanted?: WantedEntry }>('createWanted', data);
        if (result.wanted) {
          setWanted((prev) => [result.wanted!, ...prev]);
          if (data.type === 'waffe') {
            setWeapons((prev) => prev.map((w) => (w.id === data.targetId ? { ...w, isWanted: true } : w)));
          } else if (data.type === 'fahrzeug') {
            setVehicles((prev) => prev.map((v) => (v.id === data.targetId ? { ...v, isWanted: true } : v)));
          }
          logAction('Fahndung erstellt', 'Fahndung', data.targetName);
          return result.wanted.id;
        }
        throw new Error('Fahndung konnte nicht erstellt werden.');
      }

      const id = generateId('want');
      const entry: WantedEntry = {
        id,
        ...data,
        issuedAt: new Date().toISOString().split('T')[0],
        active: true,
      };
      setWanted((prev) => [entry, ...prev]);
      if (data.type === 'waffe') {
        setWeapons((prev) => prev.map((w) => (w.id === data.targetId ? { ...w, isWanted: true } : w)));
      } else if (data.type === 'fahrzeug') {
        setVehicles((prev) => prev.map((v) => (v.id === data.targetId ? { ...v, isWanted: true } : v)));
      }
      logAction('Fahndung erstellt', 'Fahndung', data.targetName);
      return id;
    },
    [logAction]
  );

  const updateWanted = useCallback(
    async (id: string, data: Partial<WantedInput & { active: boolean }>) => {
      if (isFiveM()) {
        const result = await callNui<{ success: boolean; wanted?: WantedEntry }>('updateWanted', { id, ...data });
        if (result.wanted) {
          setWanted((prev) => prev.map((w) => (w.id === id ? result.wanted! : w)));
          const entry = result.wanted;
          if (entry.type === 'waffe' || entry.type === 'fahrzeug') {
            const stillActive = entry.active;
            if (entry.type === 'waffe') {
              setWeapons((prev) => prev.map((w) => (w.id === entry.targetId ? { ...w, isWanted: stillActive } : w)));
            } else {
              setVehicles((prev) => prev.map((v) => (v.id === entry.targetId ? { ...v, isWanted: stillActive } : v)));
            }
          }
        }
      } else {
        setWanted((prev) => {
          const updated = prev.map((w) => (w.id === id ? { ...w, ...data } : w));
          const entry = updated.find((w) => w.id === id);
          if (entry && (entry.type === 'waffe' || entry.type === 'fahrzeug')) {
            const isActive = entry.active;
            if (entry.type === 'waffe') {
              setWeapons((wp) => wp.map((w) => (w.id === entry.targetId ? { ...w, isWanted: isActive } : w)));
            } else {
              setVehicles((vp) => vp.map((v) => (v.id === entry.targetId ? { ...v, isWanted: isActive } : v)));
            }
          }
          return updated;
        });
      }
      logAction('Fahndung bearbeitet', 'Fahndung', id);
    },
    [logAction]
  );

  const createCase = useCallback(
    async (data: Omit<CaseFile, 'id' | 'caseNumber' | 'createdAt' | 'updatedAt'>) => {
      if (isFiveM()) {
        const result = await callNui<{ success: boolean; caseFile?: CaseFile }>('createCase', data);
        if (result.caseFile) {
          setCases((prev) => [result.caseFile!, ...prev]);
          logAction('Akte erstellt', 'Akten', result.caseFile.caseNumber);
          return result.caseFile.id;
        }
        throw new Error('Akte konnte nicht erstellt werden.');
      }

      const id = generateId('case');
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
        const result = await callNui<{ success: boolean; caseFile?: CaseFile }>('updateCaseStatus', {
          caseId,
          status,
        });
        if (result.caseFile) {
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
        const result = await callNui<{ success: boolean; caseFile?: CaseFile }>('addCaseEvidence', {
          caseId,
          evidence,
        });
        if (result.caseFile) {
          setCases((prev) => prev.map((c) => (c.id === caseId ? result.caseFile! : c)));
        }
      } else {
        setCases((prev) =>
          prev.map((c) =>
            c.id === caseId
              ? {
                  ...c,
                  evidence: [...c.evidence, { ...evidence, id: generateId('ev') }],
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
        const result = await callNui<{ success: boolean; caseFile?: CaseFile }>('addCaseWitness', {
          caseId,
          witness,
        });
        if (result.caseFile) {
          setCases((prev) => prev.map((c) => (c.id === caseId ? result.caseFile! : c)));
        }
      } else {
        setCases((prev) =>
          prev.map((c) =>
            c.id === caseId
              ? {
                  ...c,
                  witnesses: [...c.witnesses, { ...witness, id: generateId('wit') }],
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
        const result = await callNui<{ success: boolean; caseFile?: CaseFile }>('addCaseParticipant', {
          caseId,
          participant,
        });
        if (result.caseFile) {
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
        const result = await callNui<{ success: boolean; caseFile?: CaseFile }>('addCaseNote', {
          caseId,
          note,
        });
        if (result.caseFile) {
          setCases((prev) => prev.map((c) => (c.id === caseId ? result.caseFile! : c)));
        }
      } else {
        setCases((prev) =>
          prev.map((c) =>
            c.id === caseId
              ? {
                  ...c,
                  internalNotes: [...c.internalNotes, { ...note, id: generateId('inote') }],
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
        createPerson,
        updatePerson,
        createWeapon,
        updateWeapon,
        createVehicle,
        updateVehicle,
        createWanted,
        updateWanted,
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
