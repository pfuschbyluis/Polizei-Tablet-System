import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Officer, Rank, Permission } from '../types';
import { PERMISSIONS, RANK_LABELS } from '../types';
import { OFFICERS } from '../data/mockData';

interface AuthContextType {
  currentOfficer: Officer;
  permissions: Permission;
  rankLabel: string;
  login: (officerId: string) => void;
  switchRank: (rank: Rank) => void;
  allOfficers: Officer[];
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentOfficer, setCurrentOfficer] = useState<Officer>(OFFICERS[0]);

  const permissions = PERMISSIONS[currentOfficer.rank];
  const rankLabel = RANK_LABELS[currentOfficer.rank];

  const login = useCallback((officerId: string) => {
    const officer = OFFICERS.find((o) => o.id === officerId);
    if (officer) setCurrentOfficer(officer);
  }, []);

  const switchRank = useCallback((rank: Rank) => {
    setCurrentOfficer((prev) => ({ ...prev, rank }));
  }, []);

  return (
    <AuthContext.Provider
      value={{ currentOfficer, permissions, rankLabel, login, switchRank, allOfficers: OFFICERS }}
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
