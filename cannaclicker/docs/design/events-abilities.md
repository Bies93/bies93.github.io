# Events And Abilities

Stand: Sprint 6

## Event-Regeln

| Regel           | Wert                                                                          |
| --------------- | ----------------------------------------------------------------------------- |
| Erste Events    | Gate bis erstes Item, 60 Gesamtbuds oder 75 Sekunden Runzeit.                 |
| Aktive Events   | 1 im Early Game, 2 ab 2.5 Mio Gesamtbuds oder `Event-Scouts`.                 |
| Spawn-Intervall | Basis 14-26 Sekunden nach Gate, skaliert mit Event-Research.                  |
| Pity            | Basis 55 Sekunden ohne aktives Event, skaliert mit Event-Research.            |
| Sichtbarkeit    | 7-12 Sekunden, skaliert mit Event-Dauer-Research.                             |
| Stack-Regel     | Ein temporaerer Event-Buff aktiv; neuer Buff ersetzt den alten klar sichtbar. |

## Event-Tabelle

| id              | Kategorie          | Gewicht | Min Stage                    |    Dauer | Reward / Effekt                            | Asset               |
| --------------- | ------------------ | ------: | ---------------------------- | -------: | ------------------------------------------ | ------------------- |
| `golden_bud`    | Instant Reward     |    1.00 | Gate offen                   |    7-12s | 15s Produktion oder BPC-Fallback           | `golden-bud.svg`    |
| `seed_pack`     | Meta Reward        |    0.55 | Gate offen                   |    7-12s | 1-5 Seeds, Seed-Cap respektiert            | `seed-pack.svg`     |
| `lucky_joint`   | Temporary Buff     |    0.75 | Gate offen                   |      15s | BPS/BPC x2                                 | `lucky-joint.svg`   |
| `fertile_rain`  | Instant + Buff     |    0.75 | Gate offen                   | 12s Buff | 10s Produktion + BPS x1.25                 | `fertile-rain.svg`  |
| `market_rush`   | Temporary Buff     |    0.55 | Gate offen                   |      20s | BPS/BPC x1.6                               | `market-rush.svg`   |
| `green_surge`   | Active Buff        |    0.45 | Gate offen                   |      10s | BPC x2.5                                   | `green-surge.svg`   |
| `supply_drop`   | Discount / Reward  |    0.50 | Gate offen                   |      16s | 12s Produktion + Shopkosten x0.85          | `supply-drop.svg`   |
| `flash_harvest` | Chain Event        |    0.35 | 2.5k Gesamtbuds              |    7-12s | 18s Produktion + zwei schnelle Golden Buds | `flash-harvest.svg` |
| `calm_growth`   | Idle Buff          |    0.40 | 2.5k Gesamtbuds              |      24s | BPS x1.85, x2.2 nach 15s Idle              | `calm-growth.svg`   |
| `mutant_sprout` | Rare Meta Reward   |    0.25 | 50k Gesamtbuds oder Prestige |    7-12s | 24s Produktion + hohe Seed-Chance          | `mutant-sprout.svg` |
| `overgrowth`    | Risk/Reward Moment |    0.18 | 250k Gesamtbuds              | 20s Buff | 30s Produktion + BPS x1.35                 | `overgrowth.svg`    |
| `seed_bloom`    | Meta Buff          |    0.28 | 50k Gesamtbuds oder Prestige |      18s | garantierter Seed + BPC x1.5               | `seed-bloom.svg`    |

## Abilities

| id                | Unlock          | Cooldown | Dauer | Effekt                                  | Einsatz                                       |
| ----------------- | --------------- | -------: | ----: | --------------------------------------- | --------------------------------------------- |
| `overdrive`       | Start           |      75s |   12s | BPS x3.2, skaliert mit Ability-Research | Produktionsfenster planen.                    |
| `burst`           | Start           |      70s |   10s | BPC x7                                  | Aktive Klickphasen und Green Surge nutzen.    |
| `auto_burst`      | 2.5k Gesamtbuds |     110s |   14s | +6 Auto-Klicks/s                        | Kurze aktive Session ohne hektisches Klicken. |
| `discount_window` | 15k Gesamtbuds  |     140s |   12s | Shopkosten x0.85                        | Buy-Max/x25-Fenster vorbereiten.              |
