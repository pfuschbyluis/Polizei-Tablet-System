export type Rank = 'admin' | 'leitstelle' | 'ermittler' | 'beamter';

export type CaseStatus = 'offen' | 'in_bearbeitung' | 'abgeschlossen';
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

export interface Employee {
  id: string;
  badgeNumber: string;
  name: string;
  rank: Rank;
  unit: string;
  active: boolean;
  createdAt: string;
}

export interface EmployeeInput {
  badgeNumber: string;
  password: string;
  name: string;
  rank: Rank;
  unit: string;
  active?: boolean;
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
  viewAuditLog: boolean;
  adminFunctions: boolean;
  viewEmployees: boolean;
  manageEmployees: boolean;
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
    viewAuditLog: true,
    adminFunctions: true,
    viewEmployees: true,
    manageEmployees: true,
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
    viewAuditLog: false,
    adminFunctions: false,
    viewEmployees: true,
    manageEmployees: false,
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
    viewAuditLog: false,
    adminFunctions: false,
    viewEmployees: false,
    manageEmployees: false,
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
    viewAuditLog: false,
    adminFunctions: false,
    viewEmployees: false,
    manageEmployees: false,
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
