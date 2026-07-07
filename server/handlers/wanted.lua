PolisNui.Register('polis:server:createWanted', PolisNui.WithSession(function(src, reqId, data, session)
    if not PolisNui.DenyUnless(src, reqId, Repository.EmployeeHasPermission(session.employee, 'editWanted')) then
        return
    end

    if not data.type or not data.targetId or not data.targetName then
        PolisNui.Error(src, reqId, 'Pflichtfelder fehlen.')
        return
    end

    local entry = Repository.CreateWanted(data)
    if not entry then
        PolisNui.Error(src, reqId, 'Fahndung konnte nicht erstellt werden.')
        return
    end

    PolisNui.Ok(src, reqId, { success = true, wanted = entry })
end))

PolisNui.Register('polis:server:updateWanted', PolisNui.WithSession(function(src, reqId, data, session)
    if not PolisNui.DenyUnless(src, reqId, Repository.EmployeeHasPermission(session.employee, 'editWanted')) then
        return
    end

    local entry = Repository.UpdateWanted(data.id, data)
    if not entry then
        PolisNui.Error(src, reqId, 'Fahndung nicht gefunden.')
        return
    end

    PolisNui.Ok(src, reqId, { success = true, wanted = entry })
end))
