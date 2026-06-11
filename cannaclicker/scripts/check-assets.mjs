import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, relative, resolve, sep } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const root = resolve(scriptDir, '..');
const manifestPath = resolve(root, 'src/app/assetManifest.ts');
const publicDir = resolve(root, 'public');
const imageDir = resolve(publicDir, 'img');
const manifest = readFileSync(manifestPath, 'utf8');
const rasterizedRuntimeDirs = ['items', 'upgrades', 'research', 'events', 'abilities', 'plant'];

const referenced = new Set(
  Array.from(manifest.matchAll(/asset\(\s*['"]([^'"]+)['"]\s*\)/g), (match) => match[1]),
);

const failures = [];

for (const path of referenced) {
  const absolute = resolve(publicDir, path);
  if (!absolute.startsWith(publicDir) || !existsFile(absolute)) {
    failures.push(`Missing asset referenced by manifest: ${path}`);
  }

  if (isRasterizedRuntimeAsset(path) && !path.endsWith('.png')) {
    failures.push(`Rasterized runtime asset must be PNG: ${path}`);
  }
}

const imageFiles = walk(imageDir)
  .filter((file) => /\.(svg|png|jpe?g|webp|avif)$/i.test(file))
  .map((file) => relative(publicDir, file).split(sep).join('/'))
  .sort();

for (const file of imageFiles) {
  if (!referenced.has(file)) {
    failures.push(`Orphan image not referenced by manifest: ${file}`);
  }

  if (isRasterizedRuntimeAsset(file) && file.endsWith('.svg')) {
    failures.push(`Old SVG runtime asset should not ship in rasterized group: ${file}`);
  }
}

for (const file of walk(root, { skipHeavyDirs: true })) {
  if (/\.wav$/i.test(file)) {
    failures.push(`WAV file should not ship in runtime sources: ${relative(root, file)}`);
  }
}

const beforeHash = hashDirectory(imageDir);
const generate = spawnSync(process.execPath, ['scripts/generate-assets.mjs'], {
  cwd: root,
  encoding: 'utf8',
});
if (generate.status !== 0) {
  failures.push(`Asset generator failed:\n${generate.stderr || generate.stdout}`);
}
const afterHash = hashDirectory(imageDir);
if (beforeHash !== afterHash) {
  failures.push('Asset generator is not idempotent: public/img changed after generation.');
}

if (failures.length > 0) {
  console.error(`Asset check failed with ${failures.length} issue(s):`);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  `Asset check passed: ${referenced.size} manifest references, ${imageFiles.length} public images, generator idempotent.`,
);

function existsFile(path) {
  try {
    return statSync(path).isFile();
  } catch {
    return false;
  }
}

function isRasterizedRuntimeAsset(path) {
  return rasterizedRuntimeDirs.some((dir) => path.startsWith(`img/${dir}/`));
}

function walk(dir, options = {}) {
  const skipHeavyDirs = Boolean(options.skipHeavyDirs);
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const absolute = resolve(dir, entry.name);
    if (entry.isDirectory()) {
      if (
        skipHeavyDirs &&
        [
          'node_modules',
          'dist',
          '.git',
          'test-results',
          'playwright-report',
          'biesyclicker_v11_audio_pack',
        ].includes(entry.name)
      ) {
        return [];
      }
      return walk(absolute, options);
    }
    return [absolute];
  });
}

function hashDirectory(dir) {
  const hash = createHash('sha256');
  for (const file of walk(dir).sort()) {
    hash.update(relative(dir, file));
    hash.update(readFileSync(file));
  }
  return hash.digest('hex');
}
