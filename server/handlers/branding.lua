PolisNui.Register('polis:server:getBranding', function(src, reqId, _)
    PolisNui.Ok(src, reqId, { success = true, branding = Repository.GetBranding() })
end)

PolisNui.Register('polis:server:updateBranding', PolisNui.WithSession(function(src, reqId, data, session)
    if not PolisNui.DenyUnless(src, reqId, Repository.CanManageSettings(session.employee)) then return end

    local iconUrl = data.customIconUrl or ''
    local branding, err = Repository.UpdateBranding(iconUrl)
    if not branding then
        PolisNui.Error(src, reqId, err or 'Einstellungen konnten nicht gespeichert werden.')
        return
    end

    PolisNui.Ok(src, reqId, { success = true, branding = branding })

    CreateThread(function()
        Repository.LogAudit({
            officerId = session.employee.id,
            officerName = session.employee.name,
            action = 'Polizei-Icon aktualisiert',
            module = 'Einstellungen',
            details = branding.customIconUrl ~= '' and branding.customIconUrl or 'Standard-Icon wiederhergestellt',
        })
        TriggerClientEvent('polis:client:brandingUpdated', -1, branding)
    end)
end))
