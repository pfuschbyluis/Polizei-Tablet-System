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
    if not row then return nil end
    return Repository.GetCaseDetail(id)
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
    Database.EnsureSchema()
    evidence.id = evidence.id or Database.GenerateId('ev')
    MySQL.insert.await(
        'INSERT INTO polis_case_evidence (id, case_id, name, file_url, uploaded_at, officer_id, officer_name) VALUES (?, ?, ?, ?, ?, ?, ?)',
        {
            evidence.id,
            caseId,
            evidence.name or '',
            evidence.fileUrl or '',
            evidence.uploadedAt or os.date('%Y-%m-%d'),
            evidence.officerId or '',
            evidence.officerName or '',
        }
    )
    return Repository.UpdateCaseJsonField(caseId, 'evidence', function(list)
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

