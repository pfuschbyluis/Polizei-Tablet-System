import type { Employee } from '../types';

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
  },
];

export function stripPassword<T extends { password?: string }>(emp: T): Omit<T, 'password'> {
  const { password: _, ...rest } = emp;
  return rest;
}
