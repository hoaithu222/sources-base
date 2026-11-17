/**
 * Nền responsive — `docs/rules/display/ipad-responsive.md`, `docs/rules/styling/css-architecture.md`.
 *
 * Bản đồ mốc / biến thể chỉ nằm trong tài liệu là bản đồ sẽ bị quên; những gì đo được bằng máy thì giữ ở đây:
 *   1. Biến thể `phone:` khai dạng KHỐI + `@slot` (dạng gọn `(@media A, B)` tách sai dấu phẩy, lỗi im lặng).
 *   2. Mốc `wide` / `3xl` và các biến thể `touch:` · `standalone:` không bị đổi giá trị.
 *   3. Bản JS (`media-query.constants.ts`) khớp từng chữ với điều kiện của CSS — hai bên không nói hai chuyện.
 *   4. Bảng thiết bị chuẩn (điện thoại / tablet / laptop 14" / 16" / màn ngoài) rơi đúng bậc và đúng `phone:`.
 *   5. `viewport` của root layout (`buildViewport`) KHÔNG khoá phóng to, có `viewport-fit=cover`; metadata PWA / iOS
 *      (`buildRootMetadata`); nền chống phình chữ · vùng an toàn · chạm.
 *   6. CSS `:hover` viết tay phải bọc `@media (hover: hover)`; không `h-screen` / `100vh` cho khung toàn màn.
 *
 * Đọc file bằng `import.meta.glob` (`tests/helpers/source-files.ts`) — `vitest.config.ts` cho `css.include` `*.css?raw`
 * để nội dung CSS là thật chứ không rỗng.
 */

import { describe, expect, it } from 'vitest';

import {
  HANDWRITTEN_CODE,
  SOURCE_CSS,
  isGenerated,
  stripComments as strip,
} from '@tests/helpers/source-files';

import { buildRootMetadata, buildViewport } from '@/core/seo';
import {
  BELOW_WIDE_QUERY,
  PHONE_MEDIA_QUERY,
  TOUCH_MEDIA_QUERY,
} from '@/shared/constants/media-query.constants';

const STYLES = 'src/styles/';
const css = (file: string) => strip(SOURCE_CSS[`${STYLES}${file}`] ?? '', 'css');

const VARIANTS = css('theme/variants.css');
const BREAKPOINTS = css('theme/breakpoints.css');
const TOUCH = css('base/touch.css');
const PHONE = css('base/phone.css');
const DOCUMENT = css('base/document.css');
const ROOT_VARS = css('base/root-vars.css');

const squash = (text: string) => text.replace(/\s+/g, ' ').trim();

/** Nội dung trong cặp `{ … }` đầu tiên khớp `prelude` (đếm ngoặc), hoặc `''` khi không có. */
function blockAfter(text: string, prelude: RegExp): string {
  const match = prelude.exec(text);
  if (!match) return '';
  let depth = 0;
  for (let i = match.index + match[0].length - 1; i < text.length; i++) {
    if (text[i] === '{') depth++;
    if (text[i] === '}' && --depth === 0) return text.slice(match.index + match[0].length, i);
  }
  return '';
}

/** Điều kiện của mọi `@media … {` trong `text`, theo thứ tự xuất hiện. */
const mediaConditions = (text: string) =>
  [...text.matchAll(/@media\s+([^{]+?)\s*\{/g)].map((m) => squash(m[1]));

describe('biến thể phone: — khai dạng KHỐI với đúng hai media', () => {
  const block = blockAfter(VARIANTS, /@custom-variant\s+phone\s*\{/);

  it('có `@custom-variant phone { … }`, KHÔNG dạng gọn `(@media A, B)`', () => {
    expect(block, 'thiếu khối `@custom-variant phone { … }` ở theme/variants.css').not.toBe('');
    expect(VARIANTS).not.toMatch(/@custom-variant\s+phone\s*\(/);
  });

  it('đúng hai khối @media, mỗi khối một `@slot;`', () => {
    expect(mediaConditions(block)).toEqual([
      '(max-width: 767.98px)',
      '(max-height: 540px) and (max-width: 1023.98px)',
    ]);
    expect(block.match(/@slot\s*;/g)).toHaveLength(2);
  });

  it('bản JS PHONE_MEDIA_QUERY = hai điều kiện trên nối bằng dấu phẩy', () => {
    expect(PHONE_MEDIA_QUERY).toBe(mediaConditions(block).join(', '));
  });

  it('touch.css (nhả đà vuốt dọc) và phone.css (thu chữ hiển thị) dùng đúng điều kiện phone', () => {
    expect(mediaConditions(TOUCH)).toContain(PHONE_MEDIA_QUERY);
    expect(mediaConditions(PHONE)).toEqual([PHONE_MEDIA_QUERY]);
  });
});

describe('biến thể touch: · standalone: · dark: · tv: — không đổi', () => {
  it('touch: = (hover: none) and (pointer: coarse); bản JS khớp', () => {
    expect(VARIANTS).toMatch(
      /@custom-variant\s+touch\s*\(@media\s*\(hover:\s*none\)\s*and\s*\(pointer:\s*coarse\)\)\s*;/,
    );
    expect(TOUCH_MEDIA_QUERY).toBe('(hover: none) and (pointer: coarse)');
  });

  it('standalone:, dark:, tv: còn đủ', () => {
    expect(VARIANTS).toMatch(
      /@custom-variant\s+standalone\s*\(@media\s*\(display-mode:\s*standalone\)\)/,
    );
    expect(VARIANTS).toMatch(/@custom-variant\s+dark\s*\(&:where\(\.dark,\s*\.dark \*\)\)/);
    expect(VARIANTS).toMatch(/@custom-variant\s+tv\s*\(&:where\(\.tv,\s*\.tv \*\)\)/);
  });
});

describe('mốc bề rộng — giữ `wide` 1800 và `3xl` 1920, không thêm mốc', () => {
  const theme = blockAfter(BREAKPOINTS, /@theme\s*\{/);
  const tokens = Object.fromEntries(
    [...theme.matchAll(/--breakpoint-([\w-]+):\s*([\d.]+)rem\s*;/g)].map((m) => [
      m[1],
      Number(m[2]) * 16,
    ]),
  );

  it('chỉ khai hai mốc: wide = 112.5rem (1800px), 3xl = 120rem (1920px)', () => {
    expect(theme).toMatch(/--breakpoint-wide:\s*112\.5rem\s*;/);
    expect(theme).toMatch(/--breakpoint-3xl:\s*120rem\s*;/);
    expect(Object.keys(tokens).sort()).toEqual(['3xl', 'wide']);
  });

  it('BELOW_WIDE_QUERY = đúng dưới mốc wide (`max-wide:` = width < 1800px)', () => {
    expect(BELOW_WIDE_QUERY).toBe(`(max-width: ${tokens.wide - 0.02}px)`);
  });
});

/**
 * Bảng thiết bị chuẩn (viewport CSS px) → bậc `min-width` lớn nhất đã khớp, và `phone:` có khớp không.
 * Bậc sm…2xl là mặc định của Tailwind; wide / 3xl đọc từ breakpoints.css.
 */
type Tier = 'base' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'wide';
type Device = readonly [name: string, width: number, height: number, tier: Tier, phone: boolean];

const DEVICES: readonly Device[] = [
  ['Điện thoại dọc 320×568', 320, 568, 'base', true],
  ['Điện thoại dọc 360×800', 360, 800, 'base', true],
  ['Điện thoại dọc 375×667', 375, 667, 'base', true],
  ['Điện thoại dọc 390×844', 390, 844, 'base', true],
  ['Điện thoại dọc 393×852', 393, 852, 'base', true],
  ['Điện thoại dọc 412×915', 412, 915, 'base', true],
  ['Điện thoại dọc 430×932', 430, 932, 'base', true],
  ['Điện thoại ngang 568×320', 568, 320, 'base', true],
  ['Điện thoại ngang 667×375', 667, 375, 'sm', true],
  ['Điện thoại ngang 844×390', 844, 390, 'md', true],
  ['Điện thoại ngang 915×412', 915, 412, 'md', true],
  ['Điện thoại ngang 932×430', 932, 430, 'md', true],
  ['Tablet dọc 744×1133 (mini)', 744, 1133, 'sm', true],
  ['Tablet dọc 768×1024', 768, 1024, 'md', false],
  ['Tablet dọc 810×1080', 810, 1080, 'md', false],
  ['Tablet dọc 820×1180', 820, 1180, 'md', false],
  ['Tablet dọc 834×1194', 834, 1194, 'md', false],
  ['Tablet dọc 1024×1366 (Pro 12.9")', 1024, 1366, 'lg', false],
  ['Tablet ngang 1024×768', 1024, 768, 'lg', false],
  ['Tablet ngang 1133×744', 1133, 744, 'lg', false],
  ['Tablet ngang 1180×820', 1180, 820, 'lg', false],
  ['Tablet ngang 1194×834', 1194, 834, 'lg', false],
  ['Tablet ngang 1366×1024 (Pro 12.9")', 1366, 1024, 'xl', false],
  ['Laptop 14" 1280×720', 1280, 720, 'xl', false],
  ['Laptop 14" 1366×768', 1366, 768, 'xl', false],
  ['Laptop 14" 1440×900', 1440, 900, 'xl', false],
  ['Laptop 14" 1512×982', 1512, 982, 'xl', false],
  ['Laptop 14" 1536×864', 1536, 864, '2xl', false],
  ['Laptop 16" 1536×960', 1536, 960, '2xl', false],
  ['Laptop 16" 1600×900', 1600, 900, '2xl', false],
  ['Laptop 16" 1680×1050', 1680, 1050, '2xl', false],
  ['Laptop 16" 1728×1117', 1728, 1117, '2xl', false],
  ['Laptop 16" 1792×1120', 1792, 1120, '2xl', false],
  ['Màn ngoài 1920×1080', 1920, 1080, 'wide', false],
  ['Màn ngoài 2560×1440', 2560, 1440, 'wide', false],
  ['TV 3840×2160', 3840, 2160, 'wide', false],
];

const TAILWIND_TIERS = [
  ['sm', 640],
  ['md', 768],
  ['lg', 1024],
  ['xl', 1280],
  ['2xl', 1536],
] as const;

/** Bộ đánh giá media query tối thiểu: danh sách `A, B` · `(feature: Npx) and (…)` với min/max-width/height. */
function matchesMedia(query: string, width: number, height: number): boolean {
  const clauseMatches = (clause: string) =>
    clause.split(/\s+and\s+/).every((part) => {
      const m = /^\((min|max)-(width|height):\s*([\d.]+)px\)$/.exec(part.trim());
      if (!m) throw new Error(`Bộ đánh giá không hiểu "${part}" — mở rộng matchesMedia`);
      const value = m[2] === 'width' ? width : height;
      return m[1] === 'min' ? value >= Number(m[3]) : value <= Number(m[3]);
    });
  return query.split(',').some((clause) => clauseMatches(clause.trim()));
}

describe('bảng thiết bị chuẩn — đúng bậc, đúng phone:', () => {
  const wideAt = 112.5 * 16;
  const tierOf = (width: number): Tier => {
    if (width >= wideAt) return 'wide';
    return [...TAILWIND_TIERS].reverse().find(([, min]) => width >= min)?.[0] ?? 'base';
  };

  it.each([...DEVICES])('%s', (_name, width, height, tier, phone) => {
    expect(tierOf(width)).toBe(tier);
    expect(matchesMedia(PHONE_MEDIA_QUERY, width, height)).toBe(phone);
    expect(matchesMedia(BELOW_WIDE_QUERY, width, height)).toBe(width < wideAt);
  });

  it('iPad Pro 12.9" ngang (1366) cùng bậc `xl` với laptop 14" — chỉ `touch:` tách được hai máy', () => {
    expect(tierOf(1366)).toBe('xl');
    expect(tierOf(1280)).toBe('xl');
  });

  it('laptop thấp nhất (1280×600) KHÔNG khớp phone: — hoặc rộng ≥ 1024, hoặc cao > 540', () => {
    expect(matchesMedia(PHONE_MEDIA_QUERY, 1280, 600)).toBe(false);
    expect(matchesMedia(PHONE_MEDIA_QUERY, 1024, 541)).toBe(false);
    expect(matchesMedia(PHONE_MEDIA_QUERY, 1024, 540)).toBe(false);
    expect(matchesMedia(PHONE_MEDIA_QUERY, 1023, 540)).toBe(true);
  });
});

describe('viewport + PWA (root layout, thay index.html) — không khoá phóng to', () => {
  const viewport: Record<string, unknown> = { ...buildViewport() };
  const root = buildRootMetadata({ locale: 'vi', title: 'Tiêu đề', description: 'Mô tả' });

  it('viewport: device-width + initial-scale=1 + viewport-fit=cover', () => {
    expect(viewport.width).toBe('device-width');
    expect(viewport.initialScale).toBe(1);
    expect(viewport.viewportFit).toBe('cover');
  });

  it('KHÔNG khai `maximumScale` / `userScalable` (chặn phóng là chặn người cần trợ năng)', () => {
    expect(viewport).not.toHaveProperty('maximumScale');
    expect(viewport).not.toHaveProperty('userScalable');
    const hits = Object.entries(HANDWRITTEN_CODE)
      .filter(([, text]) =>
        /maximum-scale|user-scalable|maximumScale|userScalable/i.test(strip(text)),
      )
      .map(([path]) => path);
    expect(hits, 'Không khoá phóng to ở bất kỳ file nào của src/').toEqual([]);
  });

  it('cụm PWA + chống iOS tự biến số thành link', () => {
    expect(root.appleWebApp).toMatchObject({ capable: true });
    expect(root.appleWebApp).toHaveProperty('statusBarStyle');
    expect(root.formatDetection).toMatchObject({ telephone: false });
    expect(root.manifest).toBe('/manifest.webmanifest');
    expect(root.icons).toHaveProperty('apple');
  });

  it('manifest.ts khai app cài được (standalone) và có icon maskable', () => {
    const manifest = HANDWRITTEN_CODE['src/app/manifest.ts'] ?? '';
    expect(manifest).toMatch(/display:\s*'standalone'/);
    expect(manifest).toMatch(/purpose:\s*'maskable'/);
  });
});

describe('nền toàn cục an toàn cho máy chạm', () => {
  it('bốn biến vùng an toàn --safe-t/-r/-b/-l đọc `env(safe-area-inset-*)` với mặc định 0px', () => {
    for (const [name, side] of [
      ['t', 'top'],
      ['r', 'right'],
      ['b', 'bottom'],
      ['l', 'left'],
    ]) {
      expect(ROOT_VARS).toContain(`--safe-${name}: env(safe-area-inset-${side}, 0px);`);
    }
  });

  it('chống phình chữ khi xoay ngang + bỏ ô xám khi chạm', () => {
    expect(DOCUMENT).toMatch(/-webkit-text-size-adjust:\s*100%/);
    expect(DOCUMENT).toMatch(/-webkit-tap-highlight-color:\s*transparent/);
  });

  it('khung tài liệu: html cao 100%, body min-height 100% và KHÔNG khoá cuộn (trang công khai cuộn tự nhiên)', () => {
    const body = blockAfter(DOCUMENT, /(?<![\w.-])body\s*\{/);
    expect(DOCUMENT).toMatch(/html\s*\{[^}]*height:\s*100%/);
    expect(body).toMatch(/min-height:\s*100%/);
    expect(
      body,
      'body khoá `overflow: hidden` / `height: 100%` làm trang SEO không cuộn được',
    ).not.toMatch(/(?<![\w-])height:\s*100%|overflow(?:-y)?:\s*hidden/);
    expect(DOCUMENT).not.toMatch(/#root\b/);
  });

  it('vỏ vùng làm việc tự khoá viewport: AppShellLayout `h-dvh overflow-hidden`, cuộn trong <main>', () => {
    const layout = strip(HANDWRITTEN_CODE['src/app/_layouts/AppShellLayout.tsx'] ?? '');
    expect(layout).toMatch(/root:[^\n]*\bh-dvh\b[^\n]*\boverflow-hidden\b/);
    expect(layout).toMatch(/main:[^\n]*\boverflow-y-auto\b/);
  });

  const touchMedia = blockAfter(
    TOUCH,
    /@media\s*\(hover:\s*none\)\s*and\s*\(pointer:\s*coarse\)\s*\{/,
  );
  const outsideTouchMedia = TOUCH.replace(touchMedia, '');

  it('overscroll-behavior: none chỉ nằm TRONG media chạm (đặt ngoài là đụng bàn di macOS)', () => {
    expect(touchMedia).toMatch(/html,\s*body\s*\{\s*overscroll-behavior:\s*none/);
    expect(outsideTouchMedia).not.toMatch(/overscroll-behavior:\s*none/);
  });

  it('touch-action: manipulation cho control bấm được — chỉ trong media chạm, không chặn pinch-zoom', () => {
    expect(touchMedia).toMatch(/touch-action:\s*manipulation/);
    expect(outsideTouchMedia).not.toMatch(/touch-action/);
    expect(TOUCH).not.toMatch(/touch-action:\s*(none|pan-x pan-y)/);
  });

  it('thanh cuộn chạm: rộng 0 trong media chạm (iOS / Android vẽ thanh nổi), vẫn qua ::-webkit-scrollbar', () => {
    const scrollbar = css('base/scrollbar.css');
    const inTouch = blockAfter(
      scrollbar,
      /@media\s*\(hover:\s*none\)\s*and\s*\(pointer:\s*coarse\)\s*\{/,
    );
    expect(inTouch).toMatch(/::-webkit-scrollbar\s*\{\s*width:\s*0;\s*height:\s*0;?\s*\}/);
  });
});

interface CssRule {
  selector: string;
  medias: string[];
}

/** Mọi rule thường (không phải at-rule) cùng chuỗi `@media` bao quanh nó. */
function cssRules(text: string): CssRule[] {
  const rules: CssRule[] = [];
  const stack: string[] = [];
  let buffer = '';
  let quote = '';
  for (const ch of text) {
    if (quote) {
      if (ch === quote) quote = '';
      buffer += ch;
    } else if (ch === "'" || ch === '"') {
      quote = ch;
      buffer += ch;
    } else if (ch === '{') {
      const prelude = squash(buffer);
      if (!prelude.startsWith('@')) {
        rules.push({ selector: prelude, medias: stack.filter((p) => p.startsWith('@media')) });
      }
      stack.push(prelude);
      buffer = '';
    } else if (ch === '}') {
      stack.pop();
      buffer = '';
    } else if (ch === ';') {
      buffer = '';
    } else {
      buffer += ch;
    }
  }
  return rules;
}

describe('CSS `:hover` viết tay — bọc @media (hover: hover) (hover dính trên máy chạm)', () => {
  const FILES = Object.entries(SOURCE_CSS).filter(
    ([path]) => !isGenerated(path) && !path.endsWith('overrides/autofill.css'),
  );

  it('có CSS để kiểm', () => {
    expect(FILES.length).toBeGreaterThan(10);
  });

  it('không rule nào chứa `:hover` mà thiếu @media (hover: hover) bao ngoài', () => {
    const bad = FILES.flatMap(([path, text]) =>
      cssRules(strip(text, 'css'))
        .filter((r) => /:hover\b/.test(r.selector))
        .filter((r) => !r.medias.some((m) => m.includes('(hover: hover)')))
        .map((r) => `${path} — ${r.selector.slice(0, 80)}`),
    );
    expect(
      bad,
      `Bọc trong \`@media (hover: hover)\` (ipad-responsive.md §7):\n  ${bad.join('\n  ')}`,
    ).toEqual([]);
  });
});

describe('khung toàn màn dùng dvh, không vh', () => {
  const FRAME_VH = /\b(?:min-|max-)?h-screen\b|\b(?:min-|max-)?h-\[100vh\]/;

  it('không còn `h-screen` / `min-h-screen` / `max-h-screen` / `h-[100vh]` trong src/ (ipad-responsive.md §5)', () => {
    const hits = Object.entries(HANDWRITTEN_CODE).flatMap(([path, text]) =>
      strip(text)
        .split('\n')
        .flatMap((line, i) =>
          FRAME_VH.test(line) ? [`${path}:${i + 1} — ${line.trim().slice(0, 90)}`] : [],
        ),
    );
    expect(
      hits,
      `Đổi sang \`h-dvh\` / \`min-h-dvh\` / \`100dvh\`:\n  ${hits.join('\n  ')}`,
    ).toEqual([]);
  });
});
