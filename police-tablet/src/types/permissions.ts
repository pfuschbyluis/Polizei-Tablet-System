export interface Permission {
  viewDashboard: boolean;
  viewOwnCases: boolean;
  viewAllCases: boolean;
  createCases: boolean;
  editCases: boolean;
  deleteCases: boolean;
  viewPersons: boolean;
  editPersons: boolean;
  viewWeapons: boolean;
  editWeapons: boolean;
  viewVehicles: boolean;
  editVehicles: boolean;
  viewWanted: boolean;
  editWanted: boolean;
  viewEmployees: boolean;
  manageEmployees: boolean;
  manageRoles: boolean;
  viewSettings: boolean;
  viewAuditLog: boolean;
  adminFunctions: boolean;
}

export interface RoleTemplate {
  id: string;
  name: string;
  description: string;
  isSystem: boolean;
  permissions: Permission;
}
