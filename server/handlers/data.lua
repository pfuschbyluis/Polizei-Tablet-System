PolisNui.Register('polis:server:getInitialData', PolisNui.WithSession(function(src, reqId, _, _)
    PolisNui.Ok(src, reqId, { success = true, data = Repository.LoadAllData() })
end))

PolisNui.Register('polis:server:getDataModule', PolisNui.WithSession(function(src, reqId, data, _)
    local moduleName = data and data.module
    if not moduleName then
        PolisNui.Error(src, reqId, 'Modul fehlt.')
        return
    end

    local rows = Repository.LoadModule(moduleName)
    if rows == nil then
        PolisNui.Error(src, reqId, 'Unbekanntes Datenmodul.')
        return
    end

    PolisNui.Ok(src, reqId, { success = true, module = moduleName, rows = rows })
end))

PolisNui.Register('polis:server:getPersonDetail', PolisNui.WithSession(function(src, reqId, data, session)
    if not PolisNui.DenyUnless(src, reqId, Repository.EmployeeHasPermission(session.employee, 'viewPersons')) then
        return
    end

    local person = Repository.GetPersonDetail(data.id)
    if not person then
        PolisNui.Error(src, reqId, 'Person nicht gefunden.')
        return
    end

    PolisNui.Ok(src, reqId, { success = true, person = person })
end))

PolisNui.Register('polis:server:getCaseDetail', PolisNui.WithSession(function(src, reqId, data, session)
    if not PolisNui.DenyUnless(src, reqId, Repository.EmployeeHasPermission(session.employee, 'viewCases')) then
        return
    end

    local caseFile = Repository.GetCaseDetail(data.id)
    if not caseFile then
        PolisNui.Error(src, reqId, 'Akte nicht gefunden.')
        return
    end

    PolisNui.Ok(src, reqId, { success = true, caseFile = caseFile })
end))

PolisNui.Register('polis:server:getAuditLog', PolisNui.WithSession(function(src, reqId, _, session)
    if not PolisNui.DenyUnless(src, reqId, Repository.EmployeeHasPermission(session.employee, 'viewAuditLog')) then
        return
    end

    PolisNui.Ok(src, reqId, { success = true, entries = Repository.GetAuditLog() })
end))
