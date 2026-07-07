local function ValidateEvidencePayload(evidence)
    if not evidence or not evidence.name or evidence.name:match('^%s*$') then
        return false, 'Dateiname erforderlich.'
    end

    local url = evidence.fileUrl or ''
    if url == '' then
        return false, 'Link oder Datei erforderlich.'
    end

    if url:match('^data:') then
        if #url > 3145728 then
            return false, 'Datei zu groß.'
        end
        return true
    end

    if #url > 512 or not url:match('^https?://') then
        return false, 'Ungültige Bild-URL.'
    end

    return true
end

PolisNui.Register('polis:server:createCase', PolisNui.WithSession(function(src, reqId, data, session)
    if not PolisNui.DenyUnless(src, reqId, Repository.EmployeeHasPermission(session.employee, 'createCases')) then
        return
    end

    local caseFile = Repository.CreateCase(data)
    if not caseFile then
        PolisNui.Error(src, reqId, 'Akte konnte nicht erstellt werden.')
        return
    end

    PolisNui.Ok(src, reqId, { success = true, caseFile = caseFile })
end))

PolisNui.Register('polis:server:updateCaseStatus', PolisNui.WithSession(function(src, reqId, data, session)
    if not PolisNui.DenyUnless(src, reqId, Repository.EmployeeHasPermission(session.employee, 'editCases')) then
        return
    end

    local caseFile = Repository.UpdateCaseStatus(data.caseId, data.status)
    if not caseFile then
        PolisNui.Error(src, reqId, 'Akte nicht gefunden.')
        return
    end

    PolisNui.Ok(src, reqId, { success = true, caseFile = caseFile })
end))

PolisNui.Register('polis:server:addCaseEvidence', PolisNui.WithSession(function(src, reqId, data, session)
    if not PolisNui.DenyUnless(src, reqId, Repository.EmployeeHasPermission(session.employee, 'editCases')) then
        return
    end

    local ok, err = ValidateEvidencePayload(data.evidence)
    if not ok then
        PolisNui.Error(src, reqId, err)
        return
    end

    local caseFile = Repository.AddCaseEvidence(data.caseId, data.evidence)
    PolisNui.Ok(src, reqId, { success = caseFile ~= nil, caseFile = caseFile })
end))

PolisNui.Register('polis:server:addCaseWitness', PolisNui.WithSession(function(src, reqId, data, session)
    if not PolisNui.DenyUnless(src, reqId, Repository.EmployeeHasPermission(session.employee, 'editCases')) then
        return
    end

    local caseFile = Repository.AddCaseWitness(data.caseId, data.witness)
    PolisNui.Ok(src, reqId, { success = caseFile ~= nil, caseFile = caseFile })
end))

PolisNui.Register('polis:server:addCaseParticipant', PolisNui.WithSession(function(src, reqId, data, session)
    if not PolisNui.DenyUnless(src, reqId, Repository.EmployeeHasPermission(session.employee, 'editCases')) then
        return
    end

    local caseFile = Repository.AddCaseParticipant(data.caseId, data.participant)
    PolisNui.Ok(src, reqId, { success = caseFile ~= nil, caseFile = caseFile })
end))

PolisNui.Register('polis:server:addCaseNote', PolisNui.WithSession(function(src, reqId, data, session)
    if not PolisNui.DenyUnless(src, reqId, Repository.EmployeeHasPermission(session.employee, 'editCases')) then
        return
    end

    local caseFile = Repository.AddCaseNote(data.caseId, data.note)
    PolisNui.Ok(src, reqId, { success = caseFile ~= nil, caseFile = caseFile })
end))
