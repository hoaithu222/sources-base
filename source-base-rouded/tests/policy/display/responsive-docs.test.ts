/**
 * Tài liệu responsive khớp code — `docs/rules/display/responsive-screens.md`,
 * `docs/rules/foundations/documentation-management.md §3`.
 *
 * Bảng thiết bị và bảng gate chỉ nằm trong tài liệu là bảng sẽ lệch code; những gì đo được bằng máy giữ ở đây:
 *   1. `responsive-screens.md` có thật, `docs/README.md` (mục lục duy nhất) trỏ tới, và các rule liên quan
 *      (`ipad-responsive` · `tailwind-conventions` · `css-architecture`) trỏ sang nó.
 *   2. Mốc `wide` / `3xl` ghi trong tài liệu = giá trị thật ở `theme/breakpoints.css`.
 *   3. Điều kiện `phone:` ghi ở §2.2 = hai `@media` thật của `theme/variants.css`.
 *   4. Mọi biến thể khai bằng `@custom-variant` đều có hàng ở bảng §2.2 — thêm biến thể mà quên tài liệu là đỏ.
 *   5. Bảng §1 đủ các cỡ viewport chuẩn (điện thoại · tablet · laptop 14" / 16" · màn ngoài · TV).
 *   6. Mọi chỗ trích `responsive-screens.md §x.y` (docs, code, test) trỏ tới tiêu đề có thật — đổi số mục
 *      là phải sửa nơi trích.
 *   7. Bảng thu chữ `h1–h4` ở điện thoại trong `font-system.md` = móc `--fs-*` / `--lh-*` của `base/phone.css`.
 * Khớp CSS ↔ JS ↔ bảng bậc: `responsive-foundation.test.ts`.
 */

import { describe, expect, it } from 'vitest';

import {
  DOC_FILES,
  SOURCE_CODE,
  SOURCE_CSS,
  TEST_FILES,
  stripComments,
} from '@tests/helpers/source-files';

const RULE_PATH = 'docs/rules/display/responsive-screens.md';
const RULE = DOC_FILES[RULE_PATH] ?? '';
const STYLES = 'src/styles/';

const css = (file: string) => stripComments(SOURCE_CSS[`${STYLES}${file}`] ?? '', 'css');
const VARIANTS = css('theme/variants.css');
const BREAKPOINTS = css('theme/breakpoints.css');

/** Nội dung từ tiêu đề `heading` tới tiêu đề kế cùng cấp hoặc cao hơn ('' khi không có). */
function sectionOf(text: string, heading: RegExp): string {
  const lines = text.split('\n');
  const start = lines.findIndex((line) => heading.test(line));
  if (start < 0) return '';
  const level = /^#+/.exec(lines[start])?.[0].length ?? 2;
  const end = lines.findIndex(
    (line, i) => i > start && /^#+\s/.test(line) && (/^#+/.exec(line)?.[0].length ?? 9) <= level,
  );
  return lines.slice(start, end < 0 ? undefined : end).join('\n');
}

/** Hàng bảng markdown mở đầu bằng `cell` (vd "`wide:`"), hoặc '' khi không có. */
const tableRow = (text: string, cell: string) =>
  text.split('\n').find((line) => line.startsWith(`| ${cell} `)) ?? '';

/** px của mốc `--breakpoint-<name>: Nrem` (1rem = 16px). */
function breakpointPx(name: string): number {
  const match = new RegExp(`--breakpoint-${name}:\\s*([\\d.]+)rem\\s*;`).exec(BREAKPOINTS);
  return match ? Number(match[1]) * 16 : Number.NaN;
}

describe('responsive-screens.md — có thật và được mục lục trỏ tới', () => {
  it('tài liệu tồn tại và đủ các mục §0–§8', () => {
    expect(RULE.length, `Thiếu ${RULE_PATH}`).toBeGreaterThan(4000);
    for (let n = 0; n <= 8; n++) {
      expect(RULE, `Thiếu tiêu đề "## ${n}." trong ${RULE_PATH}`).toMatch(
        new RegExp(`^## ${n}\\.\\s`, 'm'),
      );
    }
  });

  it('docs/README.md (mục lục duy nhất) có dòng trỏ tới nó', () => {
    expect(DOC_FILES['docs/README.md'] ?? '').toContain('rules/display/responsive-screens.md');
  });

  it.each([
    'docs/rules/display/ipad-responsive.md',
    'docs/rules/styling/tailwind-conventions.md',
    'docs/rules/styling/css-architecture.md',
  ])('%s trỏ sang responsive-screens.md (không chép lại bảng)', (path) => {
    expect(DOC_FILES[path] ?? '', `${path} phải trỏ sang responsive-screens.md`).toContain(
      'responsive-screens.md',
    );
  });
});

describe('mốc bề rộng trong tài liệu = breakpoints.css', () => {
  const ladder = sectionOf(RULE, /^### 2\.1\./);
  const wide = breakpointPx('wide');
  const triple = breakpointPx('3xl');

  it('đọc được mốc từ CSS', () => {
    expect(wide).toBe(1800);
    expect(triple).toBe(1920);
  });

  it('bảng §2.1 ghi `wide:` = 1800 và `3xl:` = 1920', () => {
    expect(tableRow(ladder, '`wide:`')).toContain(`| ${wide} |`);
    expect(tableRow(ladder, '`3xl:`')).toContain(`| ${triple} |`);
  });

  it('ipad-responsive.md ghi `wide` đúng mốc', () => {
    const ipad = DOC_FILES['docs/rules/display/ipad-responsive.md'] ?? '';
    expect(ipad).toMatch(new RegExp(`wide:\\s*≥\\s*${wide}\\b`));
    expect(ipad).toContain('(max-width: 1799.98px)');
  });
});

describe('biến thể ở variants.css = bảng §2.2', () => {
  const table = sectionOf(RULE, /^### 2\.2\./);

  it('mọi `@custom-variant` đều có mặt trong bảng', () => {
    const declared = [...VARIANTS.matchAll(/@custom-variant\s+([\w-]+)/g)].map((m) => m[1]);
    expect(declared.length).toBeGreaterThanOrEqual(5);
    const missing = declared.filter((name) => !table.includes(`\`${name}:\``));
    expect(missing, `Thêm hàng vào bảng §2.2 cho: ${missing.join(', ')}`).toEqual([]);
  });

  it('điều kiện `phone:` ghi trong bảng = hai @media thật', () => {
    const block = /@custom-variant\s+phone\s*\{([\s\S]*?)\n\}/.exec(VARIANTS)?.[1] ?? '';
    const numbers = [...new Set([...block.matchAll(/(\d+(?:\.\d+)?)px/g)].map((m) => m[1]))];
    expect(numbers.length, 'Không đọc được khối `@custom-variant phone`').toBeGreaterThanOrEqual(3);
    const row = tableRow(table, '`phone:`');
    const missing = numbers.filter((n) => !row.includes(`${n}px`));
    expect(missing, `Hàng \`phone:\` ở §2.2 thiếu số: ${missing.join(', ')}`).toEqual([]);
  });

  it('`touch:` và `standalone:` ghi đúng điều kiện', () => {
    expect(tableRow(table, '`touch:`')).toContain('(hover: none) and (pointer: coarse)');
    expect(tableRow(table, '`standalone:`')).toContain('(display-mode: standalone)');
  });
});

describe('bảng §1 — đủ các cỡ viewport chuẩn', () => {
  const devices = sectionOf(RULE, /^## 1\./);

  const REQUIRED = [
    // Điện thoại dọc
    '320×568',
    '360×800',
    '375×667',
    '390×844',
    '393×852',
    '412×915',
    '430×932',
    // Điện thoại ngang
    '568×320',
    '667×375',
    '844×390',
    '915×412',
    '932×430',
    // Tablet dọc
    '744×1133',
    '768×1024',
    '810×1080',
    '820×1180',
    '834×1194',
    '1024×1366',
    // Tablet ngang
    '1024×768',
    '1133×744',
    '1180×820',
    '1194×834',
    '1366×1024',
    // Laptop 14"
    '1280×720',
    '1366×768',
    '1440×900',
    '1512×982',
    '1536×864',
    // Laptop 16"
    '1600×900',
    '1680×1050',
    '1728×1117',
    '1792×1120',
    '1536×960',
    // Màn ngoài / TV
    '1920×1080',
    '2560×1440',
    '3840×2160',
  ];

  it(`có đủ ${REQUIRED.length} cỡ`, () => {
    expect(devices.length, 'Không tìm thấy mục "## 1."').toBeGreaterThan(500);
    const missing = REQUIRED.filter((size) => !devices.includes(size));
    expect(missing, `Bảng §1 thiếu cỡ: ${missing.join(', ')}`).toEqual([]);
  });

  it('ma trận §6.1 nói đúng số cỡ của bảng §1', () => {
    expect(RULE).toContain(`TOÀN BỘ bảng §1 (${REQUIRED.length} cỡ)`);
  });
});

describe('trích dẫn `responsive-screens.md §x.y` trỏ tới tiêu đề có thật', () => {
  const headings = new Set([...RULE.matchAll(/^#{2,3}\s+(\d+(?:\.\d+)?)\./gm)].map((m) => m[1]));
  const SOURCES = { ...DOC_FILES, ...SOURCE_CODE, ...SOURCE_CSS, ...TEST_FILES };

  it('có tiêu đề để đối chiếu', () => {
    expect(headings.size).toBeGreaterThan(20);
  });

  it('mọi §x.y được trích ở docs / code / test đều có tiêu đề', () => {
    const broken = Object.entries(SOURCES).flatMap(([file, text]) =>
      [...text.matchAll(/responsive-screens(?:\.md)?\s*§\s*(\d+(?:\.\d+)?)/g)]
        .filter((m) => !headings.has(m[1]))
        .map((m) => `${file} — §${m[1]}`),
    );
    expect(broken, 'Sửa số mục ở nơi trích hoặc ở tiêu đề của responsive-screens.md').toEqual([]);
  });
});

describe('font-system.md — bảng thu chữ điện thoại = phone.css', () => {
  const FONT = DOC_FILES['docs/rules/styling/font-system.md'] ?? '';
  const PHONE = css('base/phone.css');
  const px = (name: string) => {
    const match = new RegExp(String.raw`--${name}:\s*([\d.]+)rem`).exec(PHONE);
    return match ? Number(match[1]) * 16 : Number.NaN;
  };

  it.each([1, 2, 3, 4])('`text-h%i`: cỡ / giãn dòng ở điện thoại khớp móc --fs / --lh', (n) => {
    const row = tableRow(FONT, `\`text-h${n}\``);
    expect(row, `font-system.md thiếu hàng \`text-h${n}\` ở mục "Điện thoại"`).not.toBe('');
    expect(row).toContain(`| ${px(`fs-h${n}`)}px / ${px(`lh-h${n}`)}px |`);
  });
});
