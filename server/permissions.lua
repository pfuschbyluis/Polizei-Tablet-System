Permissions = {}

local PERMISSION_KEYS = {
    'viewDashboard',
    'viewOwnCases',
    'viewAllCases',
    'createCases',
    'editCases',
    'deleteCases',
    'viewPersons',
    'editPersons',
    'viewWeapons',
    'editWeapons',
    'viewVehicles',
    'editVehicles',
    'viewWanted',
    'editWanted',
    'viewEmployees',
    'manageEmployees',
    'manageRoles',
    'viewSettings',
    'viewAuditLog',
    'adminFunctions',
}

function Permissions.Empty()
    local p = {}
    for _, key in ipairs(PERMISSION_KEYS) do
        p[key] = false
    end
    return p
end

function Permissions.Full()
    local p = {}
    for _, key in ipairs(PERMISSION_KEYS) do
        p[key] = true
    end
    return p
end

function Permissions.FromTable(raw)
    local base = Permissions.Empty()
    if type(raw) ~= 'table' then
        return base
    end
    for _, key in ipairs(PERMISSION_KEYS) do
        if raw[key] ~= nil then
            base[key] = raw[key] == true or raw[key] == 1
        end
    end
    return base
end

function Permissions.Has(permissions, key)
    if not permissions then return false end
    if key == 'viewCases' then
        return permissions.viewOwnCases or permissions.viewAllCases
    end
    return permissions[key] == true
end

function Permissions.DefaultTemplates()
    return {
        {
            id = 'tpl-administrator',
            name = 'Administrator',
            description = 'Voller Zugriff auf alle Funktionen',
            isSystem = true,
            permissions = Permissions.Full(),
        },
        {
            id = 'tpl-leitung',
            name = 'Leitung',
            description = 'Leitungsfunktionen ohne Rollenverwaltung',
            isSystem = true,
            permissions = Permissions.FromTable({
                viewDashboard = true,
                viewOwnCases = true,
                viewAllCases = true,
                createCases = true,
                editCases = true,
                deleteCases = true,
                viewPersons = true,
                editPersons = true,
                viewWeapons = true,
                editWeapons = true,
                viewVehicles = true,
                editVehicles = true,
                viewWanted = true,
                editWanted = true,
                viewEmployees = true,
                manageEmployees = true,
                viewSettings = true,
                viewAuditLog = true,
                adminFunctions = true,
            }),
        },
        {
            id = 'tpl-sachbearbeiter',
            name = 'Sachbearbeiter',
            description = 'Aktenbearbeitung und Registerzugriff',
            isSystem = true,
            permissions = Permissions.FromTable({
                viewDashboard = true,
                viewOwnCases = true,
                viewAllCases = true,
                createCases = true,
                editCases = true,
                viewPersons = true,
                editPersons = true,
                viewWeapons = true,
                editWeapons = true,
                viewVehicles = true,
                editVehicles = true,
                viewWanted = true,
                editWanted = true,
            }),
        },
        {
            id = 'tpl-praktikant',
            name = 'Praktikant',
            description = 'Eingeschränkter Lesezugriff',
            isSystem = true,
            permissions = Permissions.FromTable({
                viewDashboard = true,
                viewOwnCases = true,
                viewPersons = true,
                viewWeapons = true,
                viewVehicles = true,
                viewWanted = true,
            }),
        },
    }
end

function Permissions.TemplateForRank(rank)
    local map = {
        admin = 'tpl-administrator',
        leitstelle = 'tpl-leitung',
        ermittler = 'tpl-sachbearbeiter',
        beamter = 'tpl-praktikant',
    }
    return map[rank] or 'tpl-praktikant'
end

function Permissions.ResolveForEmployee(employee, templatesById)
    if employee.permissions and next(employee.permissions) then
        return Permissions.FromTable(employee.permissions)
    end

    local templateId = employee.roleTemplateId or Permissions.TemplateForRank(employee.rank)
    local template = templatesById and templatesById[templateId]
    if template and template.permissions then
        return Permissions.FromTable(template.permissions)
    end

    return Permissions.FromTable(Permissions.Empty())
end
