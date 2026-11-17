/**
 * Tên file nói VAI TRÒ của file — `docs/rules/foundations/folder-structure.md §4`,
 * `docs/rules/foundations/code-style.md` (Naming), `docs/rules/structure/component-structure.md §6`,
 * `docs/rules/structure/ui-kit-architecture.md` (bảng đặt tên), `docs/rules/data/state-management.md`.
 *
 *   1. `PascalCase.tsx` — một component, là default export cùng tên file.
 *   2. `useXxx.ts` — export đúng hook `useXxx` (hook không JSX → không `.tsx`).
 *   3. `kebab-case.<vai>.ts` với vai trong `ROLES`; tên trần (`types.ts`) và `.helpers` bị cấm;
 *      gạch nối thay dấu chấm trước vai (`-store.ts`) bị cấm.
 *   4. File làm MỘT việc đặt `kebab-case.ts(x)` không hậu tố vai được khi tên file = kebab của MỘT
 *      export trong file (`create-query-client.ts` ↔ `createQueryClient`, `app-error.ts` ↔ `AppError`,
 *      `module-registry.ts` ↔ `MODULE_REGISTRY`).
 *   5. Trong folder `utils/` mọi file là `*.utils.ts`; `parts/` chỉ kebab-case và `.tsx` trong đó export
 *      component `PascalCase` của tên file (luật 4 không áp ở `parts/`).
 *   6. Không camelCase (trừ `useXxx`); tên folder kebab-case.
 *   7. `src/app` (hệ thống file của Next): file đặc biệt (`page.tsx` · `layout.tsx` · `route.ts` …) giữ tên do Next quy định
 *      — CHỈ ở cây route; trong folder private `_xxx/` chúng không được miễn (tên đó ở `_views/` là nhầm route với view).
 *      Folder route được là `[tham-số]` · `[...rest]` · `(nhóm)` · segment URL kebab-case; folder private `_xxx` chỉ ở
 *      gốc `src/app`, bên trong nó folder lại kebab-case.
 * `hooks/` chỉ chứa `useXxx` do `folder-structure.test.ts` giữ. Zustand → `*.store.ts` và
 * `createContext` → `*.context.ts` do ESLint giữ (`guard/store-files`, `guard/context-files`).
 */

import { describe, expect, it } from 'vitest';

import { HANDWRITTEN_CODE, baseName, dirOf, stripComments } from '@tests/helpers/source-files';

/** Vai hợp lệ sau dấu chấm: `xxx.<vai>.ts`. */
const ROLES = [
  'utils',
  'types',
  'constants',
  'theme',
  'store',
  'context',
  'schema',
  'api',
  'queries',
  'selectors',
  'lifecycle',
  'sync',
  'config',
  'routes',
];

const stem = (path: string) => baseName(path).replace(/\.tsx?$/, '');

/** Tên file đặc biệt của Next App Router (không kèm đuôi) — folder-structure.md §4. */
const NEXT_SPECIAL_FILES = new Set([
  'page',
  'layout',
  'template',
  'loading',
  'error',
  'not-found',
  'forbidden',
  'unauthorized',
  'default',
  'route',
  'global-error',
  'global-not-found',
  'opengraph-image',
  'twitter-image',
  'icon',
  'apple-icon',
  'robots',
  'sitemap',
  'manifest',
]);

/** Dưới `src/app` nhưng trong folder private `_xxx` — Next bỏ qua folder này khi định tuyến. */
const inPrivateFolder = (path: string) =>
  path
    .split('/')
    .slice(2, -1)
    .some((segment) => segment.startsWith('_'));

const isNextSpecialFile = (path: string) =>
  path.startsWith('src/app/') &&
  !inPrivateFolder(path) &&
  /\.tsx?$/.test(path) &&
  NEXT_SPECIAL_FILES.has(stem(path));

/** File không theo luật vai trò: barrel, khai báo kiểu toàn cục, file đặc biệt của Next. */
const isExempt = (path: string) =>
  baseName(path) === 'index.ts' || path.endsWith('.d.ts') || isNextSpecialFile(path);

const allow = (paths: string[], reason: string) =>
  Object.fromEntries(paths.map((path) => [path, reason]));

/**
 * Ngoại lệ có lý do (đường dẫn → lý do), gom theo lý do. Hết lý do thì xoá — bài kiểm cuối file đỏ
 * khi một dòng ở đây không còn vi phạm gì.
 *   - "GIỮ" — chủ repo đã chốt giữ tên này; lý do ghi ngay tại dòng.
 *   - "VI PHẠM" — trái quy ước ĐÃ ghi trong docs; chờ sửa `src`.
 */
const NAMING_ALLOWED: Record<string, string> = {
  ...allow(
    ['src/app/_providers/bootstrap.ts'],
    'GIỮ — file khởi động, folder-structure.md §4 gọi đích danh (export `bootstrapApp`).',
  ),
  ...allow(
    ['src/core/i18n/navigation.ts', 'src/core/i18n/request.ts'],
    'GIỮ — tên do next-intl quy định: `navigation.ts` (`createNavigation`), `request.ts` (đích của `createNextIntlPlugin`); đổi tên là đổi cả cấu hình plugin.',
  ),
  ...allow(
    ['src/core/i18n/server.ts'],
    'GIỮ — điểm vào phụ `@/core/i18n/server` (folder-structure.md §5): gom API chỉ-server của next-intl + messages.',
  ),
  ...allow(
    ['src/core/seo/metadata.ts'],
    'GIỮ — đường `core/seo/metadata.ts` được docs và `scripts/check-eslint-config.mjs` trỏ đích danh; file gom bốn hàm dựng metadata (`build*Metadata`, `buildViewport`).',
  ),
  ...allow(
    ['src/app/_providers/query-client.ts'],
    'GIỮ — đường `_providers/query-client.ts` được docs trỏ đích danh (api-patterns.md); export `getQueryClient` (singleton của app, khác `createQueryClient` ở core/query).',
  ),
  ...allow(
    ['src/app/_seo/page-metadata.ts'],
    'GIỮ — folder-structure.md §2 gọi đích danh `_seo/page-metadata.ts`; export `generatePageMetadata` (cầu nối một dòng cho `generateMetadata` của Next).',
  ),
  ...allow(
    ['src/domains/preferences/appearance-script.ts'],
    'GIỮ — `@/domains/preferences/appearance-script` là ngoại lệ CÓ TÊN của luật import domain (`scripts/eslint/architecture.mjs`), root layout nạp thẳng; export `appearanceInitScript`.',
  ),
  ...allow(
    ['src/assets/icons/standalone.tsx'],
    'GIỮ — file SINH (`scripts/generate-icons.mjs`, cặp với `index.tsx`): gom vài icon của đường tải trang công khai, mỗi icon là một export; tên gọi đích danh ở `docs/rules/styling/icon-conventions.md`.',
  ),
  ...allow(
    ['src/shared/utils/style/cn.ts'],
    'GIỮ — `cn` là tên chuẩn của mẫu clsx + tailwind-merge; folder-structure.md §3 nêu riêng `style/cn.ts`.',
  ),
  ...allow(
    ['src/shared/ui/icons/Icons.tsx'],
    'VI PHẠM — tên file khác component (`SystemIcon`) và `export const SystemIcon = memo(…)` (code-style.md): đổi `SystemIcon.tsx` + default export, sửa mọi import `@/shared/ui/icons/Icons`.',
  ),
  ...allow(
    ['src/shared/ui/data-display/table/parts/header/render-header-cell.tsx'],
    'VI PHẠM component-structure.md §6 (`parts/` = 1 file 1 component, tên export khớp tên file) — đang export hàm `renderHeaderCell`.',
  ),
};

const FILES = Object.keys(HANDWRITTEN_CODE).filter((path) => !isExempt(path));

const KEBAB = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
/** Segment đặc biệt của cây route: `[locale]` · `[...rest]` · `(nhóm)`. */
const ROUTE_SEGMENT = /^(?:\[(?:\.\.\.)?[a-z][a-zA-Z0-9]*\]|\([a-z0-9]+(?:-[a-z0-9]+)*\))$/;
const PRIVATE_FOLDER = /^_[a-z]+$/;

/** Tên folder (đường tính từ gốc repo) hợp lệ: kebab-case; riêng `src/app` thêm segment route và `_xxx` ở gốc. */
function isValidDirName(dir: string): boolean {
  const parts = dir.split('/');
  const name = parts[parts.length - 1];
  if (KEBAB.test(name)) return true;
  const inRouteTree =
    parts[0] === 'src' &&
    parts[1] === 'app' &&
    parts.length > 2 &&
    !parts.slice(2, -1).some((segment) => segment.startsWith('_'));
  if (!inRouteTree) return false;
  return (parts.length === 3 && PRIVATE_FOLDER.test(name)) || ROUTE_SEGMENT.test(name);
}
const pascalOf = (kebab: string) =>
  kebab
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
const codeOf = (path: string) => stripComments(HANDWRITTEN_CODE[path]);

/** Kebab của một tên export: `createQueryClient` · `AppError` · `MODULE_REGISTRY` → kebab-case. */
const kebabOf = (name: string) =>
  name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .replace(/_/g, '-')
    .toLowerCase();

/** Tên mà file `export default` (`export default X;` · `export default function X`). */
function defaultExportName(code: string): string | undefined {
  return code.match(/^export default (?:function\s+|class\s+)?([A-Za-z_$][\w$]*)/m)?.[1];
}

const exportsName = (code: string, name: string) =>
  new RegExp(
    String.raw`^export (?:default )?(?:async )?(?:function\*?|const|let|class)\s+${name}\b|^export \{[^}]*\b${name}\b[^}]*\}|^export default ${name};`,
    'm',
  ).test(code);

const DECLARED_EXPORT =
  /^export (?:default )?(?:declare )?(?:abstract )?(?:async )?(?:function\*?|const|let|class|interface|type|enum)\s+([A-Za-z_$][\w$]*)/gm;
const LISTED_EXPORT = /^export (?:type )?\{([^}]*)\}/gm;
const DEFAULT_EXPORT = /^export default ([A-Za-z_$][\w$]*);/gm;

/** Mọi tên file export — giá trị lẫn kiểu; `export { a as b }` tính `b`. */
function exportedNames(code: string): string[] {
  const declared = [...code.matchAll(DECLARED_EXPORT)].map((match) => match[1]);
  const listed = [...code.matchAll(LISTED_EXPORT)].flatMap((match) =>
    match[1]
      .split(',')
      .map((part) => part.trim().replace(/^type\s+/, ''))
      .map((part) => part.split(/\s+as\s+/).pop() ?? '')
      .filter(Boolean),
  );
  const defaults = [...code.matchAll(DEFAULT_EXPORT)].map((match) => match[1]);
  return [...declared, ...listed, ...defaults];
}

/** Luật 4: có export mà kebab của tên nó trùng tên file. */
const namedAfterExport = (head: string, code: string) =>
  exportedNames(code).some((name) => kebabOf(name) === head);

/** Vi phạm của file kebab-case KHÔNG có hậu tố vai (luật 3–5). */
function bareKebabProblems(path: string, head: string, code: string): string[] {
  const inParts = dirOf(path).split('/').includes('parts');
  if (!inParts && namedAfterExport(head, code)) return [];

  const dashed = ROLES.find((r) => head.endsWith(`-${r}`));
  if (dashed) return [`gạch nối thay dấu chấm — đổi \`-${dashed}\` thành \`.${dashed}\``];
  if (path.endsWith('.tsx')) {
    return exportsName(code, pascalOf(head))
      ? []
      : [`phần con kebab-case phải export component \`${pascalOf(head)}\``];
  }
  return [
    `thiếu hậu tố vai — \`${head}.<vai>.ts\` (${ROLES.join(' · ')}), hoặc tên file = kebab của MỘT export trong file`,
  ];
}

/** Vi phạm của một file, dạng chuỗi mô tả (rỗng = đạt). */
function problemsOf(path: string): string[] {
  const name = stem(path);
  const isTsx = path.endsWith('.tsx');
  const code = codeOf(path);
  const out: string[] = [];
  const [head, ...roleParts] = name.split('.');
  const role = roleParts.join('.');

  if (/^[A-Z]/.test(name)) {
    if (!isTsx) out.push('PascalCase chỉ dành cho component `.tsx`');
    else if (defaultExportName(code) !== name) {
      out.push(
        `component phải là \`export default ${name}\` (đang: ${defaultExportName(code) ?? 'không có default export'})`,
      );
    }
  } else if (/^use[A-Z]/.test(name)) {
    if (isTsx) out.push('hook không chứa JSX → `.ts` (cần JSX thì tách phần con)');
    if (!exportsName(code, name)) out.push(`phải export đúng hook \`${name}\``);
  } else if (/[A-Z]/.test(name)) {
    out.push('không camelCase — `kebab-case.<vai>.ts` hoặc `PascalCase.tsx`');
  } else if (!KEBAB.test(head)) {
    out.push('phần tên phải kebab-case');
  } else if (roleParts.length === 0 && ROLES.includes(head)) {
    out.push(`tên trần \`${head}.ts\` — thêm tiền tố mô tả: \`<miền>.${head}.ts\``);
  } else if (role === 'helpers') {
    out.push('`.helpers` không phải vai — dùng `.utils`');
  } else if (role && !ROLES.includes(role)) {
    out.push(`vai \`.${role}\` không có trong danh sách (${ROLES.join(' · ')})`);
  } else if (!role) {
    out.push(...bareKebabProblems(path, head, code));
  }

  const dirs = dirOf(path).split('/');
  if (dirs.includes('utils') && !name.endsWith('.utils')) {
    out.push('file trong `utils/` phải là `*.utils.ts`');
  }
  if (dirs.includes('parts') && !KEBAB.test(head)) out.push('file trong `parts/` đặt kebab-case');
  return out;
}

const VIOLATIONS = new Map(
  FILES.map((path) => [path, problemsOf(path)] as const).filter(([, list]) => list.length > 0),
);

describe('tên file theo vai trò', () => {
  it('có đủ file để kiểm', () => {
    expect(FILES.length).toBeGreaterThan(300);
  });

  it('mọi file trong src/ đặt tên đúng vai trò', () => {
    const hits = [...VIOLATIONS]
      .filter(([path]) => !(path in NAMING_ALLOWED))
      .map(([path, list]) => `${path} — ${list.join('; ')}`);
    expect(hits, `Đặt tên sai (folder-structure.md §4):\n  ${hits.join('\n  ')}`).toEqual([]);
  });

  it('luật "tên file = kebab của một export": camelCase · PascalCase · SCREAMING_SNAKE', () => {
    expect(kebabOf('createQueryClient')).toBe('create-query-client');
    expect(kebabOf('AppError')).toBe('app-error');
    expect(kebabOf('MODULE_REGISTRY')).toBe('module-registry');
    expect(kebabOf('HTTPClient')).toBe('http-client');
    expect(namedAfterExport('describe-error', 'export function describeError() {}')).toBe(true);
    expect(namedAfterExport('route-tree', 'export { flattenModule as routeTree };')).toBe(true);
    expect(namedAfterExport('route-tree', 'export type RouteEntry = {};')).toBe(false);
    expect(
      bareKebabProblems(
        'src/x/parts/render-cell.tsx',
        'render-cell',
        'export function renderCell() {}',
      ),
      'trong `parts/` luật 4 không áp — phải export component',
    ).toHaveLength(1);
  });

  it('tên folder kebab-case (cây route của Next thêm [tham-số] · (nhóm); `_xxx` chỉ ở gốc src/app)', () => {
    // Duyệt MỌI file kể cả file được miễn tên (`page.tsx`…) — folder route chỉ chứa file đặc biệt vẫn phải được kiểm.
    const dirs = new Set(
      Object.keys(HANDWRITTEN_CODE).flatMap((path) => {
        const parts = dirOf(path).split('/');
        return parts.map((_, i) => parts.slice(0, i + 1).join('/'));
      }),
    );
    const bad = [...dirs].filter((dir) => !isValidDirName(dir));
    expect(bad, `Folder phải kebab-case:\n  ${bad.join('\n  ')}`).toEqual([]);
  });

  it('luật folder của src/app: nhận đúng segment route và folder private, từ chối phần còn lại', () => {
    const valid = [
      'src/app/[locale]',
      'src/app/[locale]/[...rest]',
      'src/app/[locale]/(workspace)/(auth)/forgot-password',
      'src/app/[locale]/403',
      'src/app/_views',
      'src/app/_views/status',
      'src/shared/ui/form',
    ];
    const invalid = [
      'src/app/Views',
      'src/app/_Views',
      'src/app/[locale]/_views',
      'src/app/_views/_status',
      'src/app/_views/[id]',
      'src/shared/_private',
      'src/shared/[locale]',
      'src/app/[Locale]',
    ];
    expect(valid.filter((dir) => !isValidDirName(dir))).toEqual([]);
    expect(invalid.filter((dir) => isValidDirName(dir))).toEqual([]);
  });

  it('file đặc biệt của Next chỉ được miễn ở cây route — không phải trong folder private', () => {
    expect(isNextSpecialFile('src/app/[locale]/(public)/about/page.tsx')).toBe(true);
    expect(isNextSpecialFile('src/app/api/health/route.ts')).toBe(true);
    expect(isNextSpecialFile('src/app/robots.ts')).toBe(true);
    expect(isNextSpecialFile('src/app/_views/page.tsx')).toBe(false);
    expect(isNextSpecialFile('src/app/_layouts/layout.tsx')).toBe(false);
    expect(isNextSpecialFile('src/shared/ui/page.tsx')).toBe(false);
    expect(isNextSpecialFile('src/app/[locale]/(public)/about/AboutView.tsx')).toBe(false);
  });

  it('danh sách ngoại lệ không chứa file đã hết vi phạm', () => {
    const stale = Object.keys(NAMING_ALLOWED).filter((path) => !VIOLATIONS.has(path));
    expect(stale, `Xoá khỏi NAMING_ALLOWED:\n  ${stale.join('\n  ')}`).toEqual([]);
  });
});
