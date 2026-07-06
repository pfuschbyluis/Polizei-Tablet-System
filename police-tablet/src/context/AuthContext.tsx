import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Officer, Rank, Permission, Employee, EmployeeInput } from '../types';
import { PERMISSIONS, RANK_LABELS } from '../types';
import { DEV_EMPLOYEES, stripPassword } from '../data/defaults';
import { useFiveM } from './FiveMContext';
import { fetchNui, isFiveM } from '../utils/fivem';

interface LoginResult {
  success: boolean;
  officer?: Officer;
  employees?: Employee[];
  error?: string;
}

interface AuthContextType {
  currentOfficer: Officer | null;
  permissions: Permission;
  rankLabel: string;
  isAuthenticated: boolean;
  isDevMode: boolean;
  employees: Employee[];
  login: (badgeNumber: string, password: string) => Promise<boolean>;
  logout: () => void;
  switchRank: (rank: Rank) => void;
  createEmployee: (input: EmployeeInput) => Promise<{ success: boolean; error?: string }>;
  updateEmployee: (id: string, input: Partial<EmployeeInput>) => Promise<{ success: boolean; error?: string }>;
  deleteEmployee: (id: string) => Promise<{ success: boolean; error?: string }>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const EMPTY_PERMISSIONS: Permission = {
  viewDashboard: false,
  viewPersons: false,
  editPersons: false,
  viewCases: false,
  createCases: false,
  editCases: false,
  viewWeapons: false,
  editWeapons: false,
  viewVehicles: false,
  editVehicles: false,
  viewWanted: false,
  editWanted: false,
  viewAuditLog: false,
  adminFunctions: false,
  viewEmployees: false,
  manageEmployees: false,
};

function devLogin(badgeNumber: string, password: string): LoginResult {
  const emp = DEV_EMPLOYEES.find(
    (e) => e.badgeNumber.toLowerCase() === badgeNumber.toLowerCase() && e.password === password && e.active
  );
  if (!emp) return { success: false, error: 'Dienstnummer oder Passwort ungültig.' };
  const officer: Officer = {
    id: emp.id,
    badgeNumber: emp.badgeNumber,
    name: emp.name,
    rank: emp.rank,
    unit: emp.unit,
  };
  const employees = DEV_EMPLOYEES.map(stripPassword) as Employee[];
  return { success: true, officer, employees };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { isInGame } = useFiveM();
  const navigate = useNavigate();
  const isDevMode = !isInGame;
  const [currentOfficer, setCurrentOfficer] = useState<Officer | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const isAuthenticated = currentOfficer !== null;
  const permissions = currentOfficer ? PERMISSIONS[currentOfficer.rank] : EMPTY_PERMISSIONS;
  const rankLabel = currentOfficer ? RANK_LABELS[currentOfficer.rank] : '';

  const login = useCallback(
    async (badgeNumber: string, password: string): Promise<boolean> => {
      setIsLoading(true);
      try {
        let result: LoginResult;
        if (isFiveM()) {
          result = await fetchNui<LoginResult>('login', { badgeNumber, password });
        } else {
          await new Promise((r) => setTimeout(r, 150));
          result = devLogin(badgeNumber, password);
        }
        if (result.success && result.officer) {
          const { sessionToken: _, ...officer } = result.officer as typeof result.officer & {
            sessionToken?: string;
          };
          setCurrentOfficer(officer);
          setEmployees(result.employees ?? []);
          return true;
        }
        return false;
      } catch {
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout = useCallback(() => {
    setCurrentOfficer(null);
    setEmployees([]);
    navigate('/', { replace: true });
    if (isFiveM()) fetchNui('logout');
  }, [navigate]);

  const switchRank = useCallback((rank: Rank) => {
    if (isFiveM() || !currentOfficer) return;
    setCurrentOfficer((prev) => (prev ? { ...prev, rank } : null));
  }, [currentOfficer]);

  const createEmployee = useCallback(
    async (input: EmployeeInput): Promise<{ success: boolean; error?: string }> => {
      if (isFiveM()) {
        try {
          const result = await fetchNui<{ success: boolean; employee?: Employee; error?: string }>(
            'createEmployee',
            input
          );
          if (result.success && result.employee) {
            setEmployees((prev) => [...prev, result.employee!]);
            return { success: true };
          }
          return { success: false, error: result.error ?? 'Erstellen fehlgeschlagen.' };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Verbindungsfehler.',
          };
        }
      }
      const exists = DEV_EMPLOYEES.some((e) => e.badgeNumber === input.badgeNumber);
      if (exists) return { success: false, error: 'Dienstnummer bereits vergeben.' };
      const emp = {
        id: `emp-${Date.now()}`,
        ...input,
        active: input.active ?? true,
        createdAt: new Date().toISOString().split('T')[0],
      };
      DEV_EMPLOYEES.push(emp);
      setEmployees(DEV_EMPLOYEES.map(stripPassword) as Employee[]);
      return { success: true };
    },
    []
  );

  const updateEmployee = useCallback(
    async (id: string, input: Partial<EmployeeInput>): Promise<{ success: boolean; error?: string }> => {
      if (isFiveM()) {
        try {
          const result = await fetchNui<{ success: boolean; employee?: Employee; error?: string }>(
            'updateEmployee',
            { id, ...input }
          );
          if (result.success && result.employee) {
            setEmployees((prev) => prev.map((e) => (e.id === id ? result.employee! : e)));
            return { success: true };
          }
          return { success: false, error: result.error ?? 'Speichern fehlgeschlagen.' };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Verbindungsfehler.',
          };
        }
      }
      const idx = DEV_EMPLOYEES.findIndex((e) => e.id === id);
      if (idx === -1) return { success: false, error: 'Mitarbeiter nicht gefunden.' };
      DEV_EMPLOYEES[idx] = { ...DEV_EMPLOYEES[idx], ...input };
      setEmployees(DEV_EMPLOYEES.map(stripPassword) as Employee[]);
      return { success: true };
    },
    []
  );

  const deleteEmployee = useCallback(async (id: string): Promise<{ success: boolean; error?: string }> => {
    if (isFiveM()) {
      try {
        const result = await fetchNui<{ success: boolean; error?: string }>('deleteEmployee', { id });
        if (result.success) {
          setEmployees((prev) => prev.filter((e) => e.id !== id));
          return { success: true };
        }
        return { success: false, error: result.error ?? 'Löschen fehlgeschlagen.' };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Verbindungsfehler.',
        };
      }
    }
    const idx = DEV_EMPLOYEES.findIndex((e) => e.id === id);
    if (idx === -1) return { success: false, error: 'Mitarbeiter nicht gefunden.' };
    DEV_EMPLOYEES.splice(idx, 1);
    setEmployees(DEV_EMPLOYEES.map(stripPassword) as Employee[]);
    return { success: true };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        currentOfficer,
        permissions,
        rankLabel,
        isAuthenticated,
        isDevMode,
        employees,
        login,
        logout,
        switchRank,
        createEmployee,
        updateEmployee,
        deleteEmployee,
        isLoading,
      }}
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
