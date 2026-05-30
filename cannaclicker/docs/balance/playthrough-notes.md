# Playthrough Notes

Stand: Sprint 9.

Diese Notizen kombinieren lokalen Browser-Smoke, Datencheck und beschleunigte Economy-Pruefung. Sie ersetzen keine lange Live-Tuning-Session, halten aber die aktuelle Abnahmebasis fest.

## 30 Minuten Ohne Prestige

Ziel:

- Spieler erkennt in unter 10 Sekunden: Pflanze klicken, Buds steigen, Shop kaufen.
- Erstes Item innerhalb 15-60 Sekunden.
- Erstes Upgrade im Zielkorridor Minute 5-8.
- Events starten erst nach Gate und überspringen die erste Progression nicht.

Aktueller Stand:

- Start-BPC `1` und Seedling-Kosten `12` erzwingen aktive Klicks ohne lange Wartezeit.
- Planter bei `40` total Buds und Grow Tent bei `250` total Buds geben frühe Unlock-Stufen.
- `precision_trim`, `starter_auto` und `rich_soil` liegen nahe genug beieinander, um keine Early-Duerre zu erzeugen.
- Buy One, x10, x25 und Max bleiben bei schnellem Kaufen stabil, weil Kosten und Unlocks pro Karte geprueft werden.

Risiko:

- Bei sehr vielen frühen Events kann `supply_drop` in Kombination mit Buy Max etwas stark wirken. Weiter im 60-Minuten-Run beobachten.

## Erster Prestige-Run

Ziel:

- Prestige Ready bei ca. 45-90 Minuten.
- Seed-Gain erstes Prestige: klein, aber sichtbar.
- Research soll vor Prestige neugierig machen, aber nicht zwingend wirken.

Aktueller Stand:

- Prestige Requirement liegt bei `3,000,000` Lifetime-Buds.
- Seed-Gain nutzt Quadratwurzel-Skalierung, dadurch ist sofortiges Prestige sichtbar ineffizient.
- `prestige_journal` bei `420,000` total Buds ist eine gute Vorwarnung für den Reset.
- Prestige-Screen zeigt, was resetet wird, was bleibt und welche Seeds entstehen.

Risiko:

- Event-Seeds können Research vor dem ersten Prestige beschleunigen. Seed-Cap und Event-Gewichte müssen in echten Runs weiter beobachtet werden.

## Zweiter Run

Ziel:

- Zweiter Run ist mindestens 25 Prozent schneller bis Prestige ready.
- Kickstart und Prestige-Multiplikator fuehlen sich wie Meta-Fortschritt an.
- Frühe Goals bleiben nicht im Weg.

Aktueller Stand:

- Prestige-Multiplikator `1 + 0.05 * totalSeeds` skaliert moderat.
- Kickstart wird beim Prestige aktiviert und hilft dem neuen Run ohne den Shop zu trivialieren.
- Goals bleiben über `completedGoals` erhalten und werden nicht versehentlich erneut eingefordert.

Risiko:

- Bei sehr spaetem erstem Prestige kann der zweite Run stark beschleunigen. Das ist gewuenscht, solange Research nicht sofort komplett freigeschaltet wird.

## Midgame Mit Events Und Research

Ziel:

- Zwischen 4 und 10 Stunden sind Research-Zweige, Achievements, Late Items und Meta-Optimierung sichtbar.
- Keine Itemklasse ist dauerhaft nutzlos.
- Events belohnen aktive Spieler, sind aber nicht Pflicht.

Aktueller Stand:

- Spätere Items haben bessere Basis-ROI, aber hoehere Cost-Factors und klare Unlock-Schwellen.
- Item-Milestones und Synergy-Upgrades reaktivieren frühe Items.
- Research-Pfade haben separate Rollen: Efficiency, Active, Automation, Events, Genetics und Economy.
- Achievement-Set deckt aktive, passive, Event-, Research-, Seed- und Prestige-Spielstile ab.

Risiko:

- Die genaue Dominanz zwischen Hydroponic Rack, Genetics Lab und Trimming Robot braucht weitere Live-Runs, sobald mehr echte Spielerzeit vorhanden ist.

## Naechste Balance-Fragen

- Fuehlt sich `seed_sorting` bei 36,000 Buds zu früh oder genau richtig an?
- Sind 12 Eventtypen im ersten langen Run zu viel visuelle Abwechslung oder genau genug?
- Muss Offline-Gain nach dem ersten Prestige von 20 Prozent auf 25 Prozent steigen?
- Soll `Micro Greenhouse` eher Prestige-Content oder spaetes erstes Run-Ziel sein?

## Technischer Smoke

- Browser-Smoke auf 1440x1000, 768x900, 390x844 und 320x680 ohne Konsolenfehler.
- 6 Side-Panel-Tabs, 4 Achievement-Filter und 120 Achievement-Karten vorhanden.
- All-Filter zeigt 115 sichtbare Achievements und versteckt 5 Hidden Achievements.
- Hidden-Filter zeigt 5 Hidden Achievements.
- Erstes Goal ist nach 10 Klicks claimbar und springt danach auf "Build a base".
- Keine kaputten Bilder und kein horizontaler Overflow in den geprueften Viewports.
