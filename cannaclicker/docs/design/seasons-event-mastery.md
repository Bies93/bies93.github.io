# Seasons and Event Mastery

## Seasons

Seasons sind freischaltbare Event-Kontexte, keine Kalenderereignisse.

| Season | Unlock | Fokus |
| --- | --- | --- |
| Evergreen | default | ausgeglichener Pool |
| Sunshift | Achievement-Score | Reward-/Seed-Fenster |
| Night Market | Prestige 1 | Kostenfenster, Risk, Chains |
| Harvest Festival | Prestige 2 oder Contract Tokens | seltene grosse Events |

Seasons veraendern Event-Gewichte und kleine Reward-Multiplikatoren. Sie ersetzen nicht das Event-Budget.

## Event Mastery

Jedes Event hat Mastery-Level bei 10, 50 und 250 Klicks. Der Reward ist event-spezifisch und klein:

- Level 1: +2 Prozent Reward-Staerke fuer dieses Event.
- Level 2: +4 Prozent.
- Level 3: +6 Prozent.

Die Mastery nutzt `state.meta.eventStats.perEvent` und braucht keine externen Counter.
