function GetPlayerRank(source)
    Database.EnsureSchema()
    local rows = MySQL.query.await(
        'SELECT e.rank FROM polis_sessions s JOIN polis_employees e ON e.id = s.employee_id WHERE s.source = ? LIMIT 1',
        { source }
    )
    if rows and rows[1] then
        return rows[1].rank
    end
    return nil
end

exports('GetPlayerRank', GetPlayerRank)

CreateThread(function()
    Wait(1000)
    Database.EnsureSchema()
    PolisDebug('Datenbankschema geprüft / initialisiert')
end)

PolisDebug('Server gestartet (MySQL)')
