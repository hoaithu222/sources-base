// scripts/generate-pwa-icons.mjs — Sinh icon PNG cho PWA / iOS từ `public/favicon.svg`.
//
// Source: public/favicon.svg
// Output: public/icons/{icon-192,icon-512,icon-maskable-512,apple-touch-icon}.png
// Run:    npm run generate:pwa-icons
//
// Vì sao PNG: Chrome chỉ cho cài PWA khi manifest có icon 192 + 512 PNG; iOS không đọc SVG cho `apple-touch-icon`.
// `maskable` chừa lề an toàn 20% (vùng cắt tròn của Android) trên nền màu app.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = path.join(ROOT, 'public/favicon.svg');
const OUT_DIR = path.join(ROOT, 'public/icons');

/** Khớp token `bg-page` sáng của `colors-theme.json` (cũng là `THEME_COLOR.light` ở `core/seo/site.config.ts`). */
const BACKGROUND = '#F1F5F4';

const TARGETS = [
  { file: 'icon-192.png', size: 192, padding: 0, background: null },
  { file: 'icon-512.png', size: 512, padding: 0, background: null },
  { file: 'icon-maskable-512.png', size: 512, padding: 0.2, background: BACKGROUND },
  { file: 'apple-touch-icon.png', size: 180, padding: 0.1, background: BACKGROUND },
];

async function render({ file, size, padding, background }) {
  const inner = Math.round(size * (1 - padding * 2));
  const logo = await sharp(SOURCE, { density: 384 })
    .resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const canvas = sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: background ?? { r: 0, g: 0, b: 0, alpha: 0 },
    },
  });

  await canvas
    .composite([{ input: logo, gravity: 'center' }])
    .png({ compressionLevel: 9 })
    .toFile(path.join(OUT_DIR, file));
  console.log(`  ✓  ${file.padEnd(24)} ${size}×${size}`);
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  for (const target of TARGETS) await render(target);
  console.log(`✅ Done — ${TARGETS.length} icons in public/icons`);
}

main().catch((err) => {
  console.error('❌ generate-pwa-icons failed:', err);
  process.exit(1);
});
