-- Vehicles
function Repository.GetVehicleById(id)
    Database.EnsureSchema()
    local row = MySQL.single.await('SELECT * FROM polis_vehicles WHERE id = ? LIMIT 1', { id })
    return row and RepositoryMappers.rowToVehicle(row) or nil
end

function Repository.FindVehicleByPlate(plate)
    Database.EnsureSchema()
    local row = MySQL.single.await(
        'SELECT * FROM polis_vehicles WHERE LOWER(plate) = LOWER(?) LIMIT 1',
        { plate }
    )
    return row and RepositoryMappers.rowToVehicle(row) or nil
end

function Repository.CreateVehicle(data)
    Database.EnsureSchema()
    if Repository.FindVehicleByPlate(data.plate or '') then
        return nil, 'Kennzeichen bereits registriert.'
    end

    local id = Database.GenerateId('veh')
    local now = os.date('%Y-%m-%d')
    MySQL.insert.await(
        [[INSERT INTO polis_vehicles
        (id, plate, owner_id, model, brand, color, insurance_status, registration_status, is_wanted, linked_case_ids, registered_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)]],
        {
            id,
            data.plate,
            data.ownerId,
            data.model,
            data.brand,
            data.color,
            data.insuranceStatus or 'gültig',
            data.registrationStatus or 'zugelassen',
            data.isWanted and 1 or 0,
            Database.EncodeJson(data.linkedCaseIds or {}),
            now,
        }
    )

    if data.ownerId then
        Repository.LinkVehicleToPerson(data.ownerId, id)
    end

    return Repository.GetVehicleById(id)
end

function Repository.UpdateVehicle(id, data)
    Database.EnsureSchema()
    local vehicle = Repository.GetVehicleById(id)
    if not vehicle then return nil end

    local ownerId = data.ownerId or vehicle.ownerId
    MySQL.update.await(
        [[UPDATE polis_vehicles SET
        plate = ?, owner_id = ?, model = ?, brand = ?, color = ?, insurance_status = ?, registration_status = ?, is_wanted = ?
        WHERE id = ?]],
        {
            data.plate or vehicle.plate,
            ownerId,
            data.model or vehicle.model,
            data.brand or vehicle.brand,
            data.color or vehicle.color,
            data.insuranceStatus or vehicle.insuranceStatus,
            data.registrationStatus or vehicle.registrationStatus,
            (data.isWanted ~= nil and data.isWanted or vehicle.isWanted) and 1 or 0,
            id,
        }
    )

    if ownerId then
        Repository.LinkVehicleToPerson(ownerId, id)
    end

    return Repository.GetVehicleById(id)
end

