import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { AuditEntry } from '../types';
import { useAuth } from './AuthContext';
import { useFiveM } from './FiveMContext';
import { fetchNui } from '../utils/fivem';

interface AuditContextType {
  entries: AuditEntry[];
  logAction: (action: string, module: string, details: string) => void;
}

const AuditContext = createContext<AuditContextType | null>(null);

export function AuditProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const { currentOfficer, permissions, isAuthenticated } = useAuth();
  const { isInGame } = useFiveM();

  useEffect(() => {
    if (!isAuthenticated || !isInGame || !permissions.viewAuditLog) {
      if (!isAuthenticated) setEntries([]);
      return;
    }

    fetchNui<{ success: boolean; entries?: AuditEntry[] }>('getAuditLog', {})
      .then((result) => {
        if (result.success && result.entries) {
          setEntries(result.entries);
        }
      })
      .catch(() => {});
  }, [isAuthenticated, isInGame, permissions.viewAuditLog]);

  const logAction = useCallback(
    (action: string, module: string, details: string) => {
      if (!currentOfficer) return;
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
      fetchNui('logAction', {
        action,
        module,
        details,
        officerId: currentOfficer.id,
        officerName: currentOfficer.name,
      });
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
