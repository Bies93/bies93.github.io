# Progression Model

## Core Loop

1. Buds per Klick erzeugen Startkapital.
2. Items erzeugen passive Buds pro Sekunde.
3. Upgrades und Forschung multiplizieren BPS/BPC, senken Kosten oder schalten Komfort frei.
4. Events erzeugen kurzfristige Peaks, Seeds oder Sofort-Buds.
5. Prestige setzt die Run-Ökonomie zurück und zahlt Seeds für den nächsten Loop aus.

## Run-Progression

Ein Run beginnt klicklastig, verschiebt sich schnell zu passiver Produktion und endet mit der Entscheidung, ob weitere Run-Buds für mehr Seeds lohnen. Items sind datengetrieben in `src/data/items.ts`; Unlocks verwenden Gesamtbuds oder Item-Besitz.

## Prestige-Progression

Gewaehltes Modell: Option A, klassischer Prestige-Reset.

Formel:

- `seedGain = floor(sqrt(runBuds / 3,000,000))`
- `prestigeMultiplier = 1 + totalSeeds * 0.05`

Konsequenzen:

- Erster Reset ist klar und verstaendlich.
- Mehr Run-Tiefe lohnt, aber mit abnehmender Effizienz.
- Seeds bleiben eine Meta-Währung für Forschung und Produktion.

## Meilensteine

Meilensteine bleiben erhalten und belohnen horizontale Item-Breite sowie hohe Item-Level. Sie geben globale, BPS- oder BPC-Boni und können Kickstart-Buffs für neue Runs freischalten.

## Forschung

Forschung bleibt in drei lesbare Pfade geteilt:

- Effizienz: mehr BPS und bessere Item-Synergien.
- Kontrolle: Kosten, Automation, Offline-Komfort.
- Strains: temporaere Spezialisierungen mit Tradeoffs bis zum nächsten Prestige.

## Events

Events sind kein Nebenfeature, sondern Session-Rhythmus. Sie spawnen kurz, sind visuell unterscheidbar und müssen immer sofort rueckmelden, was passiert ist. Unterschiedliche Boost-Events stacken als sichtbare Buff-Liste mit eigenen Timern; derselbe Boost refresht seine Laufzeit.

## Datenquellen

- Items: `src/data/items.ts`
- Upgrades: `src/data/upgrades.ts`
- Research: `src/data/research.ts`
- Achievements: `src/data/achievements.ts`
- Assets: `src/app/assetManifest.ts`
- Prestige: `src/app/prestige.ts`
- Events: `src/app/events.ts`
