CreateThread(function()
    while true do
        if PolisClient.isOpen then
            DisableControlAction(0, 1, true)
            DisableControlAction(0, 2, true)
            DisableControlAction(0, 142, true)
            DisableControlAction(0, 18, true)
            DisableControlAction(0, 322, true)
            DisableControlAction(0, 106, true)
            Wait(0)
        else
            Wait(500)
        end
    end
end)

AddEventHandler('onResourceStop', function(resource)
    if resource == GetCurrentResourceName() then
        PolisClient.CloseTablet()
    end
end)

RegisterNetEvent('polis:client:open', function()
    PolisClient.OpenTablet()
end)

RegisterNetEvent('polis:client:close', function()
    PolisClient.CloseTablet()
end)
