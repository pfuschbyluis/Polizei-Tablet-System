fx_version 'cerulean'
game 'gta5'

name 'polis'
author 'Viktorstadt PD'
description 'POLIS – Polizei-Tablet-System (NUI) für FiveM Roleplay'
version '1.1.0'

lua54 'yes'

dependency 'oxmysql'

shared_scripts {
    'config.lua',
    'shared/debug.lua',
}

client_scripts {
    'client/state.lua',
    'client/access.lua',
    'client/animation.lua',
    'client/tablet.lua',
    'client/nui_bridge.lua',
    'client/controls.lua',
    'client/main.lua',
}

server_scripts {
    '@oxmysql/lib/MySQL.lua',
    'server/lib/sha256.lua',
    'server/password.lua',
    'server/permissions.lua',
    'server/database.lua',
    'server/repository.lua',
    'server/nui.lua',
    'server/handlers/auth.lua',
    'server/handlers/employees.lua',
    'server/handlers/roles.lua',
    'server/handlers/branding.lua',
    'server/handlers/data.lua',
    'server/handlers/persons.lua',
    'server/handlers/weapons.lua',
    'server/handlers/vehicles.lua',
    'server/handlers/wanted.lua',
    'server/handlers/cases.lua',
    'server/handlers/audit.lua',
    'server/main.lua',
}

ui_page 'html/index.html'

files {
    'html/index.html',
    'html/favicon.svg',
    'html/icons.svg',
    'html/assets/*.js',
    'html/assets/*.css',
}

exports {
    'OpenTablet',
    'CloseTablet',
    'IsTabletOpen',
}

server_exports {
    'GetPlayerRank',
}
