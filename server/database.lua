Database = {}

local seeded = false
local schemaReady = false

local SCHEMA = {
    [[CREATE TABLE IF NOT EXISTS polis_employees (
        id VARCHAR(64) NOT NULL PRIMARY KEY,
        badge_number VARCHAR(32) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(128) NOT NULL,
        rank VARCHAR(32) NOT NULL,
        unit VARCHAR(128) NOT NULL,
        active TINYINT(1) NOT NULL DEFAULT 1,
        created_at DATE NOT NULL,
        INDEX idx_badge (badge_number)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci]],

    [[CREATE TABLE IF NOT EXISTS polis_role_templates (
        id VARCHAR(64) NOT NULL PRIMARY KEY,
        name VARCHAR(128) NOT NULL,
        description VARCHAR(255) NOT NULL,
        is_system TINYINT(1) NOT NULL DEFAULT 0,
        permissions JSON NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci]],

    [[CREATE TABLE IF NOT EXISTS polis_sessions (
        token VARCHAR(64) NOT NULL PRIMARY KEY,
        employee_id VARCHAR(64) NOT NULL,
        source INT NOT NULL,
        expires_at BIGINT NOT NULL,
        INDEX idx_employee (employee_id),
        INDEX idx_source (source)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci]],

    [[CREATE TABLE IF NOT EXISTS polis_persons (
        id VARCHAR(64) NOT NULL PRIMARY KEY,
        first_name VARCHAR(64) NOT NULL,
        last_name VARCHAR(64) NOT NULL,
        date_of_birth DATE NOT NULL,
        address VARCHAR(255) NOT NULL,
        city VARCHAR(128) NOT NULL,
        phone VARCHAR(64) NULL,
        photo_url VARCHAR(512) NULL,
        prior_convictions JSON NOT NULL,
        arrest_warrants JSON NOT NULL,
        notes JSON NOT NULL,
        linked_vehicle_ids JSON NOT NULL,
        linked_weapon_ids JSON NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci]],

    [[CREATE TABLE IF NOT EXISTS polis_cases (
        id VARCHAR(64) NOT NULL PRIMARY KEY,
        case_number VARCHAR(32) NOT NULL UNIQUE,
        title VARCHAR(255) NOT NULL,
        offense VARCHAR(128) NOT NULL,
        status VARCHAR(32) NOT NULL,
        created_at DATE NOT NULL,
        updated_at DATE NOT NULL,
        assigned_officer_id VARCHAR(64) NOT NULL,
        assigned_officer_name VARCHAR(128) NOT NULL,
        description TEXT NOT NULL,
        participants JSON NOT NULL,
        evidence JSON NOT NULL,
        witnesses JSON NOT NULL,
        internal_notes JSON NOT NULL,
        linked_vehicle_ids JSON NOT NULL,
        INDEX idx_case_number (case_number),
        INDEX idx_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci]],

    [[CREATE TABLE IF NOT EXISTS polis_weapons (
        id VARCHAR(64) NOT NULL PRIMARY KEY,
        serial_number VARCHAR(64) NOT NULL UNIQUE,
        type VARCHAR(128) NOT NULL,
        caliber VARCHAR(64) NOT NULL,
        owner_id VARCHAR(64) NULL,
        license_status VARCHAR(32) NOT NULL,
        license_expiry DATE NULL,
        registered_at DATE NOT NULL,
        notes TEXT NOT NULL,
        is_wanted TINYINT(1) NOT NULL DEFAULT 0,
        INDEX idx_serial (serial_number)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci]],

    [[CREATE TABLE IF NOT EXISTS polis_vehicles (
        id VARCHAR(64) NOT NULL PRIMARY KEY,
        plate VARCHAR(32) NOT NULL UNIQUE,
        owner_id VARCHAR(64) NOT NULL,
        model VARCHAR(128) NOT NULL,
        brand VARCHAR(128) NOT NULL,
        color VARCHAR(64) NOT NULL,
        insurance_status VARCHAR(32) NOT NULL,
        registration_status VARCHAR(32) NOT NULL,
        is_wanted TINYINT(1) NOT NULL DEFAULT 0,
        linked_case_ids JSON NOT NULL,
        registered_at DATE NOT NULL,
        INDEX idx_plate (plate)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci]],

    [[CREATE TABLE IF NOT EXISTS polis_wanted (
        id VARCHAR(64) NOT NULL PRIMARY KEY,
        type VARCHAR(32) NOT NULL,
        target_id VARCHAR(64) NOT NULL,
        target_name VARCHAR(255) NOT NULL,
        priority VARCHAR(32) NOT NULL,
        description TEXT NOT NULL,
        last_known_location VARCHAR(255) NOT NULL,
        responsible_unit VARCHAR(128) NOT NULL,
        issued_at DATE NOT NULL,
        active TINYINT(1) NOT NULL DEFAULT 1,
        INDEX idx_target (target_id),
        INDEX idx_active (active)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci]],

    [[CREATE TABLE IF NOT EXISTS polis_internal_messages (
        id VARCHAR(64) NOT NULL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        author VARCHAR(128) NOT NULL,
        date DATE NOT NULL,
        priority VARCHAR(32) NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci]],

    [[CREATE TABLE IF NOT EXISTS polis_audit_log (
        id VARCHAR(64) NOT NULL PRIMARY KEY,
        timestamp DATETIME NOT NULL,
        officer_id VARCHAR(64) NOT NULL,
        officer_name VARCHAR(128) NOT NULL,
        action VARCHAR(255) NOT NULL,
        module VARCHAR(64) NOT NULL,
        details TEXT NOT NULL,
        INDEX idx_timestamp (timestamp),
        INDEX idx_officer (officer_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci]],

    [[CREATE TABLE IF NOT EXISTS polis_settings (
        setting_key VARCHAR(64) NOT NULL PRIMARY KEY,
        setting_value TEXT NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci]],
}

function Database.EnsureSchema()
    if schemaReady then
        return
    end

    for _, query in ipairs(SCHEMA) do
        MySQL.query.await(query)
    end

    Database.MigratePermissionsV2()

    if not seeded then
        Database.SeedDefaultRoleTemplates()
        Database.SeedDefaultEmployees()
        Database.UpgradeDefaultEmployeePasswords()
        seeded = true
    end

    schemaReady = true
end

function Database.MigratePermissionsV2()
    local cols = MySQL.query.await("SHOW COLUMNS FROM polis_employees LIKE 'permissions'")
    if not cols or #cols == 0 then
        MySQL.query.await('ALTER TABLE polis_employees ADD COLUMN role_template_id VARCHAR(64) NULL')
        MySQL.query.await("ALTER TABLE polis_employees ADD COLUMN permissions JSON NOT NULL")
    end

    local employees = MySQL.query.await('SELECT id, rank, role_template_id, permissions FROM polis_employees') or {}
    for _, row in ipairs(employees) do
        local perms = Database.DecodeJson(row.permissions, {})
        local hasPerms = false
        for _, key in ipairs({ 'viewDashboard', 'viewAllCases', 'manageEmployees' }) do
            if perms[key] then
                hasPerms = true
                break
            end
        end

        if not row.role_template_id or not hasPerms then
            local tplId = Permissions.TemplateForRank(row.rank)
            local tplPerms = Permissions.Empty()
            for _, template in ipairs(Permissions.DefaultTemplates()) do
                if template.id == tplId then
                    tplPerms = template.permissions
                    break
                end
            end
            MySQL.update.await(
                'UPDATE polis_employees SET role_template_id = ?, permissions = ? WHERE id = ?',
                { tplId, Database.EncodeJson(tplPerms), row.id }
            )
        end
    end
end

function Database.SeedDefaultRoleTemplates()
    local count = MySQL.scalar.await('SELECT COUNT(*) FROM polis_role_templates')
    if count and count > 0 then
        return
    end

    for _, template in ipairs(Permissions.DefaultTemplates()) do
        MySQL.insert.await(
            'INSERT INTO polis_role_templates (id, name, description, is_system, permissions) VALUES (?, ?, ?, ?, ?)',
            {
                template.id,
                template.name,
                template.description,
                template.isSystem and 1 or 0,
                Database.EncodeJson(template.permissions),
            }
        )
    end

    PolisDebug('Standard-Rollenvorlagen geseedet')
end

function Database.UpgradeDefaultEmployeePasswords()
    if not Config.DefaultEmployees or #Config.DefaultEmployees == 0 then
        return
    end

    for _, emp in ipairs(Config.DefaultEmployees) do
        if emp.badgeNumber and emp.password then
            local row = MySQL.single.await(
                'SELECT id, password_hash FROM polis_employees WHERE badge_number = ? LIMIT 1',
                { emp.badgeNumber }
            )
            if row and Password.NeedsRehash(row.password_hash) then
                local hash = Password.Hash(emp.password)
                if hash then
                    MySQL.update.await(
                        'UPDATE polis_employees SET password_hash = ? WHERE id = ?',
                        { hash, row.id }
                    )
                end
            end
        end
    end

    PolisDebug('Standard-Passwörter auf schnelles Format aktualisiert')
end

function Database.SeedDefaultEmployees()
    local count = MySQL.scalar.await('SELECT COUNT(*) FROM polis_employees')
    if count and count > 0 then
        return
    end

    if not Config.DefaultEmployees or #Config.DefaultEmployees == 0 then
        PolisDebug('Keine Standard-Mitarbeiter zum Seed konfiguriert.')
        return
    end

    for _, emp in ipairs(Config.DefaultEmployees) do
        local hash = Password.Hash(emp.password)
        local tplId = Permissions.TemplateForRank(emp.rank)
        local tplPerms = Permissions.Empty()
        for _, template in ipairs(Permissions.DefaultTemplates()) do
            if template.id == tplId then
                tplPerms = template.permissions
                break
            end
        end
        if hash then
            MySQL.insert.await(
                'INSERT INTO polis_employees (id, badge_number, password_hash, name, rank, unit, active, created_at, role_template_id, permissions) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                {
                    emp.id,
                    emp.badgeNumber,
                    hash,
                    emp.name,
                    emp.rank,
                    '',
                    emp.active and 1 or 0,
                    emp.createdAt or os.date('%Y-%m-%d'),
                    tplId,
                    Database.EncodeJson(tplPerms),
                }
            )
        end
    end

    PolisDebug(('Standard-Mitarbeiter geseedet: %s'):format(#Config.DefaultEmployees))
end

function Database.DecodeJson(value, fallback)
    if value == nil or value == '' then
        return fallback or {}
    end
    if type(value) == 'table' then
        return value
    end
    local ok, decoded = pcall(json.decode, value)
    if ok and decoded then
        return decoded
    end
    return fallback or {}
end

function Database.EncodeJson(value)
    return json.encode(value or {})
end

function Database.GenerateId(prefix)
    return ('%s-%s-%s'):format(prefix, os.time(), math.random(1000, 9999))
end

function Database.GenerateToken()
    local chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    local token = {}
    for i = 1, 48 do
        local idx = math.random(1, #chars)
        token[i] = chars:sub(idx, idx)
    end
    return table.concat(token)
end

PolisDebug('Datenbank-Modul geladen')
