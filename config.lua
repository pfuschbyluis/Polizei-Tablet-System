Config = {}

-- Allgemein
Config.ResourceName = 'polis'
Config.Command = 'polis'
Config.Keybind = 'F6'
Config.KeybindDescription = 'POLIS Tablet öffnen'

-- Job-Berechtigung (Framework-abhängig)
Config.Framework = 'standalone' -- 'standalone' | 'esx' | 'qb'
Config.AllowEveryone = true
Config.AllowedJobs = { 'police', 'lspd', 'bcso', 'sheriff', 'sasp' }

-- MySQL / Sessions
Config.SessionDurationHours = 8

-- Standard-Mitarbeiter beim ersten Start (Passwörter werden gehasht in der DB gespeichert)
Config.DefaultEmployees = {
    {
        id = 'emp-admin',
        badgeNumber = 'PD-1001',
        password = 'admin123',
        name = 'System Administrator',
        rank = 'admin',
        active = true,
        createdAt = '2026-01-01',
    },
    {
        id = 'emp-beamter',
        badgeNumber = 'PD-4521',
        password = 'beamter123',
        name = 'Polizeiobermeister Demo',
        rank = 'beamter',
        active = true,
        createdAt = '2026-01-01',
    },
}

Config.UseAnimation = true
Config.AnimDict = 'amb@world_human_seat_wall_tablet@female@base'
Config.AnimName = 'base'
Config.PropModel = 'prop_cs_tablet'
Config.PropBone = 60309
Config.NoAccessMessage = 'Du hast keinen Zugriff auf das POLIS-Tablet.'
