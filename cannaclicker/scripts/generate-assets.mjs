import { mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, '../public/img');
const rasterizedAssetDirs = ['items', 'upgrades', 'research', 'events', 'abilities', 'plant'];
const pngReplacedUiSvgAssets = [
  'ui/achievement-base.svg',
  'ui/achievement-leaf.svg',
  'ui/achievement-light.svg',
  'ui/achievement-ribbon.svg',
  'ui/auto.svg',
  'ui/bpc.svg',
  'ui/bps.svg',
  'ui/export.svg',
  'ui/import.svg',
  'ui/leaf.svg',
  'ui/prestige.svg',
  'ui/research.svg',
  'ui/reset.svg',
  'ui/seeds.svg',
  'ui/shop.svg',
  'ui/sound-off.svg',
  'ui/sound-on.svg',
  'ui/total.svg',
  'ui/upgrade.svg',
  'ui/warning.svg',
];
const obsoleteAssets = [
  'fx',
  'ui/achievement-pot.svg',
  'ui/buy.svg',
  'ui/close.svg',
  'ui/info.svg',
  'ui/locked.svg',
  'ui/settings.svg',
  'ui/stats.svg',
  ...pngReplacedUiSvgAssets,
];

const palette = {
  ink: '#07130d',
  deep: '#050b08',
  panel: '#10251a',
  wash: '#173727',
  paper: '#f4ffe3',
  green: '#19c96f',
  mint: '#76ffd0',
  lime: '#caff58',
  gold: '#ffd15a',
  amber: '#ff9f43',
  blue: '#71c7ff',
  violet: '#b58cff',
  rose: '#ff7d8a',
  red: '#ff6b5f',
  cream: '#f7ffe8',
};

function ensure(filePath) {
  mkdirSync(path.dirname(filePath), { recursive: true });
}

function writeAsset(file, content) {
  if (isRasterizedSvgOutput(file)) {
    return;
  }

  if (pngReplacedUiSvgAssets.includes(file)) {
    return;
  }

  const target = path.join(outDir, file);
  ensure(target);
  writeFileSync(target, content.trimStart());
}

function removeObsoleteAssets() {
  for (const assetPath of obsoleteAssets) {
    rmSync(path.join(outDir, assetPath), { force: true, recursive: true });
  }
  removeRasterizedSvgOutputs();
}

function isRasterizedSvgOutput(file) {
  return (
    file.endsWith('.svg') &&
    rasterizedAssetDirs.some((dir) => file === `${dir}.svg` || file.startsWith(`${dir}/`))
  );
}

function removeRasterizedSvgOutputs() {
  for (const dir of rasterizedAssetDirs) {
    const targetDir = path.join(outDir, dir);
    let entries = [];
    try {
      entries = readdirSync(targetDir, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith('.svg')) {
        rmSync(path.join(targetDir, entry.name), { force: true });
      }
    }
  }
}

function svg(viewBox, body, label = 'BiesyClicker asset') {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" role="img" aria-label="${label}">
  <defs>
    <filter id="softShadow" x="-30%" y="-30%" width="160%" height="170%">
      <feDropShadow dx="0" dy="7" stdDeviation="5" flood-color="#000" flood-opacity=".28"/>
    </filter>
    <filter id="brushRough" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency=".032" numOctaves="2" seed="8" result="noise"/>
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.6" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
    <filter id="inkBleed" x="-18%" y="-18%" width="136%" height="136%">
      <feGaussianBlur in="SourceAlpha" stdDeviation=".55" result="blur"/>
      <feOffset dy=".45" result="offset"/>
      <feMerge>
        <feMergeNode in="offset"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <filter id="paperGrain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency=".72" numOctaves="3" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values=".18"/>
      <feComponentTransfer>
        <feFuncA type="table" tableValues="0 .13"/>
      </feComponentTransfer>
    </filter>
    <linearGradient id="leafGradient" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="${palette.paper}"/>
      <stop offset=".18" stop-color="${palette.lime}"/>
      <stop offset=".58" stop-color="${palette.green}"/>
      <stop offset="1" stop-color="#0c7f46"/>
    </linearGradient>
    <linearGradient id="goldGradient" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="#fff0a8"/>
      <stop offset=".55" stop-color="${palette.gold}"/>
      <stop offset="1" stop-color="${palette.amber}"/>
    </linearGradient>
    <linearGradient id="glassGradient" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="#e8fff8" stop-opacity=".95"/>
      <stop offset=".55" stop-color="${palette.mint}" stop-opacity=".72"/>
      <stop offset="1" stop-color="${palette.blue}" stop-opacity=".48"/>
    </linearGradient>
  </defs>
  ${body}
</svg>`;
}

function shell(content, accent = palette.green, label = 'BiesyClicker icon') {
  return svg(
    '0 0 128 128',
    `<g filter="url(#softShadow)">
      <path d="M64 7c14 2 33 11 45 25 6 17 2 39-6 55-12 17-25 28-39 34-18-6-33-17-44-36-7-18-5-38 3-55C35 18 49 9 64 7Z" fill="${palette.deep}" stroke="${accent}" stroke-width="4.6" stroke-linejoin="round" filter="url(#brushRough)"/>
      <path d="M64 15c12 2 27 10 36 21 4 13 2 30-5 43-9 13-20 22-31 27-14-5-26-13-35-28-5-14-4-29 2-42 9-10 21-18 33-21Z" fill="${palette.panel}" opacity=".96"/>
      <path d="M31 37c10-11 22-17 34-18 10 2 20 7 29 14-18-3-38 2-62 16Z" fill="${accent}" opacity=".13"/>
      <path d="M25 83c12 20 24 29 39 35 15-7 27-17 39-34-22 11-52 13-78-1Z" fill="#000" opacity=".2"/>
      <g filter="url(#inkBleed)">${content}</g>
      <path d="M34 96c16 12 43 12 60-1" fill="none" stroke="${accent}" stroke-width="3.4" stroke-linecap="round" opacity=".72"/>
      <path d="M37 30c9-7 18-11 28-12M94 42c5 11 5 23 0 36M31 76c-4-14-3-26 2-38" fill="none" stroke="${palette.cream}" stroke-width="1.6" stroke-linecap="round" opacity=".34"/>
      <circle cx="33" cy="92" r="1.8" fill="${accent}" opacity=".62"/>
      <circle cx="101" cy="37" r="1.4" fill="${palette.cream}" opacity=".45"/>
      <circle cx="50" cy="22" r="1.1" fill="${palette.cream}" opacity=".35"/>
    </g>`,
    label,
  );
}

function uiShell(content, accent = palette.mint, label = 'BiesyClicker UI icon') {
  return svg(
    '0 0 64 64',
    `<g filter="url(#inkBleed)">
      <path d="M32 5c8 0 17 4 23 11 4 10 3 23-2 32-7 7-14 10-22 11-9-1-17-5-23-13-4-10-3-21 2-31C16 9 24 5 32 5Z" fill="${palette.deep}" stroke="${accent}" stroke-width="2.8" opacity=".96" filter="url(#brushRough)"/>
      <path d="M17 16c8-7 19-8 31-2" fill="none" stroke="${palette.cream}" stroke-width="1.2" stroke-linecap="round" opacity=".25"/>
      <g fill="none" stroke="${accent}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
        ${content}
      </g>
    </g>`,
    label,
  );
}

function leaf(x, y, scale = 1, rotate = 0, fill = 'url(#leafGradient)') {
  return `<g transform="translate(${x} ${y}) rotate(${rotate}) scale(${scale})">
    <path d="M0-18C16-15 24-3 20 9 8 10 0 0 0-18Z" fill="${fill}" stroke="${palette.cream}" stroke-width="${1.2 / scale}" opacity=".97" filter="url(#brushRough)"/>
    <path d="M1-14c7 7 11 13 16 21" fill="none" stroke="${palette.deep}" stroke-width="${1.45 / scale}" stroke-linecap="round" opacity=".34"/>
    <path d="M7-8c5 1 9 4 12 9M6-2c4 1 7 3 10 7" fill="none" stroke="${palette.paper}" stroke-width="${0.72 / scale}" stroke-linecap="round" opacity=".55"/>
  </g>`;
}

const itemGlyphs = {
  seedling: `${leaf(50, 64, 0.9, -34)}${leaf(76, 64, 0.9, 34)}<path d="M64 84V53" stroke="${palette.mint}" stroke-width="7" stroke-linecap="round"/>`,
  planter: `<path d="M36 63h56l-8 29H44Z" fill="${palette.amber}" stroke="${palette.cream}" stroke-width="4" stroke-linejoin="round"/>${leaf(56, 56, 0.75, -36)}${leaf(73, 55, 0.75, 38)}<path d="M64 67V39" stroke="${palette.mint}" stroke-width="6" stroke-linecap="round"/>`,
  grow_tent: `<path d="M33 91 64 31l31 60Z" fill="#174531" stroke="${palette.mint}" stroke-width="5" stroke-linejoin="round"/><path d="M64 31v60" stroke="${palette.lime}" stroke-width="4"/><path d="M49 91 64 58l15 33" fill="none" stroke="${palette.green}" stroke-width="4"/>`,
  grow_light: `<path d="M42 38h44l-9 22H51Z" fill="${palette.gold}" stroke="${palette.cream}" stroke-width="4" stroke-linejoin="round"/><path d="M48 72h32" stroke="${palette.lime}" stroke-width="6" stroke-linecap="round"/><path d="M50 84h28" stroke="${palette.green}" stroke-width="5" stroke-linecap="round"/><path d="M64 28v10" stroke="${palette.mint}" stroke-width="5"/>`,
  cultivator: `<circle cx="64" cy="42" r="13" fill="${palette.gold}" stroke="${palette.cream}" stroke-width="4"/><path d="M41 89c4-22 42-22 46 0" fill="${palette.green}" stroke="${palette.cream}" stroke-width="4"/><path d="M40 62h48" stroke="${palette.mint}" stroke-width="5" stroke-linecap="round"/><path d="M48 72h32" stroke="${palette.ink}" stroke-width="4" stroke-linecap="round" opacity=".45"/>`,
  irrigation_system: `<path d="M35 49h46c9 0 14 5 14 13s-5 13-14 13H47" fill="none" stroke="${palette.mint}" stroke-width="8" stroke-linecap="round"/><path d="M39 83c10-7 21-7 32 0" fill="none" stroke="${palette.blue}" stroke-width="5" stroke-linecap="round"/><path d="M50 66c-7 9-7 16 0 20 7-4 7-11 0-20Z" fill="${palette.blue}"/>`,
  co2_tank: `<rect x="47" y="31" width="34" height="61" rx="12" fill="#1d6950" stroke="${palette.cream}" stroke-width="4"/><path d="M55 28h18" stroke="${palette.mint}" stroke-width="6" stroke-linecap="round"/><text x="64" y="68" text-anchor="middle" font-family="Arial, sans-serif" font-size="19" font-weight="700" fill="${palette.cream}">CO2</text>`,
  climate_controller: `<rect x="38" y="36" width="52" height="50" rx="10" fill="#153a31" stroke="${palette.mint}" stroke-width="4"/><circle cx="64" cy="61" r="14" fill="none" stroke="${palette.gold}" stroke-width="5"/><path d="M64 61 74 53" stroke="${palette.cream}" stroke-width="5" stroke-linecap="round"/><path d="M46 48h12M70 80h10" stroke="${palette.green}" stroke-width="4" stroke-linecap="round"/>`,
  hydroponic_rack: `<path d="M35 43h58M35 64h58M35 85h58" stroke="${palette.mint}" stroke-width="6" stroke-linecap="round"/><path d="M43 38v52M85 38v52" stroke="${palette.green}" stroke-width="5" stroke-linecap="round"/>${leaf(51, 56, 0.45, -28)}${leaf(74, 77, 0.5, 30)}<path d="M64 45c-6 8-6 14 0 18 6-4 6-10 0-18Z" fill="${palette.blue}"/>`,
  genetics_lab: `<path d="M55 34v24L42 87h44L73 58V34" fill="url(#glassGradient)" stroke="${palette.cream}" stroke-width="4" stroke-linejoin="round"/><path d="M52 34h24" stroke="${palette.mint}" stroke-width="6" stroke-linecap="round"/><path d="M55 76c8-8 18 8 26 0M55 65c8 8 18-8 26 0" stroke="${palette.violet}" stroke-width="4" stroke-linecap="round"/>`,
  trimming_robot: `<rect x="39" y="39" width="50" height="40" rx="10" fill="#173e35" stroke="${palette.mint}" stroke-width="4"/><circle cx="55" cy="58" r="5" fill="${palette.lime}"/><circle cx="73" cy="58" r="5" fill="${palette.lime}"/><path d="M53 74h22" stroke="${palette.cream}" stroke-width="4" stroke-linecap="round"/><path d="M43 89 61 76M85 89 67 76" stroke="${palette.gold}" stroke-width="5" stroke-linecap="round"/>`,
  micro_greenhouse: `<path d="M35 86V58c0-18 58-18 58 0v28Z" fill="url(#glassGradient)" stroke="${palette.cream}" stroke-width="4"/><path d="M42 86h44" stroke="${palette.green}" stroke-width="7" stroke-linecap="round"/>${leaf(58, 73, 0.58, -32)}${leaf(72, 72, 0.58, 34)}<path d="M64 80V58" stroke="${palette.green}" stroke-width="5" stroke-linecap="round"/>`,
};

const itemAccents = {
  seedling: palette.lime,
  planter: palette.amber,
  grow_tent: palette.green,
  grow_light: palette.gold,
  cultivator: palette.mint,
  irrigation_system: palette.blue,
  co2_tank: palette.mint,
  climate_controller: palette.blue,
  hydroponic_rack: palette.lime,
  genetics_lab: palette.violet,
  trimming_robot: palette.gold,
  micro_greenhouse: palette.mint,
};

for (const [id, glyph] of Object.entries(itemGlyphs)) {
  writeAsset(
    `items/${id}.svg`,
    shell(glyph, itemAccents[id] ?? palette.green, `BiesyClicker item ${id}`),
  );
}

const upgradeGlyphs = {
  'building-boost': `<path d="M38 83h52" stroke="${palette.lime}" stroke-width="8" stroke-linecap="round"/><path d="M45 75 64 37l19 38Z" fill="${palette.green}" stroke="${palette.cream}" stroke-width="4"/><path d="M64 37v34" stroke="${palette.ink}" stroke-width="5" opacity=".35"/>`,
  'global-bps': `<circle cx="64" cy="64" r="28" fill="none" stroke="${palette.lime}" stroke-width="7"/><path d="M64 36v28l19 13" stroke="${palette.cream}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`,
  'click-power': `<path d="M45 83 58 33h19L67 57h18L54 96l9-30H47Z" fill="${palette.gold}" stroke="${palette.cream}" stroke-width="4" stroke-linejoin="round"/>`,
  automation: `<rect x="40" y="41" width="48" height="38" rx="10" fill="${palette.panel}" stroke="${palette.mint}" stroke-width="4"/><path d="M50 61h28M64 47v28" stroke="${palette.lime}" stroke-width="5" stroke-linecap="round"/><circle cx="64" cy="61" r="20" fill="none" stroke="${palette.green}" stroke-width="4" stroke-dasharray="5 7"/>`,
  'cost-efficiency': `<path d="M75 36 42 91" stroke="${palette.gold}" stroke-width="8" stroke-linecap="round"/><circle cx="49" cy="45" r="10" fill="none" stroke="${palette.cream}" stroke-width="5"/><circle cx="79" cy="82" r="10" fill="none" stroke="${palette.cream}" stroke-width="5"/>`,
};

for (const [id, glyph] of Object.entries(upgradeGlyphs)) {
  writeAsset(`upgrades/${id}.svg`, shell(glyph, palette.gold, `BiesyClicker upgrade ${id}`));
}

const researchGlyphs = {
  growth: `${leaf(57, 63, 0.62, -33)}${leaf(72, 62, 0.62, 35)}<path d="M64 84V44" stroke="${palette.mint}" stroke-width="6" stroke-linecap="round"/><circle cx="64" cy="64" r="31" fill="none" stroke="${palette.green}" stroke-width="4" stroke-dasharray="4 8"/>`,
  automation: `<path d="M43 51h42v28H43Z" fill="${palette.panel}" stroke="${palette.mint}" stroke-width="4"/><path d="M51 61h26M51 70h18" stroke="${palette.lime}" stroke-width="4" stroke-linecap="round"/><path d="M64 35v13" stroke="${palette.gold}" stroke-width="5" stroke-linecap="round"/>`,
  costcut: upgradeGlyphs['cost-efficiency'],
  overdrive: `<path d="M44 86c11-34 24-48 40-56-4 22-13 37-27 45 12-2 21-6 29-13-8 16-21 25-42 24Z" fill="url(#leafGradient)" stroke="${palette.cream}" stroke-width="4"/>`,
  strain: `<path d="M45 84c24-46 38 5 0-42M83 84c-24-46-38 5 0-42" fill="none" stroke="${palette.violet}" stroke-width="5" stroke-linecap="round"/><path d="M49 50h30M49 68h30" stroke="${palette.mint}" stroke-width="4" stroke-linecap="round"/>`,
  seeds: `<ellipse cx="54" cy="61" rx="12" ry="20" fill="${palette.gold}" stroke="${palette.cream}" stroke-width="4" transform="rotate(-24 54 61)"/><ellipse cx="76" cy="65" rx="12" ry="20" fill="${palette.lime}" stroke="${palette.cream}" stroke-width="4" transform="rotate(23 76 65)"/>`,
  offline: `<circle cx="64" cy="64" r="28" fill="none" stroke="${palette.blue}" stroke-width="6"/><path d="M64 48v18l14 9" stroke="${palette.cream}" stroke-width="5" stroke-linecap="round"/><path d="M43 38 34 28M85 38l9-10" stroke="${palette.mint}" stroke-width="5" stroke-linecap="round"/>`,
};

for (const [id, glyph] of Object.entries(researchGlyphs)) {
  writeAsset(`research/${id}.svg`, shell(glyph, palette.mint, `BiesyClicker research ${id}`));
}

const eventGlyphs = {
  'golden-bud': `${leaf(50, 64, 0.75, -35, 'url(#goldGradient)')}${leaf(76, 64, 0.75, 35, 'url(#goldGradient)')}<circle cx="64" cy="64" r="12" fill="${palette.gold}" stroke="${palette.cream}" stroke-width="4"/>`,
  'seed-pack': `<path d="M39 42h50l-5 50H44Z" fill="${palette.gold}" stroke="${palette.cream}" stroke-width="4" stroke-linejoin="round"/><path d="M48 55h32" stroke="${palette.green}" stroke-width="5"/><ellipse cx="64" cy="73" rx="11" ry="16" fill="${palette.lime}" stroke="${palette.ink}" stroke-width="2"/>`,
  'lucky-joint': `<path d="M36 76 82 48" stroke="${palette.cream}" stroke-width="11" stroke-linecap="round"/><path d="M75 52 91 42" stroke="${palette.gold}" stroke-width="11" stroke-linecap="round"/><path d="M45 70c3-14 13-23 28-26" fill="none" stroke="${palette.violet}" stroke-width="4" stroke-linecap="round"/>`,
  'fertile-rain': `<path d="M42 46c9-18 35-18 44 0 12 1 19 9 19 20 0 13-10 21-24 21H48c-14 0-24-8-24-21 0-11 7-19 18-20Z" fill="url(#glassGradient)" stroke="${palette.cream}" stroke-width="4"/><path d="M49 94c-5 8-5 13 0 17 5-4 5-9 0-17ZM65 91c-5 8-5 13 0 17 5-4 5-9 0-17ZM81 94c-5 8-5 13 0 17 5-4 5-9 0-17Z" fill="${palette.blue}"/>`,
  'market-rush': `<path d="M38 84h52V54H38Z" fill="${palette.gold}" stroke="${palette.cream}" stroke-width="4"/><path d="M34 54h60l-8-17H42Z" fill="${palette.red}" stroke="${palette.cream}" stroke-width="4"/><path d="M51 69h26" stroke="${palette.ink}" stroke-width="5" stroke-linecap="round"/>`,
  'green-surge': `<path d="M64 30 86 71H70l10 27-38-44h17Z" fill="${palette.lime}" stroke="${palette.cream}" stroke-width="4" stroke-linejoin="round"/><circle cx="64" cy="64" r="38" fill="none" stroke="${palette.green}" stroke-width="5" opacity=".55"/>`,
  'mutant-sprout': `${leaf(49, 65, 0.67, -55, palette.red)}${leaf(64, 56, 0.72, 0, palette.violet)}${leaf(79, 65, 0.67, 55, palette.blue)}<path d="M64 88V46" stroke="${palette.lime}" stroke-width="6" stroke-linecap="round"/>`,
  'supply-drop': `<path d="M39 54h50v38H39Z" fill="${palette.panel}" stroke="${palette.cream}" stroke-width="4"/><path d="M43 54 64 39l21 15M64 39v53M39 69h50" stroke="${palette.gold}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`,
  'flash-harvest': `<path d="M37 86c14-35 29-48 52-54-5 25-19 43-41 52 15 1 29-3 40-13-10 18-27 26-51 15Z" fill="url(#goldGradient)" stroke="${palette.cream}" stroke-width="4"/><path d="M58 34 49 58h16l-12 34 31-45H67l10-13Z" fill="${palette.lime}" stroke="${palette.cream}" stroke-width="3" stroke-linejoin="round"/>`,
  'calm-growth': `${leaf(50, 73, 0.65, -42)}${leaf(78, 73, 0.65, 42)}<path d="M64 88V42" stroke="${palette.mint}" stroke-width="6" stroke-linecap="round"/><circle cx="64" cy="60" r="31" fill="none" stroke="${palette.blue}" stroke-width="5" stroke-dasharray="5 9" opacity=".85"/>`,
  overgrowth: `${leaf(42, 77, 0.9, -60)}${leaf(55, 64, 0.82, -30)}${leaf(73, 61, 0.82, 30)}${leaf(88, 77, 0.9, 60)}<path d="M64 93V35" stroke="${palette.green}" stroke-width="8" stroke-linecap="round"/><path d="M39 91c17 10 33 10 50 0" stroke="${palette.lime}" stroke-width="5" stroke-linecap="round"/>`,
  'seed-bloom': `<ellipse cx="51" cy="69" rx="12" ry="20" fill="${palette.gold}" stroke="${palette.cream}" stroke-width="4" transform="rotate(-24 51 69)"/><ellipse cx="77" cy="70" rx="12" ry="20" fill="${palette.lime}" stroke="${palette.cream}" stroke-width="4" transform="rotate(24 77 70)"/><circle cx="64" cy="52" r="15" fill="url(#goldGradient)" stroke="${palette.cream}" stroke-width="4"/><path d="M64 92V61" stroke="${palette.mint}" stroke-width="6" stroke-linecap="round"/>`,
  'tiny-spark': `<path d="M64 31 74 55h25L79 69l8 27-23-16-23 16 8-27-20-14h25Z" fill="${palette.gold}" stroke="${palette.cream}" stroke-width="4" stroke-linejoin="round"/>`,
  'dew-drop': `<path d="M64 31c19 24 27 38 27 52 0 16-12 27-27 27S37 99 37 83c0-14 8-28 27-52Z" fill="url(#glassGradient)" stroke="${palette.cream}" stroke-width="4"/><path d="M54 77c5 7 13 10 22 7" fill="none" stroke="${palette.blue}" stroke-width="4" stroke-linecap="round"/>`,
  'compost-cache': `<path d="M38 50h52l-6 41H44Z" fill="${palette.amber}" stroke="${palette.cream}" stroke-width="4" stroke-linejoin="round"/><path d="M49 50c3-15 27-15 30 0" fill="none" stroke="${palette.lime}" stroke-width="5" stroke-linecap="round"/>${leaf(58, 72, 0.46, -24)}${leaf(72, 73, 0.46, 28)}`,
  sunbeam: `<circle cx="64" cy="64" r="18" fill="url(#goldGradient)" stroke="${palette.cream}" stroke-width="4"/><path d="M64 26v16M64 86v16M26 64h16M86 64h16M38 38l11 11M79 79l11 11M90 38 79 49M49 79 38 90" stroke="${palette.gold}" stroke-width="5" stroke-linecap="round"/>`,
  'mega-bud': `${leaf(45, 71, 0.92, -44, 'url(#goldGradient)')}${leaf(83, 71, 0.92, 44, 'url(#goldGradient)')}<ellipse cx="64" cy="64" rx="18" ry="24" fill="${palette.gold}" stroke="${palette.cream}" stroke-width="4"/><path d="M64 91V39" stroke="${palette.lime}" stroke-width="6" stroke-linecap="round"/>`,
  'jackpot-canopy': `<path d="M37 82c14-38 42-55 79-44-8 38-38 57-79 44Z" fill="url(#goldGradient)" stroke="${palette.cream}" stroke-width="4"/><path d="M43 87h42M49 98h30" stroke="${palette.gold}" stroke-width="6" stroke-linecap="round"/><circle cx="86" cy="45" r="9" fill="${palette.lime}" stroke="${palette.cream}" stroke-width="3"/>`,
  'aurora-bloom': `<path d="M36 90c11-40 31-61 56-64-2 23-10 39-24 49 13-3 24-9 33-18-5 23-25 36-65 33Z" fill="url(#leafGradient)" stroke="${palette.cream}" stroke-width="4"/><path d="M38 39c20-12 45-12 64 0M43 52c16-8 34-8 50 0" stroke="${palette.violet}" stroke-width="5" stroke-linecap="round" opacity=".9"/>`,
  'trail-marker': `<path d="M37 44h46l12 18-12 18H37l12-18Z" fill="${palette.panel}" stroke="${palette.blue}" stroke-width="4" stroke-linejoin="round"/><circle cx="57" cy="62" r="7" fill="${palette.lime}"/><path d="M68 62h18" stroke="${palette.gold}" stroke-width="5" stroke-linecap="round"/>`,
  'cascade-bloom': `<path d="M41 36c9 9 9 18 0 27 9 9 9 18 0 27M64 36c9 9 9 18 0 27 9 9 9 18 0 27M87 36c9 9 9 18 0 27 9 9 9 18 0 27" fill="none" stroke="${palette.blue}" stroke-width="6" stroke-linecap="round"/><circle cx="64" cy="64" r="12" fill="${palette.lime}" stroke="${palette.cream}" stroke-width="3"/>`,
  'echo-harvest': `<circle cx="64" cy="64" r="16" fill="${palette.gold}" stroke="${palette.cream}" stroke-width="4"/><path d="M38 50c-12 12-12 28 0 40M90 50c12 12 12 28 0 40M28 39c-22 22-22 48 0 70M100 39c22 22 22 48 0 70" fill="none" stroke="${palette.mint}" stroke-width="4" stroke-linecap="round" opacity=".85"/>`,
  'volatile-growth': `${leaf(46, 74, 0.72, -52, palette.red)}${leaf(64, 58, 0.78, 0, palette.lime)}${leaf(82, 74, 0.72, 52, palette.violet)}<path d="M64 91V39" stroke="${palette.red}" stroke-width="7" stroke-linecap="round"/><path d="M50 37 60 50 48 53 64 75" fill="none" stroke="${palette.gold}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`,
  'blackout-sale': `<path d="M38 86h52V54H38Z" fill="#111827" stroke="${palette.cream}" stroke-width="4"/><path d="M34 54h60l-8-18H42Z" fill="${palette.violet}" stroke="${palette.cream}" stroke-width="4"/><path d="M52 71h24M58 83h12" stroke="${palette.gold}" stroke-width="5" stroke-linecap="round"/><path d="M42 38 86 92" stroke="${palette.red}" stroke-width="4" stroke-linecap="round" opacity=".75"/>`,
  'pest-scare': `<path d="M64 32c18 12 27 29 27 51-14 10-40 10-54 0 0-22 9-39 27-51Z" fill="${palette.panel}" stroke="${palette.red}" stroke-width="4"/><circle cx="55" cy="63" r="5" fill="${palette.gold}"/><circle cx="73" cy="63" r="5" fill="${palette.gold}"/><path d="M47 82c10-8 24-8 34 0M38 57l-12-8M90 57l12-8" stroke="${palette.cream}" stroke-width="4" stroke-linecap="round"/>`,
  'solstice-seed': `<ellipse cx="64" cy="69" rx="16" ry="25" fill="url(#goldGradient)" stroke="${palette.cream}" stroke-width="4"/><path d="M64 23v17M64 98v8M34 43l12 11M94 43 82 54M27 72h15M86 72h15" stroke="${palette.gold}" stroke-width="5" stroke-linecap="round"/>`,
  'night-market': `<path d="M38 84h52V55H38Z" fill="#14213d" stroke="${palette.cream}" stroke-width="4"/><path d="M34 55h60l-10-18H44Z" fill="${palette.violet}" stroke="${palette.cream}" stroke-width="4"/><path d="M50 70h28" stroke="${palette.gold}" stroke-width="5" stroke-linecap="round"/><path d="M82 31c-13 4-22-5-19-18-12 8-13 28 5 35" fill="${palette.gold}" opacity=".9"/>`,
  'festival-lantern': `<path d="M48 42h32l8 17-8 33H48l-8-33Z" fill="url(#goldGradient)" stroke="${palette.cream}" stroke-width="4" stroke-linejoin="round"/><path d="M52 35h24M52 99h24M64 35v64" stroke="${palette.violet}" stroke-width="4" stroke-linecap="round"/><circle cx="64" cy="68" r="9" fill="${palette.lime}" opacity=".85"/>`,
};

for (const [id, glyph] of Object.entries(eventGlyphs)) {
  const accent =
    id.includes('blackout') || id.includes('volatile') || id.includes('pest')
      ? palette.red
      : id.includes('market') || id.includes('festival') || id.includes('aurora')
        ? palette.violet
        : id.includes('cascade') || id.includes('echo') || id.includes('trail')
          ? palette.blue
          : id === 'mutant-sprout'
            ? palette.red
            : palette.gold;
  writeAsset(`events/${id}.svg`, shell(glyph, accent, `BiesyClicker event ${id}`));
}

const abilityGlyphs = {
  overdrive: `<path d="M42 88c12-38 26-51 48-59-5 27-18 45-39 53 13 1 24-2 34-10-10 18-25 25-43 16Z" fill="url(#leafGradient)" stroke="${palette.cream}" stroke-width="4"/><path d="M62 34 53 60h15l-12 34 30-46H70l9-14Z" fill="${palette.gold}" stroke="${palette.cream}" stroke-width="3" stroke-linejoin="round"/>`,
  burst: `<path d="M45 83 58 33h19L67 57h18L54 96l9-30H47Z" fill="${palette.gold}" stroke="${palette.cream}" stroke-width="4" stroke-linejoin="round"/><circle cx="64" cy="64" r="36" fill="none" stroke="${palette.lime}" stroke-width="4" stroke-dasharray="4 8" opacity=".72"/>`,
  'auto-burst': `<rect x="39" y="41" width="50" height="39" rx="11" fill="${palette.panel}" stroke="${palette.mint}" stroke-width="4"/><path d="M51 61h26M64 49v24" stroke="${palette.lime}" stroke-width="5" stroke-linecap="round"/><path d="M44 90c13 8 27 8 40 0" stroke="${palette.gold}" stroke-width="5" stroke-linecap="round"/>`,
  'discount-window': `<path d="M74 36 42 92" stroke="${palette.gold}" stroke-width="8" stroke-linecap="round"/><circle cx="49" cy="47" r="10" fill="none" stroke="${palette.cream}" stroke-width="5"/><circle cx="78" cy="81" r="10" fill="none" stroke="${palette.cream}" stroke-width="5"/><path d="M35 32h58v68H35Z" fill="none" stroke="${palette.mint}" stroke-width="4" stroke-dasharray="6 7"/>`,
  'event-magnet': `<path d="M42 39v24c0 13 10 22 22 22s22-9 22-22V39H73v24c0 5-4 9-9 9s-9-4-9-9V39Z" fill="${palette.red}" stroke="${palette.cream}" stroke-width="4" stroke-linejoin="round"/><path d="M41 31h17M70 31h17" stroke="${palette.mint}" stroke-width="5" stroke-linecap="round"/><circle cx="64" cy="96" r="6" fill="${palette.gold}"/>`,
  'seed-focus': `<ellipse cx="57" cy="66" rx="13" ry="22" fill="${palette.gold}" stroke="${palette.cream}" stroke-width="4" transform="rotate(-18 57 66)"/><ellipse cx="75" cy="68" rx="10" ry="18" fill="${palette.lime}" stroke="${palette.cream}" stroke-width="4" transform="rotate(23 75 68)"/><circle cx="64" cy="64" r="34" fill="none" stroke="${palette.mint}" stroke-width="4" stroke-dasharray="5 8"/>`,
  'harvest-chain': `<path d="M38 52h22l8 12-8 12H38l8-12Z" fill="${palette.panel}" stroke="${palette.blue}" stroke-width="4" stroke-linejoin="round"/><path d="M68 52h22l8 12-8 12H68l8-12Z" fill="${palette.panel}" stroke="${palette.lime}" stroke-width="4" stroke-linejoin="round"/><path d="M57 64h18" stroke="${palette.gold}" stroke-width="5" stroke-linecap="round"/>`,
  'cooldown-sync': `<circle cx="64" cy="64" r="30" fill="none" stroke="${palette.blue}" stroke-width="6"/><path d="M64 42v23l15 9" stroke="${palette.cream}" stroke-width="5" stroke-linecap="round"/><path d="M88 36v18H70M40 92V74h18" stroke="${palette.lime}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`,
};

for (const [id, glyph] of Object.entries(abilityGlyphs)) {
  writeAsset(`abilities/${id}.svg`, shell(glyph, palette.violet, `BiesyClicker ability ${id}`));
}

const uiGlyphs = {
  export: '<path d="M32 8v31"/><path d="m20 21 12-13 12 13"/><path d="M14 38v15h36V38"/>',
  import: '<path d="M32 8v31"/><path d="m20 27 12 12 12-12"/><path d="M14 38v15h36V38"/>',
  reset: '<path d="M49 21a21 21 0 1 0 4 20"/><path d="M49 11v14H35"/>',
  seeds:
    '<path d="M25 12c16 5 23 19 17 35-17-4-25-18-17-35Z"/><path d="M38 20c-10 11-15 20-17 32"/>',
  prestige: '<path d="M32 8 39 24h17L42 34l5 17-15-10-15 10 5-17L8 24h17Z"/>',
  research: '<path d="M24 10h16v15l13 25H11l13-25Z"/><path d="M21 38h22M24 10h16"/>',
  upgrade: '<path d="M32 52V12"/><path d="m17 27 15-15 15 15"/><path d="M15 52h34"/>',
  shop: '<path d="M12 25h40l-4 27H16Z"/><path d="M19 25c0-10 26-10 26 0"/>',
  'sound-on':
    '<path d="M10 38h10l15 12V14L20 26H10Z"/><path d="M43 24c5 5 5 11 0 16M50 17c9 9 9 21 0 30"/>',
  'sound-off': '<path d="M10 38h10l15 12V14L20 26H10Z"/><path d="M44 24 56 36M56 24 44 36"/>',
  auto: '<path d="M16 32a16 16 0 0 1 27-11"/><path d="M45 13v13H32"/><path d="M48 32a16 16 0 0 1-27 11"/><path d="M19 51V38h13"/>',
  warning: '<path d="M32 10 57 53H7Z"/><path d="M32 25v12M32 46h.01"/>',
  leaf: `${leaf(32, 38, 0.82, -28)}`,
  bps: '<circle cx="32" cy="32" r="23"/><path d="M32 17v16l11 7"/>',
  bpc: '<path d="M19 34h26"/><path d="M30 19 45 34 30 49"/>',
  total: '<path d="M14 45h36"/><path d="M18 45V22h28v23"/><path d="M25 31h14"/>',
};

for (const [id, glyph] of Object.entries(uiGlyphs)) {
  const body = id === 'leaf' ? glyph : glyph;
  writeAsset(
    `ui/${id}.svg`,
    uiShell(body, id === 'warning' ? palette.amber : palette.mint, `BiesyClicker UI ${id}`),
  );
}

const achievementGlyphs = {
  'achievement-base': '<circle cx="32" cy="32" r="25"/><path d="M20 50 16 60l16-7 16 7-4-10"/>',
  'achievement-ribbon': '<path d="M19 13h26v21c0 13-13 20-13 20S19 47 19 34Z"/>',
  'achievement-leaf': `${leaf(32, 36, 0.72, -18)}`,
  'achievement-light': '<path d="M20 18h24l-5 14H25Z"/><path d="M25 43h14M22 53h20"/>',
};

for (const [id, glyph] of Object.entries(achievementGlyphs)) {
  writeAsset(`ui/${id}.svg`, uiShell(glyph, palette.gold, `BiesyClicker ${id}`));
}

function plantStage(stage) {
  const height = 96 + stage * 24;
  const leafCount = Math.min(14, Math.max(4, stage + 3));
  const flowers = stage > 7 ? stage - 7 : 0;
  const viewTop = Math.max(0, Math.round(420 - height - 62));
  const viewHeight = Math.min(500 - viewTop, Math.round(height + 138));
  const viewX = stage >= 8 ? 72 : 118;
  const viewWidth = stage >= 8 ? 368 : 276;
  let leaves = '';
  for (let i = 0; i < leafCount; i += 1) {
    const y = 392 - i * (height / (leafCount + 1));
    const spread = 24 + Math.min(stage, 10) * 3 + (i % 3) * 4;
    const x = 256 + (i % 2 === 0 ? -spread : spread);
    const rot = i % 2 === 0 ? -48 - stage : 48 + stage;
    const scale = 1.3 + Math.min(stage, 10) * 0.09 + (i > leafCount - 4 ? 0.15 : 0);
    leaves += leaf(x, y, scale, rot);
  }
  let bloom = '';
  for (let i = 0; i < flowers; i += 1) {
    const x = 222 + i * 24;
    const y = 250 - i * 13;
    bloom += `<g filter="url(#inkBleed)">
      <path d="M${x - 10} ${y}c8-15 23-15 31 0-5 15-23 18-31 0Z" fill="url(#goldGradient)" stroke="${palette.cream}" stroke-width="3"/>
      <circle cx="${x + 12}" cy="${y + 8}" r="${5 + stage * 0.55}" fill="${palette.lime}" stroke="${palette.cream}" stroke-width="2"/>
    </g>`;
  }
  const crown =
    stage >= 8
      ? `<path d="M210 ${315 - stage * 8}c33-45 59-60 92-3" fill="none" stroke="${palette.gold}" stroke-width="${3 + stage * 0.45}" stroke-linecap="round" opacity=".62"/>
        <path d="M218 ${328 - stage * 8}c29-28 53-35 79-2" fill="none" stroke="${palette.lime}" stroke-width="2.8" stroke-linecap="round" opacity=".38"/>`
      : '';
  const prestigeHalo =
    stage >= 10
      ? `<circle cx="256" cy="${420 - height + 44}" r="${86 + stage * 8}" fill="none" stroke="${palette.violet}" stroke-width="6" stroke-dasharray="10 18" opacity=".38"/>
    <circle cx="256" cy="${420 - height + 44}" r="${58 + stage * 5}" fill="none" stroke="${palette.gold}" stroke-width="4" opacity=".34"/>`
      : '';
  return svg(
    `${viewX} ${viewTop} ${viewWidth} ${viewHeight}`,
    `<circle cx="256" cy="${420 - height + 28}" r="${72 + stage * 8}" fill="${palette.green}" opacity=".08"/>
    ${prestigeHalo}
    <ellipse cx="256" cy="430" rx="126" ry="28" fill="#06140d" opacity=".38"/>
    <path d="M203 406c25 10 81 10 106 0l-18 39h-70Z" fill="${palette.panel}" stroke="${palette.gold}" stroke-width="7" stroke-linejoin="round" filter="url(#brushRough)"/>
    <path d="M256 420c-${Math.max(7, stage)}-45-${Math.max(11, stage * 2)}-92 0-${height} 12 56 12 111 0 ${height}Z" fill="${palette.green}" stroke="${palette.cream}" stroke-width="2.2" opacity=".96" filter="url(#brushRough)"/>
    <path d="M256 ${420 - height + 14}c-16 55-16 126 0 190 16-64 16-135 0-190Z" fill="${palette.mint}" opacity=".18"/>
    <g filter="url(#inkBleed)">${leaves}</g>
    ${crown}
    ${bloom}
    <path d="M198 ${372 - stage * 10}c18-29 38-45 61-49M312 ${375 - stage * 10}c-17-29-36-46-58-52" fill="none" stroke="${palette.mint}" stroke-width="2.5" stroke-linecap="round" opacity=".22"/>
    <path d="M200 427h112" stroke="${palette.gold}" stroke-width="11" stroke-linecap="round" opacity=".7"/>
    <path d="M214 407c26 11 58 11 84 0" stroke="${palette.mint}" stroke-width="4" stroke-linecap="round" opacity=".5"/>`,
    `BiesyClicker plant stage ${stage}`,
  );
}

for (let i = 1; i <= 11; i += 1) {
  writeAsset(`plant/stage-${String(i).padStart(2, '0')}.svg`, plantStage(i));
}

writeAsset(
  'backgrounds/desktop.svg',
  svg(
    '0 0 1600 900',
    `<rect width="1600" height="900" fill="#07100b"/>
    <radialGradient id="desktopGlow" cx=".5" cy=".22" r=".75">
      <stop offset="0" stop-color="#1e7f4e" stop-opacity=".55"/>
      <stop offset=".48" stop-color="#123b2b" stop-opacity=".44"/>
      <stop offset="1" stop-color="#07100b" stop-opacity="0"/>
    </radialGradient>
    <rect width="1600" height="900" fill="url(#desktopGlow)"/>
    <path d="M0 704C207 650 321 760 502 714c198-51 294-174 532-127 169 33 252 129 566 46v267H0Z" fill="#0b2118" opacity=".76" filter="url(#brushRough)"/>
    <path d="M0 779c303-59 416 46 681 0 329-57 469-116 919-14v135H0Z" fill="#07150f" opacity=".91"/>
    <path d="M154 607c84-95 140-198 168-307M1362 626c-66-119-116-227-151-324M765 668c-19-118-20-246 5-381" fill="none" stroke="${palette.green}" stroke-width="7" stroke-linecap="round" opacity=".11"/>
    <path d="M246 481c-70-20-119-71-148-154M1250 501c81-30 135-92 163-189M772 520c-61-22-106-70-134-143" fill="none" stroke="${palette.lime}" stroke-width="4" stroke-linecap="round" opacity=".1"/>
    <circle cx="1275" cy="180" r="180" fill="${palette.lime}" opacity=".08"/>
    <circle cx="355" cy="212" r="130" fill="${palette.mint}" opacity=".07"/>
    <rect width="1600" height="900" filter="url(#paperGrain)" opacity=".55"/>`,
    'BiesyClicker desktop background',
  ),
);

writeAsset(
  'backgrounds/mobile.svg',
  svg(
    '0 0 720 1280',
    `<rect width="720" height="1280" fill="#07100b"/>
    <radialGradient id="mobileGlow" cx=".5" cy=".16" r=".8">
      <stop offset="0" stop-color="#238956" stop-opacity=".5"/>
      <stop offset=".56" stop-color="#0f2f23" stop-opacity=".42"/>
      <stop offset="1" stop-color="#07100b" stop-opacity="0"/>
    </radialGradient>
    <rect width="720" height="1280" fill="url(#mobileGlow)"/>
    <path d="M0 980c155-60 230-12 338-48 143-47 215-98 382-42v390H0Z" fill="#0b2118" opacity=".76" filter="url(#brushRough)"/>
    <path d="M0 1102c170-38 291 42 420-5 108-39 188-53 300-19v202H0Z" fill="#07150f" opacity=".92"/>
    <path d="M105 1010c30-175 72-302 126-390M598 1034c-25-153-70-278-135-374" fill="none" stroke="${palette.green}" stroke-width="6" stroke-linecap="round" opacity=".12"/>
    <rect width="720" height="1280" filter="url(#paperGrain)" opacity=".5"/>`,
    'BiesyClicker mobile background',
  ),
);

writeAsset(
  'backgrounds/plants.svg',
  svg(
    '0 0 1600 900',
    `<g fill="none" stroke="${palette.green}" stroke-width="5" stroke-linecap="round" opacity=".12">
      <path d="M165 900c35-200 76-332 145-455M1420 900c-22-165-77-312-168-440M760 900c-18-130-18-270 6-420"/>
      <path d="M310 505c-82-18-136-76-164-173M1248 484c95-30 154-101 177-213M766 555c-74-22-124-78-150-168"/>
    </g>
    <g fill="none" stroke="${palette.lime}" stroke-width="2.8" stroke-linecap="round" opacity=".08" filter="url(#brushRough)">
      <path d="M214 796c55-48 93-101 116-159M1337 786c-48-43-82-91-102-143M824 780c42-34 72-75 89-123"/>
      <path d="M78 846c36-35 59-71 68-107M1499 844c-40-37-67-77-79-121"/>
    </g>`,
    'BiesyClicker plant silhouettes',
  ),
);

writeAsset(
  'backgrounds/noise.svg',
  svg(
    '0 0 256 256',
    `<filter id="noise"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="table" tableValues="0 .08"/></feComponentTransfer></filter><rect width="256" height="256" filter="url(#noise)"/>`,
    'BiesyClicker subtle noise',
  ),
);

removeObsoleteAssets();
console.log('Generated BiesyClicker SVG assets in public/img.');
