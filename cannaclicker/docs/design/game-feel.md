# Game Feel

Stand: Sprint 10.

## Ziel

CannaClicker soll sofort reagieren, aber nicht hektisch wirken. Feedback ist kurz, lesbar und stapelt sich kontrolliert. Alle wichtigen Inputs haben visuelles und auditives Feedback.

## Feedback-System

| Aktion          | Visuell                                        | Sound                      | Performance-Regel                                                       |
| --------------- | ---------------------------------------------- | -------------------------- | ----------------------------------------------------------------------- |
| Klick           | Scale/Squash, Floating Number, kleine Partikel | kurzer heller Click        | Click-Sound auf 34 ms limitiert, Floating Numbers pro Ursprung begrenzt |
| Gebuffter Klick | blaue Boost-Zahl, staerkere Partikel           | heller Double-Tick         | kein Screen-Shake                                                       |
| Kauf            | Card-Flash, Produktionswert poppt              | kurzer Kauf-Akkord         | keine DOM-Rebuilds ausser normalem Render                               |
| Fehlkauf        | dezenter Shake, kurzer Hinweis                 | leiser tiefer Tick         | keine nervige Fehlersalve                                               |
| Milestone       | staerkerer Card-Pop, Toast, Partikel           | hoeherer Kauf-Akkord       | nur bei echter Schwelle                                                 |
| Unlock          | Toast mit Handlungshinweis                     | Unlock-Chime               | Snapshot verhindert Wiederholungen                                      |
| Event Spawn     | Pop-in, Pfadbewegung, Restzeit-Balken          | Event-Kategorie-Sound      | ein bis zwei aktive Events je nach Progress                             |
| Event Collect   | Reward-Floating, Kategorie-Partikel, Toast     | Collect/Buff/Seed/Rare Cue | seltene Events etwas staerker                                           |
| Achievement     | Badge-Karte, Toast, Batch bei Mehrfach-Unlocks | Achievement Cue            | mehrere Unlocks werden gruppiert                                        |
| Prestige        | kurzer Screen-Wash, Seed-FX, neuer Run         | Prestige-Akkord            | keine lange unskippbare Sequenz                                         |

## Sound Design

Sounds werden prozedural ueber WebAudio erzeugt. Dadurch gibt es keine blockierenden Audiofiles und keine grossen Assets.

Sound-Cues:

- Click.
- Buy.
- Cannot buy.
- Unlock.
- Event spawn.
- Event collect.
- Buff activate.
- Buff expire.
- Achievement.
- Prestige.
- UI open/switch.
- Settings toggle.

Die Master-Lautstaerke ist bewusst niedrig. Der Sound-Schalter bleibt global und wird wie bisher separat gespeichert.

## Motion Settings

Settings bieten drei Motion-Stufen:

- Full: alle Partikel, Floating Numbers und Transitions aktiv.
- Reduced: weniger Partikel, kuerzere Floating-Animationen.
- Minimal: Floating Numbers und Partikel weitgehend deaktiviert.

Zusaetzlich respektieren kritische Animationen `prefers-reduced-motion`.

## Notification-Regeln

- Kein blockierender Dialog fuer normale Unlocks.
- Achievements werden bei Mehrfachausloesung zusammengefasst.
- Unlock-Snapshots verhindern Toast-Wiederholungen.
- Prestige bleibt ein klarer Moment, aber startet den neuen Run sofort.

## Performance-Regeln

- Animationen nutzen `transform` und `opacity`.
- Floating Numbers werden pro Ursprung begrenzt und aggregiert.
- Partikel haben ein globales Limit.
- Events animieren ueber Transform-Pfade und haben keine Layout-Messung pro Frame.
- Audio ist non-blocking und laedt keine Dateien.
