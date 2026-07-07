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
}

client_scripts {
    'client/main.lua',
}

server_scripts {
    '@oxmysql/lib/MySQL.lua',
    'server/lib/sha256.lua',
    'server/password.lua',
    'server/permissions.lua',
    'server/database.lua',
    'server/repository.lua',
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
