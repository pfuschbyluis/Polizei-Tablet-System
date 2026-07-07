function Repository.CopyEmployeePublic(emp)
    return {
        id = emp.id,
        badgeNumber = emp.badgeNumber,
        name = emp.name,
        rank = emp.rank,
        active = emp.active,
        createdAt = emp.createdAt,
        roleTemplateId = emp.roleTemplateId,
        permissions = emp.permissions,
    }
end

function Repository.GetTemplatesMap()
    local map = {}
    for _, template in ipairs(Repository.GetAllRoleTemplates()) do
        map[template.id] = template
    end
    return map
end

function Repository.ResolveEmployeePermissions(emp)
    return Permissions.FromTable(emp.permissions or Permissions.Empty())
end

function Repository.EmployeeHasPermission(emp, key)
    local perms = Repository.ResolveEmployeePermissions(emp)
    return Permissions.Has(perms, key)
end

