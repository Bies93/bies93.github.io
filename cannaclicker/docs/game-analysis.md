# CannaClicker Project Analysis

Stand: Reboot Sprint 1/2.

## Kurzfazit

CannaClicker ist technisch bereits ein brauchbares Vite/TypeScript-Idle-Game mit zentralem State, Save-Migrationen, Autosave, Offline-Fortschritt, Shop, Upgrades, Forschung, Achievements, Events und Prestige. Die groessten Altlasten waren nicht die Grundlogik, sondern alte Windows-Workarounds, schwere und inkonsistente PNG-Assets, fehlende Asset-Disziplin und ein Prestige-Modell, das zu wenig klar kommuniziert wurde.

## Aktueller Fortschritt

- Native npm-Nutzung ohne `setup_env.bat`.
- Node 20 Zielumgebung.
- Datengetriebene Items, Upgrades, Research und Achievements.
- Zentrales Asset-Manifest unter `src/app/assetManifest.ts`.
- Neue SVG-Asset-Struktur unter `public/img`.
- 12 Item-Icons, 8 Event-Icons, UI-Icons, Research-/Upgrade-Icons, 11 Pflanzenstadien und Backgrounds.
- Prestige Option A umgesetzt: Reset ab 1,000,000 Run-Buds, Seed-Auszahlung per Wurzelkurve.
- Events von 3 auf 8 erweitert.
- GitHub Pages Workflow baut nur noch das Produktionsbundle.

## Architektur

- `src/app/state.ts`: zentraler GameState und Default-State.
- `src/app/game.ts`: Klicks, Kaeufe, Recalculation und Achievements.
- `src/app/events.ts`: Event-Queue, Spawnlogik, Rewards und Event-Stats.
- `src/app/prestige.ts`: Prestige-Preview, Seed-Gain, Soft-Reset.
- `src/app/save/*`: Persistenz, Migration und Import/Export.
- `src/app/ui/*`: Mount/Wire/Render-Struktur fuer den HUD.
- `src/data/*`: spielrelevante Balance- und Content-Daten.

## Gameplay-Bewertung

Der Core-Loop ist schluessig: Klicks starten den Run, Items erzeugen BPS, Upgrades und Forschung vertiefen die Multiplikatoren, Events liefern kurzfristige Peaks, Prestige gibt Meta-Fortschritt. Die neue erste Item-Kurve ist schneller und klarer als der alte Stand. Der erste Reset ist durch die feste 1,000,000-Run-Buds-Schwelle besser erklaerbar.

## Balancing-Risiken

- Ob 1,000,000 Run-Buds fuer den ersten Prestige-Reset optimal ist, braucht einen manuellen Playthrough.
- Spaete Item-Tiers koennen trotz neuer Werte noch grindig werden.
- Seed-Caps und Seed-Ausgaben fuer Forschung muessen nach mehreren Resets gegeneinander geprueft werden.
- Boost-Events ueberschreiben derzeit den aktiven Event-Boost. Das ist einfach und lesbar, aber nicht so tief wie ein Stack-System.

## UI- und Asset-Bewertung

Die UI ist funktional und hat eine klare Informationsarchitektur. Visuell ist sie nun deutlich naeher am Ziel, aber noch nicht finaler Release-Polish. Die groesste Verbesserung ist das Asset-System: statt verstreuter PNGs und kaputter @2x-Ableitungen gibt es ein Manifest und konsistente SVG-Familien.

## Naechste sinnvolle Sprints

- Manueller Balancing-Playthrough vom Start bis zum ersten Prestige.
- UI-Polish fuer Shop-Karten, Prestige-Panel und Event-Feedback.
- Mehr Differenzierung in Research-Entscheidungen und Achievements.
- Performance- und Bundle-Check nach dem Entfernen aller Legacy-Assets.
