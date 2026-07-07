function Repository.GetAuditLog()
    Database.EnsureSchema()
    local entries = {}
    for _, row in ipairs(MySQL.query.await('SELECT * FROM polis_audit_log ORDER BY timestamp DESC LIMIT 500') or {}) do
        entries[#entries + 1] = RepositoryMappers.rowToAudit(row)
    end
    return entries
end

function Repository.LogAudit(entry)
    Database.EnsureSchema()
    local id = Database.GenerateId('audit')
    MySQL.insert.await(
        'INSERT INTO polis_audit_log (id, timestamp, officer_id, officer_name, action, module, details) VALUES (?, ?, ?, ?, ?, ?, ?)',
        {
            id,
            entry.timestamp or os.date('!%Y-%m-%dT%H:%M:%SZ'),
            entry.officerId,
            entry.officerName,
            entry.action,
            entry.module,
            entry.details or '',
        }
    )
    return id
end
