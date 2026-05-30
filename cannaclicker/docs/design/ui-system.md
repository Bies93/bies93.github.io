# CannaClicker UI System

Stand: Sprint 5

## Layout

Desktop nutzt zwei klare Zonen:

| Zone       | Inhalt                                           | Verhalten                                                    |
| ---------- | ------------------------------------------------ | ------------------------------------------------------------ |
| Primary    | Ressourcen, Klickobjekt, aktive Buffs, Abilities | Bleibt visuell ruhig und priorisiert sofortiges Klicken.     |
| Side Panel | Shop, Upgrades, Research, Prestige, Achievements | Sticky ab Desktop, scrollbar ohne horizontale Layoutbrueche. |

Mobile stapelt die Zonen:

| Zone           | Verhalten                                                                    |
| -------------- | ---------------------------------------------------------------------------- |
| Ressourcen-HUD | Kompakt, umbruchfaehig, keine wachsenden Zahlen-Spruenge durch tabular nums. |
| Klickbereich   | Grosser Touch-Target, Pflanze bleibt frei von Overlays.                      |
| Side Panel     | Scrollbare Listen, Tabs mit mindestens 44 px Touch-Hoehe.                    |

## Tokens

| Token                | Wert                        | Zweck                                 |
| -------------------- | --------------------------- | ------------------------------------- |
| `--ui-radius`        | `8px`                       | Standardradius für Panels und Cards. |
| `--ui-radius-sm`     | `6px`                       | Buttons und kleine Controls.          |
| `--ui-panel`         | `rgba(10, 16, 28, 0.78)`    | Ruhige Panel-Flächen.                |
| `--ui-panel-strong`  | `rgba(8, 12, 22, 0.92)`     | Modal/Sidepanel-Flächen.             |
| `--ui-border`        | `rgba(186, 230, 253, 0.14)` | Default-Trennung.                     |
| `--ui-border-strong` | `rgba(52, 211, 153, 0.45)`  | Erschwinglich/aktiv.                  |

## Themes

V1 enthaelt leichte Cosmetic-Layer:

| Theme       | Rolle                                                               |
| ----------- | ------------------------------------------------------------------- |
| `botanical` | Default: ruhig, dunkel, gruen, maximale Lesbarkeit.                 |
| `neon`      | Staerkerer Counterculture-Glow für Events, Klicks und aktive Runs. |
| `sunset`    | Wärmerer Cozy-Kontrast für spätere Runs und ruhigere Sessions.   |

| Plant Skin | Rolle                                                      |
| ---------- | ---------------------------------------------------------- |
| `classic`  | Default-Pflanze mit klarer Silhouette.                     |
| `jade`     | Kuehler, satter Botanical-Look.                            |
| `gold`     | Reward-/Prestige-betonter Warmton.                         |
| `violet`   | Später Run, Research und Prestige mit mystischem Akzent.  |

Themes und Plant Skins veraendern nur UI-Stimmung, Schatten und Akzentfarben. Sie geben keine spielerischen Boni und blockieren keine Progression.

## States

| State       | UI-Signal                                                                  |
| ----------- | -------------------------------------------------------------------------- |
| Locked      | Reduzierte Sättigung, sichtbarer Unlock-Hinweis, kein leerer Platzhalter. |
| Available   | Gruener Rand/leichter Glow, Button aktiv.                                  |
| Owned       | Statuslabel und reduzierte Button-Prioritaet.                              |
| Active Buff | Chip mit Restzeit und Farbton nach Effektart.                              |
| Event       | Runde klickbare Targets mit Icon und kurzer Label-Kapsel.                  |
| Run Lens    | Kompakter Strategiehinweis im Klickbereich mit Ton nach Fokus.             |

## Accessibility

- Interaktive Targets auf Mobile mindestens 40-44 px.
- Buffs und Item-Zustaende tragen Text, nicht nur Farbe.
- Animationen bleiben kurz: Klickpulse, Event-Bob und Kaufpulse ohne Screen-Shake.
- Zahlen nutzen tabular nums und konsistente Kurzformatierung.
