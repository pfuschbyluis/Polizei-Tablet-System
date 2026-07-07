local function normalizeIconUrl(url)
    if type(url) ~= 'string' then
        return ''
    end
    url = url:match('^%s*(.-)%s*$') or ''
    if url == '' then
        return ''
    end
    if #url > 2048 then
        return nil
    end
    if not url:match('^https?://') then
        return nil
    end
    return url
end

function Repository.GetSetting(key)
    Database.EnsureSchema()
    local row = MySQL.single.await('SELECT setting_value FROM polis_settings WHERE setting_key = ? LIMIT 1', { key })
    if not row then
        return nil
    end
    return row.setting_value
end

function Repository.SetSetting(key, value)
    Database.EnsureSchema()
    MySQL.query.await(
        'INSERT INTO polis_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)',
        { key, value }
    )
end

function Repository.GetBranding()
    Database.EnsureSchema()
    local customIconUrl = Repository.GetSetting('custom_icon_url') or ''
    return {
        customIconUrl = customIconUrl,
    }
end

function Repository.UpdateBranding(customIconUrl)
    Database.EnsureSchema()
    local url = normalizeIconUrl(customIconUrl or '')
    if url == nil then
        return nil, 'Ungültige Bild-URL. Bitte eine http(s)-Adresse eingeben.'
    end
    Repository.SetSetting('custom_icon_url', url)
    return Repository.GetBranding()
end
