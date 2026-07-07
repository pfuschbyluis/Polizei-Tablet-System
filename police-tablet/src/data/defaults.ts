import type { Employee } from '../types';
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

export function stripPassword<T extends { password?: string }>(emp: T): Omit<T, 'password'> {
  const { password: _, ...rest } = emp;
  return rest;
}

export { templateForLegacyRank };
