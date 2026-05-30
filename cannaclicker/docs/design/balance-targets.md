# Balance Targets

Stand: Sprint 1/2 Reboot. Werte sind bewusst release-nah, aber für weitere Playthroughs offen.

## Session-Ziele

- Minute 0-2: erste Klicks, erster Keimling.
- Minute 3-8: Topf und Grow-Zelt sichtbar erreichbar.
- Minute 10-20: LED-Licht, erste Upgrades, Events mit spuerbarem Reward.
- Stunde 1: stabiles BPS-Spiel mit mehreren Item-Tiers.
- Erster Prestige-Reset: ab 3,000,000 Run-Buds moeglich.

## Item-Kurve

| Tier | Item                |   Base Cost | Cost Factor |       BPS | Unlock                 |
| ---- | ------------------- | ----------: | ----------: | --------: | ---------------------- |
| 1    | Keimling            |          12 |        1.13 |      0.12 | Start                  |
| 2    | Topf                |          65 |        1.15 |       0.6 | 40 Gesamtbuds          |
| 3    | Grow-Zelt           |         420 |        1.17 |       3.8 | 250 Gesamtbuds         |
| 4    | LED-Licht           |       1,500 |        1.18 |        11 | 2 Grow-Zelte           |
| 5    | Gaertner            |       6,000 |        1.20 |        48 | 4,500 Gesamtbuds       |
| 6    | Bewässerungssystem |      28,000 |       1.215 |       240 | 20,000 Gesamtbuds      |
| 7    | CO2-Tank            |     120,000 |       1.235 |     1,100 | 90,000 Gesamtbuds      |
| 8    | Klima-Controller    |     520,000 |        1.25 |     5,200 | 400,000 Gesamtbuds     |
| 9    | Hydroponik-Rack     |   2,500,000 |       1.265 |    28,000 | 2,000,000 Gesamtbuds   |
| 10   | Genetik-Labor       |  12,000,000 |        1.28 |   160,000 | 9,000,000 Gesamtbuds   |
| 11   | Trimm-Roboter       |  70,000,000 |       1.295 | 1,000,000 | 55,000,000 Gesamtbuds  |
| 12   | Mikro-Gewaechshaus  | 450,000,000 |        1.31 | 7,500,000 | 350,000,000 Gesamtbuds |

## Prestige

- Mindestanforderung: 3,000,000 Run-Buds.
- Seed-Auszahlung: `floor(sqrt(runBuds / 3,000,000))`, mindestens 1 Seed wenn die Anforderung erreicht ist.
- Naechster Seed: `(aktueller Seed-Gain + 1)^2 * 3,000,000` Run-Buds.
- Multiplikator: `1 + seeds * 0.05`.
- Reset bewahrt Seeds, Meilensteine, passende Forschung, Preferences und Audio-Status.

## Events

| Event         | Gewicht | Effekt                                 |
| ------------- | ------: | -------------------------------------- |
| Golden Bud    |    1.00 | Sofort 12s BPS, Fallback auf Klickwert |
| Seed Pack     |    0.55 | Seed-Drop                              |
| Lucky Joint   |    0.75 | 2.0x BPS/BPC für 15s                  |
| Fertile Rain  |    0.75 | Sofort 10s BPS                         |
| Market Rush   |    0.55 | 1.6x BPS/BPC für 20s                  |
| Green Surge   |    0.45 | 2.5x BPS/BPC für 10s                  |
| Mutant Sprout |    0.25 | Sofort 24s BPS plus Seed-Chance        |
| Supply Drop   |    0.50 | Sofort 12s BPS plus hohe Seed-Chance   |

## Research und Upgrades

- Precision Trim: ab 260 Gesamtbuds, Kosten 420.
- Erste Automation: ab 260 Gesamtbuds, Kosten 420.
- Rich Soil: ab 620 Gesamtbuds, Kosten 820.
- Erste Forschung: ab 12,000 Buds, damit Forschung nicht den ersten 10-Minuten-Loop dominiert.

## Offene Balance-Fragen

- Der erste Prestige-Reset zielt auf 45-90 Minuten; die 3M-Schwelle ersetzt die zu schnelle 1M-Schwelle.
- Seed-Caps können nach Sprint 3 hoeher werden, wenn Prestige zu langsam wirkt.
