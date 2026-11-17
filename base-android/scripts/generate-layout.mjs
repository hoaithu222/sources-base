/**
 * generate-layout.mjs — sinh thang BO GÓC · GIÃN CÁCH · CỠ CONTROL · CỠ ICON ·
 * NÉT VIỀN · BREAKPOINT.
 *
 * NGUỒN DUY NHẤT: `src/styles/layout/layout.json`, chép đúng số đo của bộ
 * design system BIDV SmartBanking (Figma → Foundation "Border" và "Spacing").
 *
 * ── Vì sao tách khỏi màu và chữ ──────────────────────────────────────────────
 * Màu đổi theo theme, chữ phải kiểm lineHeight theo font. Ba nhóm token này thì
 * KHÔNG: chúng là số đo hình học, giống nhau ở mọi theme, và đổi cùng nhịp với
 * bản thiết kế. Gom chung vào một file thì mỗi lần ngân hàng chỉnh bo góc lại
 * phải mở file có 300 mã màu — nên tách.
 *
 * ── Ba đầu ra, ba nơi dùng khác nhau ────────────────────────────────────────
 *  1. `layout.generated.js`  → `tailwind.config.js` đọc, thành class
 *     `rounded-sm`, `p-md`, `h-control-md`.
 *  2. `layout.generated.ts`  → code TypeScript đọc, cho prop nhận SỐ THÔ:
 *     `<Icon size>`, `borderRadius` của `react-native-svg`, `hitSlop`…
 *  3. Kiểu `RadiusToken` / `SpacingToken`… để prop component chỉ nhận đúng tên
 *     có thật, không nhận số bừa.
 *
 * ⛔ Bo góc GHI ĐÈ thang mặc định của Tailwind (`rounded-sm` = 16 chứ không
 * phải 2px). Cố ý: hai thang song song thì lập trình viên quen tay gõ
 * `rounded-lg` của Tailwind và ra một số không có trong thiết kế.
 * Giãn cách thì NGƯỢC LẠI — chỉ THÊM tên gọi, giữ nguyên thang số
 * (`p-4` = 16px) vì thang số của Tailwind đã trùng khít bội số 4 của thiết kế.
 *
 * ⛔ Đừng sửa file `*.generated.*` — lần chạy sau ghi đè sạch.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const INPUT = path.join(ROOT, 'src/styles/layout/layout.json');
const JS_OUT = path.join(ROOT, 'src/styles/layout/layout.generated.js');
const TS_OUT = path.join(ROOT, 'src/shared/theme/layout.generated.ts');

const BANNER = 'Sinh tự động từ layout.json. ⛔ ĐỪNG SỬA TAY.';

/** Nhóm nào bắt buộc phải có — thiếu là tailwind.config sinh ra thang rỗng. */
const GROUPS = ['radius', 'spacing', 'control', 'icon', 'border', 'breakpoint'];

const layout = JSON.parse(await fs.readFile(INPUT, 'utf8'));

const problems = [];
for (const group of GROUPS) {
  const entries = layout[group];
  if (!entries || typeof entries !== 'object') {
    problems.push(`thiếu nhóm "${group}"`);
    continue;
  }
  for (const [name, value] of Object.entries(entries)) {
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
      problems.push(`"${group}.${name}" = ${JSON.stringify(value)} — phải là số dp không âm`);
    }
  }
}
/**
 * ⛔ Breakpoint phải TĂNG DẦN và không được trùng nhau.
 *
 * Tailwind sinh media query `min-width`, tức là bậc sau phải rộng hơn bậc
 * trước. Khai lộn thứ tự thì class của bậc hẹp ghi đè bậc rộng — CSS vẫn hợp lệ
 * nên không có lỗi nào báo, chỉ là máy tính bảng lấy đúng bố cục của điện thoại.
 *
 * ⚠️ Cũng chặn bậc `0`: Tailwind coi `min-width: 0px` là luôn khớp, biến một
 * bậc thành "mọi máy" và tất cả bậc sau thành vô nghĩa.
 */
const breakpoints = Object.entries(layout.breakpoint ?? {});
let previous = 0;
for (const [name, value] of breakpoints) {
  if (typeof value === 'number' && value <= previous) {
    problems.push(
      `"breakpoint.${name}" = ${JSON.stringify(value)} — phải LỚN HƠN bậc trước (${previous})`,
    );
  }
  if (typeof value === 'number') previous = value;
}

if (problems.length) {
  console.error('❌ layout.json không hợp lệ:');
  problems.forEach((p) => console.error('   ·', p));
  process.exit(1);
}

/** `{ md: 16 }` → `    'md': '16px',` (đơn vị px cho Tailwind). */
const pxLines = (entries) =>
  Object.entries(entries)
    .map(([name, value]) => `    '${name}': '${value}px',`)
    .join('\n');

/** `{ md: 16 }` → `  'md': 16,` (số thô cho TypeScript). */
const numLines = (entries) =>
  Object.entries(entries)
    .map(([name, value]) => `  '${name}': ${value},`)
    .join('\n');

const unionLines = (entries) =>
  Object.keys(entries)
    .map((name) => `  | '${name}'`)
    .join('\n');

// ── 1. layout.generated.js — nguồn cho tailwind.config.js ───────────────────
const jsOut = `/* ${BANNER} */
/* eslint-disable */
// prettier-ignore
module.exports = {
  /** theme.borderRadius — GHI ĐÈ thang mặc định. Class \`rounded-<tên>\`. */
  borderRadius: {
${pxLines(layout.radius)}
  },
  /** theme.extend.spacing — THÊM tên gọi. Class \`p-<tên>\`, \`gap-<tên>\`. */
  spacing: {
${pxLines(layout.spacing)}
  },
  /** theme.extend.height — chiều cao control. Class \`h-control-<tên>\`. */
  height: {
${Object.entries(layout.control)
  .map(([name, value]) => `    'control-${name}': '${value}px',`)
  .join('\n')}
  },
  /** theme.extend.borderWidth — nét viền theo thiết kế. */
  borderWidth: {
${pxLines(layout.border)}
  },
  /**
   * theme.screens — GHI ĐÈ thang breakpoint của Tailwind. Class \`tablet:p-xl\`.
   *
   * ⛔ Ghi đè chứ không extend: thang mặc định của Tailwind là số đo MÀN HÌNH
   * MÁY TÍNH (sm=640 · md=768 · lg=1024). Điện thoại rộng 360–430dp nên
   * \`sm:\` KHÔNG BAO GIỜ khớp trên điện thoại — class copy từ web lặng lẽ
   * không có tác dụng nào. Ba bậc dưới đây là số đo THẬT của thiết bị.
   */
  screens: {
${pxLines(layout.breakpoint)}
  },
};
`;

// ── 2. layout.generated.ts — cho prop nhận SỐ THÔ ──────────────────────────
const tsOut = `/** ${BANNER} */

export type RadiusToken =
${unionLines(layout.radius)};

export type SpacingToken =
${unionLines(layout.spacing)};

export type ControlSize =
${unionLines(layout.control)};

export type IconSize =
${unionLines(layout.icon)};

/** Bo góc, dp. Ở JSX ưu tiên class \`rounded-<tên>\`; đây là lối thoát cho SVG. */
export const RADIUS: Record<RadiusToken, number> = {
${numLines(layout.radius)}
};

/** Giãn cách, dp — cho \`contentContainerStyle\`, \`hitSlop\`, \`ItemSeparator\`. */
export const SPACING: Record<SpacingToken, number> = {
${numLines(layout.spacing)}
};

/**
 * Chiều cao control, dp.
 *
 * ⛔ Đừng hạ xuống dưới 40: ngưỡng vùng chạm tối thiểu mà cả Apple lẫn Google
 * khuyến nghị là 44dp. Cỡ \`xs\` (32) CHỈ dùng cho control nằm trong một hàng đã
 * có vùng chạm lớn hơn bọc ngoài (chip trong danh sách cuộn ngang chẳng hạn).
 */
export const CONTROL_HEIGHT: Record<ControlSize, number> = {
${numLines(layout.control)}
};

/** Cỡ icon, dp — prop \`size\` của \`<Icon>\`. */
export const ICON_SIZE: Record<IconSize, number> = {
${numLines(layout.icon)}
};

/** Nét viền, dp. */
export const BORDER_WIDTH = {
${numLines(layout.border)}
} as const;

export type BreakpointToken =
${unionLines(layout.breakpoint)};

/**
 * Ngưỡng bề rộng màn hình, dp — CÙNG số với class \`tablet:\`, \`phone:\`.
 *
 * Dùng cho những chỗ KHÔNG có className: số cột của lưới, \`numColumns\` của
 * FlashList, \`numberOfLines\`, chiều cao tấm trượt. ⛔ Đừng viết lại mấy con số
 * này tại chỗ — lệch với class là bố cục nhảy ở đúng một bề rộng và không ai
 * lần ra vì sao.
 *
 * Xem \`useBreakpoint()\` / \`useResponsiveValue()\` trong \`@/shared/theme\`.
 */
export const BREAKPOINTS: Record<BreakpointToken, number> = {
${numLines(layout.breakpoint)}
};
`;

await fs.mkdir(path.dirname(JS_OUT), { recursive: true });
await fs.writeFile(JS_OUT, jsOut);
await fs.mkdir(path.dirname(TS_OUT), { recursive: true });
await fs.writeFile(TS_OUT, tsOut);

const count = GROUPS.reduce((sum, g) => sum + Object.keys(layout[g]).length, 0);
console.log(`✅ ${path.relative(ROOT, JS_OUT)} — ${count} token hình học`);
console.log(`✅ ${path.relative(ROOT, TS_OUT)} — ${GROUPS.length} nhóm`);
