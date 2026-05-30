# Achievements And Goals

Stand: Sprint 8.

## Ziel

Achievements und Goals geben dem Spieler immer ein nahes Ziel, markieren größere Fortschritte und belohnen mehrere Spielstile. Sie sind datengetrieben in `src/data/achievements.ts` und `src/data/goals.ts` definiert.

## Achievement-Set

Release-MVP: 120 Achievements.

| Kategorie | Anzahl | Rolle                                                             |
| --------- | -----: | ----------------------------------------------------------------- |
| Harvest   |     10 | Lifetime-Buds und große Progressionsmarker.                      |
| Economy   |      9 | Current Buds und BPS-Ziele.                                       |
| Clicking  |     10 | BPC und manuelle Klicks, besonders für Early Game.               |
| Items     |     42 | Gesamtbesitz, alle 12 Items bei 10/50/150 und kompletter Katalog. |
| Upgrades  |      4 | Upgrade-Anzahl als Build-Fortschritt.                             |
| Research  |      4 | Research-Pfade sichtbar machen.                                   |
| Events    |     16 | Event-Klicks und je 5 Klicks pro Eventtyp.                        |
| Seeds     |      7 | Seeds verdienen und ausgeben.                                     |
| Prestige  |      4 | Mehrere Reset-Zyklen.                                             |
| Offline   |      2 | Rueckkehrmomente und Offline-Gain.                                |
| Abilities |      7 | Ability-Nutzung, Buff-Stacking und aktive Fenster.                |
| Hidden    |      5 | Kleine Entdeckungen, Prestige- und System-Momente.                |

## Rewards

- Normale Achievements sind primaer sichtbare Progression.
- Major Achievements geben sehr kleine globale Multiplikatoren zwischen `x1.002` und `x1.015`.
- Item-, Event- und Hidden-Achievements können kleine Multiplikatoren geben, dominieren aber nicht die Economy.
- Hidden Achievements sind Flavor- und Prestige-Momente, keine Pflicht für Early-Progress.

## UI-Regeln

Achievement-UI bietet:

- Filter: All, Unlocked, Near Completion, Hidden.
- Progress Bars für alle nicht erledigten sichtbaren Achievements.
- Kategorie, Flavor-Text und Rarity-Zustand pro Karte.
- Locked Hidden Achievements bleiben im normalen All-Feed verdeckt.
- Near Completion zeigt Achievements ab ca. 70 Prozent Fortschritt.
- Unlocks erzeugen Toasts, aber keine Popup-Kette.

## Goals

Das Goal-System fuehrt durch den frühen und mittleren Fortschritt. Goals sind claimbar, geben kleine Bud-/Seed-Rewards oder reine Hinweise und sind bewusst nicht als Questlog mit vielen parallelen Aufgaben gebaut.

| Order | Goal                    | Requirement         | Reward        |
| ----: | ----------------------- | ------------------- | ------------- |
|    10 | Ernte die ersten Buds   | 10 manuelle Klicks  | +15 Buds      |
|    20 | Baue eine Basis         | 10 Seedlings        | +75 Buds      |
|    30 | Mehr als Keimlinge      | 5 Planters          | +150 Buds     |
|    40 | Passive Produktion      | 1 BPS               | +250 Buds     |
|    50 | Erstes Upgrade          | 1 Upgrade           | +400 Buds     |
|    60 | Nutze ein Event         | 1 Event geklickt    | +750 Buds     |
|    70 | Finde Seeds             | 1 Seed verdient     | +1 Seed       |
|    80 | Erforsche eine Richtung | 1 Research-Knoten   | +1,500 Buds   |
|    90 | Hydro freilegen         | 2 Mio Lifetime-Buds | +25,000 Buds  |
|   100 | Prestige vorbereiten    | 3 Mio Lifetime-Buds | Hinweis       |
|   110 | Zweiter Lauf            | 1 Prestige          | +2 Seeds      |
|   120 | Build formen            | 12 Research-Knoten  | +100,000 Buds |

## Progression-Momente

Diese Momente sollen kurz, sichtbar und nicht überladen sein:

- Erstes Item: Goal-Claim plus Shop-Karten-Feedback.
- Erstes Upgrade: Upgrade-Karte und Achievement-Toast.
- Erstes Event: Event-Toast und Event-History.
- Erste Seeds: Seed-Panel wird relevant.
- Erstes Research: Research-Tab bekommt dauerhaftes Ziel.
- Prestige ready: Prestige-Screen erklaert Gewinn und Reset.
- Erstes Prestige: Meta-Fortschritt, Kickstart und neue Goal-Stufe.
- Alle Items sichtbar: Achievement `Full Catalogue`.

## Offene Content-Regeln

- Keine realweltlichen Anleitungen oder Produktionsdetails.
- Keine Textwaende im Hauptscreen.
- Keine Platzhaltertexte wie TODO, Test oder Lorem ipsum.
- Neue Achievements müssen eine Kategorie, Requirement, Flavor und eindeutige ID haben.
