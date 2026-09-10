/**
 * convert-to-webp.mjs
 * Converts all homepage + menu-route images to WebP.
 *
 * Resize targets:
 *   tasteandplay/  → 1200px wide  (16:10 aspect, displayed at max ~48vw desktop)
 *   signature_*    → 600px wide   (displayed at max ~280–400px)
 *   architectural-sketch-collage → 1600px wide (full-bleed background)
 *   menu_*         → 800px wide   (full-bleed card on /menu route)
 *
 * Quality: 82 (WebP perceptual quality, sharp default encoder)
 * Run: node scripts/convert-to-webp.mjs
 */

import sharp from 'sharp';
import { readdir, stat } from 'fs/promises';
import { join, basename, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ASSETS = join(__dirname, '..', 'src', 'assets');
const QUALITY = 82;

const JOBS = [
  // ── signature food photos (Menu.jsx, mobile static fallback) ──────────────
  { src: join(ASSETS, 'signature_burger.png'),  width: 600 },
  { src: join(ASSETS, 'signature_pizza.png'),   width: 600 },
  { src: join(ASSETS, 'signature_juice.png'),   width: 600 },
  { src: join(ASSETS, 'signature_coffee.png'),  width: 600 },

  // ── architectural sketch (ScrollVideoHero mural, full-bleed) ─────────────
  { src: join(ASSETS, 'architectural-sketch-collage.png.png'), width: 1600 },

  // ── menu route images (/menu page, lazy-loaded route) ────────────────────
  { src: join(ASSETS, 'menu_chicken.png'), width: 800 },
  { src: join(ASSETS, 'menu_fish.png'),    width: 800 },
  { src: join(ASSETS, 'menu_latte.png'),   width: 800 },
  { src: join(ASSETS, 'menu_shrimp.png'),  width: 800 },
  { src: join(ASSETS, 'menu_tea.png'),     width: 800 },
  { src: join(ASSETS, 'menu_pizza.png'),   width: 800 },
];

// Discover all tasteandplay/ images dynamically
const tasteDir = join(ASSETS, 'tasteandplay');
const tasteFiles = (await readdir(tasteDir))
  .filter(f => /\.(jpg|jpeg|png)$/i.test(f))
  .map(f => ({ src: join(tasteDir, f), width: 1200 }));

const ALL_JOBS = [...JOBS, ...tasteFiles];

// ─── Run conversions ─────────────────────────────────────────────────────────
let totalBefore = 0;
let totalAfter  = 0;

console.log('\n🔄  Converting images to WebP...\n');
console.log('  Input'.padEnd(55), 'Before'.padStart(9), '→', 'After'.padStart(8), 'Savings');
console.log('  ' + '─'.repeat(82));

for (const { src, width } of ALL_JOBS) {
  const dir  = dirname(src);
  const name = basename(src).replace(/\.(png|jpg|jpeg)$/i, '');
  const dest = join(dir, `${name}.webp`);

  try {
    const { size: sizeBefore } = await stat(src);

    await sharp(src)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: QUALITY, effort: 5 })
      .toFile(dest);

    const { size: sizeAfter } = await stat(dest);
    totalBefore += sizeBefore;
    totalAfter  += sizeAfter;

    const pct     = (((sizeBefore - sizeAfter) / sizeBefore) * 100).toFixed(0);
    const bStr    = `${(sizeBefore / 1024).toFixed(0)} KB`;
    const aStr    = `${(sizeAfter  / 1024).toFixed(0)} KB`;
    const relSrc  = src.replace(ASSETS, '').replace(/\\/g, '/');
    console.log(`  ${relSrc.padEnd(54)} ${bStr.padStart(8)}  →  ${aStr.padStart(7)}   −${pct}%`);
  } catch (err) {
    console.error(`  ✗ ${src}: ${err.message}`);
  }
}

const savedMB = ((totalBefore - totalAfter) / 1024 / 1024).toFixed(1);
console.log('\n  ' + '─'.repeat(82));
console.log(`  Total before : ${(totalBefore / 1024 / 1024).toFixed(1)} MB`);
console.log(`  Total after  : ${(totalAfter  / 1024 / 1024).toFixed(1)} MB`);
console.log(`  💾 Saved     : ${savedMB} MB  (${(((totalBefore-totalAfter)/totalBefore)*100).toFixed(0)}%)`);
console.log('\n✅  Done. WebP files written next to originals.\n');
console.log('Next: update import paths in source files then delete the originals.\n');
