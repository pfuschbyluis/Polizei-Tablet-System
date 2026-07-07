-- Role templates
function Repository.GetAllRoleTemplates()
    Database.EnsureSchema()
    local rows = MySQL.query.await('SELECT * FROM polis_role_templates ORDER BY name ASC') or {}
    local list = {}
    for _, row in ipairs(rows) do
        list[#list + 1] = RepositoryMappers.rowToRoleTemplate(row)
    end
    return list
end

function Repository.FindRoleTemplateById(id)
    Database.EnsureSchema()
    local row = MySQL.single.await('SELECT * FROM polis_role_templates WHERE id = ? LIMIT 1', { id })
    return row and RepositoryMappers.rowToRoleTemplate(row) or nil
end

function Repository.CreateRoleTemplate(data)
    Database.EnsureSchema()
    local id = Database.GenerateId('tpl')
    MySQL.insert.await(
        'INSERT INTO polis_role_templates (id, name, description, is_system, permissions) VALUES (?, ?, ?, 0, ?)',
        { id, data.name, data.description or '', Database.EncodeJson(Permissions.FromTable(data.permissions or {})) }
    )
    return Repository.FindRoleTemplateById(id)
end

function Repository.UpdateRoleTemplate(id, data)
    Database.EnsureSchema()
    local tpl = Repository.FindRoleTemplateById(id)
    if not tpl then return nil end

    local name = data.name or tpl.name
    local description = data.description or tpl.description
    local perms = data.permissions and Permissions.FromTable(data.permissions) or tpl.permissions

    MySQL.update.await(
        'UPDATE polis_role_templates SET name = ?, description = ?, permissions = ? WHERE id = ?',
        { name, description, Database.EncodeJson(perms), id }
    )
    return Repository.FindRoleTemplateById(id)
end

function Repository.DeleteRoleTemplate(id)
    Database.EnsureSchema()
    local tpl = Repository.FindRoleTemplateById(id)
    if not tpl or tpl.isSystem then
        return false
    end
    MySQL.update.await('DELETE FROM polis_role_templates WHERE id = ?', { id })
    return true
end

function Repository.CopyRoleTemplatePublic(tpl)
    return {
        id = tpl.id,
        name = tpl.name,
        description = tpl.description,
        isSystem = tpl.isSystem,
        permissions = tpl.permissions,
    }
end

