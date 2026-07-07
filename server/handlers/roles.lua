PolisNui.Register('polis:server:getRoleTemplates', PolisNui.WithSession(function(src, reqId, _, session)
    local allowed = Repository.CanManageRoles(session.employee) or Repository.CanManageEmployees(session.employee)
    if not PolisNui.DenyUnless(src, reqId, allowed) then return end

    local templates = {}
    for _, t in ipairs(Repository.GetAllRoleTemplates()) do
        templates[#templates + 1] = Repository.CopyRoleTemplatePublic(t)
    end
    PolisNui.Ok(src, reqId, { success = true, roleTemplates = templates })
end))

PolisNui.Register('polis:server:createRoleTemplate', PolisNui.WithSession(function(src, reqId, data, session)
    if not PolisNui.DenyUnless(src, reqId, Repository.CanManageRoles(session.employee)) then return end

    local tpl = Repository.CreateRoleTemplate(data)
    if not tpl then
        PolisNui.Error(src, reqId, 'Vorlage konnte nicht erstellt werden.')
        return
    end

    PolisNui.Ok(src, reqId, { success = true, roleTemplate = Repository.CopyRoleTemplatePublic(tpl) })
end))

PolisNui.Register('polis:server:updateRoleTemplate', PolisNui.WithSession(function(src, reqId, data, session)
    if not PolisNui.DenyUnless(src, reqId, Repository.CanManageRoles(session.employee)) then return end

    local tpl = Repository.UpdateRoleTemplate(data.id, data)
    if not tpl then
        PolisNui.Error(src, reqId, 'Vorlage nicht gefunden.')
        return
    end

    PolisNui.Ok(src, reqId, { success = true, roleTemplate = Repository.CopyRoleTemplatePublic(tpl) })
end))

PolisNui.Register('polis:server:deleteRoleTemplate', PolisNui.WithSession(function(src, reqId, data, session)
    if not PolisNui.DenyUnless(src, reqId, Repository.CanManageRoles(session.employee)) then return end

    if not Repository.DeleteRoleTemplate(data.id) then
        PolisNui.Error(src, reqId, 'Systemvorlagen können nicht gelöscht werden.')
        return
    end

    PolisNui.Ok(src, reqId, { success = true })
end))
