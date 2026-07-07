PolisNui.Register('polis:server:getInitialData', PolisNui.WithSession(function(src, reqId, _, _)
    PolisNui.Ok(src, reqId, { success = true, data = Repository.LoadAllData() })
end))

PolisNui.Register('polis:server:getAuditLog', PolisNui.WithSession(function(src, reqId, _, session)
    if not PolisNui.DenyUnless(src, reqId, Repository.EmployeeHasPermission(session.employee, 'viewAuditLog')) then
        return
    end

    PolisNui.Ok(src, reqId, { success = true, entries = Repository.GetAuditLog() })
end))
