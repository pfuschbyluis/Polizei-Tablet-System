import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { Officer, Rank, Permission } from '../types';
import { PERMISSIONS, RANK_LABELS } from '../types';
import { DEFAULT_DEV_OFFICER } from '../data/defaults';
import { useFiveM } from './FiveMContext';
import { isFiveM, type NuiOpenPayload } from '../utils/fivem';

interface AuthContextType {
  currentOfficer: Officer;
  permissions: Permission;
  rankLabel: string;
  switchRank: (rank: Rank) => void;
  isDevMode: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const VALID_RANKS: Rank[] = ['admin', 'leitstelle', 'ermittler', 'beamter'];

function isValidRank(rank: string): rank is Rank {
  return VALID_RANKS.includes(rank as Rank);
}

function officerFromNui(data: NuiOpenPayload['officer']): Officer | null {
  if (!data) return null;
  const rank = isValidRank(data.rank) ? data.rank : 'beamter';
  return {
    id: data.id,
    badgeNumber: data.badgeNumber,
    name: data.name,
    rank,
    unit: data.unit,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { openPayload, isInGame } = useFiveM();
  const isDevMode = !isInGame;
  const [currentOfficer, setCurrentOfficer] = useState<Officer>(DEFAULT_DEV_OFFICER);

  useEffect(() => {
    const nuiOfficer = officerFromNui(openPayload?.officer);
    if (nuiOfficer && isFiveM()) {
      setCurrentOfficer(nuiOfficer);
    }
  }, [openPayload]);

  const permissions = PERMISSIONS[currentOfficer.rank];
  const rankLabel = RANK_LABELS[currentOfficer.rank];

  const switchRank = useCallback((rank: Rank) => {
    if (isFiveM()) return;
    setCurrentOfficer((prev) => ({ ...prev, rank }));
  }, []);

  return (
    <AuthContext.Provider
      value={{ currentOfficer, permissions, rankLabel, switchRank, isDevMode }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
