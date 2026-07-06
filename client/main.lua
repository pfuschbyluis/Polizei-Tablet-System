local isOpen = false
local tabletProp = nil
local loggedInOfficer = nil
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

local function GetPlayerGrade()
    if Config.Framework == 'esx' then
        local ESX = exports['es_extended']:getSharedObject()
        local playerData = ESX.GetPlayerData()
        return playerData and playerData.job and playerData.job.grade or 0
    end

    if Config.Framework == 'qb' then
        local QBCore = exports['qb-core']:GetCoreObject()
        local playerData = QBCore.Functions.GetPlayerData()
        return playerData and playerData.job and playerData.job.grade.level or 0
    end

    return 0
end

local function GetPlayerJob()
    if Config.Framework == 'esx' then
        local ESX = exports['es_extended']:getSharedObject()
        local playerData = ESX.GetPlayerData()
        return playerData and playerData.job and playerData.job.name or 'police'
    end

    if Config.Framework == 'qb' then
        local QBCore = exports['qb-core']:GetCoreObject()
        local playerData = QBCore.Functions.GetPlayerData()
        return playerData and playerData.job and playerData.job.name or 'police'
    end

    return 'police'
end

local function GetRankFromGrade(grade)
    return Config.RankMapping[grade] or Config.RankMapping[0] or 'beamter'
end

local function GetUnitForJob(job)
    return Config.Units[job] or Config.Units.police or 'Streifenwagen Alpha-1'
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

local function BuildOfficerData()
    local grade = GetPlayerGrade()
    local job = GetPlayerJob()
    local rank = GetRankFromGrade(grade)
    local serverId = GetPlayerServerId(PlayerId())
    local playerName = GetPlayerName(PlayerId())

    return {
        id = ('off-%s'):format(serverId),
        badgeNumber = ('PD-%04d'):format(serverId),
        name = playerName,
        rank = rank,
        unit = GetUnitForJob(job),
    }
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
    loggedInOfficer = nil
    StartTabletAnimation()
    SetNuiFocus(true, true)

    SendNUIMessage({ action = 'open' })

    DebugPrint('Tablet geöffnet')
end

local function CloseTablet()
    if not isOpen then return end

    isOpen = false
    loggedInOfficer = nil
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
    TriggerServerEvent('polis:logAction', data)
    cb({ ok = true })
end)

local function TriggerServerNui(event, data, cb)
    local reqId = math.random(100000, 999999)
    pendingCallbacks[reqId] = cb
    TriggerServerEvent(event, reqId, data, loggedInOfficer and loggedInOfficer.rank or nil, loggedInOfficer and loggedInOfficer.id or nil)
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
            loggedInOfficer = result.officer
        end
        cb(result)
    end
    TriggerServerEvent('polis:server:login', reqId, data)
end)

RegisterNUICallback('logout', function(_, cb)
    loggedInOfficer = nil
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
