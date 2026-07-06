# POLIS – Polizei-Tablet-System

Modernes, realistisches Polizei-Tablet-System für fiktives Roleplay/Game-Projekte. Das System simuliert professionelle digitale Polizeisoftware mit ausschließlich fiktiven Daten.

## Features

- **Dashboard** – Einsätze, Akten, Fahndungen, Fahrzeugmeldungen, interne Mitteilungen
- **Personenakte** – Stammdaten, Vorstrafen, Haftbefehle, Notizen, verknüpfte Fahrzeuge/Waffen
- **Akten-System** – Akten erstellen, Beweise, Zeugen, Beteiligte, Statusverwaltung
- **Waffenregistrierung** – Seriennummern, Lizenzstatus, Besitzer, Fahndungsmeldungen
- **Fahrzeuganmeldung** – Kennzeichen, Halter, Versicherung, Zulassung, Fahndungsstatus
- **Fahndungssystem** – Personen-, Fahrzeug- und Waffenfahndung mit Prioritätsstufen
- **Einsatzverwaltung** – Einsätze erstellen, Einheiten zuweisen, Berichte, Funkcodes
- **Rang- & Rechtesystem** – Admin, Leitstelle, Ermittler, Beamter mit unterschiedlichen Berechtigungen
- **Änderungsprotokoll** – Vollständige Audit-Log-Protokollierung (Admin)

## Technologie

- React 19 + TypeScript
- Vite
- Tailwind CSS 4
- React Router
- Lucide Icons

## Starten

```bash
cd police-tablet
npm install
npm run dev
```

Die App läuft unter `http://localhost:5173`.

## Demo-Zugänge

Im Header können Beamter und Rang gewechselt werden:

| Rang | Berechtigungen |
|------|----------------|
| **Administrator** | Vollzugriff inkl. Protokoll |
| **Leitstelle** | Einsätze, Fahndung, Lesezugriff |
| **Ermittler** | Akten, Personen, Waffen, Fahrzeuge |
| **Beamter** | Dashboard, Lesezugriff |

## Hinweis

Alle Daten sind fiktiv. Es werden keine echten Behördenlogos oder Personendaten verwendet. Das System dient ausschließlich Roleplay-/Spielzwecken.
