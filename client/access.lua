function PolisClient.GetPlayerJobName()
    if Config.Framework == 'esx' then
        local ESX = exports['es_extended']:getSharedObject()
        local playerData = ESX.GetPlayerData()
        return playerData and playerData.job and playerData.job.name or nil
    end

    if Config.Framework == 'qb' then
        local QBCore = exports['qb-core']:GetCoreObject()
        local playerData = QBCore.Functions.GetPlayerData()
        return playerData and playerData.job and playerData.job.name or nil
    end

    return nil
end

function PolisClient.HasAccess()
    if Config.AllowEveryone then
        return true
    end

    local jobName = PolisClient.GetPlayerJobName()
    if not jobName then
        return false
    end

    for _, job in ipairs(Config.AllowedJobs) do
        if jobName == job then
            return true
        end
    end

    return false
end
