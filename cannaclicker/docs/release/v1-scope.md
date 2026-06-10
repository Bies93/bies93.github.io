# V1 Scope

Stand: Sprint 26.

Release-Entscheidung: `1.0.0-rc.1` ist der Release Candidate für GitHub Pages.

## V1 Muss

Diese Systeme bleiben im ersten Online-Release:

- Core Clicker mit aktivem Klickfeedback.
- Shop mit 12 Item-Tiers, Buy One/x10/x25/Max und Milestones.
- Upgrades mit Click-, Global-, Item-, Synergy-, Event-, Seed-, Automation- und Prestige-Hooks.
- 28 Events mit Gates, Kategorien, Rewards, Chain/Risk/Season-Rollen, Seeds und Pity-Verhalten.
- Seeds, Prestige, Kickstart und permanenter Total-Seed-Multiplikator.
- 51 Research-Nodes.
- 160 Achievements mit Filtern, Progress, Score, Hidden-, Build-, Season- und Challenge-Achievements.
- Goal-System für frühe Fuehrung.
- Offline-Gain mit sichtbarer Rueckkehrmeldung.
- Export, Import, Reset und Settings mit eigener Modal-Suite.
- Fünf leichte UI-Themes und sechs Plant-Skins als nicht-mechanische Cosmetic-Optionen.
- Mobile UI ab 320 px.
- Prozedurales Soundset, SFX-Lautstaerke und Motion-Intensity-Setting.

## Bewusst nicht in V1

- Account-System oder Cloud-Saves.
- Backend, Leaderboards oder Social Features.
- Cosmetics/Skins als vollwertiges Progressionssystem.
- Cloud-Saves.
- Komplexe Cosmetic-Progression ausserhalb leichter Themes, Plant-Skins und Achievement-Score.
- Weitere Late-Game-Branches über die 51 Research-Nodes hinaus.
- Sichtbares Dev-Balance-Menue im Release.

## Gekuertz oder geschaerft

- Achievement-Menge bleibt bei 160 und wird bis Launch nicht weiter aufgeblasen.
- Hidden Achievements sind Entdeckungen und Langzeitmarker, keine Early-Game-Pflichtliste.
- Motion-Polish ist global und datenarm, keine großen Video-/Audioassets.
- Devtools sind nur im Vite-Dev-Modus aktiv und bleiben im Production-Build verborgen.
- Prestige-Schwelle wurde für RC auf 3M Lifetime-Buds gesetzt, damit der erste Reset im 45-90-Minuten-Zielkorridor bleibt.
- Production-Sourcemaps sind für RC deaktiviert.

## Bekannte kleine Einschraenkungen

- Lange echte 4-20h-Balancing-Läufe brauchen nach Onlinegang echte Telemetrie oder Spielerfeedback.
- iOS Safari ist in dieser Ubuntu-Umgebung nicht real testbar; WebKit-Smoke ist als nächster technischer Proxy gruen.
- Android Chrome ist in dieser Ubuntu-Umgebung nur als Chromium-Mobile-Viewport geprüft.
- Firefox-Smoke ist via Playwright gruen; der alte Snap-Firefox-Prozess bleibt für diese Abnahme irrelevant.
- Prozeduraler Sound startet wie ueblich erst nach Benutzerinteraktion.
- Import/Export bleibt lokal und datei-/textbasiert; kein Account-Sync.

## Finaler Scope-Satz

BiesyClicker V1 ist ein lokales Web-Idle-Game ohne Backend. Der Release soll als fertiger, schneller, mobiltauglicher Singleplayer-Clicker wirken, nicht als Live-Service-Plattform.
