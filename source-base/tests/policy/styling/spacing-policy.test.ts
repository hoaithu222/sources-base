/**
 * Hệ khoảng cách — `docs/rules/styling/spacing-system.md`.
 *
 * Ba nhóm được kiểm, đều đo được bằng máy:
 *   1. Thang: không giá trị tuỳ ý; code trang chỉ dùng bậc cho phép, không dàn
 *      trang bằng margin, không đổi khoảng cách theo breakpoint.
 *   2. Chủ sở hữu mép: `PageShell` / `PageBody` / `BoxGrid` không tự đệm.
 *   3. Tài liệu ↔ code: con số ghi trong rule khớp bảng `*_CLASSES` thật.
 *
 * Nội dung file đọc qua `tests/helpers/source-files.ts`.
 */

import { describe, expect, it } from 'vitest';

import { SOURCE_CODE, SOURCE_CSS, isGenerated, stripComments } from '@tests/helpers/source-files';

const CODE = SOURCE_CODE;
const TV_CSS = SOURCE_CSS['src/styles/modes/tv.css'] ?? '';

/** Code TRANG — nơi luật thang áp chặt. Kit có hình học riêng theo Figma. */
const PAGE_CODE = ['src/app/pages/', 'src/features/'];

/** File kit được phép dùng giá trị tuỳ ý (hình học khớp Figma tới từng px). */
const ARBITRARY_ALLOWLIST = [
  'src/shared/constants/auth-motifs.constants.ts',
  'src/shared/ui/layout/DetailPanelHeader.tsx',
  'src/shared/ui/overlays/dialog/Modal.tsx',
  'src/shared/ui/overlays/modal.theme.ts',
  'src/shared/ui/surfaces/hud/hud-frame/hud-frame-decor.tsx',
  'src/shared/widgets/header/page-header/page-header.theme.ts',
  'src/shared/widgets/header/page-header/page-nav.theme.ts',
  'src/shared/widgets/header/user-menu/user-menu.theme.ts',
];

const PADDING_STEPS = new Set(['0', '0.5', '1', '1.5', '2', '2.5', '3', '4', 'px']);
const MAX_GAP = 4;
const MAX_GAP_X = 6;
const MAX_MARGIN = 2;

interface Token {
  line: number;
  /** Tiền tố biến thể, vd `md:` — rỗng nếu không có. */
  variant: string;
  /** `p`, `px`, `gap`, `gap-x`, `mt`, `space-y`… */
  prop: string;
  value: string;
  text: string;
}

const TOKEN =
  /(?<![\w-])((?:[a-z0-9-]+:)*)-?(p[xytrblse]?|gap(?:-[xy])?|space-[xy]|m[xytrbl]?)-(\[[^\]\s]+\]|\d+(?:\.\d+)?|px|auto)(?![\w-])/g;

function tokensOf(source: string): Token[] {
  const out: Token[] = [];
  stripComments(source)
    .split('\n')
    .forEach((lineText, index) => {
      for (const match of lineText.matchAll(TOKEN)) {
        out.push({
          line: index + 1,
          variant: match[1],
          prop: match[2],
          value: match[3],
          text: match[0],
        });
      }
    });
  return out;
}

const isPageCode = (path: string) => PAGE_CODE.some((dir) => path.startsWith(dir));
const isArbitrary = (token: Token) => token.value.startsWith('[');
/** Đệm cộng vùng an toàn (`pb-[calc(1rem+var(--safe-b,0px))]`) — cách DUY NHẤT tránh vạch Home / tai thỏ (ipad-responsive.md §6). */
const isSafeAreaInset = (token: Token) => /var\(--safe-[trbl],/.test(token.value);
const isPadding = (token: Token) => /^p[xytrblse]?$/.test(token.prop);
const isMargin = (token: Token) => /^m[xytrbl]?$/.test(token.prop);

const SCANNED = Object.entries(CODE)
  .filter(([path]) => !isGenerated(path))
  .map(([path, source]) => [path, tokensOf(source)] as const);

const PAGE_TOKENS = SCANNED.filter(([path]) => isPageCode(path));

/** Mọi token của code trang vi phạm `test`, dạng `file:dòng — class`. */
const pageOffenders = (test: (token: Token) => boolean) =>
  PAGE_TOKENS.flatMap(([path, tokens]) =>
    tokens.filter(test).map((token) => `${path}:${token.line} — ${token.text}`),
  );

const sourceOf = (suffix: string): string => {
  const hit = Object.entries(CODE).find(([path]) => path.endsWith(suffix));
  if (!hit) throw new Error(`Không tìm thấy file kết thúc bằng "${suffix}" — rule §3/§4 trỏ sai?`);
  return hit[1];
};

describe('spacing — thang khoảng cách', () => {
  it('không giá trị tuỳ ý (`p-[…]`, `gap-[…]`, `m-[…]`) ngoài file kit đã duyệt', () => {
    const hits = SCANNED.filter(([path]) => !ARBITRARY_ALLOWLIST.includes(path)).flatMap(
      ([path, tokens]) =>
        tokens
          .filter((token) => isArbitrary(token) && !isSafeAreaInset(token))
          .map((token) => `${path}:${token.line} — ${token.text}`),
    );
    expect(
      hits,
      `Dùng bậc gần nhất của thang (spacing-system.md §2):\n  ${hits.join('\n  ')}`,
    ).toEqual([]);
  });

  it('danh sách file được miễn không có dòng thừa', () => {
    const stale = ARBITRARY_ALLOWLIST.filter((path) => {
      const tokens = SCANNED.find(([p]) => p === path)?.[1] ?? [];
      return !tokens.some(isArbitrary);
    });
    expect(stale, `Gỡ khỏi ARBITRARY_ALLOWLIST:\n  ${stale.join('\n  ')}`).toEqual([]);
  });

  it('code trang: đệm chỉ ở bậc 0 · 0.5 · 1 · 1.5 · 2 · 2.5 · 3 · 4', () => {
    const hits = pageOffenders(
      (token) => isPadding(token) && !isArbitrary(token) && !PADDING_STEPS.has(token.value),
    );
    expect(hits, `Đệm ngoài thang (§2):\n  ${hits.join('\n  ')}`).toEqual([]);
  });

  it(`code trang: gap / gap-y ≤ ${MAX_GAP}, gap-x ≤ ${MAX_GAP_X}`, () => {
    const hits = pageOffenders((token) => {
      if (!token.prop.startsWith('gap') || isArbitrary(token)) return false;
      const limit = token.prop === 'gap-x' ? MAX_GAP_X : MAX_GAP;
      return Number(token.value) > limit;
    });
    expect(hits, `Khe quá rộng — tách hộp thay vì nới khe (§6):\n  ${hits.join('\n  ')}`).toEqual(
      [],
    );
  });

  it(`code trang: margin chỉ \`auto\` hoặc ≤ ${MAX_MARGIN}; không \`space-x/y\``, () => {
    const hits = pageOffenders((token) => {
      if (token.prop.startsWith('space-')) return true;
      if (!isMargin(token) || isArbitrary(token)) return false;
      return token.value !== 'auto' && token.value !== 'px' && Number(token.value) > MAX_MARGIN;
    });
    expect(hits, `Dàn trang bằng \`gap\` trên cha (§6):\n  ${hits.join('\n  ')}`).toEqual([]);
  });

  it('code trang: không đổi khoảng cách theo breakpoint / chế độ', () => {
    const hits = pageOffenders((token) => token.variant !== '');
    expect(hits, `Mật độ là hằng số (§7):\n  ${hits.join('\n  ')}`).toEqual([]);
  });
});

describe('spacing — mỗi mép một chủ', () => {
  it.each(['/layout/PageShell.tsx', '/layout/PageBody.tsx', '/layout/BoxGrid.tsx'])(
    '%s không tự đệm',
    (suffix) => {
      const padding = tokensOf(sourceOf(suffix)).filter(isPadding);
      expect(padding.map((token) => token.text)).toEqual([]);
    },
  );

  it('không nơi nào truyền đệm vào `<PageShell className>`', () => {
    const hits = Object.entries(CODE).flatMap(([path, source]) =>
      [
        ...stripComments(source).matchAll(
          /<PageShell\b[^>]*className=["'{`][^>]*?\bp[xytrbl]?-\d/g,
        ),
      ].map(() => path),
    );
    expect(hits, `Vỏ ngoài đã đệm (§3):\n  ${hits.join('\n  ')}`).toEqual([]);
  });

  it('`BoxPanel` để thân trần — đệm do nơi dùng chọn theo nội dung (§4.2)', () => {
    const source = sourceOf('/panels/BoxPanel.tsx');
    expect(source).toContain("'min-h-0 flex-1',");
    expect(source).toContain('bodyClassName,');
  });
});

describe('spacing — con số trong rule khớp code', () => {
  it.each([
    [
      '/constants/layout.constants.ts',
      ["SHELL_GUTTER_X = 'px-4 tv:px-2'", "SHELL_GUTTER_Y = 'py-4 tv:py-2'"],
    ],
    ['/layout/PageShell.tsx', ["scroll: 'h-full min-h-0 flex-col gap-2 overflow-hidden'"]],
    ['/layout/PageBody.tsx', ["stack && 'flex flex-col gap-2'"]],
    ['/layout/BoxGrid.tsx', ["sm: 'gap-2'", "md: 'gap-3'", "lg: 'gap-4'"]],
    ['/layout/Toolbar.tsx', ["sm: 'px-2 py-1.5'", "md: 'p-2'", "lg: 'px-3 py-2.5'"]],
    ['/panels/Surface.tsx', ["sm: 'p-2'", "md: 'p-3'", "lg: 'p-4'"]],
    [
      '/panel-card/panel-card.theme.ts',
      ["body: 'p-1.5'", "body: 'p-2'", "body: 'p-3'", "body: 'p-0'", "state: 'p-3'"],
    ],
    ['/form/FormItem.tsx', ["'flex flex-col gap-1.5'"]],
    ['/form/layout/FormGrid.tsx', ["'grid gap-4'"]],
    ['/overlays/drawer/drawer.theme.ts', ["body: 'min-h-0 flex-1 overflow-auto p-4'"]],
  ] as const)('%s', (suffix, expected) => {
    const source = sourceOf(suffix);
    const missing = expected.filter((fragment) => !source.includes(fragment));
    expect(
      missing,
      `Code đã đổi — sửa bảng tương ứng ở docs/rules/styling/spacing-system.md rồi cập nhật bài kiểm này:\n  ${missing.join('\n  ')}`,
    ).toEqual([]);
  });

  it('chế độ TV co đúng các bậc ghi ở §7', () => {
    const tv = TV_CSS;
    const shrunk = [
      '.p-3',
      '.p-4',
      '.p-6',
      '.px-3',
      '.px-4',
      '.py-3',
      '.py-4',
      '.gap-3',
      '.gap-4',
      '.gap-6',
    ];
    const missing = shrunk.filter((selector) => !tv.includes(`:root.tv ${selector} {`));
    expect(missing, `tv.css không còn co: ${missing.join(', ')}`).toEqual([]);
    expect(tv, 'bậc 2 không được co ở TV').not.toContain(':root.tv .p-2 {');
  });
});
