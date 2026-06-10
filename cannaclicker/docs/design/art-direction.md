# Art Direction

## Stilziel

CannaClicker soll wie ein modernes, eigenstaendiges Idle-Game wirken: cozy botanical, neon-green counterculture, clean UI und leicht verspielte Progression. Die Optik darf stilisiert sein und muss nicht fotorealistisch wirken.

## Farbwelt

- Basis: sehr dunkles Neutralgrau statt reines Schwarz.
- Primär: kraeftiges Leaf-Gruen für aktive Aktionen und positive Zahlen.
- Sekundär: Amber/Gold für Seeds, Belohnungen und seltene Events.
- Akzent: Cyan/Violett nur punktuell für Boosts, Forschung und Spezialeffekte.
- Keine einfarbige Gruenfläche: UI braucht neutrale Flächen, warme Rewards und klare Kontraste.

## Formen und Oberflächen

- Karten bleiben kompakt mit kleinem Radius.
- Buttons verwenden Icons plus kurze Labels, wo das Label noetig ist.
- Wiederholbare Shop-Elemente dürfen Cards sein; ganze Sections bleiben ungerahmt.
- Pflanze und Events dürfen expressiver sein als der restliche HUD.

## Icon-Regeln

- Icons müssen auf hellen und dunklen Flächen funktionieren.
- Jedes Icon braucht eine klare Silhouette bei 32px.
- Keine schwarzen Kacheln, keine unerklaerten Fotoausschnitte.
- Item-, Event-, Ability-, Upgrade- und Research-Assets nutzen detaillierte PNG-Cutouts; kleine UI-Glyphen bleiben SVG.

## Bildsprache

- Pflanzenstadien sind abstrahierte Fortschrittssignale, keine realistische Anleitung.
- Das primaere Key-Art zeigt eine fiktionale, magische Greenhouse-Kulisse ohne reale Anbauanleitung oder Paraphernalia.
- Backgrounds sind dekorative Atmosphaere und dürfen den Content nicht überdecken.
- FX-Assets bleiben sparsam, damit Events und Belohnungen hervorstechen.

## UI-Verhalten

- Zahlen und Kosten haben Vorrang vor Illustration.
- Animationen bestaetigen Aktionen, dürfen aber keine Layout-Verschiebungen verursachen.
- Mobile Layouts müssen dieselben Entscheidungen sichtbar halten wie Desktop: Kaufen, Klicken, Boosts, Prestige.

## Sprint-21-Premium-Pass

- Header und Basis-Panels wurden optisch beruhigt: weniger Dauer-Glow, klarere Flaechen, Rewards bleiben die lauteren Momente.
- Event-Kategorien haben eigene visuelle Lesbarkeit: Chain cyan, Risk rose/amber, Seasonal violet/gold, Major gold.
- Die Hauptpflanze ist weiterhin stilisiert, bekommt aber in spaeten Stadien markantere Crown- und Halo-Signale.
- Ability-Icons sind eigenstaendige Raster-Cutouts, damit aktive Skills nicht wie recycelte Controls wirken.
- Achievement-UI setzt Score, Progress und Rarity sichtbarer ein, ohne den Kartenfeed zu ueberladen.

## Signature-Art-Rework

- Items, Events, Abilities, Upgrades, Research und Pflanzenstadien sind transparente PNG-Cutouts mit malerischer Botanical-Fantasy-Anmutung.
- UI-Icons behalten ihre eindeutige Symbolik als kleine SVG-Glyphen.
- Das `signature-key-art.png` traegt die Premium-Anmutung im ersten Viewport und dient als Stilreferenz; SVG-Hintergruende bleiben als performante Fallbacks und subtile Atmosphaere.
- Alte Assets wurden nicht geloescht, sondern als `Legacy_Assets` gesichert.

## Asset-Qualitaetskriterien

- Jedes neue Icon muss bei 32px noch als Silhouette lesbar sein.
- Keine Event- oder Ability-Datei darf ausserhalb von `assetManifest.ts` referenziert werden.
- Neue Gameplay-Illustrationen werden als transparente PNGs umgesetzt; SVG bleibt fuer kleine UI-Zeichen, Badges und leichte Texturen.
- Raster-Key-Art und PNG-Cutouts muessen unter dem `public/img`-Budget bleiben und im Manifest referenziert sein.
