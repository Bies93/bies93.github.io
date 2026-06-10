# BiesyClicker Project Analysis

Stand: Reboot Sprint 1/2.

## Kurzfazit

BiesyClicker ist technisch bereits ein brauchbares Vite/TypeScript-Idle-Game mit zentralem State, Save-Migrationen, Autosave, Offline-Fortschritt, Shop, Upgrades, Forschung, Achievements, Events und Prestige. Die größten Altlasten waren nicht die Grundlogik, sondern alte Windows-Workarounds, schwere und inkonsistente PNG-Assets, fehlende Asset-Disziplin und ein Prestige-Modell, das zu wenig klar kommuniziert wurde.

## Aktueller Fortschritt

- Native npm-Nutzung ohne `setup_env.bat`.
- Node 20 Zielumgebung.
- Datengetriebene Items, Upgrades, Research und Achievements.
- Zentrales Asset-Manifest unter `src/app/assetManifest.ts`.
- Neue SVG-Asset-Struktur unter `public/img`.
- 12 Item-Icons, 12 Event-Icons, UI-Icons, Research-/Upgrade-Icons, 11 staerkere Pflanzenstadien und Backgrounds.
- Prestige Option A umgesetzt: Reset ab 3,000,000 Run-Buds, Seed-Auszahlung per Wurzelkurve.
- Events von 3 auf 12 erweitert.
- GitHub Pages Workflow baut nur noch das Produktionsbundle.

## Architektur

- `src/app/state.ts`: zentraler GameState und Default-State.
- `src/app/game.ts`: Klicks, Kaeufe, Recalculation und Achievements.
- `src/app/events.ts`: Event-Queue, Spawnlogik, Rewards und Event-Stats.
- `src/app/prestige.ts`: Prestige-Preview, Seed-Gain, Soft-Reset.
- `src/app/save/*`: Persistenz, Migration und Import/Export.
- `src/app/ui/*`: Mount/Wire/Render-Struktur für den HUD.
- `src/data/*`: spielrelevante Balance- und Content-Daten.

## Gameplay-Bewertung

Der Core-Loop ist schluessig: Klicks starten den Run, Items erzeugen BPS, Upgrades und Forschung vertiefen die Multiplikatoren, Events liefern kurzfristige Peaks, Prestige gibt Meta-Fortschritt. Die neue erste Item-Kurve ist schneller und klarer als der alte Stand. Der erste Reset ist durch die feste 3,000,000-Run-Buds-Schwelle besser im 45-90-Minuten-Zielkorridor verankert.

## Balancing-Risiken

- Ob 3,000,000 Run-Buds für den ersten Prestige-Reset nach echten Spielerläufen feinjustiert werden muss, bleibt zu beobachten.
- Späte Item-Tiers können trotz neuer Werte noch grindig werden.
- Seed-Caps und Seed-Ausgaben für Forschung müssen nach mehreren Resets gegeneinander geprüft werden.
- Boost-Events stacken jetzt als sichtbare Liste; gleiche Buffs refreshen ihre Laufzeit.

## UI- und Asset-Bewertung

Die UI ist funktional und hat eine klare Informationsarchitektur. Visuell ist sie nun deutlich näher am Ziel, aber noch nicht finaler Release-Polish. Die größte Verbesserung ist das Asset-System: statt verstreuter PNGs und kaputter @2x-Ableitungen gibt es ein Manifest und konsistente SVG-Familien.

## Naechste sinnvolle Sprints

- Manueller Balancing-Playthrough vom Start bis zum ersten Prestige.
- UI-Polish für Shop-Karten, Prestige-Panel und Event-Feedback.
- Mehr Differenzierung in Research-Entscheidungen und Achievements.
- Performance- und Bundle-Check nach dem Entfernen aller Legacy-Assets.
