-- Persons
function Repository.GetPersonById(id)
    Database.EnsureSchema()
    local row = MySQL.single.await('SELECT * FROM polis_persons WHERE id = ? LIMIT 1', { id })
    if not row then return nil end
    return Repository.GetPersonDetail(id)
end

function Repository.CreatePerson(data)
    Database.EnsureSchema()
    local id = Database.GenerateId('person')
    MySQL.insert.await(
        [[INSERT INTO polis_persons
        (id, first_name, last_name, date_of_birth, address, city, phone, photo_url, prior_convictions, arrest_warrants, notes, linked_vehicle_ids, linked_weapon_ids)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)]],
        {
            id,
            data.firstName,
            data.lastName,
            data.dateOfBirth,
            data.address,
            data.city,
            data.phone,
            data.photoUrl,
            Database.EncodeJson(data.priorConvictions or {}),
            Database.EncodeJson(data.arrestWarrants or {}),
            Database.EncodeJson(data.notes or {}),
            Database.EncodeJson(data.linkedVehicleIds or {}),
            Database.EncodeJson(data.linkedWeaponIds or {}),
        }
    )
    return Repository.GetPersonById(id)
end

function Repository.UpdatePerson(id, data)
    Database.EnsureSchema()
    local person = Repository.GetPersonById(id)
    if not person then return nil end

    MySQL.update.await(
        [[UPDATE polis_persons SET
        first_name = ?, last_name = ?, date_of_birth = ?, address = ?, city = ?, phone = ?, photo_url = ?
        WHERE id = ?]],
        {
            data.firstName or person.firstName,
            data.lastName or person.lastName,
            data.dateOfBirth or person.dateOfBirth,
            data.address or person.address,
            data.city or person.city,
            data.phone ~= nil and data.phone or person.phone,
            data.photoUrl ~= nil and data.photoUrl or person.photoUrl,
            id,
        }
    )
    return Repository.GetPersonById(id)
end

function Repository.LinkWeaponToPerson(personId, weaponId)
    if not personId or not weaponId then return end
    local person = Repository.GetPersonById(personId)
    if not person then return end
    local ids = person.linkedWeaponIds or {}
    for _, wid in ipairs(ids) do
        if wid == weaponId then return end
    end
    ids[#ids + 1] = weaponId
    MySQL.update.await('UPDATE polis_persons SET linked_weapon_ids = ? WHERE id = ?', { Database.EncodeJson(ids), personId })
end

function Repository.LinkVehicleToPerson(personId, vehicleId)
    if not personId or not vehicleId then return end
    local person = Repository.GetPersonById(personId)
    if not person then return end
    local ids = person.linkedVehicleIds or {}
    for _, vid in ipairs(ids) do
        if vid == vehicleId then return end
    end
    ids[#ids + 1] = vehicleId
    MySQL.update.await('UPDATE polis_persons SET linked_vehicle_ids = ? WHERE id = ?', { Database.EncodeJson(ids), personId })
end

-- Person notes
function Repository.AddPersonNote(personId, note)
    Database.EnsureSchema()
    local row = MySQL.single.await('SELECT id FROM polis_persons WHERE id = ? LIMIT 1', { personId })
    if not row then return false end

    note.id = note.id or Database.GenerateId('note')
    MySQL.insert.await(
        'INSERT INTO polis_person_notes (id, person_id, officer_id, officer_name, note_date, content) VALUES (?, ?, ?, ?, ?, ?)',
        {
            note.id,
            personId,
            note.officerId or '',
            note.officerName or '',
            note.date or os.date('%Y-%m-%d'),
            note.content or '',
        }
    )

    -- JSON-Spalte synchron halten (Abwärtskompatibilität)
    local notesRow = MySQL.single.await('SELECT notes FROM polis_persons WHERE id = ? LIMIT 1', { personId })
    local notes = Database.DecodeJson(notesRow and notesRow.notes or '[]', {})
    notes[#notes + 1] = note
    MySQL.update.await('UPDATE polis_persons SET notes = ? WHERE id = ?', { Database.EncodeJson(notes), personId })
    return true, note
end

