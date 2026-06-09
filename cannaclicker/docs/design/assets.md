# Asset System

## Ziel

Alle sichtbaren Bilder laufen über ein klares, web-optimiertes Asset-System. Es gibt keine alten @2x-Fantasien, keine schwarzen Kachelbilder und keine schweren PNG-Icons für kleine UI-Elemente.

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

- 12 Item-Icons
- 5 Upgrade-Iconfamilien
- 7 Research-Icons
- 28 Event-Icons
- 8 Ability-Icons
- UI-Icons inklusive Ressourcen, Controls und Achievement-Badges
- 11 Pflanzenstadien
- Signature-Key-Art, Desktop/Mobile/Texture-Backgrounds
- Hintergrundmusik über Vite-Asset-URLs

Alle Manifestwerte laufen ueber `asset()`. Bilder aus `public/img` bekommen zusaetzlich einen Versionsquery wie `?v=1.0.0-rc.1`, weil diese Dateien nicht von Vite gehasht werden.

## Generierung

Die aktuellen SVG-Assets werden über `scripts/generate-assets.mjs` erzeugt.

```bash
npm --prefix cannaclicker run assets:generate
```

Die SVGs sind bewusst vektorbasiert, damit 32px UI-Icons und größere Shop-/Plant-Darstellungen ohne separate riesige PNGs funktionieren.

Seit dem Signature-Art-Rework erzeugt der Generator eine organischere Botanical-Ink-Richtung:

- handgezeichnet wirkende Badge-Shells statt sauberer Tech-Hexagons
- Brush-Roughness, Ink-Bleed und Paper-Grain in den SVG-Definitionen
- gezeichnete Blattadern und Lichtkanten fuer bessere Nahwirkung
- spaete Pflanzenstadien mit Crown-, Halo- und Bloom-Momenten
- Background-SVGs als leichte Fallback-/Layer-Texturen

Das rasterbasierte `public/img/backgrounds/signature-key-art.png` ist der einzige groessere Key-Art-Hintergrund. Er wird als primaeres Hero-Bild genutzt, waehrend die SVG-Backdrops als leichte Fallbacks und Atmosphaeren-Layer bleiben.

Der Generator entfernt bekannte nicht mehr referenzierte Altdateien (`public/img/fx`, alte UI-Controls wie `buy.svg`, `locked.svg`, `settings.svg`, `stats.svg` und `achievement-pot.svg`) automatisch. `npm run assets:generate` darf dadurch keine neuen untracked Dateien erzeugen.

`npm run assets:check` prueft:

- Manifestpfade gegen echte Dateien.
- Keine verwaisten Runtime-Bilder unter `public/img`.
- Keine WAV-Dateien in Runtime-Quellen.
- Generator-Output bleibt idempotent.

## Naming

- Items: `snake_case.svg`, passend zur Item-ID.
- Events: `kebab-case.svg`, im Manifest auf Event-IDs gemappt.
- Abilities: `kebab-case.svg`, im Manifest auf Ability-IDs gemappt.
- UI: kurze Funktionsnamen wie `export.svg`, `sound-on.svg`, `bps.svg`.
- Plant: `stage-01.svg` bis `stage-11.svg`.
- Key-Art: `signature-key-art.png`.

## Legacy-Snapshot

Der Stand vor dem Signature-Art-Rework liegt in `Legacy_Assets/`.

- `Legacy_Assets/public_img_before_signature_rework/` enthaelt den alten `public/img`-Stand.
- `Legacy_Assets/audio_before_signature_rework/` enthaelt die vorher vorhandenen komprimierten Musikdateien.
- `Legacy_Assets/README.md` beschreibt die Wiederherstellung.

Dieser Ordner ist absichtlich nicht Teil der Runtime-Pipeline und dient nur als Rueckfall-Snapshot.

## Sprint-21-Erweiterungen

- Neue Event-Icons fuer Minor, Chain, Risk, Major und Seasonal Events.
- Ability-Icons sind jetzt vollstaendig im Generator statt teilweise wiederverwendet.
- Item-Icons nutzen gezielte Shell-Akzente je Funktionsfamilie, damit Shop-Rollen schneller unterscheidbar sind.
- Spaete Pflanzenstadien haben Crown-/Halo-Elemente, damit Prestige- und Late-Run-Zustand staerker sichtbar wird.
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
