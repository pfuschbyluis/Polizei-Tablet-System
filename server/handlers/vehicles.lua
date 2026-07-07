PolisNui.Register('polis:server:createVehicle', PolisNui.WithSession(function(src, reqId, data, session)
    if not PolisNui.DenyUnless(src, reqId, Repository.EmployeeHasPermission(session.employee, 'editVehicles')) then
        return
    end

    if not data.plate or not data.ownerId or not data.brand or not data.model then
        PolisNui.Error(src, reqId, 'Pflichtfelder fehlen.')
        return
    end

    local vehicle, err = Repository.CreateVehicle(data)
    if not vehicle then
        PolisNui.Error(src, reqId, err or 'Fahrzeug konnte nicht registriert werden.')
        return
    end

    PolisNui.Ok(src, reqId, { success = true, vehicle = vehicle })
end))

PolisNui.Register('polis:server:updateVehicle', PolisNui.WithSession(function(src, reqId, data, session)
    if not PolisNui.DenyUnless(src, reqId, Repository.EmployeeHasPermission(session.employee, 'editVehicles')) then
        return
    end

    local vehicle = Repository.UpdateVehicle(data.id, data)
    if not vehicle then
        PolisNui.Error(src, reqId, 'Fahrzeug nicht gefunden.')
        return
    end

    PolisNui.Ok(src, reqId, { success = true, vehicle = vehicle })
end))
