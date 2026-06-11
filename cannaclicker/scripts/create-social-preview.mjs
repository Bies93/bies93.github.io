import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const socialDir = resolve(root, 'public/img/social');
const keyArtPath = resolve(socialDir, 'cannabies-preview-keyart.png');
const keyArtUrl = `data:image/png;base64,${readFileSync(keyArtPath).toString('base64')}`;
const outputPath = resolve(socialDir, 'cannabies-preview.png');

mkdirSync(socialDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 1,
});

await page.setContent(
  `<!doctype html>
  <html lang="de">
    <head>
      <meta charset="utf-8" />
      <style>
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          width: 1200px;
          height: 630px;
          overflow: hidden;
          background: #06120c;
          font-family:
            Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .preview {
          position: relative;
          width: 1200px;
          height: 630px;
          overflow: hidden;
          color: #f7ffe8;
          background: #06120c;
        }

        .keyart {
          position: absolute;
          inset: 0;
          z-index: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
        }

        .preview::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: 1;
          background:
            linear-gradient(90deg, rgba(4, 10, 8, 0.98) 0%, rgba(4, 12, 9, 0.86) 34%, rgba(4, 12, 9, 0.18) 63%),
            radial-gradient(circle at 20% 28%, rgba(118, 255, 208, 0.22), transparent 28%),
            linear-gradient(180deg, rgba(255, 209, 90, 0.12), transparent 28%),
            repeating-linear-gradient(0deg, rgba(126, 255, 192, 0.055) 0 1px, transparent 1px 32px),
            repeating-linear-gradient(90deg, rgba(126, 255, 192, 0.045) 0 1px, transparent 1px 32px);
          pointer-events: none;
        }

        .preview::after {
          content: "";
          position: absolute;
          inset: 0;
          z-index: 3;
          box-shadow: inset 0 0 0 2px rgba(202, 255, 88, 0.2), inset 0 0 100px rgba(0, 0, 0, 0.62);
          pointer-events: none;
        }

        .content {
          position: absolute;
          left: 74px;
          top: 76px;
          width: 600px;
          z-index: 2;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 28px;
        }

        .mark {
          position: relative;
          width: 118px;
          height: 118px;
          flex: 0 0 auto;
          display: grid;
          place-items: center;
          border: 4px solid rgba(202, 255, 88, 0.9);
          border-radius: 22px;
          background:
            radial-gradient(circle at 66% 72%, rgba(255, 209, 90, 0.32), transparent 24%),
            linear-gradient(145deg, rgba(20, 201, 111, 0.88), rgba(5, 18, 12, 0.92) 62%);
          box-shadow:
            0 0 0 1px rgba(118, 255, 208, 0.3),
            0 24px 58px rgba(0, 0, 0, 0.48),
            0 0 38px rgba(25, 201, 111, 0.38),
            inset 0 1px 0 rgba(255, 255, 255, 0.24);
        }

        .mark span {
          font-size: 76px;
          line-height: 1;
          font-weight: 1000;
          letter-spacing: 0;
          color: #f7ffe8;
          text-shadow: 0 5px 0 rgba(4, 12, 9, 0.5), 0 0 20px rgba(118, 255, 208, 0.4);
        }

        .mark i {
          position: absolute;
          right: 15px;
          bottom: 16px;
          width: 31px;
          height: 31px;
          border: 3px solid #f7ffe8;
          border-radius: 50%;
          background: linear-gradient(135deg, #caff58, #19c96f 58%, #064a31);
          box-shadow: 0 0 17px rgba(202, 255, 88, 0.72);
        }

        .mark i::before {
          content: "";
          position: absolute;
          left: 13px;
          top: 4px;
          width: 3px;
          height: 20px;
          border-radius: 999px;
          background: rgba(5, 18, 12, 0.62);
        }

        h1 {
          margin: 0;
          font-size: 94px;
          line-height: 0.9;
          letter-spacing: 0;
          font-weight: 1000;
          color: #f7ffe8;
          text-shadow:
            0 5px 0 rgba(2, 6, 4, 0.72),
            0 0 32px rgba(118, 255, 208, 0.34);
        }

        h1 strong {
          color: #caff58;
        }

        .rule {
          width: 500px;
          height: 6px;
          margin: 30px 0 28px;
          border-radius: 999px;
          background: linear-gradient(90deg, #76ffd0, #caff58 48%, #ffd15a 72%, transparent);
          box-shadow: 0 0 20px rgba(118, 255, 208, 0.45);
        }

        .tagline {
          margin: 0;
          max-width: 540px;
          font-size: 43px;
          line-height: 1.12;
          font-weight: 850;
          letter-spacing: 0;
          color: #f4ffe3;
          text-shadow: 0 3px 18px rgba(0, 0, 0, 0.62);
        }

        .subline {
          margin: 24px 0 0;
          max-width: 540px;
          font-size: 25px;
          line-height: 1.25;
          font-weight: 780;
          letter-spacing: 0;
          color: #76ffd0;
          text-transform: uppercase;
          text-shadow: 0 2px 14px rgba(0, 0, 0, 0.62);
        }

        .badge {
          position: absolute;
          left: 78px;
          bottom: 66px;
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 15px 21px;
          border: 1px solid rgba(202, 255, 88, 0.42);
          border-radius: 999px;
          color: #f7ffe8;
          background: rgba(7, 19, 13, 0.72);
          box-shadow: 0 0 28px rgba(25, 201, 111, 0.24);
          font-size: 21px;
          font-weight: 860;
          letter-spacing: 0;
          z-index: 2;
        }

        .badge::before {
          content: "";
          width: 15px;
          height: 15px;
          border-radius: 50%;
          background: #caff58;
          box-shadow: 0 0 18px #caff58;
        }
      </style>
    </head>
    <body>
      <main class="preview" aria-label="CannaBies Social Preview">
        <img class="keyart" src="${keyArtUrl}" alt="" />
        <section class="content">
          <div class="brand">
            <div class="mark" aria-hidden="true"><span>B</span><i></i></div>
            <h1>Canna<strong>Bies</strong></h1>
          </div>
          <div class="rule"></div>
          <p class="tagline">Sowas wie CookieClicker in grün!</p>
          <p class="subline">Ein simples Idle Game mit legalen Pflanzen.</p>
        </section>
        <div class="badge">Freiherr Bies</div>
      </main>
    </body>
  </html>`,
  { waitUntil: 'networkidle' },
);

await page.locator('.keyart').evaluate(
  (image) =>
    image instanceof HTMLImageElement && image.complete
      ? Promise.resolve()
      : new Promise((resolve, reject) => {
          image.addEventListener('load', resolve, { once: true });
          image.addEventListener('error', reject, { once: true });
        }),
);

await page.locator('.preview').screenshot({ path: outputPath });
await browser.close();

console.log(`Social preview written: ${outputPath}`);
