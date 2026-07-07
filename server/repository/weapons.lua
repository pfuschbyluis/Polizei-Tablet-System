-- Weapons
function Repository.GetWeaponById(id)
    Database.EnsureSchema()
    local row = MySQL.single.await('SELECT * FROM polis_weapons WHERE id = ? LIMIT 1', { id })
    return row and RepositoryMappers.rowToWeapon(row) or nil
end

function Repository.FindWeaponBySerial(serialNumber)
    Database.EnsureSchema()
    local row = MySQL.single.await(
        'SELECT * FROM polis_weapons WHERE LOWER(serial_number) = LOWER(?) LIMIT 1',
        { serialNumber }
    )
    return row and RepositoryMappers.rowToWeapon(row) or nil
end

function Repository.CreateWeapon(data)
    Database.EnsureSchema()
    if Repository.FindWeaponBySerial(data.serialNumber or '') then
        return nil, 'Seriennummer bereits registriert.'
    end

    local id = Database.GenerateId('wpn')
    local now = os.date('%Y-%m-%d')
    MySQL.insert.await(
        [[INSERT INTO polis_weapons
        (id, serial_number, type, caliber, owner_id, license_status, license_expiry, registered_at, notes, is_wanted)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)]],
        {
            id,
            data.serialNumber,
            data.type,
            data.caliber,
            data.ownerId,
            data.licenseStatus or 'gültig',
            data.licenseExpiry,
            now,
            data.notes or '',
            data.isWanted and 1 or 0,
        }
    )

    if data.ownerId then
        Repository.LinkWeaponToPerson(data.ownerId, id)
    end

    return Repository.GetWeaponById(id)
end

function Repository.UpdateWeapon(id, data)
    Database.EnsureSchema()
    local weapon = Repository.GetWeaponById(id)
    if not weapon then return nil end

    local ownerId = data.ownerId ~= nil and data.ownerId or weapon.ownerId
    MySQL.update.await(
        [[UPDATE polis_weapons SET
        serial_number = ?, type = ?, caliber = ?, owner_id = ?, license_status = ?, license_expiry = ?, notes = ?, is_wanted = ?
        WHERE id = ?]],
        {
            data.serialNumber or weapon.serialNumber,
            data.type or weapon.type,
            data.caliber or weapon.caliber,
            ownerId,
            data.licenseStatus or weapon.licenseStatus,
            data.licenseExpiry ~= nil and data.licenseExpiry or weapon.licenseExpiry,
            data.notes ~= nil and data.notes or weapon.notes,
            (data.isWanted ~= nil and data.isWanted or weapon.isWanted) and 1 or 0,
            id,
        }
    )

    if ownerId then
        Repository.LinkWeaponToPerson(ownerId, id)
    end

    return Repository.GetWeaponById(id)
end

