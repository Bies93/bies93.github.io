# Legacy Assets

Dieser Ordner enthaelt den Asset-Stand vor dem Signature-Art-Rework.

## Inhalt

- `public_img_before_signature_rework/`: komplette alte `public/img`-Struktur.
- `audio_before_signature_rework/`: die vorhandenen komprimierten Musikdateien.

## Wiederherstellung

```bash
cp -a Legacy_Assets/public_img_before_signature_rework/. public/img/
cp -a Legacy_Assets/audio_before_signature_rework/. src/
npm run assets:check
npm run build
```

Die aktuellen Runtime-Assets bleiben im normalen Projektpfad. Dieser Ordner ist nur als Rueckfall-Snapshot gedacht.
