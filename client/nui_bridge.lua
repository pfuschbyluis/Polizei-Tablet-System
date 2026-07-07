local NUI_TIMEOUT_MS = 15000

local SERVER_ROUTES = {
    createEmployee = 'polis:server:createEmployee',
    updateEmployee = 'polis:server:updateEmployee',
    deleteEmployee = 'polis:server:deleteEmployee',
    createRoleTemplate = 'polis:server:createRoleTemplate',
    updateRoleTemplate = 'polis:server:updateRoleTemplate',
    deleteRoleTemplate = 'polis:server:deleteRoleTemplate',
    getRoleTemplates = 'polis:server:getRoleTemplates',
    getBranding = 'polis:server:getBranding',
    updateBranding = 'polis:server:updateBranding',
    getInitialData = 'polis:server:getInitialData',
    getDataModule = 'polis:server:getDataModule',
    getPersonDetail = 'polis:server:getPersonDetail',
    getCaseDetail = 'polis:server:getCaseDetail',
    getAuditLog = 'polis:server:getAuditLog',
    addPersonNote = 'polis:server:addPersonNote',
    createPerson = 'polis:server:createPerson',
    updatePerson = 'polis:server:updatePerson',
    createWeapon = 'polis:server:createWeapon',
    updateWeapon = 'polis:server:updateWeapon',
    createVehicle = 'polis:server:createVehicle',
    updateVehicle = 'polis:server:updateVehicle',
    createWanted = 'polis:server:createWanted',
    updateWanted = 'polis:server:updateWanted',
    createCase = 'polis:server:createCase',
    updateCaseStatus = 'polis:server:updateCaseStatus',
    addCaseEvidence = 'polis:server:addCaseEvidence',
    addCaseWitness = 'polis:server:addCaseWitness',
    addCaseParticipant = 'polis:server:addCaseParticipant',
    addCaseNote = 'polis:server:addCaseNote',
}

function PolisClient.TriggerServerNui(event, data, cb, onResult)
    local reqId = math.random(100000, 999999)
    PolisClient.pendingCallbacks[reqId] = function(result)
        if onResult then
            onResult(result)
        end
        cb(result)
    end

    local payload = data or {}
    if payload.sessionToken then
        PolisClient.sessionToken = payload.sessionToken
    elseif PolisClient.sessionToken then
        payload.sessionToken = PolisClient.sessionToken
    end

    TriggerServerEvent(event, reqId, payload)

    SetTimeout(NUI_TIMEOUT_MS, function()
        if PolisClient.pendingCallbacks[reqId] then
            PolisClient.pendingCallbacks[reqId]({
                success = false,
                error = 'Zeitüberschreitung – Server antwortet nicht.',
            })
            PolisClient.pendingCallbacks[reqId] = nil
        end
    end)
end

RegisterNetEvent('polis:client:nuiResult', function(reqId, result)
    if PolisClient.pendingCallbacks[reqId] then
        PolisClient.pendingCallbacks[reqId](result)
        PolisClient.pendingCallbacks[reqId] = nil
    end
end)

RegisterNetEvent('polis:client:brandingUpdated', function(branding)
    SendNUIMessage({ action = 'brandingUpdated', data = branding })
end)

RegisterNUICallback('close', function(_, cb)
    PolisClient.CloseTablet()
    cb({ ok = true })
end)

RegisterNUICallback('ready', function(_, cb)
    PolisDebug('NUI bereit')
    cb({ ok = true })
end)

RegisterNUICallback('logAction', function(data, cb)
    if PolisClient.sessionToken then
        data.sessionToken = PolisClient.sessionToken
    end
    TriggerServerEvent('polis:logAction', data)
    cb({ ok = true })
end)

RegisterNUICallback('login', function(data, cb)
    PolisClient.TriggerServerNui('polis:server:login', data, cb, function(result)
        if result.success and result.officer then
            PolisClient.sessionToken = result.officer.sessionToken
        end
    end)
end)

RegisterNUICallback('logout', function(_, cb)
    PolisClient.sessionToken = nil
    TriggerServerEvent('polis:server:logout', 0, {})
    cb({ ok = true })
end)

for callbackName, serverEvent in pairs(SERVER_ROUTES) do
    RegisterNUICallback(callbackName, function(data, cb)
        PolisClient.TriggerServerNui(serverEvent, data, cb)
    end)
end
