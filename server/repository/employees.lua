-- Employees
function Repository.GetAllEmployees()
    Database.EnsureSchema()
    local rows = MySQL.query.await('SELECT * FROM polis_employees ORDER BY name ASC') or {}
    local list = {}
    for _, row in ipairs(rows) do
        list[#list + 1] = RepositoryMappers.rowToEmployee(row)
    end
    return list
end

function Repository.FindEmployeeByBadge(badgeNumber)
    Database.EnsureSchema()
    local row = MySQL.single.await(
        'SELECT * FROM polis_employees WHERE LOWER(badge_number) = LOWER(?) LIMIT 1',
        { badgeNumber }
    )
    return row and RepositoryMappers.rowToEmployee(row) or nil
end

function Repository.FindEmployeeById(id)
    Database.EnsureSchema()
    local row = MySQL.single.await('SELECT * FROM polis_employees WHERE id = ? LIMIT 1', { id })
    return row and RepositoryMappers.rowToEmployee(row) or nil
end

function Repository.CreateEmployee(data)
    Database.EnsureSchema()
    local id = Database.GenerateId('emp')
    local hash = Password.Hash(data.password)
    if not hash then return nil, 'Passwort ungültig.' end

    local tplId = data.roleTemplateId or Permissions.TemplateForRank(data.rank or 'beamter')
    local perms = Permissions.FromTable(data.permissions or Permissions.Empty())
    if not data.permissions or not next(data.permissions) then
        for _, template in ipairs(Repository.GetAllRoleTemplates()) do
            if template.id == tplId then
                perms = template.permissions
                break
            end
        end
    end

    MySQL.insert.await(
        'INSERT INTO polis_employees (id, badge_number, password_hash, name, rank, unit, active, created_at, role_template_id, permissions) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        {
            id,
            data.badgeNumber,
            hash,
            data.name,
            data.rank or 'beamter',
            '',
            1,
            os.date('%Y-%m-%d'),
            tplId,
            Database.EncodeJson(perms),
        }
    )

    return Repository.FindEmployeeById(id)
end

function Repository.UpdateEmployee(id, data)
    Database.EnsureSchema()
    local emp = Repository.FindEmployeeById(id)
    if not emp then return nil end

    local name = data.name or emp.name
    local rank = data.rank or emp.rank
    local active = data.active ~= nil and data.active or emp.active
    local tplId = data.roleTemplateId ~= nil and data.roleTemplateId or emp.roleTemplateId
    local perms = data.permissions and Permissions.FromTable(data.permissions) or emp.permissions

    if data.password and data.password ~= '' then
        local hash = Password.Hash(data.password)
        MySQL.update.await(
            'UPDATE polis_employees SET name = ?, rank = ?, unit = ?, active = ?, password_hash = ?, role_template_id = ?, permissions = ? WHERE id = ?',
            { name, rank, '', active and 1 or 0, hash, tplId, Database.EncodeJson(perms), id }
        )
    else
        MySQL.update.await(
            'UPDATE polis_employees SET name = ?, rank = ?, unit = ?, active = ?, role_template_id = ?, permissions = ? WHERE id = ?',
            { name, rank, '', active and 1 or 0, tplId, Database.EncodeJson(perms), id }
        )
    end

    return Repository.FindEmployeeById(id)
end

function Repository.DeleteEmployee(id)
    Database.EnsureSchema()
    return MySQL.update.await('DELETE FROM polis_employees WHERE id = ?', { id })
end

