PolisNui.Register('polis:server:login', function(src, reqId, data)
    local badgeNumber = data.badgeNumber or ''
    local password = data.password or ''

    local emp = Repository.FindEmployeeByBadge(badgeNumber)
    if not emp or not emp.active or not Password.Verify(password, emp.passwordHash) then
        PolisNui.Error(src, reqId, 'Dienstnummer oder Passwort ungültig.')
        return
    end

    local sessionToken = Repository.CreateSession(emp.id, src)
    local resolvedPerms = Repository.ResolveEmployeePermissions(emp)
    local officer = {
        id = emp.id,
        badgeNumber = emp.badgeNumber,
        name = emp.name,
        rank = emp.rank,
        roleTemplateId = emp.roleTemplateId,
        permissions = resolvedPerms,
        sessionToken = sessionToken,
    }

    local employees = {}
    local roleTemplates = {}
    if Repository.CanViewEmployees(emp) then
        for _, e in ipairs(Repository.GetAllEmployees()) do
            employees[#employees + 1] = Repository.CopyEmployeePublic(e)
        end
        for _, t in ipairs(Repository.GetAllRoleTemplates()) do
            roleTemplates[#roleTemplates + 1] = Repository.CopyRoleTemplatePublic(t)
        end
    end

    PolisNui.Ok(src, reqId, {
        success = true,
        officer = officer,
        employees = employees,
        roleTemplates = roleTemplates,
    })

    if Password.NeedsRehash(emp.passwordHash) then
        CreateThread(function()
            local newHash = Password.Rehash(password)
            if newHash then
                MySQL.update.await('UPDATE polis_employees SET password_hash = ? WHERE id = ?', { newHash, emp.id })
            end
        end)
    end

    PolisDebug(('Login: %s (%s)'):format(emp.name, emp.badgeNumber))
end)

PolisNui.Register('polis:server:logout', function(src, _, _)
    Repository.DeleteSessionsForSource(src)
end)
