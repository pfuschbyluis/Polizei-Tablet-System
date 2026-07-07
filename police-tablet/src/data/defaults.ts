import type {
  Employee,
  Person,
  CaseFile,
  Weapon,
  Vehicle,
  WantedEntry,
  InternalMessage,
} from '../types';
import {
  DEFAULT_ROLE_TEMPLATES,
  emptyPermissions,
  fullPermissions,
  getTemplateById,
  templateForLegacyRank,
} from '../types';

/** Nur für Browser-Entwicklung – FiveM nutzt Server-Authentifizierung */
export const DEV_EMPLOYEES: (Employee & { password: string })[] = [
  {
    id: 'emp-admin',
    badgeNumber: 'PD-1001',
    password: 'admin123',
    name: 'System Administrator',
    rank: 'admin',
    unit: 'Leitung',
    active: true,
    createdAt: '2026-01-01',
    roleTemplateId: 'tpl-administrator',
    permissions: fullPermissions(),
  },
  {
    id: 'emp-beamter',
    badgeNumber: 'PD-4521',
    password: 'beamter123',
    name: 'Polizeiobermeister Demo',
    rank: 'beamter',
    unit: 'Streifenwagen Alpha-1',
    active: true,
    createdAt: '2026-01-01',
    roleTemplateId: 'tpl-praktikant',
    permissions: getTemplateById(DEFAULT_ROLE_TEMPLATES, 'tpl-praktikant')?.permissions ?? emptyPermissions(),
  },
];

export const DEV_PERSONS: Person[] = [
  {
    id: 'person-1',
    firstName: 'Max',
    lastName: 'Mustermann',
    dateOfBirth: '1985-03-15',
    address: 'Hauptstraße 12',
    city: 'Los Santos',
    phone: '555-0101',
    priorConvictions: [],
    arrestWarrants: [],
    notes: [],
    linkedVehicleIds: ['veh-1'],
    linkedWeaponIds: ['wpn-1'],
  },
  {
    id: 'person-2',
    firstName: 'Anna',
    lastName: 'Schmidt',
    dateOfBirth: '1992-07-22',
    address: 'Grove Street 5',
    city: 'Los Santos',
    phone: '555-0202',
    priorConvictions: [
      { id: 'pc-1', offense: 'Verkehrsdelikt', date: '2024-01-10', sentence: 'Geldstrafe 500€' },
    ],
    arrestWarrants: [],
    notes: [],
    linkedVehicleIds: [],
    linkedWeaponIds: [],
  },
];

export const DEV_WEAPONS: Weapon[] = [
  {
    id: 'wpn-1',
    serialNumber: 'WPN-2024-001',
    type: 'Pistole',
    caliber: '9mm',
    ownerId: 'person-1',
    licenseStatus: 'gültig',
    licenseExpiry: '2027-06-01',
    registeredAt: '2024-06-01',
    notes: 'Sportwaffenschein',
    isWanted: false,
  },
];

export const DEV_VEHICLES: Vehicle[] = [
  {
    id: 'veh-1',
    plate: 'LS-PD 123',
    ownerId: 'person-1',
    model: 'Schafter',
    brand: 'Benefactor',
    color: 'Schwarz',
    insuranceStatus: 'gültig',
    registrationStatus: 'zugelassen',
    isWanted: false,
    linkedCaseIds: [],
    registeredAt: '2024-03-10',
  },
];

export const DEV_CASES: CaseFile[] = [
  {
    id: 'case-1',
    caseNumber: 'AZ-2026-100001',
    title: 'Einbruch Wohnhaus',
    offense: 'Einbruch',
    status: 'in_bearbeitung',
    createdAt: '2026-01-15',
    updatedAt: '2026-02-01',
    assignedOfficerId: 'emp-admin',
    assignedOfficerName: 'System Administrator',
    participants: [{ personId: 'person-2', role: 'verdächtig' }],
    evidence: [],
    witnesses: [],
    internalNotes: [],
    linkedVehicleIds: [],
    description: 'Einbruch in Wohnhaus Grove Street.',
  },
];

export const DEV_WANTED: WantedEntry[] = [];

export const DEV_MESSAGES: InternalMessage[] = [
  {
    id: 'msg-1',
    title: 'System bereit',
    content: 'Polizei-Tablet System ist einsatzbereit.',
    author: 'Leitstelle',
    date: '2026-01-01',
    priority: 'info',
  },
];

export const DEV_INITIAL_DATA = {
  persons: DEV_PERSONS,
  cases: DEV_CASES,
  weapons: DEV_WEAPONS,
  vehicles: DEV_VEHICLES,
  wanted: DEV_WANTED,
  internalMessages: DEV_MESSAGES,
};

export function stripPassword<T extends { password?: string }>(emp: T): Omit<T, 'password'> {
  const { password: _, ...rest } = emp;
  return rest;
}

export { templateForLegacyRank };
