# Final V1 Balance

Stand: Sprint 11.

## Release-Kurve

| Abschnitt          |                                  Zielzeit | Entscheidung                                                                 |
| ------------------ | ----------------------------------------: | ---------------------------------------------------------------------------- |
| Erstes Item        |                            15-60 Sekunden | Seedling kostet 12 Buds, aktives Klicken bleibt klar.                        |
| Passive Produktion |                               1-3 Minuten | Seedlings/Planters geben sichtbaren BPS, aber keine sofortige Idle-Dominanz. |
| Erstes Upgrade     |                               5-8 Minuten | `precision_trim` bleibt frueher BPC-Anker.                                   |
| Erste Events       | nach Item, 60 total Buds oder 75 Sekunden | Events duerfen motivieren, aber nicht den Start ueberspringen.               |
| Research sichtbar  |                             20-45 Minuten | Erste Bud-Research-Nodes sind erreichbar, Seed-Research bleibt Meta-Hook.    |
| Prestige ready     |                             45-90 Minuten | 1M Lifetime-Buds bleibt Requirement.                                         |
| Zweiter Run        |                            25%+ schneller | Total Seeds und Kickstart beschleunigen moderat.                             |

## Profile-Pass

| Profil                  | Erwartetes Verhalten                                                  | Ergebnis                                    |
| ----------------------- | --------------------------------------------------------------------- | ------------------------------------------- |
| Neuer Spieler aktiv     | Klicks und Goals fuehren zum ersten Item.                             | Sauber, Goal nach 10 Klicks claimbar.       |
| Neuer Spieler semi-idle | Passive Produktion wird sichtbar, aber Kaeufe bleiben Entscheidungen. | Sauber, Offline-Gain nicht dominant.        |
| Optimierer              | Buy Max, Milestones und Eventfenster geben Hebel.                     | Sauber, Shop zeigt ROI und Delta.           |
| Event-orientiert        | Events lohnen aktiv, brechen aber den Start nicht.                    | Sauber, Gates und Seed-Cap schuetzen Early. |
| Prestige-orientiert     | Zu fruehes Prestige gibt wenig, spaeteres gibt mehr.                  | Sauber, Preview erklaert Reset und Gewinn.  |
| Mobile-Spieler          | Tabs, Clicker und Shop bleiben bedienbar.                             | Browser-Smoke ab 320 px ohne Overflow.      |
| Offline-Rueckkehr       | Offline-Gain belohnt Rueckkehr, ersetzt aktives Spiel nicht.          | Sauber, 20% und Cap bleiben V1-Wert.        |

## Economy-Entscheidungen

- BPC bleibt im Early Game relevant durch `precision_trim`, `tap_training`, Burst und Event-BPC-Buffs.
- BPS dominiert spaeter durch Items, Upgrades, Research, Prestige und Milestones.
- Spaete Items haben bessere Basis-ROI, aber hoehere Cost-Factors und klare Unlocks.
- Alte Items bleiben ueber Item-Boosts, Milestones und Synergy-Upgrades relevant.
- Event-Rewards bleiben in Sekunden Produktion ausgedrueckt, damit sie mit dem Run skalieren.
- Seed-Gain ueber Events ist begrenzt und wird durch Seed-Cap abgefedert.
- Offline-Gain bleibt bei 20% der BPS-Produktion mit 8h Basis-Cap.

## Content-Entscheidungen

- 12 Items bleiben im Release.
- 27 Research-Nodes bleiben im Release; keine zusaetzlichen Deep-Late-Branches.
- 120 Achievements bleiben im Release; keine weitere Masse.
- 12 Events bleiben im Release, weil sie klar unterschiedliche Rollen haben.
- 4 aktive Abilities bleiben im Release; keine weitere Ability vor Post-Launch.

## Tooltips und Lesbarkeit

- Shop-Karten zeigen Rolle, Kosten, Besitz, aktuelle Produktion, Produktion nach Kauf, BPS-Anteil, ROI und naechsten Milestone.
- Upgrade-Karten zeigen Kategorie, Requirement und Effekttext.
- Research-Karten zeigen Pfad, Kosten, Lock-Grund und Effekt.
- Prestige-Screen erklaert Reset, Gewinn, Seeds und Multiplikator.
- Zahlen werden kompakt formatiert und auf Mobile-Smoke gegen Overflow geprueft.

## Release-Risiken

- Exakte Midgame-Dominanz zwischen Hydroponic Rack, Genetics Lab und Trimming Robot braucht echte Langzeitlaeufe.
- Events koennen bei sehr aktivem Spiel staerker wirken als bei Semi-Idle; das ist fuer V1 akzeptiert.
- Achievement-Boni sind bewusst klein, damit sie die Economy nicht uebernehmen.
