# Seeds

Stand: Sprint 7

## Trennung

Seeds haben zwei Werte:

| Wert               | Zweck                               | Sinkt beim Ausgeben? |
| ------------------ | ----------------------------------- | -------------------- |
| Spendable Seeds    | Waehrung fuer Research              | Ja                   |
| Total Seeds Earned | Prestige-Macht und Unlock-Schwellen | Nein                 |

Damit fuehlt sich Research nicht wie eine versteckte Selbstbestrafung an. Der Prestige-Multiplikator nutzt immer `Total Seeds Earned`.

## Quellen

| Quelle           | Regel                                                                     |
| ---------------- | ------------------------------------------------------------------------- |
| Prestige         | Hauptquelle, berechnet aus Run-Lifetime-Buds.                             |
| Events           | Seed Pack, Mutant Sprout, Supply Drop, Seed Bloom und seltene Nebendrops. |
| Klicks           | Kleine Chance, erhoeht durch Research/Upgrades.                           |
| Synergien        | Einmalige Seeds fuer klare Item-Kombinationen.                            |
| Passive Research | Idle-Chance nach Research-Knoten.                                         |

## Cap

Seed-Raten werden ueber ein 60-Minuten-Fenster beobachtet. Das Cap steigt mit Lifetime-Fortschritt:

| Lifetime im Run |         Cap |
| --------------- | ----------: |
| unter 10 Mio    |  25 Seeds/h |
| unter 3 Mrd     |  60 Seeds/h |
| ab 3 Mrd        | 110 Seeds/h |
