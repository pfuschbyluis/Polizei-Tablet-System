function PolisClient.OpenTablet()
    if PolisClient.isOpen then return end

    if not PolisClient.HasAccess() then
        TriggerEvent('chat:addMessage', {
            color = { 255, 80, 80 },
            multiline = false,
            args = { 'POLIS', Config.NoAccessMessage },
        })
        return
    end

    PolisClient.isOpen = true
    PolisClient.sessionToken = nil
    PolisClient.StartTabletAnimation()
    SetNuiFocus(true, true)
    SendNUIMessage({ action = 'open' })
    PolisDebug('Tablet geöffnet')
end

function PolisClient.CloseTablet()
    if not PolisClient.isOpen then return end

    PolisClient.isOpen = false
    PolisClient.sessionToken = nil
    SetNuiFocus(false, false)
    PolisClient.StopTabletAnimation()
    SendNUIMessage({ action = 'close' })
    PolisDebug('Tablet geschlossen')
end
