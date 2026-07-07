import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import type {
  Officer,
  Rank,
  Employee,
  EmployeeInput,
  RoleTemplate,
  RoleTemplateInput,
  EffectivePermission,
} from '../types';
import {
  RANK_LABELS,
  emptyPermissions,
  toEffectivePermissions,
  DEFAULT_ROLE_TEMPLATES,
  templateForLegacyRank,
  getTemplateById,
} from '../types';
import { DEV_EMPLOYEES } from '../data/defaults';
import { useFiveM } from './FiveMContext';
import { fetchNui, isFiveM } from '../utils/fivem';

interface LoginResult {
  success: boolean;
  officer?: Officer & { sessionToken?: string };
  employees?: Employee[];
  roleTemplates?: RoleTemplate[];
  error?: string;
}

interface AuthContextType {
  currentOfficer: Officer | null;
  permissions: EffectivePermission;
  rankLabel: string;
  isAuthenticated: boolean;
  isDevMode: boolean;
  employees: Employee[];
  roleTemplates: RoleTemplate[];
  login: (badgeNumber: string, password: string) => Promise<boolean>;
  logout: () => void;
  switchRank: (rank: Rank) => void;
  createEmployee: (input: EmployeeInput) => Promise<{ success: boolean; error?: string }>;
  updateEmployee: (id: string, input: Partial<EmployeeInput>) => Promise<{ success: boolean; error?: string }>;
  deleteEmployee: (id: string) => Promise<{ success: boolean; error?: string }>;
  createRoleTemplate: (input: RoleTemplateInput) => Promise<{ success: boolean; error?: string; roleTemplate?: RoleTemplate }>;
  updateRoleTemplate: (id: string, input: Partial<RoleTemplateInput>) => Promise<{ success: boolean; error?: string; roleTemplate?: RoleTemplate }>;
  deleteRoleTemplate: (id: string) => Promise<{ success: boolean; error?: string }>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const EMPTY_EFFECTIVE = toEffectivePermissions(emptyPermissions());

function buildDevEmployeePublic(emp: (typeof DEV_EMPLOYEES)[0]): Employee {
  const tplId = emp.roleTemplateId ?? templateForLegacyRank(emp.rank);
  const tpl = getTemplateById(DEFAULT_ROLE_TEMPLATES, tplId);
  const { password: _, ...rest } = emp;
  return {
    ...rest,
    roleTemplateId: tplId,
    permissions: emp.permissions ?? tpl?.permissions ?? emptyPermissions(),
  };
}

function devLogin(badgeNumber: string, password: string): LoginResult {
  const emp = DEV_EMPLOYEES.find(
    (e) => e.badgeNumber.toLowerCase() === badgeNumber.toLowerCase() && e.password === password && e.active
  );
  if (!emp) return { success: false, error: 'Dienstnummer oder Passwort ungültig.' };

  const publicEmp = buildDevEmployeePublic(emp);
  const officer: Officer = {
    id: publicEmp.id,
    badgeNumber: publicEmp.badgeNumber,
    name: publicEmp.name,
    rank: publicEmp.rank,
    unit: publicEmp.unit,
    roleTemplateId: publicEmp.roleTemplateId,
    permissions: publicEmp.permissions,
  };

  const employees = DEV_EMPLOYEES.map(buildDevEmployeePublic);
  const canView = toEffectivePermissions(publicEmp.permissions).viewEmployees;

  return {
    success: true,
    officer,
    employees: canView ? employees : [],
    roleTemplates: canView ? DEFAULT_ROLE_TEMPLATES : [],
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { isInGame } = useFiveM();
  const navigate = useNavigate();
  const isDevMode = !isInGame;
  const [currentOfficer, setCurrentOfficer] = useState<Officer | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [roleTemplates, setRoleTemplates] = useState<RoleTemplate[]>(DEFAULT_ROLE_TEMPLATES);
  const [isLoading, setIsLoading] = useState(false);

  const isAuthenticated = currentOfficer !== null;
  const permissions = useMemo(
    () => (currentOfficer?.permissions ? toEffectivePermissions(currentOfficer.permissions) : EMPTY_EFFECTIVE),
    [currentOfficer]
  );
  const rankLabel = currentOfficer ? RANK_LABELS[currentOfficer.rank] : '';

  const login = useCallback(async (badgeNumber: string, password: string): Promise<boolean> => {
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
        const { sessionToken: _, ...officer } = result.officer;
        setCurrentOfficer(officer);
        setEmployees(result.employees ?? []);
        setRoleTemplates(result.roleTemplates ?? DEFAULT_ROLE_TEMPLATES);
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setCurrentOfficer(null);
    setEmployees([]);
    setRoleTemplates(DEFAULT_ROLE_TEMPLATES);
    navigate('/', { replace: true });
    if (isFiveM()) fetchNui('logout');
  }, [navigate]);

  const switchRank = useCallback((rank: Rank) => {
    if (isFiveM() || !currentOfficer) return;
    const tplId = templateForLegacyRank(rank);
    const tpl = getTemplateById(DEFAULT_ROLE_TEMPLATES, tplId);
    setCurrentOfficer((prev) =>
      prev
        ? {
            ...prev,
            rank,
            roleTemplateId: tplId,
            permissions: tpl?.permissions ?? emptyPermissions(),
          }
        : null
    );
  }, [currentOfficer]);

  const createEmployee = useCallback(async (input: EmployeeInput) => {
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
        return { success: false, error: error instanceof Error ? error.message : 'Verbindungsfehler.' };
      }
    }
    const exists = DEV_EMPLOYEES.some((e) => e.badgeNumber === input.badgeNumber);
    if (exists) return { success: false, error: 'Dienstnummer bereits vergeben.' };
    const tplId = input.roleTemplateId ?? templateForLegacyRank(input.rank);
    const tpl = getTemplateById(DEFAULT_ROLE_TEMPLATES, tplId);
    DEV_EMPLOYEES.push({
      id: `emp-${Date.now()}`,
      ...input,
      roleTemplateId: tplId,
      permissions: input.permissions ?? tpl?.permissions ?? emptyPermissions(),
      active: input.active ?? true,
      createdAt: new Date().toISOString().split('T')[0],
    });
    setEmployees(DEV_EMPLOYEES.map(buildDevEmployeePublic));
    return { success: true };
  }, []);

  const updateEmployee = useCallback(async (id: string, input: Partial<EmployeeInput>) => {
    if (isFiveM()) {
      try {
        const result = await fetchNui<{ success: boolean; employee?: Employee; error?: string }>(
          'updateEmployee',
          { id, ...input }
        );
        if (result.success && result.employee) {
          setEmployees((prev) => prev.map((e) => (e.id === id ? result.employee! : e)));
          if (currentOfficer?.id === id && result.employee.permissions) {
            setCurrentOfficer((prev) =>
              prev ? { ...prev, permissions: result.employee!.permissions, roleTemplateId: result.employee!.roleTemplateId } : null
            );
          }
          return { success: true };
        }
        return { success: false, error: result.error ?? 'Speichern fehlgeschlagen.' };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Verbindungsfehler.' };
      }
    }
    const idx = DEV_EMPLOYEES.findIndex((e) => e.id === id);
    if (idx === -1) return { success: false, error: 'Mitarbeiter nicht gefunden.' };
    DEV_EMPLOYEES[idx] = { ...DEV_EMPLOYEES[idx], ...input };
    setEmployees(DEV_EMPLOYEES.map(buildDevEmployeePublic));
    return { success: true };
  }, [currentOfficer?.id]);

  const deleteEmployee = useCallback(async (id: string) => {
    if (isFiveM()) {
      try {
        const result = await fetchNui<{ success: boolean; error?: string }>('deleteEmployee', { id });
        if (result.success) {
          setEmployees((prev) => prev.filter((e) => e.id !== id));
          return { success: true };
        }
        return { success: false, error: result.error ?? 'Löschen fehlgeschlagen.' };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Verbindungsfehler.' };
      }
    }
    const idx = DEV_EMPLOYEES.findIndex((e) => e.id === id);
    if (idx === -1) return { success: false, error: 'Mitarbeiter nicht gefunden.' };
    DEV_EMPLOYEES.splice(idx, 1);
    setEmployees(DEV_EMPLOYEES.map(buildDevEmployeePublic));
    return { success: true };
  }, []);

  const createRoleTemplate = useCallback(async (input: RoleTemplateInput) => {
    if (isFiveM()) {
      try {
        const result = await fetchNui<{ success: boolean; roleTemplate?: RoleTemplate; error?: string }>(
          'createRoleTemplate',
          input
        );
        if (result.success && result.roleTemplate) {
          setRoleTemplates((prev) => [...prev, result.roleTemplate!]);
          return { success: true, roleTemplate: result.roleTemplate };
        }
        return { success: false, error: result.error ?? 'Vorlage konnte nicht erstellt werden.' };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Verbindungsfehler.' };
      }
    }
    const tpl: RoleTemplate = {
      id: `tpl-${Date.now()}`,
      name: input.name,
      description: input.description,
      isSystem: false,
      permissions: input.permissions,
    };
    setRoleTemplates((prev) => [...prev, tpl]);
    return { success: true, roleTemplate: tpl };
  }, []);

  const updateRoleTemplate = useCallback(async (id: string, input: Partial<RoleTemplateInput>) => {
    if (isFiveM()) {
      try {
        const result = await fetchNui<{ success: boolean; roleTemplate?: RoleTemplate; error?: string }>(
          'updateRoleTemplate',
          { id, ...input }
        );
        if (result.success && result.roleTemplate) {
          setRoleTemplates((prev) => prev.map((t) => (t.id === id ? result.roleTemplate! : t)));
          return { success: true, roleTemplate: result.roleTemplate };
        }
        return { success: false, error: result.error ?? 'Speichern fehlgeschlagen.' };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Verbindungsfehler.' };
      }
    }
    setRoleTemplates((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              name: input.name ?? t.name,
              description: input.description ?? t.description,
              permissions: input.permissions ?? t.permissions,
            }
          : t
      )
    );
    return { success: true };
  }, []);

  const deleteRoleTemplate = useCallback(async (id: string) => {
    if (isFiveM()) {
      try {
        const result = await fetchNui<{ success: boolean; error?: string }>('deleteRoleTemplate', { id });
        if (result.success) {
          setRoleTemplates((prev) => prev.filter((t) => t.id !== id));
          return { success: true };
        }
        return { success: false, error: result.error ?? 'Löschen fehlgeschlagen.' };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Verbindungsfehler.' };
      }
    }
    const tpl = roleTemplates.find((t) => t.id === id);
    if (!tpl || tpl.isSystem) return { success: false, error: 'Systemvorlage kann nicht gelöscht werden.' };
    setRoleTemplates((prev) => prev.filter((t) => t.id !== id));
    return { success: true };
  }, [roleTemplates]);

  return (
    <AuthContext.Provider
      value={{
        currentOfficer,
        permissions,
        rankLabel,
        isAuthenticated,
        isDevMode,
        employees,
        roleTemplates,
        login,
        logout,
        switchRank,
        createEmployee,
        updateEmployee,
        deleteEmployee,
        createRoleTemplate,
        updateRoleTemplate,
        deleteRoleTemplate,
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
