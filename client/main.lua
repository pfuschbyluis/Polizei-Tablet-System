exports('OpenTablet', function()
    PolisClient.OpenTablet()
end)

exports('CloseTablet', function()
    PolisClient.CloseTablet()
end)

exports('IsTabletOpen', function()
    return PolisClient.isOpen
end)

RegisterCommand(Config.Command, function()
    if PolisClient.isOpen then
        PolisClient.CloseTablet()
    else
        PolisClient.OpenTablet()
    end
end, false)

if Config.Keybind then
    RegisterKeyMapping(Config.Command, Config.KeybindDescription, 'keyboard', Config.Keybind)
end
