# Final V1 Balance

Stand: Sprint 26 / `1.0.0-rc.1`.

## Release-Kurve

| Abschnitt          |                                   Zielzeit | Entscheidung                                                                 |
| ------------------ | -----------------------------------------: | ---------------------------------------------------------------------------- |
| Erstes Item        |                             15-60 Sekunden | Seedling kostet 12 Buds, aktives Klicken bleibt klar.                        |
| Passive Produktion |                                1-3 Minuten | Seedlings/Planters geben sichtbaren BPS, aber keine sofortige Idle-Dominanz. |
| Erstes Upgrade     |                                5-8 Minuten | `precision_trim` bei 260 Buds/420 Kosten bleibt früher BPC-Anker.            |
| Erste Events       | nach Item, 120 total Buds und 90 Sekunden  | Events dürfen motivieren, aber nicht den Start überspringen.                 |
| Research sichtbar  |                              20-45 Minuten | Erste Bud-Research-Nodes sind erreichbar, Seed-Research bleibt Meta-Hook.    |
| Prestige ready     |                              60-90 Minuten | 3M+ dynamische Lifetime-Buds plus Mindestlaufzeit verhindern Reset-Spam.     |
| Zweiter Run        |                             25%+ schneller | Ascension-Seeds, Ascension-Nodes und Kickstart beschleunigen kontrolliert.   |

## Profile-Pass

| Profil                  | Erwartetes Verhalten                                                  | Ergebnis                                    |
| ----------------------- | --------------------------------------------------------------------- | ------------------------------------------- |
| Neuer Spieler aktiv     | Klicks und Goals fuehren zum ersten Item.                             | Sauber, Goal nach 10 Klicks claimbar.       |
| Neuer Spieler semi-idle | Passive Produktion wird sichtbar, aber Kaeufe bleiben Entscheidungen. | Sauber, Offline-Gain nicht dominant.        |
| Optimierer              | Buy Max, Milestones und Eventfenster geben Hebel.                     | Sauber, Shop zeigt ROI und Delta.           |
| Event-orientiert        | Events lohnen aktiv, brechen aber den Start nicht.                    | Sauber, Gates und Seed-Cap schuetzen Early. |
| Prestige-orientiert     | Zu frühes Prestige gibt wenig, späteres gibt mehr.                    | Sauber, Preview erklaert Reset und Gewinn.  |
| Mobile-Spieler          | Tabs, Clicker und Shop bleiben bedienbar.                             | Browser-Smoke ab 320 px ohne Overflow.      |
| Offline-Rueckkehr       | Offline-Gain belohnt Rueckkehr, ersetzt aktives Spiel nicht.          | Sauber, 20% und Cap bleiben V1-Wert.        |

## Economy-Entscheidungen

- BPC bleibt im Early Game relevant durch `precision_trim`, `tap_training`, Burst und Event-BPC-Buffs.
- BPS dominiert später durch Items, Upgrades, Research, Prestige und Milestones.
- Spaete Items haben bessere Basis-ROI, aber hoehere Cost-Factors und klare Unlocks.
- Alte Items bleiben über Item-Boosts, Milestones und Synergy-Upgrades relevant.
- Event-Rewards bleiben in Sekunden Produktion ausgedrueckt, damit sie mit dem Run skalieren; Golden Bud nutzt 12s statt 15s.
- Event-Spawns sind bewusst seltene Bonusmomente; Spawn-Research skaliert kontrolliert und ist gedeckelt.
- Event-Rewards nutzen ein 5-Minuten-Phasenbudget: Early 15%, Early Automation 35%, First Strategy 60%, spaeter mehr nur durch echte Research-/Ascension-Investition.
- Event-Buffs stacken als sichtbare Liste mit eigenen Timern, gleiche Buffs refreshen statt unklar zu duplizieren.
- Seed-Gain über Events ist begrenzt und wird durch Seed-Cap abgefedert; diese Seeds sind Research-Währung und erhöhen den Prestige-Multiplikator nicht.
- Prestige erzeugt Ascension-Seeds; `totalAscensionSeeds` ist die einzige Seed-Basis für den globalen Prestige-Multiplikator.
- Prestige-Anforderung skaliert mit `totalAscensionSeeds` und Prestige-Anzahl; zusaetzlich gilt eine Mindestlaufzeit von 60 Minuten pro Prestige.
- Offline-Gain bleibt bei 20% der BPS-Produktion mit 8h Basis-Cap.
- Offline-Gain speichert bewusst bereinigte BPS ohne temporäre Event-, Ability- oder Kickstart-Multiplikatoren.
- `docs/balance/phase-targets-2-20h.md` und `docs/balance/simulation-results.md` dokumentieren den 2-20h-Pass aus der echten deterministischen Sim.

## Content-Entscheidungen

- 12 Items bleiben im Release.
- 51 Research-Nodes bleiben im Release; keine zusaetzlichen Deep-Late-Branches vor Launch.
- 160 Achievements bleiben im Release; keine weitere Masse vor Launch.
- 28 Events bleiben im Release, weil Minor/Major/Rare/Chain/Risk/Season Rollen abgedeckt sind.
- 8 aktive Abilities bleiben im Release; keine weitere Ability vor Post-Launch.

## Tooltips und Lesbarkeit

- Shop-Karten zeigen Rolle, Kosten, Besitz, aktuelle Produktion, Produktion nach Kauf, BPS-Anteil, ROI und nächsten Milestone.
- Upgrade-Karten zeigen Kategorie, Requirement und Effekttext.
- Research-Karten zeigen Pfad, Kosten, Lock-Grund und Effekt.
- Prestige-Screen erklaert Reset, Gewinn, Seeds und Multiplikator.
- Zahlen werden kompakt formatiert und auf Mobile-Smoke gegen Overflow geprueft.

## Release-Risiken

- Exakte Midgame-Dominanz zwischen Hydroponic Rack, Genetics Lab und Trimming Robot braucht nach Launch echte Langzeitläufe.
- Events können bei sehr aktivem Spiel staerker wirken als bei Semi-Idle; das ist für V1 akzeptiert.
- Achievement-Boni sind bewusst klein, damit sie die Economy nicht übernehmen.
