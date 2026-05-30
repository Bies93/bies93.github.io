import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, '../public/img');

const palette = {
  ink: '#07130d',
  panel: '#10251a',
  green: '#19c96f',
  mint: '#76ffd0',
  lime: '#caff58',
  gold: '#ffd15a',
  amber: '#ff9f43',
  blue: '#71c7ff',
  violet: '#b58cff',
  red: '#ff6b5f',
  cream: '#f7ffe8',
};

function ensure(filePath) {
  mkdirSync(path.dirname(filePath), { recursive: true });
}

function writeAsset(file, content) {
  const target = path.join(outDir, file);
  ensure(target);
  writeFileSync(target, content.trimStart());
}

function svg(viewBox, body, label = 'CannaClicker asset') {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" role="img" aria-label="${label}">
  <defs>
    <filter id="softShadow" x="-30%" y="-30%" width="160%" height="170%">
      <feDropShadow dx="0" dy="7" stdDeviation="5" flood-color="#000" flood-opacity=".28"/>
    </filter>
    <linearGradient id="leafGradient" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="${palette.lime}"/>
      <stop offset=".48" stop-color="${palette.green}"/>
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

function shell(content, accent = palette.green, label = 'CannaClicker icon') {
  return svg(
    '0 0 128 128',
    `<g filter="url(#softShadow)">
      <path d="M64 8 108 32v48l-44 40-44-40V32Z" fill="${palette.panel}" stroke="${accent}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M64 15 100 35v40l-36 33-36-33V35Z" fill="#0b1c13" opacity=".94"/>
      ${content}
      <path d="M35 96c16 11 42 11 58 0" fill="none" stroke="${accent}" stroke-width="3" stroke-linecap="round" opacity=".6"/>
    </g>`,
    label,
  );
}

function uiShell(content, accent = palette.mint, label = 'CannaClicker UI icon') {
  return svg(
    '0 0 64 64',
    `<g fill="none" stroke="${accent}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
      ${content}
    </g>`,
    label,
  );
}

function leaf(x, y, scale = 1, rotate = 0, fill = 'url(#leafGradient)') {
  return `<path d="M0-18C16-15 24-3 20 9 8 9 0 0 0-18Z" transform="translate(${x} ${y}) rotate(${rotate}) scale(${scale})" fill="${fill}" stroke="${palette.cream}" stroke-width="${1.3 / scale}" opacity=".96"/>`;
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

for (const [id, glyph] of Object.entries(itemGlyphs)) {
  writeAsset(`items/${id}.svg`, shell(glyph, palette.green, `CannaClicker item ${id}`));
}

const upgradeGlyphs = {
  'building-boost': `<path d="M38 83h52" stroke="${palette.lime}" stroke-width="8" stroke-linecap="round"/><path d="M45 75 64 37l19 38Z" fill="${palette.green}" stroke="${palette.cream}" stroke-width="4"/><path d="M64 37v34" stroke="${palette.ink}" stroke-width="5" opacity=".35"/>`,
  'global-bps': `<circle cx="64" cy="64" r="28" fill="none" stroke="${palette.lime}" stroke-width="7"/><path d="M64 36v28l19 13" stroke="${palette.cream}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`,
  'click-power': `<path d="M45 83 58 33h19L67 57h18L54 96l9-30H47Z" fill="${palette.gold}" stroke="${palette.cream}" stroke-width="4" stroke-linejoin="round"/>`,
  automation: `<rect x="40" y="41" width="48" height="38" rx="10" fill="${palette.panel}" stroke="${palette.mint}" stroke-width="4"/><path d="M50 61h28M64 47v28" stroke="${palette.lime}" stroke-width="5" stroke-linecap="round"/><circle cx="64" cy="61" r="20" fill="none" stroke="${palette.green}" stroke-width="4" stroke-dasharray="5 7"/>`,
  'cost-efficiency': `<path d="M75 36 42 91" stroke="${palette.gold}" stroke-width="8" stroke-linecap="round"/><circle cx="49" cy="45" r="10" fill="none" stroke="${palette.cream}" stroke-width="5"/><circle cx="79" cy="82" r="10" fill="none" stroke="${palette.cream}" stroke-width="5"/>`,
};

for (const [id, glyph] of Object.entries(upgradeGlyphs)) {
  writeAsset(`upgrades/${id}.svg`, shell(glyph, palette.gold, `CannaClicker upgrade ${id}`));
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
  writeAsset(`research/${id}.svg`, shell(glyph, palette.mint, `CannaClicker research ${id}`));
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
};

for (const [id, glyph] of Object.entries(eventGlyphs)) {
  writeAsset(
    `events/${id}.svg`,
    shell(glyph, id === 'mutant-sprout' ? palette.red : palette.gold, `CannaClicker event ${id}`),
  );
}

const uiGlyphs = {
  export: '<path d="M32 8v31"/><path d="m20 21 12-13 12 13"/><path d="M14 38v15h36V38"/>',
  import: '<path d="M32 8v31"/><path d="m20 27 12 12 12-12"/><path d="M14 38v15h36V38"/>',
  reset: '<path d="M49 21a21 21 0 1 0 4 20"/><path d="M49 11v14H35"/>',
  settings:
    '<circle cx="32" cy="32" r="8"/><path d="M32 6v9M32 49v9M6 32h9M49 32h9M14 14l6 6M44 44l6 6M50 14l-6 6M20 44l-6 6"/>',
  seeds:
    '<path d="M25 12c16 5 23 19 17 35-17-4-25-18-17-35Z"/><path d="M38 20c-10 11-15 20-17 32"/>',
  prestige: '<path d="M32 8 39 24h17L42 34l5 17-15-10-15 10 5-17L8 24h17Z"/>',
  research: '<path d="M24 10h16v15l13 25H11l13-25Z"/><path d="M21 38h22M24 10h16"/>',
  upgrade: '<path d="M32 52V12"/><path d="m17 27 15-15 15 15"/><path d="M15 52h34"/>',
  shop: '<path d="M12 25h40l-4 27H16Z"/><path d="M19 25c0-10 26-10 26 0"/>',
  stats: '<path d="M16 50V31M32 50V14M48 50V24"/>',
  'sound-on':
    '<path d="M10 38h10l15 12V14L20 26H10Z"/><path d="M43 24c5 5 5 11 0 16M50 17c9 9 9 21 0 30"/>',
  'sound-off': '<path d="M10 38h10l15 12V14L20 26H10Z"/><path d="M44 24 56 36M56 24 44 36"/>',
  info: '<circle cx="32" cy="32" r="24"/><path d="M32 29v17M32 18h.01"/>',
  close: '<path d="M18 18 46 46M46 18 18 46"/>',
  buy: '<path d="M12 20h9l5 28h24"/><path d="M25 28h28l-6 14H28"/><circle cx="29" cy="54" r="3"/><circle cx="48" cy="54" r="3"/>',
  locked:
    '<rect x="16" y="28" width="32" height="24" rx="5"/><path d="M23 28v-7c0-12 18-12 18 0v7"/>',
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
    uiShell(body, id === 'warning' ? palette.amber : palette.mint, `CannaClicker UI ${id}`),
  );
}

const achievementGlyphs = {
  'achievement-base': '<circle cx="32" cy="32" r="25"/><path d="M20 50 16 60l16-7 16 7-4-10"/>',
  'achievement-ribbon': '<path d="M19 13h26v21c0 13-13 20-13 20S19 47 19 34Z"/>',
  'achievement-leaf': `${leaf(32, 36, 0.72, -18)}`,
  'achievement-light': '<path d="M20 18h24l-5 14H25Z"/><path d="M25 43h14M22 53h20"/>',
  'achievement-pot': '<path d="M18 27h28l-4 23H22Z"/><path d="M25 25c4-10 10-10 14 0"/>',
};

for (const [id, glyph] of Object.entries(achievementGlyphs)) {
  writeAsset(`ui/${id}.svg`, uiShell(glyph, palette.gold, `CannaClicker ${id}`));
}

function plantStage(stage) {
  const height = 74 + stage * 22;
  const leafCount = Math.min(10, Math.max(2, stage + 1));
  const flowers = stage > 7 ? stage - 7 : 0;
  let leaves = '';
  for (let i = 0; i < leafCount; i += 1) {
    const y = 380 - i * (height / (leafCount + 2));
    const x = 256 + (i % 2 === 0 ? -18 - stage * 2 : 18 + stage * 2);
    const rot = i % 2 === 0 ? -42 : 42;
    const scale = 1.2 + Math.min(stage, 8) * 0.1;
    leaves += leaf(x, y, scale, rot);
  }
  let bloom = '';
  for (let i = 0; i < flowers; i += 1) {
    const x = 232 + i * 24;
    bloom += `<circle cx="${x}" cy="${255 - i * 12}" r="${7 + stage}" fill="${palette.gold}" stroke="${palette.cream}" stroke-width="3"/>`;
  }
  return svg(
    '0 0 512 512',
    `<ellipse cx="256" cy="430" rx="115" ry="25" fill="#06140d" opacity=".35"/>
    <path d="M256 421V${420 - height}" stroke="${palette.green}" stroke-width="${10 + stage}" stroke-linecap="round"/>
    ${leaves}
    ${bloom}
    <path d="M205 428h102" stroke="${palette.gold}" stroke-width="9" stroke-linecap="round" opacity=".55"/>`,
    `CannaClicker plant stage ${stage}`,
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
    <path d="M0 710C210 660 320 760 500 716c197-48 295-170 531-126 167 32 251 126 569 48v262H0Z" fill="#0b2118" opacity=".72"/>
    <path d="M0 780c300-60 415 45 680 0 330-56 470-115 920-14v134H0Z" fill="#07150f" opacity=".9"/>
    <circle cx="1275" cy="180" r="180" fill="${palette.lime}" opacity=".08"/>
    <circle cx="355" cy="212" r="130" fill="${palette.mint}" opacity=".07"/>`,
    'CannaClicker desktop background',
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
    <path d="M0 980c155-60 230-12 338-48 143-47 215-98 382-42v390H0Z" fill="#0b2118" opacity=".72"/>
    <path d="M0 1102c170-38 291 42 420-5 108-39 188-53 300-19v202H0Z" fill="#07150f" opacity=".92"/>`,
    'CannaClicker mobile background',
  ),
);

writeAsset(
  'backgrounds/plants.svg',
  svg(
    '0 0 1600 900',
    `<g fill="none" stroke="${palette.green}" stroke-width="5" stroke-linecap="round" opacity=".12">
      <path d="M165 900c35-200 76-332 145-455M1420 900c-22-165-77-312-168-440M760 900c-18-130-18-270 6-420"/>
      <path d="M310 505c-82-18-136-76-164-173M1248 484c95-30 154-101 177-213M766 555c-74-22-124-78-150-168"/>
    </g>`,
    'CannaClicker plant silhouettes',
  ),
);

writeAsset(
  'backgrounds/noise.svg',
  svg(
    '0 0 256 256',
    `<filter id="noise"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="table" tableValues="0 .08"/></feComponentTransfer></filter><rect width="256" height="256" filter="url(#noise)"/>`,
    'CannaClicker subtle noise',
  ),
);

writeAsset(
  'fx/spark.svg',
  svg(
    '0 0 128 128',
    `<path d="M64 14 73 54l39 10-39 10-9 40-9-40-39-10 39-10Z" fill="${palette.gold}" stroke="${palette.cream}" stroke-width="4"/>`,
    'CannaClicker spark',
  ),
);

console.log('Generated CannaClicker SVG assets in public/img.');
