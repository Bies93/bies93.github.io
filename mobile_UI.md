# Mobile UI Audit

## Hintergrund & generelle Präsentation
- **Fehlende Hero-Grafik auf Smartphones:** Das Hintergrundbild `--hero-image` wird zwar in `mountRoot` gesetzt, aber durch den Media-Query erst ab `768px` Bildschirmbreite eingebunden. Dadurch fehlen auf Mobilgeräten die heroischen Pflanzenvisuals komplett.【F:cannaclicker/src/app/ui/mountRoot.ts†L35-L38】【F:cannaclicker/src/styles/index.css†L12-L33】  
  _Verbesserung:_ Eine abgespeckte Hero-Grafik für Mobilgeräte (z. B. kleinere Auflösung/Dateigröße) ergänzen oder einen alternativen Hintergrund definieren, der bereits unterhalb `768px` aktiv wird.
- **Fixierte HUD-Meldungen kollidieren mit dem Header:** Das HUD wird per `position: fixed` direkt unterhalb der Statusleiste platziert. Auf kleinen Displays überlagern Toasts damit Teile des Logos oder der Navigations-Buttons.【F:cannaclicker/src/app/ui/mountRoot.ts†L40-L47】  
  _Verbesserung:_ Abstand dynamisch an die Header-Höhe koppeln oder Toasts für Mobilgeräte weiter unten (z. B. unterhalb der Klicker-Karte) anzeigen.

## Header & globale Steuerung
- **Übergroßer Schriftzug im Landscape-Modus:** Der Schriftzug „CannaBies“ hat eine Mindestgröße von `2.6rem` plus großzügige Innenabstände und Effekte, wodurch er im quer gehaltenen Smartphone von den Bedienelementen verdrängt wird.【F:cannaclicker/src/styles/index.css†L272-L335】【F:cannaclicker/src/app/ui/mountHeader.ts†L5-L41】  
  _Verbesserung:_ Eigene Breakpoints für Mobilgeräte hinzufügen (z. B. kleinere Schrift- und Paddingwerte unterhalb `640px`) oder den Titel auf zwei Zeilen umbrechen lassen.
- **Bedienleiste zwingt zum Horizontal-Scrollen:** Die Steuerleiste ist `flex-nowrap` und enthält vier Buttons mit großen Rändern; Labels werden auf kleinen Bildschirmen komplett verborgen, wodurch nur Icons übrig bleiben.【F:cannaclicker/src/app/ui/mountHeader.ts†L30-L38】【F:cannaclicker/src/app/ui/components/controls.ts†L21-L55】  
  _Verbesserung:_ Die Buttons kompakter gestalten, Texte via `sr-only` behalten oder ein Overflow-Menü („⋮“) für Mobilgeräte vorsehen.

## Info-Ribbon & Statistiken
- **Stat-Kacheln stapeln sich zu hoch:** Jede Kachel benötigt mindestens `13rem` Breite; auf schmalen Displays führt das zu sehr vielen Zeilen und drängt den eigentlichen Spielfokus nach unten.【F:cannaclicker/src/styles/index.css†L183-L211】  
  _Verbesserung:_ Für Mobilgeräte kleinere Mindestbreiten festlegen oder auf ein horizontales Scroll-Carousel umstellen.
- **Prestige-Badge konkurriert um Platz:** Das Prestige-Abzeichen ist fest rechts ausgerichtet; bei wenig horizontalem Raum landet es in einer eigenen Zeile und erzeugt visuelle Unruhe.【F:cannaclicker/src/styles/index.css†L213-L260】  
  _Verbesserung:_ Badge bei kleinen Viewports unterhalb der Statistik-Liste platzieren oder neben dem Titel ankern.

## Klicker-Karte
- **Interaktionsfläche zu groß:** Der Klick-Button hat eine Mindesthöhe von `18rem` und das Pflanzen-Icon mindestens `12rem` Breite/Höhe. Auf kleinen Geräten bleibt dadurch kaum Platz für übrigen Inhalt, insbesondere in Landscape.【F:cannaclicker/src/styles/index.css†L78-L118】  
  _Verbesserung:_ Unterhalb von ~`480px` Viewportbreite kleinere Clamp-Werte nutzen oder einen gestauchten Kompaktmodus anbieten.
- **Stark gespannter Tracking-Text:** Die Beschriftung `click-label` nutzt `letter-spacing: 0.45em`, was auf kleinen Displays abgeschnitten wirken kann.【F:cannaclicker/src/styles/index.css†L123-L127】  
  _Verbesserung:_ Letter-Spacing für Mobilgeräte reduzieren oder dynamisch am verfügbaren Platz ausrichten.

## Seitliches Panel (Shop/Upgrades/Research)
- **Tabs mit großer Laufweite brechen unschön um:** Die Tab-Leiste hat `flex-1` plus `tracking-[0.3em]` und `whitespace-nowrap`; lange Texte wie „ACHIEVEMENTS“ erzeugen unharmonische Umbrüche oder horizontales Scrollen.【F:cannaclicker/src/styles/index.css†L850-L864】  
  _Verbesserung:_ Letter-Spacing auf Mobilgeräten reduzieren, Icons ergänzen oder die Tabs als horizontale Scroll-Leiste anlegen.
- **Filter-Pills schwer zu treffen:** Forschung-Filter sind klein, dicht beieinander und verwenden ebenfalls starkes Letter-Spacing, was Touch-Trefferflächen reduziert.【F:cannaclicker/src/styles/index.css†L614-L624】  
  _Verbesserung:_ Größere Padding-Werte bzw. Buttons mit voller Breite für Mobilgeräte bereitstellen.

## Weitere Beobachtungen
- **Hohe Grund-Paddingwerte:** Viele Karten (z. B. Info-Ribbon, Ability-Buttons, Upgrade-Karten) nutzen großzügige Abstände, die auf kleinen Displays zu unnötiger Scroll-Länge führen.【F:cannaclicker/src/styles/index.css†L183-L371】【F:cannaclicker/src/styles/index.css†L544-L575】  
  _Verbesserung:_ Utility-Klassen oder Media Queries einsetzen, um Padding und Schatten auf Mobilgeräten zu reduzieren.
- **Fehlende Touch-Feedbacks:** Einige Elemente (z. B. Filter-Pills, Tabs) nutzen Hover-Zustände als primäres Feedback, bieten aber keinen expliziten `:active`- oder `:focus-visible`-Fallback für Touch.【F:cannaclicker/src/styles/index.css†L618-L624】【F:cannaclicker/src/styles/index.css†L858-L864】  
  _Verbesserung:_ Mobile-spezifische Active- und Focus-Stile ergänzen, um Nutzenden auch ohne Hover ein Feedback zu geben.

Diese Punkte decken die größten Pain-Points der aktuellen Oberfläche auf Smartphones ab und liefern konkrete Anhaltspunkte für Verbesserungen.
