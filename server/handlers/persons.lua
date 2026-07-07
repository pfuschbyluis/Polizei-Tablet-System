PolisNui.Register('polis:server:addPersonNote', PolisNui.WithSession(function(src, reqId, data, session)
    if not PolisNui.DenyUnless(src, reqId, Repository.EmployeeHasPermission(session.employee, 'editPersons')) then
        return
    end

    local ok, note = Repository.AddPersonNote(data.personId, data.note)
    if not ok then
        PolisNui.Error(src, reqId, 'Person nicht gefunden.')
        return
    end

    PolisNui.Ok(src, reqId, { success = true, note = note })
end))

PolisNui.Register('polis:server:createPerson', PolisNui.WithSession(function(src, reqId, data, session)
    if not PolisNui.DenyUnless(src, reqId, Repository.EmployeeHasPermission(session.employee, 'editPersons')) then
        return
    end

    if not data.firstName or not data.lastName or not data.dateOfBirth then
        PolisNui.Error(src, reqId, 'Pflichtfelder fehlen.')
        return
    end

    local person = Repository.CreatePerson(data)
    if not person then
        PolisNui.Error(src, reqId, 'Person konnte nicht erstellt werden.')
        return
    end

    PolisNui.Ok(src, reqId, { success = true, person = person })
end))

PolisNui.Register('polis:server:updatePerson', PolisNui.WithSession(function(src, reqId, data, session)
    if not PolisNui.DenyUnless(src, reqId, Repository.EmployeeHasPermission(session.employee, 'editPersons')) then
        return
    end

    local person = Repository.UpdatePerson(data.id, data)
    if not person then
        PolisNui.Error(src, reqId, 'Person nicht gefunden.')
        return
    end

    PolisNui.Ok(src, reqId, { success = true, person = person })
end))
