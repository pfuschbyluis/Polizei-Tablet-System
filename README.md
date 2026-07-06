# POLIS – FiveM Polizei-Tablet

FiveM-NUI-Resource mit professionellem Polizei-Tablet für Roleplay-Server. Alle Daten sind fiktiv.

## Installation

1. Repository klonen oder herunterladen
2. Ordner in `resources/[police]/polis` legen (Name frei wählbar)
3. UI bauen (einmalig nach Updates):

```bash
cd police-tablet
npm install
npm run build:fivem
```

4. In `server.cfg` eintragen:

```
ensure polis
```

## Steuerung im Spiel

| Aktion | Taste / Befehl |
|--------|----------------|
| Tablet öffnen/schließen | **F6** oder `/polis` |
| Schließen | **ESC** oder X-Button |

## Framework-Konfiguration

In `config.lua` anpassen:

```lua
Config.Framework = 'standalone' -- 'esx' | 'qb' | 'standalone'
Config.AllowEveryone = true   -- false für Job-Check
Config.AllowedJobs = { 'police', 'lspd', 'bcso' }
```

### ESX / QBCore

```lua
Config.Framework = 'esx'      -- oder 'qb'
Config.AllowEveryone = false
```

Ränge werden über `Config.RankMapping` aus dem Job-Grade abgeleitet.

## Exports (Client)

```lua
-- Tablet öffnen
exports['polis']:OpenTablet()

-- Tablet schließen
exports['polis']:CloseTablet()

-- Status prüfen
local open = exports['polis']:IsTabletOpen()
```

## Events

```lua
-- Von Server/Client auslösen
TriggerEvent('polis:client:open')
TriggerEvent('polis:client:close')
```

## Entwicklung (Browser)

Zum UI-Entwickeln ohne FiveM:

```bash
cd police-tablet
npm run dev
```

Im Browser sind Demo-Beamte und Ränge im Header umschaltbar.

## Projektstruktur

```
polis/                    ← FiveM Resource (Repo-Root)
├── fxmanifest.lua
├── config.lua
├── client/main.lua
├── server/main.lua
├── html/                 ← Build-Output (npm run build:fivem)
└── police-tablet/        ← React-Quellcode
```

## Module

- Dashboard, Personenakten, Akten-System
- Waffen- & Fahrzeugregister
- Fahndungssystem
- Einsatzverwaltung
- Rang- & Rechtesystem
- Audit-Protokoll

## Hinweis

Fiktives Roleplay-System. Keine echten Behördenlogos oder Personendaten.
