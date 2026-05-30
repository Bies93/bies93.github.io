# Asset System

## Ziel

Alle sichtbaren Bilder laufen ueber ein klares, web-optimiertes Asset-System. Es gibt keine alten @2x-Fantasien, keine schwarzen Kachelbilder und keine schweren PNG-Icons fuer kleine UI-Elemente.

## Ordnerstruktur

```text
public/img/items
public/img/upgrades
public/img/research
public/img/events
public/img/ui
public/img/plant
public/img/backgrounds
public/img/fx
public/sounds
```

## Manifest

`src/app/assetManifest.ts` ist die zentrale Zuordnung fuer:

- 12 Item-Icons
- 5 Upgrade-Iconfamilien
- 7 Research-Icons
- 8 Event-Icons
- UI-Icons inklusive Stats, Controls und Achievement-Badges
- 11 Pflanzenstadien
- Desktop/Mobile/Texture-Backgrounds

## Generierung

Die aktuellen SVG-Assets werden ueber `scripts/generate-assets.mjs` erzeugt.

```bash
npm --prefix cannaclicker run assets:generate
```

Die SVGs sind bewusst vektorbasiert, damit 32px UI-Icons und groessere Shop-/Plant-Darstellungen ohne separate riesige PNGs funktionieren.

## Naming

- Items: `snake_case.svg`, passend zur Item-ID.
- Events: `kebab-case.svg`, im Manifest auf Event-IDs gemappt.
- UI: kurze Funktionsnamen wie `export.svg`, `sound-on.svg`, `bps.svg`.
- Plant: `stage-01.svg` bis `stage-11.svg`.

## srcset-Regel

`createItemSrcset()` gibt aktuell nur die vorhandene URL zurueck. Damit sind alte defekte `@2x`-Ableitungen entfernt. Echte responsive Rastervarianten duerfen spaeter nur eingetragen werden, wenn die Dateien wirklich existieren.

## Cleanup-Regel

Nicht referenzierte Legacy-Ordner wie `public/icons`, `public/achievements` und `public/plant-stages` duerfen nicht zurueckkehren. Neue Assets muessen ueber das Manifest referenziert werden.

## Abnahme

- `npm --prefix cannaclicker run build`
- Lokaler Start
- Browser-Konsole ohne offensichtliche Runtime-Fehler
- Manuelle Sichtpruefung: Shop, Events, Prestige, Achievements, Pflanze, Controls
