# CannaClicker Next Sprints

Stand: 2026-05-31

Ziel dieses Plans: CannaClicker vom alten `0.9.0-rc.1`-Ausgangspunkt zu einem langfristig motivierenden, öffentlich releasefähigen Idle-/Clicker-Game entwickeln, das in Tiefe und Langzeitspaß in Richtung Cookie Clicker geht, aber moderner, klarer und hochwertiger wirkt. Sprint 22-26 heben den Stand auf `1.0.0-rc.1`.

Der aktuelle Stand ist bereits deutlich über Prototyp-Niveau: Core Loop, Shop, Upgrades, Research, Events, Seeds, Prestige, Achievements, Offline-Gain, Export/Import, Audio, Musik, Themes, Plant-Skins, responsive UI und GitHub-Pages-Build sind vorhanden. Die nächsten Sprints drehen sich deshalb nicht um “erstmal zum Laufen bringen”, sondern um Systemtiefe, Ergonomie, langfristige Progression, Premium-Polish und Release-Härtung.

## Gesamtbefund

### Was bereits gut ist

- Vite/TypeScript-Projekt läuft ohne alte Windows-Workarounds.
- Core Loop ist funktional: Klicks, BPS, BPC, Items, Upgrades, Research, Events, Prestige und Achievements greifen grundsätzlich ineinander.
- SVG-Asset-System ist klein, konsistent und performant.
- `public/img` ist klein und hat keine offensichtlich kaputten Bildpfade.
- Musik ist eingebunden: Opus bevorzugt, MP3 als Fallback, WAV nicht im Runtime-Build.
- SFX sind performant über WebAudio erzeugt.
- Desktop-Layout wirkt bereits wie ein richtiges Webgame.
- Mobile hat keinen horizontalen Overflow, ist aber noch nicht ergonomisch genug.
- Build, Typecheck und Lint sind grün.
- Devtools sind im Production Preview nicht sichtbar.

### Größte Lücken zum Zielbild

- Mobile ist zu lang und priorisiert die Kernaktionen falsch: Shop kommt zu spät.
- Prestige ist noch kein vollwertiger Ascension-Motor wie bei großen Incremental Games.
- Seeds vermischen Run-Belohnung, Event-Belohnung, Research-Währung und Prestige-Macht zu stark.
- Research ist eher eine Liste permanenter Multiplikatoren als ein langfristiger Skilltree mit Build-Identität.
- Aktives Klicken und Automation verlieren im Mid-/Late-Game zu stark gegen reine BPS-Skalierung.
- Items haben Rollen im Text, aber noch zu wenig echte mechanische Archetypen und Cross-Synergien.
- Events sind häufig und motivierend, aber strategisch noch flach.
- Achievements sind umfangreich, aber als Liste und als Meta-System noch nicht stark genug.
- UI ist hochwertig, aber teilweise überladen: Shop-Karten, Tabs, Toasts, mobile Header/HUD.
- Modals und Save-Flows sind funktional, aber noch nicht premium/accessibility-reif.
- Release-Dokumentation und CI müssen an den aktuellen Stand angepasst werden.

---

## Sprint 13: Mobile Core UX Rework

Zeitraum: 2 Wochen

Status: Implementiert am 2026-05-31.

Umsetzung:

- Mobile Root-Order priorisiert jetzt Header → Clicker → Shop/Side-Panel; der alte HUD-Riegel wandert mobil nach unten, während Bud/BPS/BPC direkt im Clicker bleiben.
- Next-Buy-Panel direkt unter der Pflanze zeigt den sinnvollsten Kauf samt Kosten und BPS-Zuwachs.
- Goal/Run-Lens wurden aus dem Clicker-Hauptfluss herausgezogen, damit Shop/Tabs mobil früher erreichbar sind.
- Mobile CSS verdichtet Header, Clickfläche, Click-Stats, Shop-Karten und Ascension-Karten.
- Smoke-Screenshots wurden für 320px, 390px, 430px, 768px und 1440px unter `screenshots/sprint13-15-*` erzeugt.

### Ziel

Der mobile erste Bildschirm muss die eigentliche Clicker-Schleife sofort spielbar machen: Ressource sehen, Pflanze klicken, nächsten Kauf verstehen, Shop erreichen. Auf Mobile darf der Spieler nicht erst durch Header, HUD, Karten und Panels scrollen müssen, bevor der Shop sichtbar wird.

### Aufgaben

- Mobile Layout neu priorisieren:
  - Header auf Mobile stark verkleinern.
  - Logo/Title kompakter machen oder in eine kleine Top-Bar verschieben.
  - HUD auf Mobile auf Buds, BPS, BPC, Seeds reduziert anzeigen.
  - Sekundäre Stats in ein aufklappbares Detailpanel verschieben.
- Klickbereich auf Mobile früher sichtbar machen:
  - Pflanze innerhalb der ersten Viewport-Höhe platzieren.
  - Klickfläche groß halten, aber vertikale Luft reduzieren.
  - Goal und Run Lens kompakter machen.
- Shop auf Mobile sofort erreichbar machen:
  - Sticky Bottom Navigation oder sticky Tabbar.
  - “Next Buy”-Drawer direkt unter der Pflanze.
  - Erste erschwingliche Shop-Karte als kompakter Kaufbereich im Hauptscreen.
- Side Panel mobil umbauen:
  - Shop/Upgrades/Research/Prestige/Achievements/Settings als echte mobile Tabs.
  - Keine langen Desktop-Karten ungefiltert auf Mobile zeigen.
  - Locked Items kompakter darstellen.
- Mobile Touch Targets prüfen:
  - Buttons mindestens 44px hoch.
  - Buy One/x10/x25/Max bedienbar ohne versehentliche Klicks.
- Mobile Screenshots prüfen:
  - 320px.
  - 390px.
  - 430px.
  - 768px Tablet.

### Betroffene Dateien

- `src/app/ui/mountRoot.ts`
- `src/app/ui/mountPanels.ts`
- `src/app/ui/panels/sidePanel.ts`
- `src/app/ui/updaters/shop/*`
- `src/app/ui/updaters/statPanel.ts`
- `src/styles/index.css`
- `docs/design/ui-system.md`

### Deliverables

- Mobile-first Hauptscreen.
- Kompakter mobiler HUD.
- Sticky Mobile Navigation oder gleichwertige Lösung.
- Next-Buy-/Next-Action-Bereich.
- Aktualisierte UI-Dokumentation.

### Abnahmekriterien

- Auf `390x844` sind Buds, BPS/BPC, Pflanze und nächster Kauf ohne langes Scrollen erreichbar.
- Shop ist innerhalb der ersten 1-2 Nutzeraktionen erreichbar.
- Kein horizontaler Overflow auf `320px`.
- Mobile fühlt sich wie ein eigenes Layout an, nicht wie gestapelter Desktop.

---

## Sprint 14: Navigation, Shop-UI und Informationshierarchie

Zeitraum: 2 Wochen

Status: Implementiert am 2026-05-31.

Umsetzung:

- Side-Panel-Tabs nutzen kurze Labels plus Icon-Signal und numerische Badges für verfügbare Aktionen.
- Mobile Shop-Karten sind kompakter; sekundäre Details werden mobil reduziert, Kaufaktionen bleiben groß genug.
- Quick-Shop und Run-Lens trennen konkrete nächste Kaufaktion von strategischem Hinweistext.
- Tab-Overflow und abgeschnittene Labels wurden in Desktop- und Mobile-Smoke geprüft.

### Ziel

Die UI soll weniger überladen wirken und die nächste beste Aktion klarer zeigen. Shop, Upgrades, Research und Achievements müssen schneller scanbar werden.

### Aufgaben

- Side-Panel-Navigation verbessern:
  - Abgeschnittene Tabs wie `GROW...`, `UPGR...`, `RESEA...` entfernen.
  - Kürzere Labels oder Icon+Label-System einführen.
  - Aktiven View-Titel anzeigen.
  - Badges für verfügbare Upgrades/Research/Achievements einbauen.
  - Optional Gruppierung: `Grow`, `Power`, `Meta`, `More`.
- Shop-Karten entschlacken:
  - Standardansicht: Name, Icon, Owned, Cost, +BPS, Milestone, Hauptkaufbutton.
  - ROI, BPS-Share, SynergyHooks, genaue Details in Expand/Tooltip/Detailsheet.
  - Locked Cards kompakter und neugierig machend.
  - Buy Buttons besser gruppieren.
  - Buy Max als primärer späterer Button, nicht gleichwertig zu allem.
- Toast-System schärfen:
  - Unlock- und Achievement-Flut stärker bündeln.
  - Toasts dürfen Shop/Research nicht dauerhaft verdecken.
  - Mobile Toast-Position prüfen.
- Run Lens verbessern:
  - Nicht nur Hinweistext, sondern konkrete nächste Aktion.
  - Beispiel: “Buy 3 Seedlings”, “Save for Precision Trim”, “Prestige now gives +2 Seeds”.
- Empty States verbessern:
  - Research ohne verfügbare Nodes erklärt nächsten Unlock.
  - Achievement-Filter ohne Treffer zeigt sinnvolle Hinweise.
  - Locked Shop Items zeigen klare, kurze Anforderungen.

### Betroffene Dateien

- `src/app/ui/panels/sidePanel.ts`
- `src/app/ui/updaters/strings.ts`
- `src/app/ui/updaters/shop/*`
- `src/app/ui/updaters/research/*`
- `src/app/ui/updaters/achievements.ts`
- `src/app/ui/services/toast.ts`
- `src/app/strategy.ts`
- `src/styles/index.css`

### Deliverables

- Lesbare Navigation ohne abgeschnittene Tabtexte.
- Kompaktere Shop-Karten.
- Verbesserte Toast-Regeln.
- Verbesserte Empty States.
- Verbesserte Next-Action-Kommunikation.

### Abnahmekriterien

- Desktop 1440px zeigt alle Navigationseinträge professionell lesbar.
- Mobile zeigt keine überlangen Karten vor der Kernaktion.
- Spieler erkennt innerhalb von 5 Sekunden, was als nächstes sinnvoll ist.
- Toasts verdecken keine Kernbuttons dauerhaft.

---

## Sprint 15: Prestige 2.0 / Ascension Foundation

Zeitraum: 2 Wochen

Status: Implementiert am 2026-05-31.

Umsetzung:

- Run-/Research-Seeds und Ascension-Seeds sind getrennt.
- Event-/Click-/Passive-Seeds erhöhen den Prestige-Multiplikator nicht mehr.
- Prestige erzeugt Ascension-Seeds; der Multiplikator basiert auf `totalAscensionSeeds`.
- Ascension-Tree mit 24 permanenten Nodes wurde als datengetriebenes Fundament eingebaut.
- Permanent-Slot-Felder sind im State/Save vorhanden und werden durch Ascension-Nodes gespeist.
- Save-Version wurde auf 8 erhöht und migriert neue Prestige-/Ascension-Felder.

### Ziel

Prestige muss zum langfristigen Herzstück werden. Der Spieler soll nicht nur “Reset für Multiplikator” drücken, sondern echte Ascension-Entscheidungen treffen.

### Aufgaben

- Währungen neu schneiden:
  - Run-Seeds: kleine temporäre/Research-nahe Belohnung aus Events, Klicks, Synergien.
  - Prestige-Seeds oder Ascension-Seeds: nur durch Prestige-Reset.
  - Spendable vs Total sauber erklären.
- Prestige-Multiplikator umbauen:
  - Multiplikator darf nicht durch Pre-Prestige-Event-Seeds unklar steigen.
  - Prestige-Gain muss klar aus Run-Leistung kommen.
  - Preview zeigt: Reset, Gewinn, dauerhafte Boni, verlorene Dinge.
- Ascension Tree einführen:
  - Erste 20-30 permanente Nodes.
  - Startbonus-Nodes.
  - Offline-Nodes.
  - Event-Nodes.
  - Active-Click-Nodes.
  - Idle-Production-Nodes.
  - Research-/Seed-Nodes.
  - Cosmetic-/Quality-Nodes optional.
- Perma-Slot-System vorbereiten:
  - 1 Upgrade oder Research-Effekt kann später über Prestige behalten werden.
  - Noch klein starten, aber Architektur vorbereiten.
- Prestige-Timing neu balancieren:
  - Erster Prestige weiter ca. 45-90 Minuten.
  - Zweiter Run 25-40 Prozent schneller.
  - Dritter Run öffnet Ascension-Strategie sichtbar.

### Betroffene Dateien

- `src/app/prestige.ts`
- `src/app/seeds.ts`
- `src/app/state.ts`
- `src/app/save/*`
- `src/data/research.ts`
- neue Daten: `src/data/ascension.ts`
- neue Logik: `src/app/ascension.ts`
- UI: `src/app/ui/components/prestigePanel.ts` oder bestehende Prestige-Komponenten
- `docs/design/prestige.md`
- `docs/balance/final-v1-balance.md`

### Deliverables

- Getrennte Run-/Prestige-Währungslogik.
- Ascension-Grundsystem.
- Prestige-UI mit echter Entscheidungsqualität.
- Save-Migration für neue Prestige-Daten.
- Dokumentierte neue Prestige-Formel.

### Abnahmekriterien

- Prestige fühlt sich wie ein bedeutender Meta-Schritt an.
- Event-Seeds brechen den Prestige-Multiplikator nicht.
- Spieler versteht vor Reset exakt, was bleibt und was geht.
- Zweiter Run fühlt sich spürbar schneller, aber nicht trivial an.

---

## Sprint 16: Research 2.0 / Skilltree und Build-Pfade

Zeitraum: 2 Wochen

Status: Implementiert am 2026-05-31.

Umsetzung:

- Research-Datenmodell um `ResearchClass`, Ascension-Kosten und Prestige-Pfad erweitert.
- Research umfasst jetzt 51 Nodes über Efficiency, Active, Automation, Events, Genetics, Economy und Prestige.
- Neue Effektfamilien: BPC aus BPS-Anteil, Krit-Chance, Combo-Power, Automation-BPS-Anteil und Softcap-Relief.
- Research-UI zeigt Pfad-Zusammenfassungen, Klassenstatus und sortiert verfügbare/erschwingliche Nodes vor Locked/Owned.
- Ascension-Seeds können gezielt für Prestige-Lab-Research ausgegeben werden, inklusive Multiplikator-Neuberechnung.
- Dokumentation aktualisiert in `docs/design/research.md`.

### Ziel

Research soll kein flacher Upgrade-Stack sein, sondern ein sichtbarer Progressionsbaum mit Build-Identität. Spieler sollen sich bewusst für aktive, idle, event-, seed- oder automation-orientierte Pfade entscheiden.

### Aufgaben

- Research-Klassen trennen:
  - Run Tech: resetet beim Prestige.
  - Permanent Lab: bleibt, kostet Prestige-Währung.
  - Strains: pro Run exklusiv/respecbar.
- Research-UI umbauen:
  - Pfade/Cluster statt reiner Liste.
  - Fortschritt pro Pfad anzeigen.
  - Available zuerst, Owned kompakter.
  - Locked Nodes mit klarer nächster Bedingung.
- Pfade definieren:
  - Active Harvest.
  - Idle Hydro.
  - Event Combo.
  - Genetics/Seeds.
  - Automation.
  - Economy/Cost.
  - Prestige/Ascension.
- Research-Effekte interessanter machen:
  - Nicht nur `BPS_MULT`.
  - Event-Dauer, Event-Qualität, Combo-Fenster.
  - BPC aus BPS-Anteil.
  - Offline-Cap und Offline-Effizienz.
  - Item-Synergien.
  - Softcap-Bypass.
- Respec-Logik für Strains vorbereiten:
  - Pro Run eine Strain-Entscheidung.
  - Prestige resetet Strain.
  - Später ggf. Respec-Kosten.

### Betroffene Dateien

- `src/data/research.ts`
- `src/app/research.ts`
- `src/app/game.ts`
- `src/app/prestige.ts`
- `src/app/ui/updaters/research/*`
- `src/app/ui/panels/sidePanel.ts`
- `src/styles/index.css`
- `docs/design/research.md`

### Deliverables

- Research-Datenmodell mit Typen/Klassen.
- UI für Research-Pfade.
- Mindestens 40-60 Research-Nodes für längeres Spiel.
- Dokumentierte Build-Pfade.

### Abnahmekriterien

- Spieler kann mindestens drei unterschiedliche Builds erkennen.
- Research-Entscheidungen sind nicht alle offensichtlich linear.
- Prestige und Research greifen sauber ineinander.

---

## Sprint 17: Active Play, BPC und Automation Rework

Zeitraum: 2 Wochen

Status: Implementiert am 2026-05-31.

Umsetzung:

- Manuelle Klicks nutzen jetzt Combo, Krit und optionalen BPS-Anteil.
- Click-Combo wird im Klickbutton angezeigt und bleibt bewusst kurz/lesbar.
- Kritische Klicks bekommen goldene `CRIT`-Floating-Numbers und stärkeren Button-Pop.
- Automation kann neben Auto-Klicks einen gekappten BPS-Anteil ernten.
- Neue Abilities eingebaut: Event Magnet, Seed Focus, Harvest Chain, Cooldown Sync.
- Event Magnet beeinflusst Spawnrate, Seed Focus beeinflusst Click-/Event-Seeds, Harvest Chain verstärkt Combo, Cooldown Sync verkürzt laufende Cooldowns.
- Dokumentation aktualisiert in `docs/design/early-game-balance.md` und `docs/design/game-feel.md`.

### Ziel

Aktives Spielen soll nicht nach Early Game irrelevant werden. Klicken, Abilities und Automation müssen bis ins Mid-/Late-Game mechanisch relevant bleiben.

### Aufgaben

- BPC-Formel umbauen:
  - BPC nicht nur `1 * Multiplikatoren`.
  - Anteil von BPS einführen, z.B. Klick = Basis + x Sekunden Produktion.
  - Caps und Scaling definieren, damit Klickspam nicht alles dominiert.
- Active Builds ermöglichen:
  - Click Combo/Streak System.
  - Kritische Klicks oder Charged Clicks.
  - Event-Buffs, die aktives Klicken gezielt verstärken.
- Automation umbauen:
  - Auto Clicks skalieren mit BPC oder BPS-Anteil.
  - Automation kann später Events teilweise vorbereiten oder Buff-Fenster verlängern.
  - Auto Burst als ernsthafter Midgame-Baustein.
- Abilities erweitern:
  - Aktuell 4 Abilities: Overdrive, Burst, Auto Burst, Discount Window.
  - Neue Abilities:
    - Event Magnet.
    - Seed Focus.
    - Harvest Chain.
    - Cooldown Sync.
  - Cooldowns, Dauer und Stacking sauber kommunizieren.
- Game Feel prüfen:
  - Klickfeedback bleibt lesbar bei hohem Tempo.
  - Floating Numbers werden aggregiert.
  - Mobile Tap bleibt direkt.

### Betroffene Dateien

- `src/app/game.ts`
- `src/app/loop.ts`
- `src/app/abilities.ts`
- `src/data/abilities.ts`
- `src/app/events.ts`
- `src/app/effects.ts`
- `src/app/ui/updaters/abilities.ts`
- `src/app/ui/wireCoreClicks.ts`
- `docs/design/early-game-balance.md`
- `docs/design/game-feel.md`

### Deliverables

- Neue BPC/BPS-Kopplung.
- Relevante Active- und Automation-Builds.
- Erweiterte Ability-Daten.
- Dokumentierte Active-Play-Kurve.

### Abnahmekriterien

- Aktives Klicken bleibt auch nach 60-120 Minuten sinnvoll.
- Idle ist später stark, aber Active ist eine echte Strategie.
- Automation fühlt sich wie Progression an, nicht wie kosmetische Klicksimulation.

---

## Sprint 18: Shop 2.0 / Item-Archetypen und Synergie-Matrix

Zeitraum: 2 Wochen

Status: Implementiert am 2026-05-31.

Umsetzung:

- Item-Milestones sind jetzt archetypabhängig statt überall gleich.
- Synergie-Matrix mit 12 Cross-Item-Regeln eingebaut und im Shop sichtbar gemacht.
- Building-Upgrades auf 5 Stufen pro Item erweitert.
- Neue Archetype-Upgrades für Active, Automation, Events, Softcaps und Seeds ergänzt.
- Softcap-Relief ist als Research-/Upgrade-Gegenmittel implementiert und wirkt auf Shop-Berechnung, ROI und Produktion.
- Item-Synergien multiplizieren die Basisproduktion vor Milestone-/Softcap-/Globalmultiplikatoren.
- Dokumentation aktualisiert in `docs/design/shop-economy.md` und `docs/balance/economy-tables.md`.

### Ziel

Jedes Item soll mechanisch eine Rolle haben. Alte Items sollen nicht nur durch x2-Upgrades relevant bleiben, sondern durch echte Cross-Synergien und Builds.

### Aufgaben

- Item-Archetypen finalisieren:
  - Seedling: Click/Seed-Masse.
  - Planter: günstiger Early-Stabilisator.
  - Grow Tent: erster Produktionssprung.
  - Grow Light: Indoor/Event-Verstärker.
  - Cultivator: skaliert mit Gesamtbreite.
  - Irrigation: Kosten/Softcap/Infrastructure.
  - CO2 Tank: Buff- und Event-Power.
  - Climate Controller: Event-Stabilität und Offline-Effizienz.
  - Hydroponic Rack: Idle-Kern.
  - Genetics Lab: Seeds/Research/Strains.
  - Trimming Robot: Automation.
  - Micro Greenhouse: Prestige/Late-Compression.
- Synergie-Matrix bauen:
  - Item A produziert mehr pro X Item B.
  - Event-Builds profitieren von CO2/Climate.
  - Active-Builds profitieren von Seedling/Cultivator/Robot.
  - Idle-Builds profitieren von Hydro/Irrigation/Climate.
  - Prestige-Builds profitieren von Genetics/Micro.
- Milestones überarbeiten:
  - Nicht alle Items exakt gleiche Schwellen.
  - Spezifische Milestone-Boni pro Item.
  - Sichtbare Milestone-Details.
- Softcaps spielbar machen:
  - Softcaps sichtbar kommunizieren.
  - Research/Prestige kann bestimmte Softcaps verschieben.
  - Keine versteckten Strafen ohne Gegenmittel.
- Upgrade-Content erweitern:
  - Pro Item 5-8 thematische Upgrades.
  - Weniger generische “Boost 1/2/3”-Texte.
  - Mehr mechanische Upgrades statt reine Multiplikatoren.

### Betroffene Dateien

- `src/data/items.ts`
- `src/data/upgrades.ts`
- `src/data/milestones.ts`
- `src/app/shop.ts`
- `src/app/game.ts`
- `src/app/upgrades.ts`
- `src/app/ui/updaters/shop/*`
- `docs/design/shop-economy.md`
- `docs/balance/economy-tables.md`

### Deliverables

- Item-Archetypen mit echten Effekten.
- Synergie-Matrix.
- Erweiterte Item-Upgrades.
- Neue Milestone-Struktur.
- Dokumentierte Shop-Ökonomie.

### Abnahmekriterien

- Kein Item ist nur “größere Zahl”.
- Alte Items bleiben über Synergien relevant.
- Spieler erkennt mindestens drei sinnvolle Kaufstrategien.

---

## Sprint 19: Events 2.0 / Seasons, Chains und Risk-Reward

Status: Implementiert am 2026-05-31.

Umgesetzt:

- 28 Events mit Kategorien `minor`, `major`, `chain`, `risk`, `seasonal`.
- Getrennte Kategorie-Pity-Timer plus globale Pity.
- Chain-Folgeevents, Risk-Soft-Fails ohne harte Bud-Verluste und Seasonal-Datenmodell.
- Event-UI mit Kategorie-/Rarity-Datenattributen, klareren Timer-/Warnstilen und neuen Icons.
- Event-Research/Upgrades beeinflussen Spawn-Qualitaet, Chain-Chance und Risk-Kontrolle.
- Dokumentation in `docs/design/events-abilities.md`.

Zeitraum: 2 Wochen

### Ziel

Events sollen mehr sein als zufällige Bud-/Buff-Klicks. Sie sollen aktive Spieler belohnen, Build-Entscheidungen unterstützen und langfristig Überraschung erzeugen.

### Aufgaben

- Event-Kategorien trennen:
  - Minor Sparks: häufig, kleine Rewards.
  - Major Events: selten, starke Rewards.
  - Chain Events: führen zu Folge-Events.
  - Risk Events: hoher Gewinn oder temporärer Nachteil.
  - Seasonal Events: zeitlich/thematisch begrenzte Sets.
- Spawn-System umbauen:
  - Häufigkeit nach Phase skalieren.
  - Major Events nicht alle 14-26 Sekunden.
  - Pity-Timer getrennt nach Event-Typ.
- Event-Upgrades erweitern:
  - Spawn-Qualität.
  - Chain-Chance.
  - Buff-Dauer.
  - Risk-Reward-Kontrolle.
  - Idle-kompatible Event-Hilfen.
- Event-UI verbessern:
  - Restzeit klarer.
  - Major Events visuell stärker.
  - Risk Events klar warnen.
  - Event-Historie oder kleines Log optional.
- Seasons vorbereiten:
  - 2-3 erste Season-Sets als Datenmodell.
  - Keine echten Kalenderzwänge nötig.
  - Spieler kann Season später über Prestige/Research freischalten.

### Betroffene Dateien

- `src/app/events.ts`
- `src/app/ui/events/*`
- `src/data/research.ts`
- `src/data/upgrades.ts`
- `src/data/achievements.ts`
- `src/app/audio.ts`
- `src/styles/index.css`
- `docs/design/events-abilities.md`

### Deliverables

- Event-Typ-System.
- Mindestens 20-30 Events insgesamt.
- Erste Chain-/Major-/Risk-Events.
- Event-Balance-Dokumentation.

### Abnahmekriterien

- Events sind nicht mandatory, aber spannend.
- Aktive Spieler haben klare Vorteile.
- Events brechen Early Game nicht.
- Events erzeugen langfristig Abwechslung.

---

## Sprint 20: Achievements, Goals und Meta-Score

Status: Implementiert am 2026-05-31.

Umgesetzt:

- Achievement-Score pro Rarity inklusive kleinem, gedeckeltem Meta-Multiplikator.
- Achievement-Summary mit Fortschritt, Score, Near Count, Hidden Count und Kategoriechips.
- Neue Achievement-Kategorien fuer Builds, Seasons, Challenges und Cosmetics.
- Erweiterte Event-/Chain-/Risk-/Season-Achievements und Score-Meilensteine.
- Goal-System mit Midgame-, Build-, Event-, Prestige- und temporären Boost-Rewards.
- Dokumentation in `docs/content/achievements.md`.

Zeitraum: 2 Wochen

### Ziel

Achievements und Goals sollen langfristige Motivation liefern wie bei Cookie Clicker. Sie sollen nicht nur Checklisten sein, sondern Meta-Fortschritt, Stolz und neue Ziele erzeugen.

### Aufgaben

- Achievement-UI verbessern:
  - Summary Header.
  - Gesamtfortschritt.
  - Kategorie-Counts.
  - “Near Completion” prominent.
  - Hidden als Mystery-Slots.
  - Optional Virtualisierung oder Pagination.
- Achievement-Score einführen:
  - Achievements geben Score.
  - Score schaltet Meta-Upgrades oder Multiplikator-Familien frei.
  - Kleine globale Boni bleiben kontrolliert.
- Achievement-Kategorien erweitern:
  - Prestige-Speedruns.
  - Build-spezifische Achievements.
  - Event-Chain Achievements.
  - Season Achievements.
  - Challenge Achievements.
  - Cosmetic Unlocks.
- Goals erweitern:
  - Onboarding-Goals behalten.
  - Run-Goals pro Prestige.
  - Midgame-Goals.
  - Build-Goals.
  - Prestige-Challenges.
- Belohnungen verbessern:
  - Nicht nur Buds/Seeds.
  - Temporary Boost.
  - Cosmetic Badge.
  - Unlock-Hint.
  - Ascension XP/Score.

### Betroffene Dateien

- `src/data/achievements.ts`
- `src/app/achievements.ts`
- `src/data/goals.ts`
- `src/app/goals.ts`
- `src/app/ui/components/achievementCard.ts`
- `src/app/ui/updaters/achievements.ts`
- `src/app/ui/updaters/statPanel.ts`
- `src/styles/index.css`
- `docs/content/achievements.md`

### Deliverables

- Achievement-Score-System.
- Bessere Achievement-UI.
- Erweiterte Goals.
- Dokumentierter Meta-Score.

### Abnahmekriterien

- Spieler hat immer mehrere nahe und langfristige Ziele.
- Achievements wirken wertvoll, nicht beliebig.
- Meta-Score dominiert Balance nicht, fühlt sich aber lohnend an.

---

## Sprint 21: Premium Art Direction und Signature Assets

Status: Implementiert am 2026-05-31.

Umgesetzt:

- Ruhigerer Header-/Panel-/Clicker-Glow, Reward- und Rarity-Momente bleiben staerker.
- Neue Event-Icons fuer alle neuen Eventtypen.
- Ability-Icons vollstaendig im SVG-Generator und Manifest.
- Spaete Plant-Stages mit Crown-/Halo-Signatur fuer Late-/Prestige-Gefuehl.
- Achievement-Summary/Badge-Rarity-Polish.
- Dokumentation in `docs/design/art-direction.md` und `docs/design/assets.md`.

Zeitraum: 2 Wochen

### Ziel

Das Spiel soll nicht nur “saubere SVGs” haben, sondern einen eigenständigen Signature-Look. Weniger generisch, weniger gleichförmige Glows, stärkere visuelle Identität.

### Aufgaben

- Art Direction schärfen:
  - Visuelle Hierarchie definieren.
  - Glow-Level reduzieren.
  - Header weniger dominant machen.
  - Panels ruhiger, Rewards stärker.
- Signature Plant Pass:
  - Pflanze stärker als Markenzeichen.
  - Mehr erkennbare Stadien.
  - Late-Game/Prestige-Transformationen.
  - Skin-Varianten qualitativer unterscheiden.
- Item Icons überarbeiten:
  - Jedes Item klarer unterscheidbar.
  - Einheitliche Silhouette, aber eigene Form.
  - Auf hell/dunkel lesbar.
- Achievement Badges:
  - Rarity stärker sichtbar.
  - Kategorie-Badges.
  - Legendary Badges mit besonderer Inszenierung.
- Ability Icons in Generator aufnehmen:
  - Aktuell liegen Ability-Icons außerhalb der Generator-Logik.
  - Generator soll alle manifestierten Assets erzeugen oder prüfen.
- Backgrounds verbessern:
  - Weniger rein atmosphärisch.
  - Spielzustände subtil abbilden.
  - Event-/Prestige-Stimmung optional.

### Betroffene Dateien

- `public/img/**`
- `scripts/generate-assets.mjs`
- `src/app/assetManifest.ts`
- `src/styles/index.css`
- `docs/design/art-direction.md`
- `docs/design/assets.md`

### Deliverables

- Überarbeiteter Art-Direction-Guide.
- Neue Plant-Stages.
- Überarbeitete Item-/Ability-/Achievement-Icons.
- Generator deckt alle manifestierten Assets ab.

### Abnahmekriterien

- Spiel ist in Screenshots sofort wiedererkennbar.
- Icons sind ohne Text besser unterscheidbar.
- Weniger visuelle Konkurrenz zwischen Header, Cards und Badges.

---

## Sprint 22: Modals, Save UX und Accessibility

Zeitraum: 2 Wochen

Status: Implementiert im Sprint-22-26-Pass (`1.0.0-rc.1`): eigene Modal-Suite, fokussierbare Dialoge, Copy/Download-Export, sicherer Import, Reset-Sicherheitsphrase und gehärtete Storage-Writes.

### Ziel

Alle riskanten Aktionen müssen professionell, sicher und zugänglich sein. Keine Browser-`prompt`/`confirm`-Flows für zentrale Release-Funktionen.

### Aufgaben

- Eigene Modals bauen für:
  - Import.
  - Export.
  - Reset.
  - Prestige.
  - Optional Changelog/Credits.
- Accessibility:
  - `aria-labelledby`.
  - `aria-describedby`.
  - Initial Focus.
  - Focus Trap.
  - Fokus-Rückgabe.
  - Escape schließt sichere Modals.
  - Reset/Prestige brauchen explizite Bestätigung.
- Save-Import härten:
  - Import erst vollständig validieren.
  - Erst nach erfolgreichem `initState()` speichern.
  - Defekte Saves nicht persistieren.
  - Storage Writes mit try/catch.
  - Quota-/Private-Mode-Verhalten prüfen.
- Export verbessern:
  - Copy Button.
  - Download als Datei.
  - QR/Share optional später.
- Reset verbessern:
  - Warnung mit klarer Liste, was gelöscht wird.
  - Sicherheitsphrase optional.
- Alte Save-Versionen prüfen:
  - Migrationen robust halten.
  - Ungültige Decimal-Werte defensiv normalisieren.

### Betroffene Dateien

- `src/app/save.ts`
- `src/app/save/*`
- `src/app/ui/wirePersistence.ts`
- `src/app/ui/components/*`
- `src/app/ui/services/*`
- `src/app/ui/input/shortcuts.ts`
- `src/styles/index.css`
- `docs/release/known-issues.md`

### Deliverables

- Vollständige Modal-Suite.
- Sicherer Importpfad.
- Export als Copy und Datei.
- Accessibility-konforme riskante Aktionen.

### Abnahmekriterien

- Kein zentraler Flow nutzt Browser-`prompt`, `confirm` oder `alert`.
- Defekter Import kann keinen kaputten Save überschreiben.
- Keyboard-only-Nutzung funktioniert für Modals.

---

## Sprint 23: Performance, Cache-Busting und Release-CI

Zeitraum: 2 Wochen

Status: Implementiert im Sprint-22-26-Pass (`1.0.0-rc.1`): Version-Query fuer `public/img`, einheitliches Manifest, `assets:check`, GitHub-Pages-Workflow und Production-Playwright-Matrix.

### Ziel

Release-Behauptungen müssen technisch stimmen. Assets, CI und Production-Smokes sollen GitHub-Pages-tauglich und wiederholbar sein.

### Aufgaben

- Asset-Cache-Busting korrigieren:
  - `public/img` wird nicht von Vite gehasht.
  - Entweder Assets nach `src/assets` verschieben und per `new URL`/`import.meta.glob` laden.
  - Oder Version-Query an `asset()` hängen.
  - Docs entsprechend korrigieren.
- Manifest vereinheitlichen:
  - Aktuell sind Event-Assets rohe Strings, andere Manifestwerte fertige URLs.
  - Alle Manifestwerte gleich behandeln.
- `assets:check` einführen:
  - Manifest gegen existierende Dateien prüfen.
  - Keine verwaisten Runtime-Assets.
  - Generator-Output idempotent prüfen.
  - Ability-Icons einschließen.
- CI erweitern:
  - `npm run lint`.
  - `npm run test`.
  - `npm run build`.
  - Production Preview E2E.
  - Chromium, Firefox, WebKit.
  - Viewports 320, 390, 768, 1440.
  - Broken image check.
  - Console error check.
- Mobile Performance Profiling:
  - CSS-Blur/Backdrop-Filter prüfen.
  - Daueranimationen reduzieren.
  - `data-motion="reduced|minimal"` konsequenter anwenden.
- Audio-Release-Regeln:
  - WAV nicht in Runtime-Quellpfaden.
  - MP3-Fallback klanglich prüfen.
  - Optional AAC/M4A-Fallback evaluieren.

### Betroffene Dateien

- `src/app/assets.ts`
- `src/app/assetManifest.ts`
- `scripts/generate-assets.mjs`
- neue Scripts: `scripts/check-assets.mjs`
- `.github/workflows/pages.yml`
- `playwright.config.ts`
- `e2e/smoke.spec.ts`
- `src/styles/index.css`
- `docs/release/checklist.md`

### Deliverables

- Echtes Cache-Busting oder dokumentierte Alternative.
- Asset-Check-Script.
- Erweiterte CI.
- Production-E2E-Smokes.
- Performance-Notizen.

### Abnahmekriterien

- CI deckt die wichtigsten Release-Checks ab.
- Keine widersprüchliche Release-Dokumentation.
- Production Build zeigt keine kaputten Bilder oder Console Errors.
- Mobile bleibt bei Klickspam bedienbar.

---

## Sprint 24: Long-Term Content Expansion

Zeitraum: 2 Wochen

Status: Implementiert im Sprint-22-26-Pass (`1.0.0-rc.1`): 160 Achievements, 51 Research-Nodes, 8 Abilities, fuenf UI-Themes, sechs Plant-Skins und mehr Hidden/Season/Build/Challenge-Ziele.

### Ziel

Das Spiel braucht mehr Langzeitinhalt, damit es nicht nach 4-10 Stunden leer wirkt. Dieser Sprint erweitert Content nicht wahllos, sondern entlang der neuen Systeme.

### Aufgaben

- Upgrade-Menge erweitern:
  - Pro Item 5-8 Upgrades.
  - Pro Build-Pfad mehrere Synergy-Upgrades.
  - Prestige-/Ascension-Upgrades.
- Research erweitern:
  - 40-60 Nodes nach Research 2.0.
  - Späte Nodes mit echten Mechaniken.
- Achievements erweitern:
  - 150-200 Achievements als Ziel.
  - Mehr Hidden/Challenge/Build/Event/Season Achievements.
- Cosmetics erweitern:
  - Weitere Plant-Skins.
  - UI-Themes.
  - Prestige-Rahmen.
  - Achievement-Badges.
  - Background-Varianten.
- Late-Game Items oder Tiers prüfen:
  - Option A: 12 Items behalten, aber tiefer machen.
  - Option B: 3-6 spätere Spezial-Items hinzufügen.
  - Keine neuen Items ohne Rolle.
- Flavor/Text-Pass:
  - Keine Textwände.
  - Keine realweltlichen Anleitungen.
  - Professioneller Ton.
  - Deutsch/Englisch konsistent.

### Betroffene Dateien

- `src/data/items.ts`
- `src/data/upgrades.ts`
- `src/data/research.ts`
- `src/data/achievements.ts`
- `src/data/goals.ts`
- `src/app/i18n.ts`
- `docs/content/*`
- `docs/design/*`

### Deliverables

- Erweiterter Mid-/Late-Game-Content.
- Neue Cosmetics.
- Content-Dokumentation.
- Aktualisierte Balance-Tabellen.

### Abnahmekriterien

- Spieler hat nach mehreren Prestiges weiterhin neue Ziele.
- Content wirkt nicht wie Füllmaterial.
- Neue Inhalte unterstützen Build-Entscheidungen.

---

## Sprint 25: Full Balance Pass 2-20 Stunden

Zeitraum: 2 Wochen

Status: Implementiert im Sprint-22-26-Pass (`1.0.0-rc.1`): 2-20h-Phasen, Profil-Simulationen, Exploit-Pass und Offline-BPS-Haertung gegen temporaere Buffs.

### Ziel

Nach den Systemumbauten muss die Progression über mehrere Stunden absichtlich wirken. Keine Sackgassen, keine unkontrollierten Explosionen, keine toten Systeme.

### Aufgaben

- Phasen neu definieren:
  - 0-5 Minuten.
  - 5-30 Minuten.
  - 30-90 Minuten.
  - 1.5-4 Stunden.
  - 4-10 Stunden.
  - 10-20 Stunden.
- Simulationsskripte verbessern:
  - Active Player.
  - Semi-Idle Player.
  - Optimizer.
  - Event Player.
  - Prestige Player.
  - Mobile Player.
- Economy prüfen:
  - Item ROI.
  - Upgrade Timing.
  - Research Costs.
  - Prestige Gain.
  - Ascension Tree Costs.
  - Event EV.
  - Offline Gain.
  - Achievement Score.
  - BPC/BPS-Verhältnis.
- Exploits prüfen:
  - Offline mit temporären Buffs.
  - Event-Seeds.
  - Buy Max + Cost Buffs.
  - Prestige zu früh/zu spät.
  - Save/Import Missbrauch.
- Playthrough-Notizen aktualisieren:
  - Echter 30-Minuten-Run.
  - Erster Prestige-Run.
  - Zweiter Run.
  - 4h Run.
  - 10h Simulation.

### Betroffene Dateien

- `src/data/*`
- `src/app/*`
- `scripts/*`
- `docs/balance/*`

### Deliverables

- Neue Balancewerte.
- Simulationsergebnisse.
- Playthrough-Notizen.
- Finalisierte Phase Targets.

### Abnahmekriterien

- Keine 20-Minuten-Strecke ohne Entscheidung.
- Kein einzelner Build dominiert alles.
- Prestige beschleunigt, trivialisiert aber nicht.
- Active und Idle sind beide legitim.

---

## Sprint 26: Final 1.0 Release Polish

Zeitraum: 2 Wochen

Status: Implementiert im Sprint-22-26-Pass (`1.0.0-rc.1`): Release-Dokumentation, Versionssprung, Asset-/Save-/CI-Finalcheck und bekannte echte Hardware-Limits dokumentiert.

### Ziel

Alles, was unfertig wirkt, wird entfernt, verbessert oder bewusst als Post-Launch markiert. Danach kann 1.0 mit gutem Gewissen veröffentlicht werden.

### Aufgaben

- Vollständiger UI-Polish:
  - Keine abgeschnittenen Texte.
  - Keine überfüllten Cards.
  - Keine unstimmigen deutschen/englischen Begriffe.
  - Keine Debug-/Dev-Hinweise sichtbar.
- Browser-Abnahme:
  - Chromium Desktop.
  - Firefox Desktop.
  - WebKit.
  - Echter iOS Safari Hardware-Test.
  - Android Chrome.
- Release-Dokumentation aktualisieren:
  - `docs/release/v1-scope.md`
  - `docs/release/checklist.md`
  - `docs/release/known-issues.md`
  - `docs/release/post-launch-roadmap.md`
- Audio final prüfen:
  - Musikloop sauber.
  - SFX nicht nervig.
  - Lautstärke-Balance.
  - Autoplay-Hinweis nicht nötig, aber Verhalten korrekt.
- Asset-Finalcheck:
  - Keine WAV im Runtime-Pfad.
  - Keine verwaisten Assets.
  - Keine kaputten Pfade.
  - Favicon/App Icons final.
- Save-Kompatibilität prüfen:
  - Alter RC-Save.
  - Neuer 1.0-Save.
  - Defekter Import.
  - Reset.
- GitHub Pages final prüfen:
  - Base Path.
  - Dist-Artefakt.
  - Workflow.
  - Cache.

### Betroffene Dateien

- Gesamtes Repo.
- Schwerpunkt `src/app/ui`, `src/data`, `docs/release`, `.github/workflows`.

### Deliverables

- Release Candidate `1.0.0-rc.1`.
- Finaler 1.0-Scope.
- Bekannte Einschränkungen.
- Post-Launch Roadmap.
- Release-Checkliste vollständig.

### Abnahmekriterien

- Spiel wirkt auf Desktop und Mobile fertig.
- Erste 2-4 Stunden sind motivierend.
- Mehrere Prestiges bleiben interessant.
- Keine sichtbaren Placeholder.
- Keine Console Errors.
- Keine kaputten Assets.
- Echte iOS-Safari-Abnahme erledigt.

---

## Querschnittsregeln für alle Sprints

- Gameplay zuerst, danach UI, danach Polish.
- Keine neuen Systeme ohne klare Spielerentscheidung.
- Keine reinen Multiplikator-Stapel, wenn eine Mechanik möglich ist.
- Mobile immer mitprüfen.
- Save-Migration bei jeder State-Änderung einplanen.
- Alle sichtbaren Texte Deutsch/Englisch konsistent halten.
- Keine realweltlichen Anleitungen oder realistische Anbau-Simulation.
- Devtools dürfen Production nicht erreichen.
- Performance darf nicht durch Partikel, Blur oder DOM-Listen kippen.
- Jede neue Währung braucht klare Bedeutung und UI-Erklärung.
- Jede neue Progression muss in Doku und Balance-Tabellen auftauchen.

## Empfohlene Priorität

1. Sprint 13: Mobile Core UX Rework.
2. Sprint 15: Prestige 2.0.
3. Sprint 17: Active Play und Automation Rework.
4. Sprint 18: Shop 2.0.
5. Sprint 16: Research 2.0.
6. Sprint 19: Events 2.0.
7. Sprint 20: Achievements/Goals/Meta-Score.
8. Sprint 23: Release-CI und technische Härtung.
9. Sprint 21: Premium Art Direction.
10. Sprint 25: Full Balance Pass.
11. Sprint 26: Final 1.0 Polish.

Diese Reihenfolge priorisiert das, was den Spielspaß am stärksten prägt: Mobile-Erreichbarkeit, Langzeit-Meta, Build-Tiefe und Balance.

---

## Sprint 27: Depth Expansion Foundation

Status: Implementiert.

Ziel:

- CannaClicker bekommt neue langfristige Entscheidungsebenen gegen den Cookie-Clicker-Vergleich.
- Save-Version 9 erweitert den State ohne alte Saves hart zu brechen.
- Roadmap und Design-Dokumente beschreiben die neue Depth-Phase.

Umsetzung:

- `docs/roadmap/depth-expansion-roadmap.md`
- `src/data/rooms.ts`
- `src/data/strains.ts`
- `src/data/contracts.ts`
- `src/data/seasons.ts`
- `src/data/eventMastery.ts`
- `src/data/challenges.ts`
- `src/data/collections.ts`
- `src/app/depth.ts`

Abnahme:

- Neuer Save startet mit validen Defaults.
- Alte Saves Version 7/8 werden weiter normalisiert.
- Neue Systeme sind datengetrieben.

## Sprint 28: Strains, Contracts und Greenhouse Rooms

Status: Implementiert.

Ziel:

- Spieler waehlt pro Run eine Strain.
- Contracts geben klare Run-Auftraege.
- Rooms machen permanenten Ausbau sichtbar.

Umsetzung:

- 5 Strains mit XP und Level 1-3.
- 20 Contracts mit Easy/Medium/Hard.
- 6 Greenhouse Rooms mit je 5 Leveln.
- Contract Tokens als spaetes Room-Gate.

Abnahme:

- Strain-Auswahl beeinflusst BPC/BPS/Events/Automation/Prestige.
- Contract kann angenommen und bei Erfuellung geclaimed werden.
- Room-Level verbrauchen Buds/Ascension-Seeds/Score/Tokens.

## Sprint 29: Seasons, Event Mastery und Prestige Challenges

Status: Implementiert.

Ziel:

- Events bekommen langfristige Mastery.
- Seasons verschieben Event-Gewichte ohne Kalenderpflicht.
- Challenges erzeugen neue Run-Regeln.

Umsetzung:

- 4 Seasons: Evergreen, Sunshift, Night Market, Harvest Festival.
- Event Mastery Level 1-3 pro Event.
- 6 Prestige Challenges mit echten Regelmodifikatoren.
- Challenge Rewards schalten Cosmetics und kleine Boni frei.

Abnahme:

- No Events deaktiviert Event-Spawns.
- Manual Garden deaktiviert passive Produktion.
- Silent Greenhouse blockiert Abilities.
- Risk Market fokussiert Risk-Events.
- Tiny Pot begrenzt Item-Kopien.

## Sprint 30: Collection und Automation Manager

Status: Implementiert.

Ziel:

- Cosmetics werden als Sammlung sichtbarer Meta-Fortschritt.
- Automation wird freigeschaltete Progression statt Default.

Umsetzung:

- Collection Score mit hartem +3 Prozent Meta-Cap.
- Auto-Click ab Automation-Tier 1.
- Auto-Buy-Regeln ab Tier 2.
- Ability Scheduling ab Tier 4.
- Automation bleibt im Greenhouse-Tab optional steuerbar.

Abnahme:

- Automation laeuft nicht von Spielstart an.
- Auto-Buy nutzt kleine Einzelkaeufe, kein Buy-Max-Spike.
- Collection-Bonus kann Balance nicht dominieren.
