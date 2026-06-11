# BiesyClicker v1.1 Audio Pack

Ziel: kurze, warme, weiche und variantenreiche Sounds, die Qualität geben, aber beim Idle-/Clicker-Spiel nicht nerven.

## Ordner

- `wav/` enthält die Master-Dateien zur Weiterbearbeitung.
- `ogg/` enthält Opus-Dateien als empfohlene Runtime-Version für moderne Browser.
- `mp3/music/` enthält MP3-Fallbacks für Musik-Layer.
- `manifest.audio.json` enthält Mapping- und Integrationshinweise.

## SFX-Mapping

### Click
- `click_leaf_soft_01..06`
- Empfehlung: zufällig wählen und zusätzlich PlaybackRate 0.96–1.04 verwenden.
- Lautstärke im Spiel eher niedrig halten. Clicks müssen bei schnellem Klicken angenehm bleiben.

### Buy
- `buy_normal_01..03`: normaler Kauf.
- `buy_important_01..02`: hoher Kaufwert, teures Upgrade, relevante Aktion.
- `buy_milestone_01..02`: Item-Milestone oder Achievement-ähnlicher Shopmoment.
- `buy_new_item_01..02`: neues Item freigeschaltet/erstmals gekauft.

### Events / Rewards
- `event_spawn_soft_01..03`: Event erscheint.
- `event_collect_soft_01..03`: Event eingesammelt.
- `reward_rare_gold_01..02`: seltener Reward, Rare Event, Legendary Achievement.

### Prestige
- `prestige_seed_ascend_01..02`: Prestige-/Ascension-Moment. Kurz, wertig, deutlich anders als normale Käufe.

### UI Extra
- `ui_soft_toggle_01`: Settings/Mute/kleine UI-Bestätigung.
- `ui_soft_deny_01`: dezente Ablehnung, z. B. nicht kaufbar. Sehr leise einsetzen.

## Musik-Layer

Alle Musik-Layer sind 24 Sekunden lang und bewusst leise gehalten:

- `music_early_base_loop_24s`: ruhiger Early-Loop.
- `music_mid_growth_layer_loop_24s`: dezenter Growth-/Midgame-Layer.
- `music_late_prestige_shimmer_layer_loop_24s`: sehr leiser Late-/Prestige-Schimmer.
- `music_event_pulse_layer_loop_24s`: optionaler Event-/Buff-Puls.

Empfohlene Ingame-Lautstärke:

- SFX: 0.30–0.45
- Musik: 0.12–0.25
- Event-/Rare-/Prestige-Sounds dürfen kurz etwas lauter wirken, aber nicht dauerhaft dominieren.

## Hinweise

Die Sounds sind synthetisch/prozedural erzeugt und als v1.1-Startpunkt gedacht. Für v1.2/2.0 kann daraus ein kuratiertes, professionell gemastertes Soundset entstehen.
