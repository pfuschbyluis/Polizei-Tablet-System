local function DebugPrint(msg)
    print(('[^3POLIS^7] %s'):format(msg))
end

local function NuiError(src, reqId, message)
    TriggerClientEvent('polis:client:nuiResult', src, reqId, { success = false, error = message })
end

local function NuiOk(src, reqId, payload)
    TriggerClientEvent('polis:client:nuiResult', src, reqId, payload)
end

local function ResolveSession(src, data)
    local token = data and data.sessionToken or nil
    return Repository.GetSession(token, src)
end

local function RequireSession(src, reqId, data)
    local session = ResolveSession(src, data)
    if not session then
        NuiError(src, reqId, 'Sitzung abgelaufen. Bitte erneut anmelden.')
        return nil
    end
    return session
end

-- Login
RegisterNetEvent('polis:server:login', function(reqId, data)
    local src = source
    local badgeNumber = data and data.badgeNumber or ''
    local password = data and data.password or ''

    local emp = Repository.FindEmployeeByBadge(badgeNumber)
    if not emp or not emp.active or not Password.Verify(password, emp.passwordHash) then
        NuiError(src, reqId, 'Dienstnummer oder Passwort ungültig.')
        return
    end

    local sessionToken = Repository.CreateSession(emp.id, src)
    local resolvedPerms = Repository.ResolveEmployeePermissions(emp)
    local officer = {
        id = emp.id,
        badgeNumber = emp.badgeNumber,
        name = emp.name,
        rank = emp.rank,
        roleTemplateId = emp.roleTemplateId,
        permissions = resolvedPerms,
        sessionToken = sessionToken,
    }

    local employees = {}
    local roleTemplates = {}
    if Repository.CanViewEmployees(emp) then
        for _, e in ipairs(Repository.GetAllEmployees()) do
            employees[#employees + 1] = Repository.CopyEmployeePublic(e)
        end
        for _, t in ipairs(Repository.GetAllRoleTemplates()) do
            roleTemplates[#roleTemplates + 1] = Repository.CopyRoleTemplatePublic(t)
        end
    end

    NuiOk(src, reqId, {
        success = true,
        officer = officer,
        employees = employees,
        roleTemplates = roleTemplates,
    })

    if Password.NeedsRehash(emp.passwordHash) then
        CreateThread(function()
            local newHash = Password.Rehash(password)
            if newHash then
                MySQL.update.await('UPDATE polis_employees SET password_hash = ? WHERE id = ?', { newHash, emp.id })
            end
        end)
    end

    DebugPrint(('Login: %s (%s)'):format(emp.name, emp.badgeNumber))
end)

RegisterNetEvent('polis:server:logout', function(_, data)
    local src = source
    Repository.DeleteSessionsForSource(src)
end)

-- Mitarbeiter
RegisterNetEvent('polis:server:createEmployee', function(reqId, data)
    local src = source
    local session = RequireSession(src, reqId, data)
    if not session then return end

    if not Repository.CanManageEmployees(session.employee) then
        NuiError(src, reqId, 'Keine Berechtigung.')
        return
    end

    if Repository.FindEmployeeByBadge(data.badgeNumber or '') then
        NuiError(src, reqId, 'Dienstnummer vergeben.')
        return
    end

    local emp, err = Repository.CreateEmployee(data)
    if not emp then
        NuiError(src, reqId, err or 'Erstellen fehlgeschlagen.')
        return
    end

    NuiOk(src, reqId, { success = true, employee = Repository.CopyEmployeePublic(emp) })
    DebugPrint(('Mitarbeiter erstellt: %s'):format(emp.name))
end)

RegisterNetEvent('polis:server:updateEmployee', function(reqId, data)
    local src = source
    local session = RequireSession(src, reqId, data)
    if not session then return end

    if not Repository.CanManageEmployees(session.employee) then
        NuiError(src, reqId, 'Keine Berechtigung.')
        return
    end

    local emp = Repository.UpdateEmployee(data.id, data)
    if not emp then
        NuiError(src, reqId, 'Aktualisieren fehlgeschlagen.')
        return
    end

    NuiOk(src, reqId, { success = true, employee = Repository.CopyEmployeePublic(emp) })
end)

RegisterNetEvent('polis:server:deleteEmployee', function(reqId, data)
    local src = source
    local session = RequireSession(src, reqId, data)
    if not session then return end

    if not Repository.CanManageEmployees(session.employee) then
        NuiError(src, reqId, 'Keine Berechtigung.')
        return
    end

    if data.id == session.employee.id then
        NuiError(src, reqId, 'Eigener Account.')
        return
    end

    Repository.DeleteEmployee(data.id)
    NuiOk(src, reqId, { success = true })
end)

-- Rollenvorlagen
RegisterNetEvent('polis:server:getRoleTemplates', function(reqId, data)
    local src = source
    local session = RequireSession(src, reqId, data)
    if not session then return end

    if not Repository.CanManageRoles(session.employee) and not Repository.CanManageEmployees(session.employee) then
        NuiError(src, reqId, 'Keine Berechtigung.')
        return
    end

    local templates = {}
    for _, t in ipairs(Repository.GetAllRoleTemplates()) do
        templates[#templates + 1] = Repository.CopyRoleTemplatePublic(t)
    end
    NuiOk(src, reqId, { success = true, roleTemplates = templates })
end)

RegisterNetEvent('polis:server:createRoleTemplate', function(reqId, data)
    local src = source
    local session = RequireSession(src, reqId, data)
    if not session then return end

    if not Repository.CanManageRoles(session.employee) then
        NuiError(src, reqId, 'Keine Berechtigung.')
        return
    end

    local tpl = Repository.CreateRoleTemplate(data)
    if not tpl then
        NuiError(src, reqId, 'Vorlage konnte nicht erstellt werden.')
        return
    end

    NuiOk(src, reqId, { success = true, roleTemplate = Repository.CopyRoleTemplatePublic(tpl) })
end)

RegisterNetEvent('polis:server:updateRoleTemplate', function(reqId, data)
    local src = source
    local session = RequireSession(src, reqId, data)
    if not session then return end

    if not Repository.CanManageRoles(session.employee) then
        NuiError(src, reqId, 'Keine Berechtigung.')
        return
    end

    local tpl = Repository.UpdateRoleTemplate(data.id, data)
    if not tpl then
        NuiError(src, reqId, 'Vorlage nicht gefunden.')
        return
    end

    NuiOk(src, reqId, { success = true, roleTemplate = Repository.CopyRoleTemplatePublic(tpl) })
end)

RegisterNetEvent('polis:server:deleteRoleTemplate', function(reqId, data)
    local src = source
    local session = RequireSession(src, reqId, data)
    if not session then return end

    if not Repository.CanManageRoles(session.employee) then
        NuiError(src, reqId, 'Keine Berechtigung.')
        return
    end

    if not Repository.DeleteRoleTemplate(data.id) then
        NuiError(src, reqId, 'Systemvorlagen können nicht gelöscht werden.')
        return
    end

    NuiOk(src, reqId, { success = true })
end)

-- Branding / Einstellungen
RegisterNetEvent('polis:server:getBranding', function(reqId, _)
    local src = source
    NuiOk(src, reqId, { success = true, branding = Repository.GetBranding() })
end)

RegisterNetEvent('polis:server:updateBranding', function(reqId, data)
    local src = source
    local session = RequireSession(src, reqId, data)
    if not session then return end

    if not Repository.CanManageSettings(session.employee) then
        NuiError(src, reqId, 'Keine Berechtigung.')
        return
    end

    local iconUrl = data and data.customIconUrl or ''
    local branding, err = Repository.UpdateBranding(iconUrl)
    if not branding then
        NuiError(src, reqId, err or 'Einstellungen konnten nicht gespeichert werden.')
        return
    end

    NuiOk(src, reqId, { success = true, branding = branding })

    CreateThread(function()
        Repository.LogAudit({
            officerId = session.employee.id,
            officerName = session.employee.name,
            action = 'Polizei-Icon aktualisiert',
            module = 'Einstellungen',
            details = branding.customIconUrl ~= '' and branding.customIconUrl or 'Standard-Icon wiederhergestellt',
        })
        TriggerClientEvent('polis:client:brandingUpdated', -1, branding)
    end)
end)

-- Daten laden
RegisterNetEvent('polis:server:getInitialData', function(reqId, data)
    local src = source
    local session = RequireSession(src, reqId, data)
    if not session then return end

    local payload = Repository.LoadAllData()
    NuiOk(src, reqId, { success = true, data = payload })
end)

RegisterNetEvent('polis:server:getAuditLog', function(reqId, data)
    local src = source
    local session = RequireSession(src, reqId, data)
    if not session then return end

    if not Repository.EmployeeHasPermission(session.employee, 'viewAuditLog') then
        NuiError(src, reqId, 'Keine Berechtigung.')
        return
    end

    NuiOk(src, reqId, { success = true, entries = Repository.GetAuditLog() })
end)

-- Personen
RegisterNetEvent('polis:server:addPersonNote', function(reqId, data)
    local src = source
    local session = RequireSession(src, reqId, data)
    if not session then return end

    if not Repository.EmployeeHasPermission(session.employee, 'editPersons') then
        NuiError(src, reqId, 'Keine Berechtigung.')
        return
    end

    local ok, note = Repository.AddPersonNote(data.personId, data.note)
    if not ok then
        NuiError(src, reqId, 'Person nicht gefunden.')
        return
    end

    NuiOk(src, reqId, { success = true, note = note })
end)

RegisterNetEvent('polis:server:createPerson', function(reqId, data)
    local src = source
    local session = RequireSession(src, reqId, data)
    if not session then return end

    if not Repository.EmployeeHasPermission(session.employee, 'editPersons') then
        NuiError(src, reqId, 'Keine Berechtigung.')
        return
    end

    if not data.firstName or not data.lastName or not data.dateOfBirth then
        NuiError(src, reqId, 'Pflichtfelder fehlen.')
        return
    end

    local person = Repository.CreatePerson(data)
    if not person then
        NuiError(src, reqId, 'Person konnte nicht erstellt werden.')
        return
    end

    NuiOk(src, reqId, { success = true, person = person })
end)

RegisterNetEvent('polis:server:updatePerson', function(reqId, data)
    local src = source
    local session = RequireSession(src, reqId, data)
    if not session then return end

    if not Repository.EmployeeHasPermission(session.employee, 'editPersons') then
        NuiError(src, reqId, 'Keine Berechtigung.')
        return
    end

    local person = Repository.UpdatePerson(data.id, data)
    if not person then
        NuiError(src, reqId, 'Person nicht gefunden.')
        return
    end

    NuiOk(src, reqId, { success = true, person = person })
end)

-- Waffen
RegisterNetEvent('polis:server:createWeapon', function(reqId, data)
    local src = source
    local session = RequireSession(src, reqId, data)
    if not session then return end

    if not Repository.EmployeeHasPermission(session.employee, 'editWeapons') then
        NuiError(src, reqId, 'Keine Berechtigung.')
        return
    end

    if not data.serialNumber or not data.type or not data.caliber then
        NuiError(src, reqId, 'Pflichtfelder fehlen.')
        return
    end

    local weapon, err = Repository.CreateWeapon(data)
    if not weapon then
        NuiError(src, reqId, err or 'Waffe konnte nicht registriert werden.')
        return
    end

    NuiOk(src, reqId, { success = true, weapon = weapon })
end)

RegisterNetEvent('polis:server:updateWeapon', function(reqId, data)
    local src = source
    local session = RequireSession(src, reqId, data)
    if not session then return end

    if not Repository.EmployeeHasPermission(session.employee, 'editWeapons') then
        NuiError(src, reqId, 'Keine Berechtigung.')
        return
    end

    local weapon = Repository.UpdateWeapon(data.id, data)
    if not weapon then
        NuiError(src, reqId, 'Waffe nicht gefunden.')
        return
    end

    NuiOk(src, reqId, { success = true, weapon = weapon })
end)

-- Fahrzeuge
RegisterNetEvent('polis:server:createVehicle', function(reqId, data)
    local src = source
    local session = RequireSession(src, reqId, data)
    if not session then return end

    if not Repository.EmployeeHasPermission(session.employee, 'editVehicles') then
        NuiError(src, reqId, 'Keine Berechtigung.')
        return
    end

    if not data.plate or not data.ownerId or not data.brand or not data.model then
        NuiError(src, reqId, 'Pflichtfelder fehlen.')
        return
    end

    local vehicle, err = Repository.CreateVehicle(data)
    if not vehicle then
        NuiError(src, reqId, err or 'Fahrzeug konnte nicht registriert werden.')
        return
    end

    NuiOk(src, reqId, { success = true, vehicle = vehicle })
end)

RegisterNetEvent('polis:server:updateVehicle', function(reqId, data)
    local src = source
    local session = RequireSession(src, reqId, data)
    if not session then return end

    if not Repository.EmployeeHasPermission(session.employee, 'editVehicles') then
        NuiError(src, reqId, 'Keine Berechtigung.')
        return
    end

    local vehicle = Repository.UpdateVehicle(data.id, data)
    if not vehicle then
        NuiError(src, reqId, 'Fahrzeug nicht gefunden.')
        return
    end

    NuiOk(src, reqId, { success = true, vehicle = vehicle })
end)

-- Fahndung
RegisterNetEvent('polis:server:createWanted', function(reqId, data)
    local src = source
    local session = RequireSession(src, reqId, data)
    if not session then return end

    if not Repository.EmployeeHasPermission(session.employee, 'editWanted') then
        NuiError(src, reqId, 'Keine Berechtigung.')
        return
    end

    if not data.type or not data.targetId or not data.targetName then
        NuiError(src, reqId, 'Pflichtfelder fehlen.')
        return
    end

    local entry = Repository.CreateWanted(data)
    if not entry then
        NuiError(src, reqId, 'Fahndung konnte nicht erstellt werden.')
        return
    end

    NuiOk(src, reqId, { success = true, wanted = entry })
end)

RegisterNetEvent('polis:server:updateWanted', function(reqId, data)
    local src = source
    local session = RequireSession(src, reqId, data)
    if not session then return end

    if not Repository.EmployeeHasPermission(session.employee, 'editWanted') then
        NuiError(src, reqId, 'Keine Berechtigung.')
        return
    end

    local entry = Repository.UpdateWanted(data.id, data)
    if not entry then
        NuiError(src, reqId, 'Fahndung nicht gefunden.')
        return
    end

    NuiOk(src, reqId, { success = true, wanted = entry })
end)

-- Akten
RegisterNetEvent('polis:server:createCase', function(reqId, data)
    local src = source
    local session = RequireSession(src, reqId, data)
    if not session then return end

    if not Repository.EmployeeHasPermission(session.employee, 'createCases') then
        NuiError(src, reqId, 'Keine Berechtigung.')
        return
    end

    local caseFile = Repository.CreateCase(data)
    if not caseFile then
        NuiError(src, reqId, 'Akte konnte nicht erstellt werden.')
        return
    end

    NuiOk(src, reqId, { success = true, caseFile = caseFile })
end)

RegisterNetEvent('polis:server:updateCaseStatus', function(reqId, data)
    local src = source
    local session = RequireSession(src, reqId, data)
    if not session then return end

    if not Repository.EmployeeHasPermission(session.employee, 'editCases') then
        NuiError(src, reqId, 'Keine Berechtigung.')
        return
    end

    local caseFile = Repository.UpdateCaseStatus(data.caseId, data.status)
    if not caseFile then
        NuiError(src, reqId, 'Akte nicht gefunden.')
        return
    end

    NuiOk(src, reqId, { success = true, caseFile = caseFile })
end)

local function ValidateEvidencePayload(evidence)
    if not evidence or not evidence.name or evidence.name:match('^%s*$') then
        return false, 'Dateiname erforderlich.'
    end

    local url = evidence.fileUrl or ''
    if url == '' then
        return false, 'Link oder Datei erforderlich.'
    end

    if url:match('^data:') then
        if #url > 3145728 then
            return false, 'Datei zu groß.'
        end
        return true
    end

    if #url > 512 or not url:match('^https?://') then
        return false, 'Ungültige Bild-URL.'
    end

    return true
end

RegisterNetEvent('polis:server:addCaseEvidence', function(reqId, data)
    local src = source
    local session = RequireSession(src, reqId, data)
    if not session then return end

    if not Repository.EmployeeHasPermission(session.employee, 'editCases') then
        NuiError(src, reqId, 'Keine Berechtigung.')
        return
    end

    local ok, err = ValidateEvidencePayload(data.evidence)
    if not ok then
        NuiError(src, reqId, err)
        return
    end

    local caseFile = Repository.AddCaseEvidence(data.caseId, data.evidence)
    NuiOk(src, reqId, { success = caseFile ~= nil, caseFile = caseFile })
end)

RegisterNetEvent('polis:server:addCaseWitness', function(reqId, data)
    local src = source
    local session = RequireSession(src, reqId, data)
    if not session then return end

    if not Repository.EmployeeHasPermission(session.employee, 'editCases') then
        NuiError(src, reqId, 'Keine Berechtigung.')
        return
    end

    local caseFile = Repository.AddCaseWitness(data.caseId, data.witness)
    NuiOk(src, reqId, { success = caseFile ~= nil, caseFile = caseFile })
end)

RegisterNetEvent('polis:server:addCaseParticipant', function(reqId, data)
    local src = source
    local session = RequireSession(src, reqId, data)
    if not session then return end

    if not Repository.EmployeeHasPermission(session.employee, 'editCases') then
        NuiError(src, reqId, 'Keine Berechtigung.')
        return
    end

    local caseFile = Repository.AddCaseParticipant(data.caseId, data.participant)
    NuiOk(src, reqId, { success = caseFile ~= nil, caseFile = caseFile })
end)

RegisterNetEvent('polis:server:addCaseNote', function(reqId, data)
    local src = source
    local session = RequireSession(src, reqId, data)
    if not session then return end

    if not Repository.EmployeeHasPermission(session.employee, 'editCases') then
        NuiError(src, reqId, 'Keine Berechtigung.')
        return
    end

    local caseFile = Repository.AddCaseNote(data.caseId, data.note)
    NuiOk(src, reqId, { success = caseFile ~= nil, caseFile = caseFile })
end)

-- Audit
RegisterNetEvent('polis:logAction', function(data)
    local src = source
    if not data or type(data) ~= 'table' then return end

    Database.EnsureSchema()

    local session = ResolveSession(src, data)
    local officerId = data.officerId or (session and session.employee.id) or ('src-%s'):format(src)
    local officerName = data.officerName or (session and session.employee.name) or (GetPlayerName(src) or 'Unbekannt')

    Repository.LogAudit({
        timestamp = os.date('%Y-%m-%d %H:%M:%S'),
        officerId = officerId,
        officerName = officerName,
        action = data.action or '?',
        module = data.module or '?',
        details = data.details or '',
    })

    DebugPrint(('Audit [%s] %s – %s: %s'):format(officerName, data.module or '?', data.action or '?', data.details or ''))
end)

-- Export
function GetPlayerRank(source)
    Database.EnsureSchema()
    local rows = MySQL.query.await('SELECT e.rank FROM polis_sessions s JOIN polis_employees e ON e.id = s.employee_id WHERE s.source = ? LIMIT 1', { source })
    if rows and rows[1] then
        return rows[1].rank
    end
    return nil
end

exports('GetPlayerRank', GetPlayerRank)

CreateThread(function()
    Wait(1000)
    Database.EnsureSchema()
    DebugPrint('Datenbankschema geprüft / initialisiert')
end)

DebugPrint('Server gestartet (MySQL)')
