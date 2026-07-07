local MODULE_QUERIES = {
    persons = {
        sql = 'SELECT * FROM polis_persons ORDER BY last_name ASC LIMIT ?',
        mapper = 'rowToPersonSummary',
        limitKey = 'persons',
    },
    cases = {
        sql = [[SELECT id, case_number, title, offense, status, created_at, updated_at,
            assigned_officer_id, assigned_officer_name, description, linked_vehicle_ids
            FROM polis_cases ORDER BY updated_at DESC LIMIT ?]],
        mapper = 'rowToCaseSummary',
        limitKey = 'cases',
    },
    weapons = {
        sql = 'SELECT * FROM polis_weapons ORDER BY serial_number ASC LIMIT ?',
        mapper = 'rowToWeapon',
        limitKey = 'weapons',
    },
    vehicles = {
        sql = 'SELECT * FROM polis_vehicles ORDER BY plate ASC LIMIT ?',
        mapper = 'rowToVehicle',
        limitKey = 'vehicles',
    },
    wanted = {
        sql = 'SELECT * FROM polis_wanted ORDER BY issued_at DESC LIMIT ?',
        mapper = 'rowToWanted',
        limitKey = 'wanted',
    },
    internalMessages = {
        sql = 'SELECT * FROM polis_internal_messages ORDER BY date DESC LIMIT ?',
        mapper = 'rowToMessage',
        limitKey = 'messages',
    },
}

local function getLimit(key)
    local limits = Config.DataLoadLimits or {}
    return limits[key] or 500
end

function Repository.LoadModule(moduleName)
    Database.EnsureSchema()
    local spec = MODULE_QUERIES[moduleName]
    if not spec then
        return nil
    end

    local limit = getLimit(spec.limitKey)
    local mapper = RepositoryMappers[spec.mapper]
    local list = {}
    for _, row in ipairs(MySQL.query.await(spec.sql, { limit }) or {}) do
        list[#list + 1] = mapper(row)
    end
    return list
end

function Repository.LoadAllData()
    return {
        persons = Repository.LoadModule('persons') or {},
        cases = Repository.LoadModule('cases') or {},
        weapons = Repository.LoadModule('weapons') or {},
        vehicles = Repository.LoadModule('vehicles') or {},
        wanted = Repository.LoadModule('wanted') or {},
        internalMessages = Repository.LoadModule('internalMessages') or {},
    }
end

function Repository.GetPersonDetail(id)
    Database.EnsureSchema()
    local row = MySQL.single.await('SELECT * FROM polis_persons WHERE id = ? LIMIT 1', { id })
    if not row then return nil end

    local person = RepositoryMappers.rowToPerson(row)
    local noteRows = MySQL.query.await(
        'SELECT id, officer_id, officer_name, note_date, content FROM polis_person_notes WHERE person_id = ? ORDER BY note_date DESC',
        { id }
    ) or {}

    if #noteRows > 0 then
        local notes = {}
        for _, noteRow in ipairs(noteRows) do
            notes[#notes + 1] = {
                id = noteRow.id,
                officerId = noteRow.officer_id,
                officerName = noteRow.officer_name,
                date = noteRow.note_date,
                content = noteRow.content,
            }
        end
        person.notes = notes
    end

    return person
end

function Repository.GetCaseDetail(id)
    Database.EnsureSchema()
    local row = MySQL.single.await('SELECT * FROM polis_cases WHERE id = ? LIMIT 1', { id })
    if not row then return nil end

    local caseFile = RepositoryMappers.rowToCase(row)
    local evidenceRows = MySQL.query.await(
        'SELECT id, name, file_url, uploaded_at, officer_id, officer_name FROM polis_case_evidence WHERE case_id = ? ORDER BY uploaded_at DESC',
        { id }
    ) or {}

    if #evidenceRows > 0 then
        local evidence = {}
        for _, evidenceRow in ipairs(evidenceRows) do
            evidence[#evidence + 1] = {
                id = evidenceRow.id,
                name = evidenceRow.name,
                fileUrl = evidenceRow.file_url,
                uploadedAt = evidenceRow.uploaded_at,
                officerId = evidenceRow.officer_id,
                officerName = evidenceRow.officer_name,
            }
        end
        caseFile.evidence = evidence
    end

    return caseFile
end
