Config = {}

-- Allgemein
Config.ResourceName = 'polis'
Config.Command = 'polis'
Config.Keybind = 'F6'
Config.KeybindDescription = 'POLIS Tablet öffnen'

-- Job-Berechtigung (Framework-abhängig)
Config.Framework = 'standalone' -- 'standalone' | 'esx' | 'qb'

-- Erlaubte Jobs (bei standalone immer true wenn Config.AllowEveryone = true)
Config.AllowEveryone = true -- Für Tests / Standalone-Server
Config.AllowedJobs = {
    'police',
    'lspd',
    'bcso',
    'sheriff',
    'sasp',
}

-- Rang-Mapping: Framework-Grade -> POLIS-Rang
-- rank: admin | leitstelle | ermittler | beamter
Config.RankMapping = {
    [0] = 'beamter',
    [1] = 'beamter',
    [2] = 'beamter',
    [3] = 'ermittler',
    [4] = 'leitstelle',
    [5] = 'admin',
}

Config.Units = {
    police = 'Streifenwagen Alpha-1',
    lspd = 'LSPD Streife',
    bcso = 'BCSO Patrouille',
    sheriff = 'Sheriff Department',
    sasp = 'Highway Patrol',
}

-- Animation beim Öffnen
Config.UseAnimation = true
Config.AnimDict = 'amb@world_human_seat_wall_tablet@female@base'
Config.AnimName = 'base'
Config.PropModel = 'prop_cs_tablet'
Config.PropBone = 60309

-- Benachrichtigung bei fehlender Berechtigung
Config.NoAccessMessage = 'Du hast keinen Zugriff auf das POLIS-Tablet.'
