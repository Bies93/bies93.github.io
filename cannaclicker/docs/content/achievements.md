# Achievements And Goals

Stand: Sprint 24-26 / `1.0.0-rc.1`.

## Ziel

Achievements und Goals geben dem Spieler immer ein nahes Ziel, markieren größere Fortschritte und belohnen mehrere Spielstile. Sie sind datengetrieben in `src/data/achievements.ts` und `src/data/goals.ts` definiert.

## Achievement-Set

Release-MVP nach Sprint 26: 160 Achievements. Das Set ist bewusst breiter als das urspruengliche MVP, weil Events 2.0, Build-Ziele, Seasons, Risk/Chain Events, Cosmetics und Achievement-Score eigene Progression Hooks brauchen.

| Kategorie  | Anzahl | Rolle                                                             |
| ---------- | -----: | ----------------------------------------------------------------- |
| Harvest    |     11 | Lifetime-Buds und große Progressionsmarker.                       |
| Economy    |      8 | Current Buds und BPS-Ziele.                                       |
| Clicking   |     10 | BPC und manuelle Klicks, besonders für Early Game.                |
| Items      |     42 | Gesamtbesitz, alle 12 Items bei 10/50/150 und kompletter Katalog. |
| Upgrades   |      4 | Upgrade-Anzahl als Build-Fortschritt.                             |
| Research   |      5 | Research-Pfade sichtbar machen.                                   |
| Events     |     34 | Event-Klicks, je 5 Klicks pro Eventtyp und Chain-Ziele.           |
| Seeds      |      7 | Seeds verdienen und ausgeben.                                     |
| Prestige   |      4 | Mehrere Reset-Zyklen.                                             |
| Offline    |      2 | Rueckkehrmomente und Offline-Gain.                                |
| Abilities  |     11 | Ability-Nutzung, Buff-Stacking und aktive Fenster.                |
| Builds     |      5 | Item-Kombinationen als Build-Identitaet.                          |
| Seasons    |      2 | Seasonal Events als spaetere Stimmungssets.                       |
| Challenges |      2 | Risk-/Research-Ziele fuer bewusstes Spiel.                        |
| Cosmetics  |      4 | Achievement-Score-Marker fuer Badge-/Meta-Progression.            |
| Hidden     |      9 | Kleine Entdeckungen, Prestige- und System-Momente.                |

## Rewards

- Normale Achievements sind primaer sichtbare Progression.
- Major Achievements geben sehr kleine globale Multiplikatoren zwischen `x1.002` und `x1.015`.
- Item-, Event- und Hidden-Achievements können kleine Multiplikatoren geben, dominieren aber nicht die Economy.
- Hidden Achievements sind Flavor- und Prestige-Momente, keine Pflicht für Early-Progress.
- Jedes Achievement gibt Score nach Rarity: Common 5, Rare 15, Epic 35, Legendary 80.
- Achievement-Score gibt zusaetzlich einen sehr kleinen Meta-Multiplikator: `+0.25%` je 100 Score, gedeckelt bei `+6%`.
- Score-Achievements bei 100/300/700/1000 Score markieren kosmetische Badge-Stufen und halten Meta-Progress sichtbar.

## UI-Regeln

Achievement-UI bietet:

- Filter: All, Unlocked, Near Completion, Hidden.
- Progress Bars für alle nicht erledigten sichtbaren Achievements.
- Kategorie, Flavor-Text und Rarity-Zustand pro Karte.
- Locked Hidden Achievements bleiben im normalen All-Feed verdeckt.
- Near Completion zeigt Achievements ab ca. 70 Prozent Fortschritt.
- Unlocks erzeugen Toasts, aber keine Popup-Kette.
- Summary Header zeigt Gesamtfortschritt, Score, Score-Multiplikator, Near Count, Hidden Count und Kategoriechips.

## Goals

Das Goal-System fuehrt durch den frühen und mittleren Fortschritt. Goals sind claimbar, geben kleine Bud-/Seed-Rewards oder reine Hinweise und sind bewusst nicht als Questlog mit vielen parallelen Aufgaben gebaut.

| Order | Goal                    | Requirement           | Reward        |
| ----: | ----------------------- | --------------------- | ------------- |
|    10 | Ernte die ersten Buds   | 10 manuelle Klicks    | +15 Buds      |
|    20 | Baue eine Basis         | 10 Seedlings          | +75 Buds      |
|    30 | Mehr als Keimlinge      | 5 Planters            | +150 Buds     |
|    40 | Passive Produktion      | 1 BPS                 | +250 Buds     |
|    50 | Erstes Upgrade          | 1 Upgrade             | +400 Buds     |
|    60 | Nutze ein Event         | 1 Event geklickt      | +750 Buds     |
|    70 | Finde Seeds             | 1 Seed verdient       | +1 Seed       |
|    80 | Erforsche eine Richtung | 1 Research-Knoten     | +1,500 Buds   |
|    90 | Hydro freilegen         | 2 Mio Lifetime-Buds   | +25,000 Buds  |
|   100 | Prestige vorbereiten    | 3 Mio Lifetime-Buds   | Hinweis       |
|   110 | Zweiter Lauf            | 1 Prestige            | +2 Seeds      |
|   120 | Build formen            | 12 Research-Knoten    | +100,000 Buds |
|   130 | Ketten lesen            | 5 Chain-Events        | BPS-Boost     |
|   140 | Aktive Linie            | 500 Klicks + 100 BPC  | BPC-Boost     |
|   150 | Automation anlaufen     | 25 Ability-Nutzungen  | +2 Seeds      |
|   160 | Shop-Synergie           | Grow Light/Tent Mix   | +250,000 Buds |
|   170 | Risiko einordnen        | 10 Risk-Events        | Kostenfenster |
|   180 | Saisonfenster           | 5 Seasonal-Events     | +3 Seeds      |
|   190 | Meta-Score starten      | 100 Achievement-Score | +500,000 Buds |
|   200 | Prestige-Schleife       | 2 Prestiges           | +5 Seeds      |
|   210 | Katalog schließen       | Alle Items sichtbar   | Global-Boost  |

Boost-Rewards werden als temporäre Buffs mit ID `goal_reward` in der normalen Buff-Leiste angezeigt. Sie ersetzen keine Kernökonomie, sondern schaffen kurze Anschlussfenster nach erledigten Zielen.

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
