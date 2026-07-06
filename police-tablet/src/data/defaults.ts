import type { Officer } from '../types';

/** Fallback für Browser-Entwicklung ohne FiveM */
export const DEFAULT_DEV_OFFICER: Officer = {
  id: 'dev',
  badgeNumber: 'PD-0000',
  name: 'Demo Beamter',
  rank: 'admin',
  unit: 'Entwicklung',
};
