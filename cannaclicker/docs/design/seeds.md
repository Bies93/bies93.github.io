# Seeds

Stand: Sprint 15

## Trennung

Seeds haben jetzt drei klar getrennte Werte:

| Wert                  | Zweck                                         | Sinkt beim Ausgeben? |
| --------------------- | --------------------------------------------- | -------------------- |
| Research-Seeds        | Währung für Seed-Research                     | Ja                   |
| Ascension-Seeds       | Währung für Ascension-Nodes                   | Ja                   |
| Total Ascension Seeds | Prestige-Macht und Ascension-Unlock-Schwellen | Nein                 |

Damit fuehlt sich Research nicht wie eine versteckte Selbstbestrafung an. Event-, Klick- und passive Seeds erhöhen den Prestige-Multiplikator nicht mehr. Der Prestige-Multiplikator nutzt immer `totalAscensionSeeds`.

## Quellen

| Quelle           | Regel                                                                     |
| ---------------- | ------------------------------------------------------------------------- |
| Prestige         | Erzeugt ausschließlich Ascension-Seeds, berechnet aus Run-Lifetime-Buds.  |
| Events           | Seed Pack, Mutant Sprout, Supply Drop, Seed Bloom und seltene Nebendrops. |
| Klicks           | Kleine Chance, erhoeht durch Research/Upgrades.                           |
| Synergien        | Einmalige Seeds für klare Item-Kombinationen.                             |
| Passive Research | Idle-Chance nach Research-Knoten.                                         |

Events, Klicks, Synergien und passive Research erzeugen nur Research-Seeds.

## Cap

Seed-Raten werden über ein 60-Minuten-Fenster beobachtet. Das Cap steigt mit Lifetime-Fortschritt:

| Lifetime im Run |         Cap |
| --------------- | ----------: |
| unter 10 Mio    |  25 Seeds/h |
| unter 3 Mrd     |  60 Seeds/h |
| ab 3 Mrd        | 110 Seeds/h |
