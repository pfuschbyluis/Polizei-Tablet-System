PolisNui = PolisNui or {}

function PolisNui.Error(src, reqId, message)
    TriggerClientEvent('polis:client:nuiResult', src, reqId, { success = false, error = message })
end

function PolisNui.Ok(src, reqId, payload)
    TriggerClientEvent('polis:client:nuiResult', src, reqId, payload)
end

function PolisNui.ResolveSession(src, data)
    local token = data and data.sessionToken or nil
    return Repository.GetSession(token, src)
end

function PolisNui.RequireSession(src, reqId, data)
    local session = PolisNui.ResolveSession(src, data)
    if not session then
        PolisNui.Error(src, reqId, 'Sitzung abgelaufen. Bitte erneut anmelden.')
        return nil
    end
    return session
end

function PolisNui.Register(eventName, handler)
    RegisterNetEvent(eventName, function(reqId, data)
        handler(source, reqId, data or {})
    end)
end

function PolisNui.WithSession(handler)
    return function(src, reqId, data)
        local session = PolisNui.RequireSession(src, reqId, data)
        if not session then return end
        handler(src, reqId, data, session)
    end
end

function PolisNui.DenyUnless(src, reqId, allowed, message)
    if allowed then
        return true
    end
    PolisNui.Error(src, reqId, message or 'Keine Berechtigung.')
    return false
end
