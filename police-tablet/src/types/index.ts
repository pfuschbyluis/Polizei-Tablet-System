export type Rank = 'admin' | 'leitstelle' | 'ermittler' | 'beamter';

export type CaseStatus = 'offen' | 'in_bearbeitung' | 'abgeschlossen';
export type OperationStatus = 'geplant' | 'aktiv' | 'abgeschlossen' | 'abgebrochen';
export type WantedPriority = 'niedrig' | 'mittel' | 'hoch' | 'kritisch';
export type WantedType = 'person' | 'fahrzeug' | 'waffe';
export type LicenseStatus = 'gültig' | 'abgelaufen' | 'entzogen' | 'gesucht';
export type InsuranceStatus = 'gültig' | 'abgelaufen' | 'unbekannt';
export type RegistrationStatus = 'zugelassen' | 'abgemeldet' | 'gesperrt';

export interface Officer {
  id: string;
  badgeNumber: string;
  name: string;
  rank: Rank;
  unit: string;
  avatar?: string;
}

export interface PriorConviction {
  id: string;
  offense: string;
  date: string;
  sentence: string;
}

export interface ArrestWarrant {
  id: string;
  reason: string;
  issuedDate: string;
  issuingJudge: string;
  active: boolean;
}

export interface OfficerNote {
  id: string;
  officerId: string;
  officerName: string;
  date: string;
  content: string;
}

export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  address: string;
  city: string;
  phone?: string;
  priorConvictions: PriorConviction[];
  arrestWarrants: ArrestWarrant[];
  notes: OfficerNote[];
  linkedVehicleIds: string[];
  linkedWeaponIds: string[];
  operationHistoryIds: string[];
  photoUrl?: string;
}

export interface Evidence {
  id: string;
  name: string;
  type: string;
  uploadedBy: string;
  uploadedAt: string;
  description: string;
}

export interface Witness {
  id: string;
  name: string;
  phone: string;
  statement: string;
}

export interface CaseParticipant {
  personId: string;
  role: 'verdächtig' | 'opfer' | 'zeuge' | 'beteiligt';
}

export interface CaseFile {
  id: string;
  caseNumber: string;
  title: string;
  offense: string;
  status: CaseStatus;
  createdAt: string;
  updatedAt: string;
  assignedOfficerId: string;
  assignedOfficerName: string;
  participants: CaseParticipant[];
  evidence: Evidence[];
  witnesses: Witness[];
  internalNotes: OfficerNote[];
  linkedVehicleIds: string[];
  description: string;
}

export interface Weapon {
  id: string;
  serialNumber: string;
  type: string;
  caliber: string;
  ownerId: string | null;
  licenseStatus: LicenseStatus;
  licenseExpiry: string | null;
  registeredAt: string;
  notes: string;
  isWanted: boolean;
}

export interface Vehicle {
  id: string;
  plate: string;
  ownerId: string;
  model: string;
  brand: string;
  color: string;
  insuranceStatus: InsuranceStatus;
  registrationStatus: RegistrationStatus;
  isWanted: boolean;
  linkedCaseIds: string[];
  registeredAt: string;
}

export interface WantedEntry {
  id: string;
  type: WantedType;
  targetId: string;
  targetName: string;
  priority: WantedPriority;
  description: string;
  lastKnownLocation: string;
  responsibleUnit: string;
  issuedAt: string;
  active: boolean;
}

export interface AssignedUnit {
  unitId: string;
  unitName: string;
  officers: string[];
}

export interface Operation {
  id: string;
  code: string;
  title: string;
  location: string;
  coordinates?: { lat: number; lng: number };
  status: OperationStatus;
  priority: WantedPriority;
  assignedUnits: AssignedUnit[];
  radioCode: string;
  report: string;
  createdAt: string;
  updatedAt: string;
  linkedCaseIds: string[];
}

export interface InternalMessage {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  priority: 'info' | 'warnung' | 'dringend';
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  officerId: string;
  officerName: string;
  action: string;
  module: string;
  details: string;
}

export interface Permission {
  viewDashboard: boolean;
  viewPersons: boolean;
  editPersons: boolean;
  viewCases: boolean;
  createCases: boolean;
  editCases: boolean;
  viewWeapons: boolean;
  editWeapons: boolean;
  viewVehicles: boolean;
  editVehicles: boolean;
  viewWanted: boolean;
  editWanted: boolean;
  viewOperations: boolean;
  createOperations: boolean;
  editOperations: boolean;
  viewAuditLog: boolean;
  adminFunctions: boolean;
}

export const RANK_LABELS: Record<Rank, string> = {
  admin: 'Administrator',
  leitstelle: 'Leitstelle',
  ermittler: 'Ermittler',
  beamter: 'Beamter',
};

export const PERMISSIONS: Record<Rank, Permission> = {
  admin: {
    viewDashboard: true,
    viewPersons: true,
    editPersons: true,
    viewCases: true,
    createCases: true,
    editCases: true,
    viewWeapons: true,
    editWeapons: true,
    viewVehicles: true,
    editVehicles: true,
    viewWanted: true,
    editWanted: true,
    viewOperations: true,
    createOperations: true,
    editOperations: true,
    viewAuditLog: true,
    adminFunctions: true,
  },
  leitstelle: {
    viewDashboard: true,
    viewPersons: true,
    editPersons: false,
    viewCases: true,
    createCases: false,
    editCases: false,
    viewWeapons: true,
    editWeapons: false,
    viewVehicles: true,
    editVehicles: false,
    viewWanted: true,
    editWanted: true,
    viewOperations: true,
    createOperations: true,
    editOperations: true,
    viewAuditLog: false,
    adminFunctions: false,
  },
  ermittler: {
    viewDashboard: true,
    viewPersons: true,
    editPersons: true,
    viewCases: true,
    createCases: true,
    editCases: true,
    viewWeapons: true,
    editWeapons: true,
    viewVehicles: true,
    editVehicles: true,
    viewWanted: true,
    editWanted: true,
    viewOperations: true,
    createOperations: false,
    editOperations: false,
    viewAuditLog: false,
    adminFunctions: false,
  },
  beamter: {
    viewDashboard: true,
    viewPersons: true,
    editPersons: false,
    viewCases: true,
    createCases: false,
    editCases: false,
    viewWeapons: true,
    editWeapons: false,
    viewVehicles: true,
    editVehicles: false,
    viewWanted: true,
    editWanted: false,
    viewOperations: true,
    createOperations: false,
    editOperations: false,
    viewAuditLog: false,
    adminFunctions: false,
  },
};

export const OFFENSES = [
  'Diebstahl',
  'Raub',
  'Körperverletzung',
  'Betrug',
  'Drogenhandel',
  'Einbruch',
  'Vandalismus',
  'Verkehrsdelikt',
  'Bedrohung',
  'Waffendelikt',
  'Hausfriedensbruch',
  'Beschädigung fremden Eigentums',
];

export const RADIO_CODES = [
  '10-4', '10-6', '10-7', '10-8', '10-9', '10-13', '10-20', '10-33', '10-50', 'Code 1', 'Code 2', 'Code 3',
];

export const UNITS = [
  'Streifenwagen Alpha-1',
  'Streifenwagen Alpha-2',
  'Streifenwagen Beta-1',
  'SEK Einheit Nord',
  'SEK Einheit Süd',
  'Verkehrsdienst',
  'Kripo Team A',
  'Kripo Team B',
  'Leitstelle Zentral',
];
