import type { Permission } from './permissions';

export type { Permission, RoleTemplate } from './permissions';
export {
  PERMISSION_LABELS,
  PERMISSION_GROUPS,
  DEFAULT_ROLE_TEMPLATES,
  emptyPermissions,
  fullPermissions,
  toEffectivePermissions,
  countActivePermissions,
  templateForLegacyRank,
  getTemplateById,
} from '../utils/permissions';
export type { EffectivePermission } from '../utils/permissions';

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
  avatar?: string;
  roleTemplateId?: string | null;
  permissions?: Permission;
}

export interface Employee {
  id: string;
  badgeNumber: string;
  name: string;
  rank: Rank;
  active: boolean;
  createdAt: string;
  roleTemplateId: string | null;
  permissions: Permission;
}

export interface EmployeeInput {
  badgeNumber: string;
  password: string;
  name: string;
  rank: Rank;
  active?: boolean;
  roleTemplateId?: string | null;
  permissions?: Permission;
}

export interface RoleTemplateInput {
  name: string;
  description: string;
  permissions: Permission;
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

export const PARTICIPANT_ROLE_OPTIONS: { value: CaseParticipant['role']; label: string }[] = [
  { value: 'verdächtig', label: 'Verdächtig' },
  { value: 'opfer', label: 'Opfer' },
  { value: 'zeuge', label: 'Zeuge' },
  { value: 'beteiligt', label: 'Beteiligt' },
];

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

export const RANK_LABELS: Record<Rank, string> = {
  admin: 'Administrator',
  leitstelle: 'Leitstelle',
  ermittler: 'Ermittler',
  beamter: 'Beamter',
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
