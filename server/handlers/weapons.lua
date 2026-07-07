PolisNui.Register('polis:server:createWeapon', PolisNui.WithSession(function(src, reqId, data, session)
    if not PolisNui.DenyUnless(src, reqId, Repository.EmployeeHasPermission(session.employee, 'editWeapons')) then
        return
    end

    if not data.serialNumber or not data.type or not data.caliber then
        PolisNui.Error(src, reqId, 'Pflichtfelder fehlen.')
        return
    end

    local weapon, err = Repository.CreateWeapon(data)
    if not weapon then
        PolisNui.Error(src, reqId, err or 'Waffe konnte nicht registriert werden.')
        return
    end

    PolisNui.Ok(src, reqId, { success = true, weapon = weapon })
end))

PolisNui.Register('polis:server:updateWeapon', PolisNui.WithSession(function(src, reqId, data, session)
    if not PolisNui.DenyUnless(src, reqId, Repository.EmployeeHasPermission(session.employee, 'editWeapons')) then
        return
    end

    local weapon = Repository.UpdateWeapon(data.id, data)
    if not weapon then
        PolisNui.Error(src, reqId, 'Waffe nicht gefunden.')
        return
    end

    PolisNui.Ok(src, reqId, { success = true, weapon = weapon })
end))
