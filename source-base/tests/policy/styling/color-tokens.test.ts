/**
 * Bảng màu — `src/styles/theme/colors-theme.json` và `docs/rules/styling/color-system.md`.
 *
 * ── Vì sao cần bài kiểm này ──────────────────────────────────────────────────
 * Tailwind IM LẶNG bỏ qua class màu không tồn tại: gõ `text-fg-1` sau khi token
 * ấy đã đổi tên thì phần tử mất màu mà không có lỗi build, lint hay typecheck
 * nào. Ngược lại, token không ai dùng cứ nằm lại trong JSON (bản trước có
 * 327 key thì 99 key không có nơi dùng nào). Bốn nhóm dưới đây đo được bằng máy:
 *   1. Cấu trúc file nguồn hợp lệ, không khai thừa.
 *   2. File sinh ra (`generated-colors.css`, `colors.generated.ts`) khớp nguồn —
 *      CI không tự chạy `generate:colors`, nên quên chạy là lệch âm thầm.
 *   3. Mọi class / `var(--color-…)` trong code trỏ tới token CÓ THẬT, và không
 *      còn tên cũ (đã đổi tên hoặc đã xoá).
 *   4. Mọi token đều có nơi dùng — kể cả những token chỉ được tới bằng cách ghép
 *      tên `var(--color-${tone}-5)` (khai ở `DYNAMIC_REACH`).
 *
 * Nội dung file đọc qua `tests/helpers/source-files.ts` (không `fs` — xem chú thích ở đó).
 */

import { describe, expect, it } from 'vitest';

import {
  CHART_CHROME,
  CHART_CHROME_TV,
  CHART_OTHER_TOKEN,
  CHART_SEMANTIC,
  CHART_SERIES_TOKENS,
  CHART_STATUS,
} from '@/shared/charts/constants/chart-palette.constants';
import { DARK_COLORS, LIGHT_COLORS, THEME_COLOR_KEYS } from '@/shared/theme';
import type { TitleIconColor } from '@/shared/ui';
import {
  ROOT_FILES,
  SOURCE_CODE,
  SOURCE_CSS,
  TEST_FILES,
  isGenerated,
  stripComments,
} from '@tests/helpers/source-files';

const THEME_JSON = ROOT_FILES['src/styles/theme/colors-theme.json'];
const GENERATED_CSS = SOURCE_CSS['src/styles/theme/generated-colors.css'];

// ── Nạp & giải file nguồn (cùng luật với `scripts/generate-colors.mjs`) ─────────────────────────

interface ThemeConfig {
  ramps: Record<string, (string | null)[]>;
  alias: Record<string, { of: string; steps: number[] }>;
  shared: Record<string, string>;
  theme: Record<string, [string, string]>;
}

const config = JSON.parse(THEME_JSON) as ThemeConfig;

const rampColors: Record<string, string | undefined> = {};
for (const [family, steps] of Object.entries(config.ramps)) {
  steps.forEach((value, index) => {
    if (value !== null) rampColors[`${family}-${index + 1}`] = value;
  });
}
const aliasColors: Record<string, string | undefined> = {};
for (const [name, { of, steps }] of Object.entries(config.alias)) {
  for (const step of steps) aliasColors[`${name}-${step}`] = rampColors[`${of}-${step}`];
}

const KEYS = [
  ...Object.keys(rampColors),
  ...Object.keys(config.shared),
  ...Object.keys(aliasColors),
  ...Object.keys(config.theme),
];
const KEY_SET = new Set(KEYS);

// ── Quét code ───────────────────────────────────────────────────────────────────────────────────

/** Bản thân bài kiểm này liệt kê tên cũ nên không tự soi mình. */
const SELF = 'tests/policy/styling/color-tokens.test.ts';

/** Code app (TS/TSX + CSS + `index.html`), bỏ file sinh tự động — chúng chứa MỌI tên token dưới dạng chuỗi. */
const APP_FILES = Object.entries({
  ...SOURCE_CODE,
  ...SOURCE_CSS,
  'index.html': ROOT_FILES['index.html'],
})
  .filter(([path]) => !isGenerated(path))
  .map(([path, text]) => ({ path, text: stripComments(text) }));
const TEST_CODE = Object.entries(TEST_FILES)
  .filter(([path]) => path !== SELF)
  .map(([path, text]) => ({ path, text: stripComments(text) }));

// Thứ tự trong nhóm CÓ NGHĨA: biến thể dài (`border-b`, `ring-offset`) phải đứng trước `border`, `ring`.
const PREFIX =
  '(?:bg|text|border-[trblxyse]|border|ring-offset|ring|outline|fill|stroke|from|via|to|divide-[xy]|divide|shadow|inset-shadow|drop-shadow|accent|caret|decoration|placeholder)';
const NAME = '[a-z][a-z0-9]*(?:-[a-z0-9]+)*';
const CLASS_TOKEN = new RegExp(`(?<![A-Za-z0-9_-])${PREFIX}-(${NAME})(?![A-Za-z0-9_-])`, 'g');
const CSS_VAR = new RegExp(`--color-(${NAME})(?![A-Za-z0-9_-])`, 'g');
const TOKEN_CALL =
  /(?:tokenVar|tokenVarAlpha|tokenVarOver|getThemeColor)\(\s*['"]([a-z0-9-]+)['"]/g;
const QUOTED = /(['"`])([a-z][a-z0-9]*(?:-[a-z0-9]+)*)\1/g;

/** Họ có thang số: các họ trong `ramps`, họ alias, `neutral`, `black`. */
const FAMILIES = new Set([
  ...Object.keys(config.ramps),
  ...Object.keys(config.alias),
  ...KEYS.filter((k) => /^[a-z]+-\d+$/.test(k)).map((k) => k.replace(/-\d+$/, '')),
]);

/**
 * Tên đã xoá hoặc đã đổi tên (xem `docs/rules/styling/color-system.md` §"Đổi tên"). Giữ lại để KHÔNG ai
 * viết lại chúng — class cũ sẽ không báo lỗi mà chỉ mất màu.
 */
const LEGACY_FAMILIES = ['gray', 'lime', 'emerald', 'white'];
const LEGACY_TOKENS = [
  ...['base', '1', '2', '3', '4'].map((s) => `bg-${s}`),
  'bg-input-2',
  'bg-dialog-2',
  'bg-nav',
  'bg-chart',
  'bg-primary',
  'bg-secondary',
  'bg-accent',
  'bg-info',
  'bg-warning',
  'bg-error',
  'bg-success',
  'bg-neutral',
  'bg-orange',
  'border-1',
  'border-2',
  'divider-1',
  'divider-2',
  'divider-primary',
  'divider-white-10',
  'divider-white-20',
  'divider-blue-10',
  ...['1', '2', '3', '4', '5'].map((s) => `fg-${s}`),
  'fg-on-nav',
  'fg-on-nav-accent',
  'fg-on-popup',
  'fg-on-popup-muted',
  'fg-on-dialog',
  'fg-on-dialog-muted',
  'popup-border',
  'popup-shadow',
  'nav-divider',
  'nav-hover-bg',
  'nav-active-bg',
  'nav-from',
  'nav-to',
  'nav-border',
  'nav-shadow-inset',
  'header-from',
  'header-to',
  'header-border',
  'brand',
  'overlay',
  'disabled-1',
  'disabled-2',
];
/** Vừa là tên token cũ vừa là chuỗi hợp lệ khác (`border-2` = viền dày 2px, `overlay` = prop) → chỉ soi dạng class. */
const AMBIGUOUS_BARE = new Set(['border-1', 'border-2', 'brand', 'overlay']);

/** `'bg-success'` là class THẬT cho key `success` — không phải tên token cũ `bg-success`. */
const isValidClassString = (value: string) => {
  const rest = value.match(/^(?:bg|text|border|ring|fill|stroke)-(.+)$/)?.[1];
  return rest !== undefined && KEY_SET.has(rest);
};

/** Một chuỗi sau tiền tố utility có PHẢI là tên token màu không (để phân biệt với `text-body-14`, `shadow-lg`…). */
function looksLikeColorToken(name: string): boolean {
  if (/^(?:bg|fg|border|divider|shadow)-/.test(name)) return true;
  const family = name.match(/^([a-z]+)-\d+$/)?.[1];
  return family !== undefined && (FAMILIES.has(family) || LEGACY_FAMILIES.includes(family));
}

interface Hit {
  file: string;
  token: string;
}

function scan(files: { path: string; text: string }[], pattern: RegExp, group = 1): Hit[] {
  const hits: Hit[] = [];
  for (const { path, text } of files) {
    for (const match of text.matchAll(pattern)) {
      hits.push({ file: path, token: match[group] });
    }
  }
  return hits;
}

const fmt = (hits: Hit[]) => [...new Set(hits.map((h) => `${h.file} → ${h.token}`))].sort();

// ── 1. Cấu trúc ─────────────────────────────────────────────────────────────────────────────────

describe('colors-theme.json — cấu trúc', () => {
  it('mỗi họ trong ramps có tối đa 10 bậc, mọi bậc là mã hex hoặc null', () => {
    const bad: string[] = [];
    for (const [family, steps] of Object.entries(config.ramps)) {
      if (steps.length > 10) bad.push(`${family}: ${steps.length} phần tử`);
      steps.forEach((v, i) => {
        if (v !== null && !/^#(?:[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(v)) {
          bad.push(`${family}[bậc ${i + 1}]: ${v}`);
        }
      });
    }
    expect(bad).toEqual([]);
  });

  it('không key nào khai trùng giữa ramps / shared / alias / theme', () => {
    const seen = new Set<string>();
    const dup = KEYS.filter((k) => (seen.has(k) ? true : (seen.add(k), false)));
    expect(dup).toEqual([]);
  });

  it('alias trỏ tới bậc CÓ THẬT của họ gốc, và giá trị trùng 100% (chỉ là tên khác)', () => {
    const bad: string[] = [];
    for (const [name, { of, steps }] of Object.entries(config.alias)) {
      for (const step of steps) {
        if (rampColors[`${of}-${step}`] === undefined) bad.push(`${name}-${step} → ${of}-${step}`);
      }
    }
    expect(bad).toEqual([]);
  });

  it('token theo theme phải KHÁC nhau giữa light và dark — giống hệt thì chuyển sang `shared`', () => {
    const same = Object.entries(config.theme)
      // `neutral-0` / `neutral-10` giống nhau ở hai theme nhưng thuộc một thang tách theo theme, để thang đọc liền.
      .filter(([key, [light, dark]]) => !key.startsWith('neutral-') && light === dark)
      .map(([key]) => key);
    expect(same).toEqual([]);
  });
});

// ── 2. File sinh ra khớp nguồn ──────────────────────────────────────────────────────────────────

describe('file sinh ra khớp colors-theme.json', () => {
  const css = GENERATED_CSS;
  const darkBlock = css.slice(css.indexOf('.dark {'), css.indexOf('@theme inline'));

  it('colors.generated.ts có đúng tập key của nguồn', () => {
    expect([...THEME_COLOR_KEYS].sort()).toEqual([...KEYS].sort());
  });

  it('giá trị light / dark trong colors.generated.ts khớp nguồn', () => {
    const wrong: string[] = [];
    for (const key of KEYS) {
      const pair = config.theme[key] as [string, string] | undefined;
      const base = rampColors[key] ?? config.shared[key] ?? aliasColors[key];
      const [light, dark] = pair ?? [base, base];
      if (LIGHT_COLORS[key as keyof typeof LIGHT_COLORS] !== light) wrong.push(`light ${key}`);
      if (DARK_COLORS[key as keyof typeof DARK_COLORS] !== dark) wrong.push(`dark ${key}`);
    }
    expect(wrong).toEqual([]);
  });

  it('generated-colors.css khai đủ mọi key trong @theme và `.dark` chỉ ghi token theo theme', () => {
    const missing = KEYS.filter((k) => !css.includes(`--color-${k}: var(--color-${k});`));
    expect(missing).toEqual([]);
    expect(darkBlock.match(/--color-/g)?.length ?? 0).toBe(Object.keys(config.theme).length);
  });
});

// ── 3. Không tham chiếu treo, không tên cũ ──────────────────────────────────────────────────────

describe('code dùng token màu có thật', () => {
  const FILES = [...APP_FILES, ...TEST_CODE];

  it('mọi class màu (bg-/text-/border-… + tên token) trỏ tới key có trong colors-theme.json', () => {
    const dangling = scan(FILES, CLASS_TOKEN).filter(
      (h) => looksLikeColorToken(h.token) && !KEY_SET.has(h.token),
    );
    expect(fmt(dangling)).toEqual([]);
  });

  it('mọi var(--color-…) viết thẳng trỏ tới key có thật', () => {
    const dangling = scan(FILES, CSS_VAR).filter((h) => !KEY_SET.has(h.token));
    expect(fmt(dangling)).toEqual([]);
  });

  it('mọi token truyền vào tokenVar() / getThemeColor() có thật', () => {
    const dangling = scan(FILES, TOKEN_CALL).filter((h) => !KEY_SET.has(h.token));
    expect(fmt(dangling)).toEqual([]);
  });

  it('không còn tên token cũ (đã đổi tên / đã xoá) dưới dạng class hoặc var(--color-…)', () => {
    const legacy = new Set(LEGACY_TOKENS);
    const hits = [
      ...scan(FILES, CLASS_TOKEN).filter((h) => legacy.has(h.token) && !KEY_SET.has(h.token)),
      ...scan(FILES, CSS_VAR).filter((h) => legacy.has(h.token) && !KEY_SET.has(h.token)),
    ];
    expect(fmt(hits)).toEqual([]);
  });

  it('không còn tên cũ dạng chuỗi token ("fg-1", "bg-base"…) truyền cho chart / hàm màu', () => {
    const legacy = new Set(
      LEGACY_TOKENS.filter((t) => !AMBIGUOUS_BARE.has(t) && !isValidClassString(t)),
    );
    const hits = scan(FILES, QUOTED, 2).filter((h) => legacy.has(h.token) && !KEY_SET.has(h.token));
    expect(fmt(hits)).toEqual([]);
  });

  it('chart-palette chỉ trỏ tới token có thật', () => {
    const tokens = [
      ...CHART_SERIES_TOKENS,
      CHART_OTHER_TOKEN,
      ...Object.values(CHART_SEMANTIC),
      ...Object.values(CHART_STATUS),
      ...Object.values(CHART_CHROME),
      ...Object.values(CHART_CHROME_TV),
    ];
    expect(tokens.filter((t) => !KEY_SET.has(t))).toEqual([]);
  });
});

// ── 4. Không token mồ côi ───────────────────────────────────────────────────────────────────────

/**
 * Token chỉ được tới bằng cách GHÉP TÊN lúc chạy — grep không thấy. Thêm tone / bậc mới cho các
 * component dưới đây thì thêm vào đây, nếu không bài kiểm sẽ báo nhầm là mồ côi (và ngược lại: thiếu
 * bậc trong JSON thì bài kiểm "hợp đồng" bên dưới báo đỏ).
 */
function dynamicReach(): Set<string> {
  const reach = new Set<string>();
  const add = (families: readonly string[], steps: readonly number[]) => {
    for (const family of families) for (const step of steps) reach.add(`${family}-${step}`);
  };
  // TitleScreen / HudFrame / PanelCard / DetailPanelHeader / SectionHeader / PageHeaderTitle:
  // `var(--color-${tone}-3…6)` — TitleScreen dùng 3, 4, 5, 6.
  const titleTones = {
    blue: true,
    green: true,
    yellow: true,
    orange: true,
    red: true,
    purple: true,
    sky: true,
    teal: true,
    indigo: true,
    pink: true,
    fuchsia: true,
    azure: true,
  } satisfies Record<TitleIconColor, true>;
  add(Object.keys(titleTones), [3, 4, 5, 6]);
  // BoxInfo: `var(--color-${family}-${step ± 1})` quanh bậc giữa (5; riêng primary là 3).
  add(['red', 'orange', 'yellow', 'green', 'teal', 'sky', 'blue'], [4, 5, 6]);
  add(['primary'], [2, 3, 4]);
  // SummaryPill: `var(--color-${SUMMARY_PILL_TONE_TOKEN[color]}-5)`.
  add(
    ['primary', 'success', 'accent', 'orange', 'indigo', 'pink', 'fuchsia', 'purple', 'blue'],
    [5],
  );
  add(['error', 'teal'], [5]);
  // Gradient chart: `tokenDarker(token, 1…2)` (lõi tối hơn 1–2 bậc, kẹp ở bậc cuối còn tồn tại) cho mọi họ chart; token series
  // nằm ở -5…-7 nên bậc -5…-7 của các họ này luôn phải còn trong JSON.
  const chartTokens = [
    ...CHART_SERIES_TOKENS,
    ...Object.values(CHART_SEMANTIC),
    ...Object.values(CHART_STATUS),
  ];
  add([...new Set(chartTokens.map((t) => t.replace(/-\d+$/, '')))], [5, 6, 7]);
  return reach;
}

describe('mọi token đều có nơi dùng', () => {
  const reach = dynamicReach();

  it('hợp đồng ghép tên: mọi bậc mà component với tới đều CÓ trong colors-theme.json', () => {
    expect([...reach].filter((k) => !KEY_SET.has(k)).sort()).toEqual([]);
  });

  it('không token mồ côi (không class, không var(), không chuỗi token, không nằm trong DYNAMIC_REACH)', () => {
    const used = new Set<string>();
    const collect = (pattern: RegExp, group = 1) => {
      for (const hit of scan(APP_FILES, pattern, group)) used.add(hit.token);
    };
    collect(CLASS_TOKEN);
    collect(CSS_VAR);
    collect(TOKEN_CALL);
    // Chuỗi nháy trùng tên token: danh sách token của chart / demo (`'secondary-5'`, `'fg-muted'`…).
    collect(QUOTED, 2);

    // Alias được dùng thì bậc gốc của nó cũng được tính là dùng (`warning-7` dùng → `orange-7` phải ở lại).
    for (const [name, { of, steps }] of Object.entries(config.alias)) {
      for (const step of steps) {
        if (used.has(`${name}-${step}`) || reach.has(`${name}-${step}`)) used.add(`${of}-${step}`);
      }
    }

    const orphans = KEYS.filter((k) => !used.has(k) && !reach.has(k));
    expect(orphans).toEqual([]);
  });
});
