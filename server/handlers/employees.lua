PolisNui.Register('polis:server:createEmployee', PolisNui.WithSession(function(src, reqId, data, session)
    if not PolisNui.DenyUnless(src, reqId, Repository.CanManageEmployees(session.employee)) then return end

    if Repository.FindEmployeeByBadge(data.badgeNumber or '') then
        PolisNui.Error(src, reqId, 'Dienstnummer vergeben.')
        return
    end

    local emp, err = Repository.CreateEmployee(data)
    if not emp then
        PolisNui.Error(src, reqId, err or 'Erstellen fehlgeschlagen.')
        return
    end

    PolisNui.Ok(src, reqId, { success = true, employee = Repository.CopyEmployeePublic(emp) })
    PolisDebug(('Mitarbeiter erstellt: %s'):format(emp.name))
end))

PolisNui.Register('polis:server:updateEmployee', PolisNui.WithSession(function(src, reqId, data, session)
    if not PolisNui.DenyUnless(src, reqId, Repository.CanManageEmployees(session.employee)) then return end

    local emp = Repository.UpdateEmployee(data.id, data)
    if not emp then
        PolisNui.Error(src, reqId, 'Aktualisieren fehlgeschlagen.')
        return
    end

    PolisNui.Ok(src, reqId, { success = true, employee = Repository.CopyEmployeePublic(emp) })
end))

PolisNui.Register('polis:server:deleteEmployee', PolisNui.WithSession(function(src, reqId, data, session)
    if not PolisNui.DenyUnless(src, reqId, Repository.CanManageEmployees(session.employee)) then return end

    if data.id == session.employee.id then
        PolisNui.Error(src, reqId, 'Eigener Account.')
        return
    end

    Repository.DeleteEmployee(data.id)
    PolisNui.Ok(src, reqId, { success = true })
end))
