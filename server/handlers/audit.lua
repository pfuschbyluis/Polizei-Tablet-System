RegisterNetEvent('polis:logAction', function(data)
    local src = source
    if not data or type(data) ~= 'table' then return end

    Database.EnsureSchema()

    local session = PolisNui.ResolveSession(src, data)
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

    PolisDebug(('Audit [%s] %s – %s: %s'):format(officerName, data.module or '?', data.action or '?', data.details or ''))
end)
