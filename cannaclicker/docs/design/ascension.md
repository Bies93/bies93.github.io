# Ascension

Stand: Sprint 15

## Ziel

Ascension macht Prestige zu einer langfristigen Entscheidung statt zu einem reinen Multiplikator-Reset. Das System ist bewusst als Fundament gebaut: klein genug fuer V1, aber datengetrieben und erweiterbar.

## Waehrung

| Waehrung        | Quelle       | Nutzung                          |
| --------------- | ------------ | -------------------------------- |
| Ascension-Seeds | Nur Prestige | Ascension-Nodes kaufen           |
| Total Ascension | Nur Prestige | Prestige-Multiplikator berechnen |

Research-Seeds aus Events, Klicks, Synergien und passiver Research bleiben getrennt.

## Tree

Der erste Tree hat 24 Nodes in diesen Kategorien:

| Kategorie | Rolle                                        |
| --------- | -------------------------------------------- |
| Core      | Globale Meta-Power und groessere Ziele       |
| Active    | BPC, Click-Relevanz und aktive Runs          |
| Idle      | Offline-Cap und passive Run-Stabilitaet      |
| Events    | Event-Rewards und Spawnrate                  |
| Research  | Seed-Research-Kosten                         |
| Shop      | Startbonus und Shop-Momentum                 |
| Prestige  | Ascension-Seed-Ertrag und Run-Beschleunigung |
| Utility   | Auto-Klicks und Permanent-Slot-Fundament     |

## Permanent Slots

`permanentSlots` und `permanentUpgradeIds` bleiben als internes State-/Save-Fundament erhalten, sind in Version 1.0 aber nicht als kaufbare Ascension-Nodes sichtbar. Dadurch gibt es keine Nodes ohne direkte Spielerfunktion. Die eigentliche Auswahl-UI fuer dauerhaft behaltene Upgrades ist Post-Launch-Scope.

## Balance-Leitplanken

- Erster Prestige bleibt bei ca. 45-90 Minuten Zielzeit.
- Fruehe Ascension-Nodes kosten 1-3 Seeds und geben kleine, spuerbare Beschleuniger.
- Spaete Nodes kosten 12-20 Seeds und sind Release-Midgame-Ziele.
- Ascension darf den zweiten Run beschleunigen, aber den Core Loop nicht ueberspringen.
