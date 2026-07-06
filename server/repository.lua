Repository = {}

local function rowToEmployee(row)
    return {
        id = row.id,
        badgeNumber = row.badge_number,
        name = row.name,
        rank = row.rank,
        unit = row.unit,
        active = row.active == 1 or row.active == true,
        createdAt = row.created_at,
        passwordHash = row.password_hash,
    }
end

local function rowToPerson(row)
    return {
        id = row.id,
        firstName = row.first_name,
        lastName = row.last_name,
        dateOfBirth = row.date_of_birth,
        address = row.address,
        city = row.city,
        phone = row.phone,
        photoUrl = row.photo_url,
        priorConvictions = Database.DecodeJson(row.prior_convictions, {}),
        arrestWarrants = Database.DecodeJson(row.arrest_warrants, {}),
        notes = Database.DecodeJson(row.notes, {}),
        linkedVehicleIds = Database.DecodeJson(row.linked_vehicle_ids, {}),
        linkedWeaponIds = Database.DecodeJson(row.linked_weapon_ids, {}),
    }
end

local function rowToCase(row)
    return {
        id = row.id,
        caseNumber = row.case_number,
        title = row.title,
        offense = row.offense,
        status = row.status,
        createdAt = row.created_at,
        updatedAt = row.updated_at,
        assignedOfficerId = row.assigned_officer_id,
        assignedOfficerName = row.assigned_officer_name,
        description = row.description,
        participants = Database.DecodeJson(row.participants, {}),
        evidence = Database.DecodeJson(row.evidence, {}),
        witnesses = Database.DecodeJson(row.witnesses, {}),
        internalNotes = Database.DecodeJson(row.internal_notes, {}),
        linkedVehicleIds = Database.DecodeJson(row.linked_vehicle_ids, {}),
    }
end

local function rowToWeapon(row)
    return {
        id = row.id,
        serialNumber = row.serial_number,
        type = row.type,
        caliber = row.caliber,
        ownerId = row.owner_id,
        licenseStatus = row.license_status,
        licenseExpiry = row.license_expiry,
        registeredAt = row.registered_at,
        notes = row.notes or '',
        isWanted = row.is_wanted == 1 or row.is_wanted == true,
    }
end

local function rowToVehicle(row)
    return {
        id = row.id,
        plate = row.plate,
        ownerId = row.owner_id,
        model = row.model,
        brand = row.brand,
        color = row.color,
        insuranceStatus = row.insurance_status,
        registrationStatus = row.registration_status,
        isWanted = row.is_wanted == 1 or row.is_wanted == true,
        linkedCaseIds = Database.DecodeJson(row.linked_case_ids, {}),
        registeredAt = row.registered_at,
    }
end

local function rowToWanted(row)
    return {
        id = row.id,
        type = row.type,
        targetId = row.target_id,
        targetName = row.target_name,
        priority = row.priority,
        description = row.description,
        lastKnownLocation = row.last_known_location,
        responsibleUnit = row.responsible_unit,
        issuedAt = row.issued_at,
        active = row.active == 1 or row.active == true,
    }
end

local function rowToMessage(row)
    return {
        id = row.id,
        title = row.title,
        content = row.content,
        author = row.author,
        date = row.date,
        priority = row.priority,
    }
end

local function rowToAudit(row)
    return {
        id = row.id,
        timestamp = row.timestamp,
        officerId = row.officer_id,
        officerName = row.officer_name,
        action = row.action,
        module = row.module,
        details = row.details,
    }
end

function Repository.CopyEmployeePublic(emp)
    return {
        id = emp.id,
        badgeNumber = emp.badgeNumber,
        name = emp.name,
        rank = emp.rank,
        unit = emp.unit,
        active = emp.active,
        createdAt = emp.createdAt,
    }
end

-- Employees
function Repository.GetAllEmployees()
    Database.EnsureSchema()
    local rows = MySQL.query.await('SELECT * FROM polis_employees ORDER BY name ASC') or {}
    local list = {}
    for _, row in ipairs(rows) do
        list[#list + 1] = rowToEmployee(row)
    end
    return list
end

function Repository.FindEmployeeByBadge(badgeNumber)
    Database.EnsureSchema()
    local row = MySQL.single.await(
        'SELECT * FROM polis_employees WHERE LOWER(badge_number) = LOWER(?) LIMIT 1',
        { badgeNumber }
    )
    return row and rowToEmployee(row) or nil
end

function Repository.FindEmployeeById(id)
    Database.EnsureSchema()
    local row = MySQL.single.await('SELECT * FROM polis_employees WHERE id = ? LIMIT 1', { id })
    return row and rowToEmployee(row) or nil
end

function Repository.CreateEmployee(data)
    Database.EnsureSchema()
    local id = Database.GenerateId('emp')
    local hash = Password.Hash(data.password)
    if not hash then return nil, 'Passwort ungültig.' end

    MySQL.insert.await(
        'INSERT INTO polis_employees (id, badge_number, password_hash, name, rank, unit, active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        {
            id,
            data.badgeNumber,
            hash,
            data.name,
            data.rank or 'beamter',
            data.unit or 'Streifenwagen Alpha-1',
            1,
            os.date('%Y-%m-%d'),
        }
    )

    return Repository.FindEmployeeById(id)
end

function Repository.UpdateEmployee(id, data)
    Database.EnsureSchema()
    local emp = Repository.FindEmployeeById(id)
    if not emp then return nil end

    local name = data.name or emp.name
    local rank = data.rank or emp.rank
    local unit = data.unit or emp.unit
    local active = data.active ~= nil and data.active or emp.active

    if data.password and data.password ~= '' then
        local hash = Password.Hash(data.password)
        MySQL.update.await(
            'UPDATE polis_employees SET name = ?, rank = ?, unit = ?, active = ?, password_hash = ? WHERE id = ?',
            { name, rank, unit, active and 1 or 0, hash, id }
        )
    else
        MySQL.update.await(
            'UPDATE polis_employees SET name = ?, rank = ?, unit = ?, active = ? WHERE id = ?',
            { name, rank, unit, active and 1 or 0, id }
        )
    end

    return Repository.FindEmployeeById(id)
end

function Repository.DeleteEmployee(id)
    Database.EnsureSchema()
    return MySQL.update.await('DELETE FROM polis_employees WHERE id = ?', { id })
end

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
        'SELECT s.*, e.id AS emp_id, e.badge_number, e.name, e.rank, e.unit, e.active FROM polis_sessions s JOIN polis_employees e ON e.id = s.employee_id WHERE s.token = ? AND s.source = ? LIMIT 1',
        { token, source }
    )
    if not row then return nil end
    if row.expires_at < os.time() then
        MySQL.update.await('DELETE FROM polis_sessions WHERE token = ?', { token })
        return nil
    end
    if row.active ~= 1 and row.active ~= true then return nil end
    return {
        token = token,
        employee = {
            id = row.emp_id,
            badgeNumber = row.badge_number,
            name = row.name,
            rank = row.rank,
            unit = row.unit,
        },
    }
end

-- Data loading
function Repository.LoadAllData()
    Database.EnsureSchema()

    local persons = {}
    for _, row in ipairs(MySQL.query.await('SELECT * FROM polis_persons ORDER BY last_name ASC') or {}) do
        persons[#persons + 1] = rowToPerson(row)
    end

    local cases = {}
    for _, row in ipairs(MySQL.query.await('SELECT * FROM polis_cases ORDER BY updated_at DESC') or {}) do
        cases[#cases + 1] = rowToCase(row)
    end

    local weapons = {}
    for _, row in ipairs(MySQL.query.await('SELECT * FROM polis_weapons ORDER BY serial_number ASC') or {}) do
        weapons[#weapons + 1] = rowToWeapon(row)
    end

    local vehicles = {}
    for _, row in ipairs(MySQL.query.await('SELECT * FROM polis_vehicles ORDER BY plate ASC') or {}) do
        vehicles[#vehicles + 1] = rowToVehicle(row)
    end

    local wanted = {}
    for _, row in ipairs(MySQL.query.await('SELECT * FROM polis_wanted ORDER BY issued_at DESC') or {}) do
        wanted[#wanted + 1] = rowToWanted(row)
    end

    local internalMessages = {}
    for _, row in ipairs(MySQL.query.await('SELECT * FROM polis_internal_messages ORDER BY date DESC') or {}) do
        internalMessages[#internalMessages + 1] = rowToMessage(row)
    end

    return {
        persons = persons,
        cases = cases,
        weapons = weapons,
        vehicles = vehicles,
        wanted = wanted,
        internalMessages = internalMessages,
    }
end

function Repository.GetAuditLog()
    Database.EnsureSchema()
    local entries = {}
    for _, row in ipairs(MySQL.query.await('SELECT * FROM polis_audit_log ORDER BY timestamp DESC LIMIT 500') or {}) do
        entries[#entries + 1] = rowToAudit(row)
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

-- Person notes
function Repository.AddPersonNote(personId, note)
    Database.EnsureSchema()
    local row = MySQL.single.await('SELECT notes FROM polis_persons WHERE id = ? LIMIT 1', { personId })
    if not row then return false end
    local notes = Database.DecodeJson(row.notes, {})
    note.id = note.id or Database.GenerateId('note')
    notes[#notes + 1] = note
    MySQL.update.await('UPDATE polis_persons SET notes = ? WHERE id = ?', { Database.EncodeJson(notes), personId })
    return true, note
end

-- Cases
function Repository.GenerateCaseNumber()
    local year = os.date('%Y')
    local num = math.random(100000, 999999)
    return ('AZ-%s-%s'):format(year, num)
end

function Repository.CreateCase(data)
    Database.EnsureSchema()
    local id = Database.GenerateId('case')
    local now = os.date('%Y-%m-%d')
    local caseNumber = Repository.GenerateCaseNumber()

    MySQL.insert.await(
        [[INSERT INTO polis_cases
        (id, case_number, title, offense, status, created_at, updated_at, assigned_officer_id, assigned_officer_name, description, participants, evidence, witnesses, internal_notes, linked_vehicle_ids)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)]],
        {
            id,
            caseNumber,
            data.title,
            data.offense,
            data.status or 'offen',
            now,
            now,
            data.assignedOfficerId,
            data.assignedOfficerName,
            data.description or '',
            Database.EncodeJson(data.participants or {}),
            Database.EncodeJson(data.evidence or {}),
            Database.EncodeJson(data.witnesses or {}),
            Database.EncodeJson(data.internalNotes or {}),
            Database.EncodeJson(data.linkedVehicleIds or {}),
        }
    )

    return Repository.GetCaseById(id)
end

function Repository.GetCaseById(id)
    Database.EnsureSchema()
    local row = MySQL.single.await('SELECT * FROM polis_cases WHERE id = ? LIMIT 1', { id })
    return row and rowToCase(row) or nil
end

function Repository.UpdateCaseJsonField(caseId, field, updater)
    Database.EnsureSchema()
    local row = MySQL.single.await(('SELECT %s, updated_at FROM polis_cases WHERE id = ? LIMIT 1'):format(field), { caseId })
    if not row then return nil end
    local current = Database.DecodeJson(row[field], {})
    local updated = updater(current)
    local now = os.date('%Y-%m-%d')
    MySQL.update.await(
        ('UPDATE polis_cases SET %s = ?, updated_at = ? WHERE id = ?'):format(field),
        { Database.EncodeJson(updated), now, caseId }
    )
    return Repository.GetCaseById(caseId)
end

function Repository.UpdateCaseStatus(caseId, status)
    Database.EnsureSchema()
    local now = os.date('%Y-%m-%d')
    MySQL.update.await('UPDATE polis_cases SET status = ?, updated_at = ? WHERE id = ?', { status, now, caseId })
    return Repository.GetCaseById(caseId)
end

function Repository.AddCaseEvidence(caseId, evidence)
    return Repository.UpdateCaseJsonField(caseId, 'evidence', function(list)
        evidence.id = evidence.id or Database.GenerateId('ev')
        list[#list + 1] = evidence
        return list
    end)
end

function Repository.AddCaseWitness(caseId, witness)
    return Repository.UpdateCaseJsonField(caseId, 'witnesses', function(list)
        witness.id = witness.id or Database.GenerateId('wit')
        list[#list + 1] = witness
        return list
    end)
end

function Repository.AddCaseParticipant(caseId, participant)
    return Repository.UpdateCaseJsonField(caseId, 'participants', function(list)
        list[#list + 1] = participant
        return list
    end)
end

function Repository.AddCaseNote(caseId, note)
    return Repository.UpdateCaseJsonField(caseId, 'internal_notes', function(list)
        note.id = note.id or Database.GenerateId('inote')
        list[#list + 1] = note
        return list
    end)
end

function Repository.CanViewEmployees(rank)
    return rank == 'admin' or rank == 'leitstelle'
end

function Repository.CanManageEmployees(rank)
    return rank == 'admin'
end
