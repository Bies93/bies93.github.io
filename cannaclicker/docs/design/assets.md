# Asset System

## Ziel

Alle sichtbaren Bilder laufen über ein klares, web-optimiertes Asset-System. Große Gameplay-Illustrationen sind transparente PNG-Cutouts; kleine Controls, Badges und leichte Background-Texturen bleiben SVG.

## Ordnerstruktur

```text
public/img/items
public/img/upgrades
public/img/research
public/img/events
public/img/abilities
public/img/ui
public/img/plant
public/img/backgrounds
src/*.mp3 / src/*.opus
Legacy_Assets
```

## Manifest

`src/app/assetManifest.ts` ist die zentrale Zuordnung für:

- 12 Item-Illustrationen als PNG
- 5 Upgrade-Iconfamilien als PNG
- 7 Research-Icons als PNG
- 28 Event-Icons als PNG
- 8 Ability-Icons als PNG
- UI-Icons inklusive Ressourcen, Controls und Achievement-Badges
- 11 Pflanzenstadien als PNG
- Signature-Key-Art, Desktop/Mobile/Texture-Backgrounds
- Hintergrundmusik über Vite-Asset-URLs

Alle Manifestwerte laufen ueber `asset()`. Bilder aus `public/img` bekommen zusaetzlich einen Versionsquery wie `?v=1.0.0-rc.1`, weil diese Dateien nicht von Vite gehasht werden.

## Generierung

`scripts/generate-assets.mjs` erzeugt nur die bewusst vektorbasierten UI- und Background-SVGs.

```bash
npm --prefix cannaclicker run assets:generate
```

Item-, Plant-, Ability-, Event-, Upgrade- und Research-Grafiken sind Raster-Cutouts, weil sie neben dem malerischen Signature-Key-Art detaillierter und hochwertiger wirken müssen. Die alten Generator-SVGs in diesen Gruppen werden beim Generatorlauf entfernt, damit sie nicht als Runtime-Assets zurückkehren.

Das rasterbasierte `public/img/backgrounds/signature-key-art.png` ist das primaere Key-Art. Es definiert die Stilrichtung fuer die transparenten Gameplay-PNGs; die SVG-Backdrops bleiben als leichte Fallbacks und Atmosphaeren-Layer.

Der Generator entfernt bekannte nicht mehr referenzierte Altdateien (`public/img/fx`, alte UI-Controls wie `buy.svg`, `locked.svg`, `settings.svg`, `stats.svg` und `achievement-pot.svg`) automatisch. `npm run assets:generate` darf dadurch keine neuen untracked Dateien erzeugen.

`npm run assets:check` prueft:

- Manifestpfade gegen echte Dateien.
- Große Runtime-Bildgruppen muessen PNGs sein.
- Keine verwaisten Runtime-Bilder unter `public/img`.
- Keine WAV-Dateien in Runtime-Quellen.
- Generator-Output bleibt idempotent.

## Naming

- Items: `snake_case.png`, passend zur Item-ID.
- Events: `kebab-case.png`, im Manifest auf Event-IDs gemappt.
- Abilities: `kebab-case.png`, im Manifest auf Ability-IDs gemappt.
- UI: kurze Funktionsnamen wie `export.svg`, `sound-on.svg`, `bps.svg`.
- Plant: `stage-01.png` bis `stage-11.png`.
- Key-Art: `signature-key-art.png`.

## Legacy-Snapshot

Der Stand vor dem Signature-Art-Rework liegt in `Legacy_Assets/`.

- `Legacy_Assets/public_img_before_signature_rework/` enthaelt den alten `public/img`-Stand.
- `Legacy_Assets/audio_before_signature_rework/` enthaelt die vorher vorhandenen komprimierten Musikdateien.
- `Legacy_Assets/README.md` beschreibt die Wiederherstellung.

Dieser Ordner ist absichtlich nicht Teil der Runtime-Pipeline und dient nur als Rueckfall-Snapshot.

## Sprint-21-Erweiterungen

- Neue Event-Icons fuer Minor, Chain, Risk, Major und Seasonal Events.
- Ability-Icons sind eigenstaendige PNG-Cutouts statt recycelter Controls.
- Item-Illustrationen nutzen detaillierte Materialien und Silhouetten statt einfacher SVG-Shells.
- Spaete Pflanzenstadien haben staerkere Bloom-, Crown- und Late-Run-Signale.
- Achievement-Badges nutzen Rarity-Polish in CSS; die Badge-Basis bleibt vektorbasiert.

## srcset-Regel

`createItemSrcset()` gibt aktuell nur die vorhandene URL zurück. Damit sind alte defekte `@2x`-Ableitungen entfernt. Echte responsive Rastervarianten dürfen später nur eingetragen werden, wenn die Dateien wirklich existieren.

## Cleanup-Regel

Nicht referenzierte Legacy-Ordner wie `public/icons`, `public/achievements`, `public/plant-stages` und `public/img/fx` dürfen nicht zurückkehren. Neue Assets müssen über das Manifest referenziert werden.

## Abnahme

- `npm --prefix cannaclicker run build`
- `npm --prefix cannaclicker run assets:check`
- Lokaler Start
- Browser-Konsole ohne offensichtliche Runtime-Fehler
- Manuelle Sichtpruefung: Shop, Events, Prestige, Achievements, Pflanze, Controls
