-- Sessions
function Repository.CreateSession(employeeId, source)
    Database.EnsureSchema()
    Repository.DeleteSessionsForSource(source)
    local token = Database.GenerateToken()
    local expiresAt = os.time() + (Config.SessionDurationHours or 8) * 3600
    MySQL.insert.await(
        'INSERT INTO polis_sessions (token, employee_id, source, expires_at) VALUES (?, ?, ?, ?)',
        { token, employeeId, source, expiresAt }
    )
    return token, expiresAt
end

function Repository.DeleteSessionsForSource(source)
    Database.EnsureSchema()
    MySQL.update.await('DELETE FROM polis_sessions WHERE source = ?', { source })
end

function Repository.GetSession(token, source)
    Database.EnsureSchema()
    if not token or token == '' then return nil end
    local row = MySQL.single.await(
        'SELECT s.*, e.id AS emp_id, e.badge_number, e.name, e.rank, e.unit, e.active, e.role_template_id, e.permissions FROM polis_sessions s JOIN polis_employees e ON e.id = s.employee_id WHERE s.token = ? AND s.source = ? LIMIT 1',
        { token, source }
    )
    if not row then return nil end
    if row.expires_at < os.time() then
        MySQL.update.await('DELETE FROM polis_sessions WHERE token = ?', { token })
        return nil
    end
    if row.active ~= 1 and row.active ~= true then return nil end

    local emp = {
        id = row.emp_id,
        badgeNumber = row.badge_number,
        name = row.name,
        rank = row.rank,
        active = true,
        roleTemplateId = row.role_template_id,
        permissions = Permissions.FromTable(Database.DecodeJson(row.permissions, {})),
    }

    return {
        token = token,
        employee = emp,
    }
end

