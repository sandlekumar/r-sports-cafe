import sharp from 'sharp';
import { readdir, stat, unlink } from 'fs/promises';
import { join, extname, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const MENU_DIR = join(__dirname, '..', 'src', 'assets', 'menuitems');

async function run() {
  console.log('🚀 Starting Menu Items Image Optimization...\n');
  console.log(`Scanning: ${MENU_DIR}\n`);

  const files = await readdir(MENU_DIR);
  const imageFiles = files.filter(f => /\.(jpe?g|png|webp|heic)$/i.test(f) && !f.endsWith('.optimized.webp'));

  let totalBefore = 0;
  let totalAfter = 0;
  let successCount = 0;
  let failCount = 0;

  console.log('File'.padEnd(55) + 'Before'.padStart(10) + ' -> ' + 'After'.padStart(10) + '   Savings');
  console.log('-'.repeat(85));

  for (const file of imageFiles) {
    const srcPath = join(MENU_DIR, file);
    const fileStat = await stat(srcPath);
    const sizeBefore = fileStat.size;
    totalBefore += sizeBefore;

    const base = basename(file, extname(file));
    const targetFile = `${base}.webp`;
    const targetPath = join(MENU_DIR, targetFile);

    try {
      // Resize to max 1000px width, quality 80
      const transformer = sharp(srcPath, { failOn: 'none' })
        .rotate() // auto-orient based on EXIF
        .resize({ width: 1000, withoutEnlargement: true })
        .webp({ quality: 80, effort: 4 });

      await transformer.toFile(targetPath);

      const afterStat = await stat(targetPath);
      const sizeAfter = afterStat.size;
      totalAfter += sizeAfter;
      successCount++;

      const beforeMB = (sizeBefore / (1024 * 1024)).toFixed(2) + ' MB';
      const afterKB = (sizeAfter / 1024).toFixed(1) + ' KB';
      const savings = (((sizeBefore - sizeAfter) / sizeBefore) * 100).toFixed(1) + '%';

      console.log(
        file.slice(0, 52).padEnd(55) +
        beforeMB.padStart(10) + ' -> ' +
        afterKB.padStart(10) +
        `   -${savings}`
      );

      // If the original was not already a webp, we can remove the giant original
      if (file !== targetFile) {
        await unlink(srcPath);
      }
    } catch (err) {
      failCount++;
      console.error(`❌ Failed: ${file}:`, err.message);
    }
  }

  console.log('-'.repeat(85));
  console.log(`\n🎉 Optimization Completed!`);
  console.log(`✅ Success: ${successCount} files`);
  if (failCount > 0) console.log(`⚠️ Failed: ${failCount} files`);
  console.log(`📦 Total Size Before : ${(totalBefore / (1024 * 1024 * 1024)).toFixed(2)} GB (${(totalBefore / (1024 * 1024)).toFixed(1)} MB)`);
  console.log(`⚡ Total Size After  : ${(totalAfter / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`🔥 Total Space Saved: ${(((totalBefore - totalAfter) / totalBefore) * 100).toFixed(1)}%\n`);
}

run().catch(console.error);
