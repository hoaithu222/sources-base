/**
 * Cấu trúc CSS — `docs/rules/styling/css-architecture.md` và `docs/rules/styling/scrollbar.md`.
 *
 * Một rule chỉ nằm trong tài liệu là một rule sẽ bị quên; ba nhóm dưới đây đều
 * đo được bằng máy:
 *   1. `globals.css` chỉ là entry (`@import`/`@source`), mỗi thư mục con chỉ chứa
 *      đúng loại khối của nó, và không file nào bị bỏ sót khỏi chuỗi import.
 *   2. Thanh cuộn — ba cái bẫy trình duyệt đã làm vỡ thanh cuộn thật.
 *   3. Độ nét chữ — `color-scheme` và trục `opsz` của Inter.
 *   4. Hình học KHÔNG đổi theo theme — một thang bo góc, viền bắt sáng chạy cả sáng lẫn tối (chỉ đổi cường độ qua biến).
 *
 * Nội dung file đọc qua `tests/helpers/source-files.ts`.
 */

import { describe, expect, it } from 'vitest';

import {
  SOURCE_CODE,
  SOURCE_CSS,
  isGenerated,
  stripComments as strip,
} from '@tests/helpers/source-files';

const CSS = SOURCE_CSS;
const CODE = SOURCE_CODE;

const STYLES = 'src/styles/';
const ENTRY = `${STYLES}globals.css`;

const SCROLLBAR_FILES = [`${STYLES}base/scrollbar.css`, `${STYLES}utilities/scrollbar.css`];

/** Bỏ chú thích CSS, giữ nguyên số dòng. */
const stripComments = (text: string) => strip(text, 'css');

/**
 * Phần mở đầu (trước `{` hoặc `;`) của từng câu lệnh CẤP TRÊN CÙNG.
 * `@layer base { … }` → `@layer base`; `.tv .p-4 { … }` → `.tv .p-4`.
 *
 * Ký tự trong chuỗi nháy bị bỏ qua: `@source '../**\/*.{ts,tsx}'` chứa `{` `}`
 * thật nhưng không phải khối.
 */
function topLevelPreludes(text: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let buffer = '';
  let quote = '';
  for (const ch of stripComments(text)) {
    if (quote) {
      if (ch === quote) quote = '';
      if (depth === 0) buffer += ch;
    } else if (ch === "'" || ch === '"') {
      quote = ch;
      if (depth === 0) buffer += ch;
    } else if (ch === '{') {
      if (depth === 0) {
        out.push(buffer.trim());
        buffer = '';
      }
      depth++;
    } else if (ch === '}') {
      depth--;
      if (depth === 0) buffer = '';
    } else if (ch === ';' && depth === 0) {
      if (buffer.trim()) out.push(buffer.trim());
      buffer = '';
    } else if (depth === 0) {
      buffer += ch;
    }
  }
  return out;
}

const filesIn = (dir: string) =>
  Object.keys(CSS).filter((p) => p.startsWith(`${STYLES}${dir}/`) && !isGenerated(p));

describe('globals.css — entry CSS toàn cục, root layout import trực tiếp', () => {
  const entry = CSS[ENTRY] ?? '';

  it('đọc được nội dung CSS thật — rỗng nghĩa là cấu hình vitest `css` đang nuốt `?raw`, mọi phép kiểm dưới đây sẽ pass giả', () => {
    expect(entry.length).toBeGreaterThan(200);
    expect(Object.keys(CSS).length).toBeGreaterThan(10);
  });

  it('root layout import globals.css; chỉ layout gốc và hai trang thay layout (global-*) được import; không entry CSS thứ hai', () => {
    expect(CODE['src/app/[locale]/layout.tsx']).toMatch(/^import '@\/styles\/globals\.css';$/m);
    // `global-error` / `global-not-found` thay cả root layout nên phải tự nạp CSS; chỗ nào khác import là nạp trùng.
    const importers = Object.entries(CODE)
      .filter(([, text]) => /^import '[^']*styles\/globals\.css';$/m.test(text))
      .map(([path]) => path)
      .sort();
    expect(importers).toEqual([
      'src/app/[locale]/layout.tsx',
      'src/app/global-error.tsx',
      'src/app/global-not-found.tsx',
    ]);
    const rootCss = Object.keys(CSS).filter((p) => /^src\/[^/]+\.css$/.test(p));
    expect(rootCss, `CSS toàn cục phải đi qua globals.css:\n  ${rootCss.join('\n  ')}`).toEqual([]);
  });

  it('chỉ chứa @import và @source, không viết rule', () => {
    const bad = topLevelPreludes(entry).filter((s) => !/^@(import|source)\b/.test(s));
    expect(
      bad,
      `Rule phải nằm trong file con, rồi @import vào đây:\n  ${bad.join('\n  ')}`,
    ).toEqual([]);
  });

  it('@import tailwindcss đứng ĐẦU TIÊN — preflight phải có trước mọi thứ khác', () => {
    const imports = [...stripComments(entry).matchAll(/@import\s+'([^']+)'/g)].map((m) => m[1]);
    expect(imports[0]).toBe('tailwindcss');
  });

  it('mọi file .css trong styles/ đều được import, và import nào cũng trỏ tới file có thật', () => {
    const imported = [...stripComments(entry).matchAll(/@import\s+'\.\/([^']+)'/g)].map(
      (m) => `${STYLES}${m[1]}`,
    );
    const onDisk = Object.keys(CSS).filter((p) => p.startsWith(STYLES) && p !== ENTRY);

    const orphans = onDisk.filter((p) => !imported.includes(p));
    const dangling = imported.filter((p) => !onDisk.includes(p));
    expect(
      orphans,
      `File chưa được @import (CSS không bao giờ chạy):\n  ${orphans.join('\n  ')}`,
    ).toEqual([]);
    expect(dangling, `@import trỏ tới file không tồn tại:\n  ${dangling.join('\n  ')}`).toEqual([]);
  });
});

describe('mỗi thư mục styles/ chỉ chứa đúng loại khối của nó', () => {
  const violations = (dir: string, ok: (prelude: string) => boolean) =>
    filesIn(dir).flatMap((path) =>
      topLevelPreludes(CSS[path] ?? '')
        .filter((p) => !ok(p))
        .map((p) => `${path} — "${p.slice(0, 60)}"`),
    );

  it('base/ — toàn bộ nằm trong @layer base', () => {
    const bad = violations('base', (p) => p === '@layer base');
    expect(bad, `Rule ở base/ phải nằm trong @layer base:\n  ${bad.join('\n  ')}`).toEqual([]);
  });

  it('utilities/ — toàn bộ nằm trong @layer utilities', () => {
    const bad = violations('utilities', (p) => p === '@layer utilities');
    expect(
      bad,
      `Rule ở utilities/ phải nằm trong @layer utilities:\n  ${bad.join('\n  ')}`,
    ).toEqual([]);
  });

  it('overrides/ — KHÔNG layer, vì chúng phải thắng utility của Tailwind', () => {
    const bad = violations('overrides', (p) => !p.startsWith('@layer'));
    expect(bad, `Đặt vào @layer là thua utility:\n  ${bad.join('\n  ')}`).toEqual([]);
  });

  it('theme/ — chỉ @theme, @keyframes, @property, @custom-variant', () => {
    const bad = violations('theme', (p) => /^@(theme|keyframes|property|custom-variant)\b/.test(p));
    expect(bad, `Rule thường không thuộc theme/:\n  ${bad.join('\n  ')}`).toEqual([]);
  });
});

describe('thanh cuộn — docs/rules/styling/scrollbar.md', () => {
  const allCss = Object.entries(CSS).filter(([p]) => !isGenerated(p));

  it('scrollbar-width / scrollbar-color chỉ khai trong hai file thanh cuộn', () => {
    // Từ Chrome 121, MỘT trong hai property này khác `auto` là Blink bỏ qua toàn bộ
    // `::-webkit-scrollbar*` → thanh cuộn custom biến mất, rơi về native ~15px.
    const hits = allCss
      .filter(([p]) => !SCROLLBAR_FILES.includes(p))
      .filter(([, text]) => /\bscrollbar-(width|color)\s*:/.test(stripComments(text)))
      .map(([p]) => p);
    expect(
      hits,
      `Đưa vào base/scrollbar.css hoặc utilities/scrollbar.css:\n  ${hits.join('\n  ')}`,
    ).toEqual([]);
  });

  it('mọi @supports (-moz-appearance) đều kèm not (-webkit-hyphens) — Safari cũng nhận -moz-appearance', () => {
    const bad = SCROLLBAR_FILES.flatMap((path) =>
      [...stripComments(CSS[path] ?? '').matchAll(/@supports[^{]*-moz-appearance[^{]*\{/g)]
        .filter((m) => !m[0].includes('-webkit-hyphens'))
        .map(() => path),
    );
    expect(bad, `Thiếu "not (-webkit-hyphens: none)":\n  ${bad.join('\n  ')}`).toEqual([]);
  });

  it('có reset cho .scrollbar-thin — Tailwind ≥ 4.3 tự sinh utility trùng tên', () => {
    const text = stripComments(CSS[`${STYLES}utilities/scrollbar.css`] ?? '');
    expect(text).toMatch(/\.scrollbar-thin\s*\{\s*scrollbar-width:\s*auto/);
  });

  it('code không dùng class scrollbar-thin (deprecated) hay [scrollbar-width:…] / [scrollbar-color:…]', () => {
    const hits: string[] = [];
    for (const [path, text] of Object.entries(CODE)) {
      strip(text)
        .split('\n')
        .forEach((line, i) => {
          if (/\bscrollbar-thin\b|\[scrollbar-(width|color):/.test(line)) {
            hits.push(`${path}:${i + 1} — ${line.trim().slice(0, 90)}`);
          }
        });
    }
    expect(hits, `Bỏ class — thanh cuộn mặc định đã đủ:\n  ${hits.join('\n  ')}`).toEqual([]);
  });
});

describe('độ nét chữ — docs/rules/styling/font-system.md §"Độ nét chữ"', () => {
  const documentCss = stripComments(CSS[`${STYLES}base/document.css`] ?? '');

  it('html khai color-scheme theo theme — widget do trình duyệt vẽ phải TỐI khi app tối', () => {
    expect(documentCss).toMatch(/html\s*\{[^}]*color-scheme:\s*light/);
    expect(documentCss).toMatch(/html\.dark\s*\{[^}]*color-scheme:\s*dark/);
  });

  it('html bật pipeline vẽ chữ: antialiased + optimizeLegibility + font-optical-sizing', () => {
    expect(documentCss).toMatch(/-webkit-font-smoothing:\s*antialiased/);
    expect(documentCss).toMatch(/text-rendering:\s*optimizeLegibility/);
    expect(documentCss).toMatch(/font-optical-sizing:\s*auto/);
  });

  it('root layout xin trục opsz của Inter (next/font) — thiếu thì font-optical-sizing là no-op im lặng', () => {
    const layout = strip(CODE['src/app/[locale]/layout.tsx'] ?? '');
    const inter = /\bInter\(\{[\s\S]*?\}\)/.exec(layout)?.[0] ?? '';
    expect(inter, 'thiếu lời gọi Inter({ … }) ở root layout').not.toBe('');
    expect(inter).toMatch(/axes:\s*\[\s*'opsz'\s*\]/);
  });

  it('biến font của next/font khớp --font-sans: Inter dẫn đầu qua var(--font-inter, …)', () => {
    const layout = strip(CODE['src/app/[locale]/layout.tsx'] ?? '');
    expect(layout).toMatch(/variable:\s*'--font-inter'/);
    const rootVars = stripComments(CSS[`${STYLES}base/root-vars.css`] ?? '');
    expect(rootVars).toMatch(/--font-sans:\s*var\(--font-inter,\s*'Inter'\)/);
  });
});

describe('autofill — docs/rules/styling/css-architecture.md §"Autofill"', () => {
  const autofillCss = stripComments(CSS[`${STYLES}overrides/autofill.css`] ?? '');

  it('nằm ở overrides/ (KHÔNG layer) và khớp :-webkit-autofill', () => {
    expect(autofillCss).toMatch(/:-webkit-autofill/);
    expect(filesIn('base').some((p) => p.endsWith('autofill.css'))).toBe(false);
  });

  it('trì hoãn chuyển màu nền — UA đặt nền bằng !important nên đây là cách duy nhất', () => {
    expect(autofillCss).toMatch(/transition-property:\s*background-color/);
    expect(autofillCss).toMatch(/transition-duration:\s*\d{4,}s/);
  });

  it('KHÔNG dùng box-shadow phủ màu cứng — nó đổi nền riêng của ô sang màu đoán', () => {
    expect(autofillCss).not.toMatch(/box-shadow/);
  });
});

describe('hình học không đổi theo theme — docs/rules/styling/light-theme.md §3 · §7.1', () => {
  const allCss = Object.entries(CSS).filter(([p]) => !isGenerated(p));
  const RADIUS_DECL = /--radius-(?:xs|sm|md|lg|xl|2xl)\s*:/;

  it('thang `--radius-*` chỉ khai MỘT lần ở theme/radius.css — không ai đặt lại dưới `.dark` / `.tv` (rounded-* luôn bo)', () => {
    const hits = allCss
      .filter(([p]) => p !== `${STYLES}theme/radius.css`)
      .filter(([, text]) => RADIUS_DECL.test(stripComments(text)))
      .map(([p]) => p);
    expect(hits, `Bỏ khai báo bán kính theo theme:\n  ${hits.join('\n  ')}`).toEqual([]);
    expect(stripComments(CSS[`${STYLES}theme/radius.css`] ?? '')).toMatch(RADIUS_DECL);
  });

  it('viền bắt sáng (rim-light.css) không rẽ nhánh theo theme — sáng / tối cùng một rule, khác nhau ở biến', () => {
    const rim = stripComments(CSS[`${STYLES}utilities/rim-light.css`] ?? '');
    expect(rim).not.toMatch(/:not\(\s*\.dark\s*\)/);
    expect(rim).toMatch(/:root\s*\{[^}]*--rim-glass-k/);
    expect(rim).toMatch(/\.dark\s*\{[^}]*--rim-glass-k/);
  });
});
