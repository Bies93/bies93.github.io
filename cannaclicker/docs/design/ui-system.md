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
| `--ui-radius`        | `8px`                       | Standardradius fuer Panels und Cards. |
| `--ui-radius-sm`     | `6px`                       | Buttons und kleine Controls.          |
| `--ui-panel`         | `rgba(10, 16, 28, 0.78)`    | Ruhige Panel-Flaechen.                |
| `--ui-panel-strong`  | `rgba(8, 12, 22, 0.92)`     | Modal/Sidepanel-Flaechen.             |
| `--ui-border`        | `rgba(186, 230, 253, 0.14)` | Default-Trennung.                     |
| `--ui-border-strong` | `rgba(52, 211, 153, 0.45)`  | Erschwinglich/aktiv.                  |

## States

| State       | UI-Signal                                                                  |
| ----------- | -------------------------------------------------------------------------- |
| Locked      | Reduzierte Saettigung, sichtbarer Unlock-Hinweis, kein leerer Platzhalter. |
| Available   | Gruener Rand/leichter Glow, Button aktiv.                                  |
| Owned       | Statuslabel und reduzierte Button-Prioritaet.                              |
| Active Buff | Chip mit Restzeit und Farbton nach Effektart.                              |
| Event       | Runde klickbare Targets mit Icon und kurzer Label-Kapsel.                  |

## Accessibility

- Interaktive Targets auf Mobile mindestens 40-44 px.
- Buffs und Item-Zustaende tragen Text, nicht nur Farbe.
- Animationen bleiben kurz: Klickpulse, Event-Bob und Kaufpulse ohne Screen-Shake.
- Zahlen nutzen tabular nums und konsistente Kurzformatierung.
