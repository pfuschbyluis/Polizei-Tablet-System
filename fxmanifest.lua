fx_version 'cerulean'
game 'gta5'

name 'polis'
author 'Viktorstadt PD'
description 'POLIS – Polizei-Tablet-System (NUI) für FiveM Roleplay'
version '1.0.0'

lua54 'yes'

shared_scripts {
    'config.lua',
}

client_scripts {
    'client/main.lua',
}

server_scripts {
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
