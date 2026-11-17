/**
 * Ngân sách TẢI BAN ĐẦU — chạy sau `npm run build`. Đo thư mục khác `dist/`: `node scripts/check-bundle.mjs <thư-mục>`.
 *
 * "Tải ban đầu" = những gì trình duyệt phải lấy trước khi vẽ được khung hình
 * đầu: file entry + mọi `<link rel="modulepreload">` + CSS trong `dist/index.html`.
 * Trang lazy không tính — chúng chỉ tải khi người dùng mở tới.
 *
 * ── Vì sao cần ───────────────────────────────────────────────────────────────
 * Lazy route KHÔNG tự bảo đảm thư viện nặng nằm ngoài tải ban đầu. Đã xảy ra
 * thật: cấu hình chia chunk đặt module `react` vào chunk `charts`, nên mọi
 * chunk đều import `charts` và ~400 kB thư viện biểu đồ bị preload ở mọi lần
 * mở app. Build vẫn xanh, không cảnh báo nào — chỉ đo mới thấy.
 *
 * Script này chặn hai kiểu hồi quy:
 *   1. Chunk nặng-chỉ-dùng-ở-vài-trang lọt vào tải ban đầu.
 *   2. Tổng tải ban đầu vượt ngân sách.
 *
 * "Tải ban đầu" lấy từ HTML (entry + modulepreload) HỢP với bao đóng import TĨNH tính từ các
 * chunk đó: một chunk được import tĩnh gián tiếp mà HTML không preload vẫn bị đếm. Import động
 * (`import()`, danh sách `__vite__mapDeps`) cố ý không đi theo — đó chính là phần lazy.
 *
 * Vượt ngân sách vì LÝ DO CHÍNH ĐÁNG (thêm thư viện nền thật sự cần ngay)
 * thì nâng con số dưới đây trong cùng PR — để việc tăng dung lượng là một
 * quyết định có người duyệt, không phải tai nạn.
 */

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = process.argv[2] ? path.resolve(process.argv[2]) : path.join(ROOT, 'dist');

/**
 * Ngân sách sau gzip (mức 9), tính bằng kB. Số đo lúc đặt: JS ≈ 285 kB, CSS ≈ 31 kB.
 *
 * CSS nâng 40 → 46 kB: thêm shell responsive điện thoại (`phone:` — variant mới ở
 * `theme/variants.css` — cùng `touch:` mở rộng ra toàn UI kit cho vùng chạm) đo được
 * ~41.8 kB, vượt ngân sách cũ vì lý do chính đáng (feature thật, không phải leak) —
 * nâng số có chủ đích, chừa khoảng 4 kB cho tăng nhẹ sắp tới.
 *
 * CSS nâng 46 → 60 kB: Tailwind sinh MỘT file CSS cho toàn app — mọi class dùng ở
 * bất cứ đâu trong `src/`, kể cả trang demo lazy-load (JS không preload), đều vào
 * chung file đó nên tính vào "tải ban đầu". Thêm trang Factory (`features/demo/factory`)
 * + 2 mục catalog mới (`OpsKitSection`, `HudRecipesSection`) + cập nhật header đo được
 * ~55.9 kB, vượt ngân sách cũ vì lý do chính đáng (nội dung trưng bày thật, không phải
 * leak) — nâng số có chủ đích, chừa ~4 kB cho tăng nhẹ sắp tới. Nếu khoản này tiếp tục
 * tăng đều theo mỗi trang demo mới, cân nhắc lại với chủ repo việc tách ngân sách CSS
 * riêng cho bản demo (xem `docs/known-issues.md`).
 *
 * CSS nâng 60 → 64 kB: thêm ảnh xem trước kiểu header (`user-menu/skin-preview`) + thanh
 * khay (`page-header/shapes/shelf.theme.ts`, đã gom 12 class gradient còn 3 bằng biến CSS)
 * đo được ~60.4 kB — trước commit đó đã ~59.8 kB, tức ngân sách cũ hết chỗ. Đo lại cho
 * thấy class CHỈ trang demo dùng chỉ ~1.9 kB, nên tách ngân sách demo không giải quyết
 * được: phần tăng nằm ở UI kit / widget dùng chung (header riêng ~6.4 kB). Chừa ~3.6 kB.
 *
 * JS nâng 320 → 340 kB, CSS nâng 64 → 68 kB: sau đợt shell + UI kit mới (Dock, tab làm việc, trang chủ phân hệ,
 * `ChoiceTiles`…) đo được JS ≈ 330.4 kB, CSS ≈ 66.3 kB. Không chunk nào trong `LAZY_ONLY_CHUNKS` lọt vào tải đầu —
 * đây là phình dần của shell / UI kit dùng chung, chưa tách theo từng commit. Chừa ~9.6 kB JS, ~1.7 kB CSS; tăng nữa
 * thì đo lại phần nào nằm ở `index` / `Tooltip` (2 chunk lớn nhất sau vendor) thay vì nâng tiếp.
 */
const BUDGET_KB = {
  initialJs: 340,
  initialCss: 68,
};

/**
 * Chunk KHÔNG được có mặt trong tải ban đầu. Tên khớp nhóm `codeSplitting`
 * ở `vite.config.ts`.
 */
const LAZY_ONLY_CHUNKS = ['charts', 'tree', 'dnd'];

const indexPath = path.join(DIST, 'index.html');
if (!fs.existsSync(indexPath)) {
  console.error(`❌ Không thấy ${path.join(DIST, 'index.html')} — chạy \`npm run build\` trước.`);
  process.exit(1);
}

const html = fs.readFileSync(indexPath, 'utf8');

/** Mọi giá trị `src` / `href` của thẻ khớp `pattern` trỏ vào file trong dist. */
function collect(pattern) {
  return [...html.matchAll(pattern)].map((m) => m[1]).filter((url) => url.startsWith('/'));
}

/** `from"./x.js"` và `import"./x.js"` — KHÔNG khớp `import("…")` (dấu ngoặc bị loại khỏi nhóm giữa). */
const STATIC_IMPORT = /\b(?:import|export)\s*(?:[^'"()]*?\bfrom\s*)?["'](\.{1,2}\/[^"']+\.js)["']/g;

/** Mọi chunk đạt tới bằng import tĩnh từ `urls` (gồm chính `urls`), dưới dạng URL trong dist. */
function staticClosure(urls) {
  const seen = new Set();
  const queue = [...urls];
  while (queue.length > 0) {
    const url = queue.pop();
    if (seen.has(url)) continue;
    seen.add(url);
    const file = path.join(DIST, url);
    if (!fs.existsSync(file)) continue;
    const dir = path.posix.dirname(url);
    const code = fs.readFileSync(file, 'utf8');
    for (const match of code.matchAll(STATIC_IMPORT)) {
      queue.push(path.posix.normalize(path.posix.join(dir, match[1])));
    }
  }
  return [...seen];
}

const fromHtml = [
  ...collect(/<script[^>]+type="module"[^>]+src="([^"]+)"/g),
  ...collect(/<link[^>]+rel="modulepreload"[^>]+href="([^"]+)"/g),
];
const scripts = staticClosure(fromHtml);
const styles = collect(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g);

function gzipKb(url) {
  const file = path.join(DIST, url);
  return zlib.gzipSync(fs.readFileSync(file), { level: 9 }).length / 1024;
}

const measure = (urls) => urls.map((url) => ({ url, kb: gzipKb(url) }));
const total = (items) => items.reduce((sum, item) => sum + item.kb, 0);

const js = measure(scripts);
const css = measure(styles);
const jsTotal = total(js);
const cssTotal = total(css);

const problems = [];

for (const { url } of js) {
  const name = path.basename(url);
  const hit = LAZY_ONLY_CHUNKS.find((chunk) => name.startsWith(`${chunk}-`));
  if (hit) {
    problems.push(
      `Chunk "${hit}" (${name}) bị tải ngay từ đầu. Một module mà trang đầu cần đang nằm trong chunk này — xem thứ tự \`priority\` của \`codeSplitting.groups\` ở vite.config.ts.`,
    );
  }
}

if (jsTotal > BUDGET_KB.initialJs) {
  problems.push(
    `JS tải ban đầu ${jsTotal.toFixed(1)} kB gzip, vượt ngân sách ${BUDGET_KB.initialJs} kB.`,
  );
}
if (cssTotal > BUDGET_KB.initialCss) {
  problems.push(
    `CSS tải ban đầu ${cssTotal.toFixed(1)} kB gzip, vượt ngân sách ${BUDGET_KB.initialCss} kB.`,
  );
}

console.log('Tải ban đầu (gzip):');
for (const { url, kb } of [...js].sort((a, b) => b.kb - a.kb)) {
  console.log(`  ${kb.toFixed(1).padStart(7)} kB  ${path.basename(url)}`);
}
console.log(`  ${'─'.repeat(40)}`);
console.log(`  ${jsTotal.toFixed(1).padStart(7)} kB  JS   (ngân sách ${BUDGET_KB.initialJs} kB)`);
console.log(`  ${cssTotal.toFixed(1).padStart(7)} kB  CSS  (ngân sách ${BUDGET_KB.initialCss} kB)`);

if (problems.length > 0) {
  console.error(`\n❌ Ngân sách tải ban đầu KHÔNG đạt:`);
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}

console.log('\n✅ Tải ban đầu trong ngân sách.');
