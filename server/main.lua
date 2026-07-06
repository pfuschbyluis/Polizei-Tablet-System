local function DebugPrint(msg)
    print(('[^3POLIS^7] %s'):format(msg))
end

RegisterNetEvent('polis:logAction', function(data)
    local src = source
    if not data or type(data) ~= 'table' then return end

    local playerName = GetPlayerName(src) or ('ID %s'):format(src)
    DebugPrint(('Audit [%s] %s – %s: %s'):format(
        playerName,
        data.module or '?',
        data.action or '?',
        data.details or ''
    ))
end)

exports('GetPlayerRank', function(source)
    -- Platzhalter für Server-seitige Rangermittlung
    return 'beamter'
end)

DebugPrint('Server gestartet')
