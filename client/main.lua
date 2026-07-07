local isOpen = false
local tabletProp = nil
local sessionToken = nil
local pendingCallbacks = {}

local function DebugPrint(msg)
    print(('[^3POLIS^7] %s'):format(msg))
end

local function HasAccess()
    if Config.AllowEveryone then
        return true
    end

    if Config.Framework == 'esx' then
        local ESX = exports['es_extended']:getSharedObject()
        local playerData = ESX.GetPlayerData()
        if not playerData or not playerData.job then return false end
        for _, job in ipairs(Config.AllowedJobs) do
            if playerData.job.name == job then return true end
        end
        return false
    end

    if Config.Framework == 'qb' then
        local QBCore = exports['qb-core']:GetCoreObject()
        local playerData = QBCore.Functions.GetPlayerData()
        if not playerData or not playerData.job then return false end
        for _, job in ipairs(Config.AllowedJobs) do
            if playerData.job.name == job then return true end
        end
        return false
    end

    return false
end

local function StartTabletAnimation()
    if not Config.UseAnimation then return end

    local ped = PlayerPedId()
    local dict = Config.AnimDict
    local anim = Config.AnimName

    RequestAnimDict(dict)
    while not HasAnimDictLoaded(dict) do
        Wait(10)
    end

    TaskPlayAnim(ped, dict, anim, 3.0, 3.0, -1, 49, 0, false, false, false)

    local propModel = joaat(Config.PropModel)
    RequestModel(propModel)
    while not HasModelLoaded(propModel) do
        Wait(10)
    end

    tabletProp = CreateObject(propModel, 0.0, 0.0, 0.0, true, true, false)
    AttachEntityToEntity(
        tabletProp,
        ped,
        GetPedBoneIndex(ped, Config.PropBone),
        0.03, 0.002, -0.02,
        10.0, 160.0, 0.0,
        true, true, false, true, 1, true
    )
    SetModelAsNoLongerNeeded(propModel)
end

local function StopTabletAnimation()
    if not Config.UseAnimation then return end

    local ped = PlayerPedId()
    ClearPedTasks(ped)

    if tabletProp and DoesEntityExist(tabletProp) then
        DeleteEntity(tabletProp)
        tabletProp = nil
    end
end

local function OpenTablet()
    if isOpen then return end

    if not HasAccess() then
        TriggerEvent('chat:addMessage', {
            color = { 255, 80, 80 },
            multiline = false,
            args = { 'POLIS', Config.NoAccessMessage },
        })
        return
    end

    isOpen = true
    sessionToken = nil
    StartTabletAnimation()
    SetNuiFocus(true, true)

    SendNUIMessage({ action = 'open' })

    DebugPrint('Tablet geöffnet')
end

local function CloseTablet()
    if not isOpen then return end

    isOpen = false
    sessionToken = nil
    SetNuiFocus(false, false)
    StopTabletAnimation()

    SendNUIMessage({ action = 'close' })
    DebugPrint('Tablet geschlossen')
end

-- Exports
exports('OpenTablet', OpenTablet)
exports('CloseTablet', CloseTablet)
exports('IsTabletOpen', function() return isOpen end)

-- Command & Keybind
RegisterCommand(Config.Command, function()
    if isOpen then
        CloseTablet()
    else
        OpenTablet()
    end
end, false)

if Config.Keybind then
    RegisterKeyMapping(Config.Command, Config.KeybindDescription, 'keyboard', Config.Keybind)
end

-- NUI Callbacks
RegisterNUICallback('close', function(_, cb)
    CloseTablet()
    cb({ ok = true })
end)

RegisterNUICallback('ready', function(_, cb)
    DebugPrint('NUI bereit')
    cb({ ok = true })
end)

RegisterNUICallback('logAction', function(data, cb)
    if sessionToken then
        data.sessionToken = sessionToken
    end
    TriggerServerEvent('polis:logAction', data)
    cb({ ok = true })
end)

local function TriggerServerNui(event, data, cb)
    local reqId = math.random(100000, 999999)
    pendingCallbacks[reqId] = cb
    local payload = data or {}
    if payload.sessionToken then
        sessionToken = payload.sessionToken
    elseif sessionToken then
        payload.sessionToken = sessionToken
    end
    TriggerServerEvent(event, reqId, payload)

    SetTimeout(15000, function()
        if pendingCallbacks[reqId] then
            pendingCallbacks[reqId]({ success = false, error = 'Zeitüberschreitung – Server antwortet nicht.' })
            pendingCallbacks[reqId] = nil
        end
    end)
end

RegisterNetEvent('polis:client:nuiResult', function(reqId, result)
    if pendingCallbacks[reqId] then
        pendingCallbacks[reqId](result)
        pendingCallbacks[reqId] = nil
    end
end)

RegisterNUICallback('login', function(data, cb)
    local reqId = math.random(100000, 999999)
    pendingCallbacks[reqId] = function(result)
        if result.success and result.officer then
            sessionToken = result.officer.sessionToken
        end
        cb(result)
    end
    TriggerServerEvent('polis:server:login', reqId, data)

    SetTimeout(15000, function()
        if pendingCallbacks[reqId] then
            pendingCallbacks[reqId]({ success = false, error = 'Zeitüberschreitung – Server antwortet nicht.' })
            pendingCallbacks[reqId] = nil
        end
    end)
end)

RegisterNUICallback('logout', function(_, cb)
    sessionToken = nil
    TriggerServerEvent('polis:server:logout', 0, {})
    cb({ ok = true })
end)

RegisterNUICallback('createEmployee', function(data, cb)
    TriggerServerNui('polis:server:createEmployee', data, cb)
end)

RegisterNUICallback('updateEmployee', function(data, cb)
    TriggerServerNui('polis:server:updateEmployee', data, cb)
end)

RegisterNUICallback('deleteEmployee', function(data, cb)
    TriggerServerNui('polis:server:deleteEmployee', data, cb)
end)

RegisterNUICallback('createRoleTemplate', function(data, cb)
    TriggerServerNui('polis:server:createRoleTemplate', data, cb)
end)

RegisterNUICallback('updateRoleTemplate', function(data, cb)
    TriggerServerNui('polis:server:updateRoleTemplate', data, cb)
end)

RegisterNUICallback('deleteRoleTemplate', function(data, cb)
    TriggerServerNui('polis:server:deleteRoleTemplate', data, cb)
end)

RegisterNUICallback('getRoleTemplates', function(data, cb)
    TriggerServerNui('polis:server:getRoleTemplates', data, cb)
end)

RegisterNUICallback('getBranding', function(data, cb)
    TriggerServerNui('polis:server:getBranding', data, cb)
end)

RegisterNUICallback('updateBranding', function(data, cb)
    TriggerServerNui('polis:server:updateBranding', data, cb)
end)

RegisterNUICallback('getInitialData', function(data, cb)
    TriggerServerNui('polis:server:getInitialData', data, cb)
end)

RegisterNetEvent('polis:client:brandingUpdated', function(branding)
    SendNUIMessage({ action = 'brandingUpdated', data = branding })
end)

RegisterNUICallback('getAuditLog', function(data, cb)
    TriggerServerNui('polis:server:getAuditLog', data, cb)
end)

RegisterNUICallback('addPersonNote', function(data, cb)
    TriggerServerNui('polis:server:addPersonNote', data, cb)
end)

RegisterNUICallback('createPerson', function(data, cb)
    TriggerServerNui('polis:server:createPerson', data, cb)
end)

RegisterNUICallback('updatePerson', function(data, cb)
    TriggerServerNui('polis:server:updatePerson', data, cb)
end)

RegisterNUICallback('createWeapon', function(data, cb)
    TriggerServerNui('polis:server:createWeapon', data, cb)
end)

RegisterNUICallback('updateWeapon', function(data, cb)
    TriggerServerNui('polis:server:updateWeapon', data, cb)
end)

RegisterNUICallback('createVehicle', function(data, cb)
    TriggerServerNui('polis:server:createVehicle', data, cb)
end)

RegisterNUICallback('updateVehicle', function(data, cb)
    TriggerServerNui('polis:server:updateVehicle', data, cb)
end)

RegisterNUICallback('createWanted', function(data, cb)
    TriggerServerNui('polis:server:createWanted', data, cb)
end)

RegisterNUICallback('updateWanted', function(data, cb)
    TriggerServerNui('polis:server:updateWanted', data, cb)
end)

RegisterNUICallback('createCase', function(data, cb)
    TriggerServerNui('polis:server:createCase', data, cb)
end)

RegisterNUICallback('updateCaseStatus', function(data, cb)
    TriggerServerNui('polis:server:updateCaseStatus', data, cb)
end)

RegisterNUICallback('addCaseEvidence', function(data, cb)
    TriggerServerNui('polis:server:addCaseEvidence', data, cb)
end)

RegisterNUICallback('addCaseWitness', function(data, cb)
    TriggerServerNui('polis:server:addCaseWitness', data, cb)
end)

RegisterNUICallback('addCaseParticipant', function(data, cb)
    TriggerServerNui('polis:server:addCaseParticipant', data, cb)
end)

RegisterNUICallback('addCaseNote', function(data, cb)
    TriggerServerNui('polis:server:addCaseNote', data, cb)
end)

-- ESC fallback (zusätzlich zu NUI)
CreateThread(function()
    while true do
        if isOpen then
            DisableControlAction(0, 1, true)
            DisableControlAction(0, 2, true)
            DisableControlAction(0, 142, true)
            DisableControlAction(0, 18, true)
            DisableControlAction(0, 322, true)
            DisableControlAction(0, 106, true)
            Wait(0)
        else
            Wait(500)
        end
    end
end)

-- Cleanup bei Resource-Stop
AddEventHandler('onResourceStop', function(resource)
    if resource == GetCurrentResourceName() then
        CloseTablet()
    end
end)

-- Event für andere Resources
RegisterNetEvent('polis:client:open', function()
    OpenTablet()
end)

RegisterNetEvent('polis:client:close', function()
    CloseTablet()
end)
