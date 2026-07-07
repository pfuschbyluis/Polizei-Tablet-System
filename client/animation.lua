function PolisClient.StartTabletAnimation()
    if not Config.UseAnimation then return end

    local ped = PlayerPedId()
    local dict = Config.AnimDict
    local anim = Config.AnimName

    RequestAnimDict(dict)
    while not HasAnimDictLoaded(dict) do
        Wait(10)
    end

    TaskPlayAnim(ped, dict, anim, 3.0, 3.0, -1, 49, 0, false, false, false)

    local propModel = joaat(Config.PropModel)
    RequestModel(propModel)
    while not HasModelLoaded(propModel) do
        Wait(10)
    end

    PolisClient.tabletProp = CreateObject(propModel, 0.0, 0.0, 0.0, true, true, false)
    AttachEntityToEntity(
        PolisClient.tabletProp,
        ped,
        GetPedBoneIndex(ped, Config.PropBone),
        0.03, 0.002, -0.02,
        10.0, 160.0, 0.0,
        true, true, false, true, 1, true
    )
    SetModelAsNoLongerNeeded(propModel)
end

function PolisClient.StopTabletAnimation()
    if not Config.UseAnimation then return end

    local ped = PlayerPedId()
    ClearPedTasks(ped)

    if PolisClient.tabletProp and DoesEntityExist(PolisClient.tabletProp) then
        DeleteEntity(PolisClient.tabletProp)
        PolisClient.tabletProp = nil
    end
end
