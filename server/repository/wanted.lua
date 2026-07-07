-- Wanted
function Repository.GetWantedById(id)
    Database.EnsureSchema()
    local row = MySQL.single.await('SELECT * FROM polis_wanted WHERE id = ? LIMIT 1', { id })
    return row and RepositoryMappers.rowToWanted(row) or nil
end

local function syncTargetWantedFlag(wantedType, targetId)
    if wantedType == 'waffe' then
        local count = MySQL.scalar.await(
            'SELECT COUNT(*) FROM polis_wanted WHERE type = ? AND target_id = ? AND active = 1',
            { 'waffe', targetId }
        )
        MySQL.update.await('UPDATE polis_weapons SET is_wanted = ? WHERE id = ?', { (count and count > 0) and 1 or 0, targetId })
    elseif wantedType == 'fahrzeug' then
        local count = MySQL.scalar.await(
            'SELECT COUNT(*) FROM polis_wanted WHERE type = ? AND target_id = ? AND active = 1',
            { 'fahrzeug', targetId }
        )
        MySQL.update.await('UPDATE polis_vehicles SET is_wanted = ? WHERE id = ?', { (count and count > 0) and 1 or 0, targetId })
    end
end

function Repository.CreateWanted(data)
    Database.EnsureSchema()
    local id = Database.GenerateId('want')
    local now = os.date('%Y-%m-%d')
    MySQL.insert.await(
        [[INSERT INTO polis_wanted
        (id, type, target_id, target_name, priority, description, last_known_location, responsible_unit, issued_at, active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)]],
        {
            id,
            data.type,
            data.targetId,
            data.targetName,
            data.priority or 'mittel',
            data.description or '',
            data.lastKnownLocation or 'Unbekannt',
            '',
            now,
        }
    )

    if data.type == 'waffe' or data.type == 'fahrzeug' then
        syncTargetWantedFlag(data.type, data.targetId)
    end

    return Repository.GetWantedById(id)
end

function Repository.UpdateWanted(id, data)
    Database.EnsureSchema()
    local entry = Repository.GetWantedById(id)
    if not entry then return nil end

    local active = data.active ~= nil and data.active or entry.active
    MySQL.update.await(
        [[UPDATE polis_wanted SET
        priority = ?, description = ?, last_known_location = ?, responsible_unit = ?, active = ?
        WHERE id = ?]],
        {
            data.priority or entry.priority,
            data.description ~= nil and data.description or entry.description,
            data.lastKnownLocation or entry.lastKnownLocation,
            '',
            active and 1 or 0,
            id,
        }
    )

    syncTargetWantedFlag(entry.type, entry.targetId)
    return Repository.GetWantedById(id)
end
