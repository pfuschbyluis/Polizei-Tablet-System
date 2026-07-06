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

    Database.EnsureSchema()

    local emp = Repository.FindEmployeeByBadge(badgeNumber)
    if not emp or not emp.active or not Password.Verify(password, emp.passwordHash) then
        NuiError(src, reqId, 'Dienstnummer oder Passwort ungültig.')
        return
    end

    if Password.NeedsRehash(emp.passwordHash) then
        local newHash = Password.Rehash(password)
        if newHash then
            MySQL.update.await('UPDATE polis_employees SET password_hash = ? WHERE id = ?', { newHash, emp.id })
        end
    end

    local sessionToken = Repository.CreateSession(emp.id, src)
    local officer = {
        id = emp.id,
        badgeNumber = emp.badgeNumber,
        name = emp.name,
        rank = emp.rank,
        unit = emp.unit,
        sessionToken = sessionToken,
    }

    local employees = {}
    if Repository.CanViewEmployees(emp.rank) then
        for _, e in ipairs(Repository.GetAllEmployees()) do
            employees[#employees + 1] = Repository.CopyEmployeePublic(e)
        end
    end

    NuiOk(src, reqId, {
        success = true,
        officer = officer,
        employees = employees,
    })

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

    if not Repository.CanManageEmployees(session.employee.rank) then
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

    if not Repository.CanManageEmployees(session.employee.rank) then
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

    if not Repository.CanManageEmployees(session.employee.rank) then
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

    if session.employee.rank ~= 'admin' then
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

    local ok, note = Repository.AddPersonNote(data.personId, data.note)
    if not ok then
        NuiError(src, reqId, 'Person nicht gefunden.')
        return
    end

    NuiOk(src, reqId, { success = true, note = note })
end)

-- Akten
RegisterNetEvent('polis:server:createCase', function(reqId, data)
    local src = source
    local session = RequireSession(src, reqId, data)
    if not session then return end

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

    local caseFile = Repository.UpdateCaseStatus(data.caseId, data.status)
    if not caseFile then
        NuiError(src, reqId, 'Akte nicht gefunden.')
        return
    end

    NuiOk(src, reqId, { success = true, caseFile = caseFile })
end)

RegisterNetEvent('polis:server:addCaseEvidence', function(reqId, data)
    local src = source
    local session = RequireSession(src, reqId, data)
    if not session then return end

    local caseFile = Repository.AddCaseEvidence(data.caseId, data.evidence)
    NuiOk(src, reqId, { success = caseFile ~= nil, caseFile = caseFile })
end)

RegisterNetEvent('polis:server:addCaseWitness', function(reqId, data)
    local src = source
    local session = RequireSession(src, reqId, data)
    if not session then return end

    local caseFile = Repository.AddCaseWitness(data.caseId, data.witness)
    NuiOk(src, reqId, { success = caseFile ~= nil, caseFile = caseFile })
end)

RegisterNetEvent('polis:server:addCaseParticipant', function(reqId, data)
    local src = source
    local session = RequireSession(src, reqId, data)
    if not session then return end

    local caseFile = Repository.AddCaseParticipant(data.caseId, data.participant)
    NuiOk(src, reqId, { success = caseFile ~= nil, caseFile = caseFile })
end)

RegisterNetEvent('polis:server:addCaseNote', function(reqId, data)
    local src = source
    local session = RequireSession(src, reqId, data)
    if not session then return end

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
