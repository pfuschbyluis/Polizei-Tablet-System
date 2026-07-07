# POLIS – FiveM Polizei-Tablet

FiveM-NUI-Resource mit professionellem Polizei-Tablet für Roleplay-Server. Alle Daten sind fiktiv.

## Installation

1. Repository klonen oder herunterladen
2. **[oxmysql](https://github.com/overextended/oxmysql)** installieren und MySQL-Verbindung in `server.cfg` konfigurieren
3. Ordner in `resources/[police]/polis` legen (Name frei wählbar)
4. UI bauen (einmalig nach Updates):

```bash
cd police-tablet
npm install
npm run build:fivem
```

5. In `server.cfg` eintragen (oxmysql vor polis starten):

```
ensure oxmysql
ensure polis
```

### Datenbank

Beim ersten Start werden **alle Tabellen automatisch erstellt** – es sind keine manuellen SQL-Importe nötig. Vor jeder Datenbankoperation prüft das Skript, ob die Tabellen existieren, und legt fehlende Strukturen an.

Passwörter werden **niemals im Klartext** gespeichert. Beim Login werden ältere Hashes automatisch auf ein schnelles Format migriert. Standard-Mitarbeiter aus `config.lua` werden beim ersten Start einmalig angelegt (nur wenn die Tabelle leer ist).

## Steuerung im Spiel

| Aktion | Taste / Befehl |
|--------|----------------|
| Tablet öffnen/schließen | **F6** oder `/polis` |
| Schließen | **ESC** oder X-Button |

## Anmeldung

Beim Öffnen erscheint ein Login-Fenster. Anmeldung mit **Dienstnummer** und **Passwort**.

Standard-Zugänge (in `config.lua` anpassbar):

| Dienstnummer | Passwort | Rang |
|--------------|----------|------|
| PD-1001 | admin123 | Administrator |
| PD-4521 | beamter123 | Beamter |

Administratoren können unter **Mitarbeiter** neue Zugänge anlegen und verwalten.

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
- Waffen- & Fahrzeugregister (Anlegen & Bearbeiten)
- Fahndungssystem
- Mitarbeiterverwaltung mit Rollen & Berechtigungen
- Audit-Protokoll

## Hinweis

Fiktives Roleplay-System. Keine echten Behördenlogos oder Personendaten.
