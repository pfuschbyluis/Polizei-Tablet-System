import type { Permission, RoleTemplate } from '../types';

export const PERMISSION_LABELS: Record<keyof Permission, string> = {
  viewDashboard: 'Dashboard einsehen',
  viewOwnCases: 'Eigene Akten einsehen',
  viewAllCases: 'Alle Akten einsehen',
  createCases: 'Akten erstellen',
  editCases: 'Akten bearbeiten',
  deleteCases: 'Akten löschen',
  viewPersons: 'Personen einsehen',
  editPersons: 'Personen bearbeiten',
  viewWeapons: 'Waffenregister einsehen',
  editWeapons: 'Waffen bearbeiten',
  viewVehicles: 'Fahrzeugregister einsehen',
  editVehicles: 'Fahrzeuge bearbeiten',
  viewWanted: 'Fahndung einsehen',
  editWanted: 'Fahndung bearbeiten',
  viewEmployees: 'Mitarbeiter einsehen',
  manageEmployees: 'Mitarbeiter verwalten',
  manageRoles: 'Rollen & Berechtigungen verwalten',
  viewSettings: 'Einstellungen aufrufen',
  viewAuditLog: 'Protokoll einsehen',
  adminFunctions: 'Administration',
};

export const PERMISSION_GROUPS: { title: string; keys: (keyof Permission)[] }[] = [
  {
    title: 'Allgemein',
    keys: ['viewDashboard', 'viewSettings', 'viewAuditLog', 'adminFunctions'],
  },
  {
    title: 'Akten',
    keys: ['viewOwnCases', 'viewAllCases', 'createCases', 'editCases', 'deleteCases'],
  },
  {
    title: 'Personen',
    keys: ['viewPersons', 'editPersons'],
  },
  {
    title: 'Register',
    keys: ['viewWeapons', 'editWeapons', 'viewVehicles', 'editVehicles', 'viewWanted', 'editWanted'],
  },
  {
    title: 'Verwaltung',
    keys: ['viewEmployees', 'manageEmployees', 'manageRoles'],
  },
];

export type EffectivePermission = Permission & {
  viewCases: boolean;
};

export function emptyPermissions(): Permission {
  return {
    viewDashboard: false,
    viewOwnCases: false,
    viewAllCases: false,
    createCases: false,
    editCases: false,
    deleteCases: false,
    viewPersons: false,
    editPersons: false,
    viewWeapons: false,
    editWeapons: false,
    viewVehicles: false,
    editVehicles: false,
    viewWanted: false,
    editWanted: false,
    viewEmployees: false,
    manageEmployees: false,
    manageRoles: false,
    viewSettings: false,
    viewAuditLog: false,
    adminFunctions: false,
  };
}

export function fullPermissions(): Permission {
  const p = emptyPermissions();
  (Object.keys(p) as (keyof Permission)[]).forEach((k) => {
    p[k] = true;
  });
  return p;
}

export function toEffectivePermissions(p: Permission): EffectivePermission {
  return {
    ...p,
    viewCases: p.viewOwnCases || p.viewAllCases,
  };
}

export function countActivePermissions(p: Permission): number {
  return (Object.keys(p) as (keyof Permission)[]).filter((k) => p[k]).length;
}

export function permissionsFromTemplate(template: RoleTemplate | undefined, overrides?: Partial<Permission>): Permission {
  const base = template ? { ...template.permissions } : emptyPermissions();
  if (!overrides) return base;
  return { ...base, ...overrides };
}

export const DEFAULT_ROLE_TEMPLATES: RoleTemplate[] = [
  {
    id: 'tpl-administrator',
    name: 'Administrator',
    description: 'Voller Zugriff auf alle Funktionen',
    isSystem: true,
    permissions: fullPermissions(),
  },
  {
    id: 'tpl-leitung',
    name: 'Leitung',
    description: 'Leitungsfunktionen ohne Rollenverwaltung',
    isSystem: true,
    permissions: {
      ...emptyPermissions(),
      viewDashboard: true,
      viewOwnCases: true,
      viewAllCases: true,
      createCases: true,
      editCases: true,
      deleteCases: true,
      viewPersons: true,
      editPersons: true,
      viewWeapons: true,
      editWeapons: true,
      viewVehicles: true,
      editVehicles: true,
      viewWanted: true,
      editWanted: true,
      viewEmployees: true,
      manageEmployees: true,
      viewSettings: true,
      viewAuditLog: true,
      adminFunctions: true,
    },
  },
  {
    id: 'tpl-sachbearbeiter',
    name: 'Sachbearbeiter',
    description: 'Aktenbearbeitung und Registerzugriff',
    isSystem: true,
    permissions: {
      ...emptyPermissions(),
      viewDashboard: true,
      viewOwnCases: true,
      viewAllCases: true,
      createCases: true,
      editCases: true,
      viewPersons: true,
      editPersons: true,
      viewWeapons: true,
      viewVehicles: true,
      viewWanted: true,
      editWanted: true,
    },
  },
  {
    id: 'tpl-praktikant',
    name: 'Praktikant',
    description: 'Eingeschränkter Lesezugriff',
    isSystem: true,
    permissions: {
      ...emptyPermissions(),
      viewDashboard: true,
      viewOwnCases: true,
      viewPersons: true,
      viewWeapons: true,
      viewVehicles: true,
      viewWanted: true,
    },
  },
];

export function templateForLegacyRank(rank: string): string {
  const map: Record<string, string> = {
    admin: 'tpl-administrator',
    leitstelle: 'tpl-leitung',
    ermittler: 'tpl-sachbearbeiter',
    beamter: 'tpl-praktikant',
  };
  return map[rank] ?? 'tpl-praktikant';
}

export function getTemplateById(templates: RoleTemplate[], id: string | null | undefined): RoleTemplate | undefined {
  if (!id) return undefined;
  return templates.find((t) => t.id === id);
}
