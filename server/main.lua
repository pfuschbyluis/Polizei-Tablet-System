local Employees = {}

local function DebugPrint(msg)
    print(('[^3POLIS^7] %s'):format(msg))
end

local function CopyEmployeePublic(emp)
    return {
        id = emp.id,
        badgeNumber = emp.badgeNumber,
        name = emp.name,
        rank = emp.rank,
        unit = emp.unit,
        active = emp.active,
        createdAt = emp.createdAt,
    }
end

local function GetEmployeesPublic()
    local list = {}
    for _, emp in pairs(Employees) do
        list[#list + 1] = CopyEmployeePublic(emp)
    end
    return list
end

local function FindByBadge(badgeNumber)
    for _, emp in pairs(Employees) do
        if emp.badgeNumber:lower() == badgeNumber:lower() then
            return emp
        end
    end
    return nil
end

local function FindById(id)
    return Employees[id]
end

local function CanViewEmployees(rank)
    return rank == 'admin' or rank == 'leitstelle'
end

local function CanManageEmployees(rank)
    return rank == 'admin'
end

-- Initialisierung
CreateThread(function()
    for _, emp in ipairs(Config.DefaultEmployees) do
        Employees[emp.id] = emp
    end
    DebugPrint(('Mitarbeiter geladen: %s'):format(#Config.DefaultEmployees))
end)

-- Login
RegisterNetEvent('polis:server:login', function(reqId, data)
    local src = source
    local badgeNumber = data and data.badgeNumber or ''
    local password = data and data.password or ''

    local emp = FindByBadge(badgeNumber)
    if not emp or not emp.active or emp.password ~= password then
        TriggerClientEvent('polis:client:nuiResult', src, reqId, {
            success = false,
            error = 'Dienstnummer oder Passwort ungültig.',
        })
        return
    end

    local officer = {
        id = emp.id,
        badgeNumber = emp.badgeNumber,
        name = emp.name,
        rank = emp.rank,
        unit = emp.unit,
    }

    local employees = CanViewEmployees(emp.rank) and GetEmployeesPublic() or {}

    TriggerClientEvent('polis:client:nuiResult', src, reqId, {
        success = true,
        officer = officer,
        employees = employees,
    })

    DebugPrint(('Login: %s (%s)'):format(emp.name, emp.badgeNumber))
end)

-- Mitarbeiter erstellen
RegisterNetEvent('polis:server:createEmployee', function(reqId, data, actorRank)
    local src = source
    if not CanManageEmployees(actorRank) then
        TriggerClientEvent('polis:client:nuiResult', src, reqId, { success = false, error = 'Keine Berechtigung.' })
        return
    end

    if FindByBadge(data.badgeNumber or '') then
        TriggerClientEvent('polis:client:nuiResult', src, reqId, { success = false, error = 'Dienstnummer vergeben.' })
        return
    end

    local id = ('emp-%s'):format(os.time())
    local emp = {
        id = id,
        badgeNumber = data.badgeNumber,
        password = data.password,
        name = data.name,
        rank = data.rank or 'beamter',
        unit = data.unit or 'Streifenwagen Alpha-1',
        active = true,
        createdAt = os.date('%Y-%m-%d'),
    }
    Employees[id] = emp

    TriggerClientEvent('polis:client:nuiResult', src, reqId, {
        success = true,
        employee = CopyEmployeePublic(emp),
    })
    DebugPrint(('Mitarbeiter erstellt: %s'):format(emp.name))
end)

-- Mitarbeiter aktualisieren
RegisterNetEvent('polis:server:updateEmployee', function(reqId, data, actorRank)
    local src = source
    if not CanManageEmployees(actorRank) then
        TriggerClientEvent('polis:client:nuiResult', src, reqId, { success = false })
        return
    end

    local emp = FindById(data.id)
    if not emp then
        TriggerClientEvent('polis:client:nuiResult', src, reqId, { success = false })
        return
    end

    if data.name then emp.name = data.name end
    if data.rank then emp.rank = data.rank end
    if data.unit then emp.unit = data.unit end
    if data.active ~= nil then emp.active = data.active end
    if data.password and data.password ~= '' then emp.password = data.password end

    TriggerClientEvent('polis:client:nuiResult', src, reqId, {
        success = true,
        employee = CopyEmployeePublic(emp),
    })
end)

-- Mitarbeiter löschen
RegisterNetEvent('polis:server:deleteEmployee', function(reqId, data, actorRank, actorId)
    local src = source
    if not CanManageEmployees(actorRank) then
        TriggerClientEvent('polis:client:nuiResult', src, reqId, { success = false })
        return
    end

    if data.id == actorId then
        TriggerClientEvent('polis:client:nuiResult', src, reqId, { success = false, error = 'Eigener Account.' })
        return
    end

    if Employees[data.id] then
        Employees[data.id] = nil
        TriggerClientEvent('polis:client:nuiResult', src, reqId, { success = true })
    else
        TriggerClientEvent('polis:client:nuiResult', src, reqId, { success = false })
    end
end)

RegisterNetEvent('polis:logAction', function(data)
    local src = source
    if not data or type(data) ~= 'table' then return end
    local playerName = GetPlayerName(src) or ('ID %s'):format(src)
    DebugPrint(('Audit [%s] %s – %s: %s'):format(
        playerName, data.module or '?', data.action or '?', data.details or ''
    ))
end)

DebugPrint('Server gestartet')
