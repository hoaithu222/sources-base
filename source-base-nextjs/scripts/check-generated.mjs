#!/usr/bin/env node
/**
 * Kiểm FILE SINH khớp nguồn — `npm run check:generated`.
 *
 * Với từng generator: lưu bản đang có của các file đầu ra → chạy generator → so sánh → KHÔI PHỤC bản cũ (luôn luôn, kể cả khi lỗi
 * hay Ctrl+C). Nhờ vậy kiểm được cả những generator CHƯA an toàn để chạy thật (xem `docs/known-issues.md` mục F) mà không ghi đè gì.
 *
 *   ✅ khớp               đầu ra y hệt file đang commit
 *   ⚠️ chỉ khác định dạng  nội dung giống sau khi qua Prettier (file đang commit đã được Prettier xếp lại) — không làm lệnh đỏ
 *   ⛔ lệch nội dung       nguồn đã đổi mà file sinh chưa chạy lại (hoặc generator không deterministic) — làm lệnh đỏ
 *
 * Đầu ra nhị phân (PNG) chỉ cảnh báo: byte có thể khác theo phiên bản `sharp`. Chạy `npm run check:generated` sau khi sửa nguồn sinh
 * (màu, font, icon SVG) và trước khi mở PR; CI chạy cùng lệnh. Thêm generator mới → thêm một mục vào `GENERATORS`.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import * as prettier from 'prettier';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/**
 * `outputs`: file đầu ra (đường từ gốc repo). `also`: thư mục mà generator có thể xoá / tạo file `.ts(x)` bên trong — lưu và khôi phục
 * cả chúng. `binary`: so từng byte, chỉ cảnh báo.
 */
const GENERATORS = [
  {
    name: 'colors',
    command: 'node scripts/generate-colors.mjs',
    outputs: ['src/styles/theme/generated-colors.css', 'src/shared/theme/colors.generated.ts'],
  },
  {
    name: 'font',
    command: 'node scripts/generate-font.mjs',
    outputs: ['src/styles/font/generated-font.css'],
  },
  {
    name: 'vci-icons',
    command: 'node scripts/generate-vci-icons.mjs',
    outputs: ['src/shared/ui/icons/vci-icon/vci-icons.generated.ts'],
  },
  {
    name: 'icons',
    command: 'node scripts/generate-icons.mjs',
    outputs: [
      'src/assets/icons/index.tsx',
      'src/assets/icons/standalone.tsx',
      'src/shared/ui/icons/index.ts',
    ],
    also: ['src/assets/icons'],
  },
  {
    name: 'images',
    command: 'node scripts/generate-images.mjs',
    outputs: ['src/assets/image/index.ts'],
  },
  {
    name: 'pwa-icons',
    command: 'node scripts/generate-pwa-icons.mjs',
    outputs: [
      'public/icons/apple-touch-icon.png',
      'public/icons/icon-192.png',
      'public/icons/icon-512.png',
      'public/icons/icon-maskable-512.png',
    ],
    binary: true,
  },
];

/** Chỉ chạy các generator được nêu: `node scripts/check-generated.mjs colors font`. */
const only = process.argv.slice(2);
const selected =
  only.length > 0 ? GENERATORS.filter(({ name }) => only.includes(name)) : GENERATORS;

const abs = (file) => path.join(ROOT, file);
const normalize = (text) => text.replace(/\r\n/g, '\n');

/** Mọi file `.ts` / `.tsx` ngay trong `dir` (không đệ quy) — thứ `generate-icons` có thể xoá. */
const sourceFilesIn = (dir) =>
  fs
    .readdirSync(abs(dir))
    .filter((name) => /\.tsx?$/.test(name))
    .map((name) => path.posix.join(dir, name));

/** Lưu nội dung các file; `null` = chưa tồn tại (khôi phục thì xoá). */
const snapshot = (files) =>
  new Map(
    files.map((file) => [file, fs.existsSync(abs(file)) ? fs.readFileSync(abs(file)) : null]),
  );

function restore(saved) {
  for (const [file, content] of saved) {
    if (content === null) fs.rmSync(abs(file), { force: true });
    else fs.writeFileSync(abs(file), content);
  }
}

const formatted = async (file, text) => {
  const options = (await prettier.resolveConfig(abs(file))) ?? {};
  const info = await prettier.getFileInfo(abs(file));
  if (!info.inferredParser) return text;
  return prettier.format(text, { ...options, filepath: abs(file) });
};

async function compare(generator, before) {
  const result = { exact: [], formatOnly: [], drift: [] };
  for (const file of generator.outputs) {
    const old = before.get(file);
    const fresh = fs.existsSync(abs(file)) ? fs.readFileSync(abs(file)) : null;
    if (old === null || fresh === null) {
      result.drift.push(`${file} (${old === null ? 'chưa có file' : 'generator không ghi file'})`);
    } else if (old.equals(fresh)) {
      result.exact.push(file);
    } else if (generator.binary) {
      result.formatOnly.push(`${file} (byte khác)`);
    } else if (
      (await formatted(file, normalize(old.toString('utf8')))) ===
      (await formatted(file, normalize(fresh.toString('utf8'))))
    ) {
      result.formatOnly.push(file);
    } else {
      result.drift.push(file);
    }
  }
  return result;
}

let saved = new Map();
const guard = () => {
  restore(saved);
  saved = new Map();
};
process.on('SIGINT', () => {
  guard();
  process.exit(130);
});

let failed = false;
try {
  for (const generator of selected) {
    const watched = [...generator.outputs, ...(generator.also ?? []).flatMap(sourceFilesIn)];
    saved = snapshot([...new Set(watched)]);
    const before = new Map(saved);

    const run = spawnSync(generator.command, {
      cwd: ROOT,
      shell: true,
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
    });
    if (run.status !== 0) {
      failed = true;
      console.error(
        `⛔ ${generator.name}: generator thoát mã ${run.status}\n${run.stdout}${run.stderr}`,
      );
    } else {
      const { exact, formatOnly, drift } = await compare(generator, before);
      if (drift.length > 0) {
        failed = true;
        console.error(`⛔ ${generator.name}: file sinh lệch nguồn — ${drift.join(', ')}`);
      } else if (formatOnly.length > 0) {
        console.warn(`⚠️  ${generator.name}: chỉ khác định dạng — ${formatOnly.join(', ')}`);
      } else {
        console.log(`✅ ${generator.name}: ${exact.length} file khớp nguồn`);
      }
    }
    guard();
  }
} finally {
  guard();
}

if (failed) {
  console.error(
    '\nChạy lại generator tương ứng (`npm run generate:<tên>`), xem diff rồi commit cùng nguồn. ' +
      'Generator còn cảnh báo không chạy được: docs/known-issues.md mục F.',
  );
  process.exit(1);
}
