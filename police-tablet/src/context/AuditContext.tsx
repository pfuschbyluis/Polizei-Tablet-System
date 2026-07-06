import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { AuditEntry } from '../types';
import { INITIAL_AUDIT } from '../data/mockData';
import { useAuth } from './AuthContext';

interface AuditContextType {
  entries: AuditEntry[];
  logAction: (action: string, module: string, details: string) => void;
}

const AuditContext = createContext<AuditContextType | null>(null);

export function AuditProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<AuditEntry[]>(INITIAL_AUDIT);
  const { currentOfficer } = useAuth();

  const logAction = useCallback(
    (action: string, module: string, details: string) => {
      const entry: AuditEntry = {
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        officerId: currentOfficer.id,
        officerName: currentOfficer.name,
        action,
        module,
        details,
      };
      setEntries((prev) => [entry, ...prev]);
    },
    [currentOfficer]
  );

  return (
    <AuditContext.Provider value={{ entries, logAction }}>
      {children}
    </AuditContext.Provider>
  );
}

export function useAudit() {
  const ctx = useContext(AuditContext);
  if (!ctx) throw new Error('useAudit must be used within AuditProvider');
  return ctx;
}
