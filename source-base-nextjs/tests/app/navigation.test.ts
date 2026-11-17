/**
 * Cấu hình điều hướng — `src/app/_navigation`.
 *
 *  1. `buildMenu`: thứ tự, mục ẩn, lọc quyền (quyền phân hệ + quyền màn hình CỘNG DỒN).
 *  2. `resolveScreenTitle`: màn sâu nhất thắng, `Phân hệ · Màn`, URL lạ → `undefined`.
 *  3. Route thật: mọi path khai ở `NAV_*` và `PATHS` đều có `page.tsx` dưới `src/app/[locale]` (route nhóm `(x)` bị bỏ khỏi URL).
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { NavLabelResolver, NavModuleDef, NavPageDef } from '@/app/_navigation';
import type { SessionUser } from '@/domains/session';
import { REPO_PATHS } from '@tests/helpers/source-files';

const config = vi.hoisted(() => ({ authEnabled: true }));

vi.mock('@/core/config', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/core/config')>();
  return {
    ...actual,
    appConfig: {
      ...actual.appConfig,
      get authEnabled() {
        return config.authEnabled;
      },
    },
  };
});

const { NAV_MODULES, NAV_PAGES, buildMenu, resolveScreenTitle } = await import('@/app/_navigation');
const { GUEST_ONLY_PATHS, PATHS, PROTECTED_PATH_PREFIXES } =
  await import('@/shared/constants/paths.constants');
const enMessages = (await import('@/messages/en')).default;
const viMessages = (await import('@/messages/vi')).default;

function userWith(permissions: string[], roles: string[] = []): SessionUser {
  return { id: 'u1', email: 'an@example.com', name: 'An', roles, permissions };
}

const labelOf: NavLabelResolver = (id) => ({
  title: `Tên ${id}`,
  subtitle: `Phụ ${id}`,
  description: `Mô tả ${id}`,
});

const PAGES: readonly NavPageDef[] = [
  { id: 'settings', path: '/settings', icon: 'settings', order: 2 },
  { id: 'dashboard', path: '/dashboard', icon: 'home', order: 0 },
  { id: 'profile', path: '/profile', icon: 'customer', hideInMenu: true, order: 1 },
];

const MODULES: readonly NavModuleDef[] = [
  {
    id: 'demo',
    path: '/demo',
    icon: 'apps',
    tone: 'primary',
    permission: { resource: 'module' },
    screens: [
      { id: 'demoLibrary', path: '/demo' },
      {
        id: 'dashboard',
        path: '/demo/reports',
        permission: { resource: 'report', action: 'export' },
      },
      { id: 'profile', path: '/demo/reports/detail', hideInNav: true },
    ],
  },
];

beforeEach(() => {
  config.authEnabled = true;
});

describe('buildMenu — trang tĩnh', () => {
  it('xếp theo `order` tăng dần, bỏ mục `hideInMenu`', () => {
    const { pages } = buildMenu(PAGES, [], labelOf, userWith([]));

    expect(pages.map((page) => page.id)).toEqual(['dashboard', 'settings']);
    expect(pages[0]).toMatchObject({
      title: 'Tên dashboard',
      subtitle: 'Phụ dashboard',
      href: '/dashboard',
      icon: 'home',
      permissions: [],
    });
  });

  it('mục không có `icon` không vào menu; mục không có `order` xếp cuối theo thứ tự khai báo', () => {
    const pages: NavPageDef[] = [
      { id: 'profile', path: '/profile', icon: 'customer' },
      { id: 'settings', path: '/settings' },
      { id: 'dashboard', path: '/dashboard', icon: 'home', order: 5 },
    ];

    expect(buildMenu(pages, [], labelOf, null).pages.map((page) => page.id)).toEqual([
      'dashboard',
      'profile',
    ]);
  });

  it('không sửa mảng cấu hình gốc khi sắp xếp', () => {
    const before = PAGES.map((page) => page.id);
    buildMenu(PAGES, [], labelOf, null);

    expect(PAGES.map((page) => page.id)).toEqual(before);
  });

  it('lọc theo quyền của trang: thiếu quyền thì ẩn, đủ quyền hoặc admin thì hiện', () => {
    const guarded: NavPageDef[] = [
      { id: 'dashboard', path: '/dashboard', icon: 'home' },
      {
        id: 'settings',
        path: '/settings',
        icon: 'settings',
        permission: { resource: 'setting', action: 'update' },
      },
    ];
    const idsFor = (user: SessionUser | null) =>
      buildMenu(guarded, [], labelOf, user).pages.map((page) => page.id);

    expect(idsFor(null)).toEqual(['dashboard']);
    expect(idsFor(userWith(['setting:view']))).toEqual(['dashboard']);
    expect(idsFor(userWith(['setting:update']))).toEqual(['dashboard', 'settings']);
    expect(idsFor(userWith([], ['admin']))).toEqual(['dashboard', 'settings']);
  });

  it('kiểm đăng nhập tắt (demo) → mọi mục hiện, bất kể quyền', () => {
    config.authEnabled = false;
    const guarded: NavPageDef[] = [
      { id: 'settings', path: '/settings', icon: 'settings', permission: { resource: 'setting' } },
    ];

    expect(buildMenu(guarded, [], labelOf, null).pages).toHaveLength(1);
  });
});

describe('buildMenu — phân hệ', () => {
  it('dựng mục phân hệ kèm dải màn hình, bỏ màn `hideInNav`', () => {
    const { modules } = buildMenu([], MODULES, labelOf, userWith(['module:view', 'report:export']));

    expect(modules).toHaveLength(1);
    expect(modules[0]).toMatchObject({ id: 'demo', href: '/demo', icon: 'apps', tone: 'primary' });
    expect(modules[0].nav?.map((link) => link.href)).toEqual(['/demo', '/demo/reports']);
  });

  it('quyền của phân hệ CỘNG DỒN vào quyền của từng màn hình', () => {
    const { modules } = buildMenu([], MODULES, labelOf, userWith(['module:view', 'report:export']));
    const [library, reports] = modules[0].nav ?? [];

    expect(library.permissions).toEqual([{ resource: 'module' }]);
    expect(reports.permissions).toEqual([
      { resource: 'module' },
      { resource: 'report', action: 'export' },
    ]);
  });

  it('thiếu quyền phân hệ → cả phân hệ biến mất, không lộ màn con', () => {
    const { modules } = buildMenu([], MODULES, labelOf, userWith(['report:export']));

    expect(modules).toEqual([]);
  });

  it('đủ quyền phân hệ nhưng thiếu quyền riêng của màn → chỉ màn đó bị ẩn', () => {
    const { modules } = buildMenu([], MODULES, labelOf, userWith(['module:view']));

    expect(modules[0].nav?.map((link) => link.href)).toEqual(['/demo']);
  });

  it('chưa đăng nhập (user null) với phân hệ cần quyền → ẩn; admin thấy hết', () => {
    expect(buildMenu([], MODULES, labelOf, null).modules).toEqual([]);

    const admin = buildMenu([], MODULES, labelOf, userWith([], ['admin'])).modules;
    expect(admin[0].nav).toHaveLength(2);
  });

  it('xếp phân hệ theo `order`', () => {
    const modules: NavModuleDef[] = [
      { id: 'demo', path: '/b', icon: 'apps', order: 2, screens: [] },
      { id: 'dashboard', path: '/a', icon: 'home', order: 1, screens: [] },
    ];

    expect(buildMenu([], modules, labelOf, null).modules.map((item) => item.href)).toEqual([
      '/a',
      '/b',
    ]);
  });
});

describe('resolveScreenTitle', () => {
  const user = userWith(['module:view', 'report:export']);
  const { pages, modules } = buildMenu(PAGES, MODULES, labelOf, user);

  it('trang tĩnh → tên trang', () => {
    expect(resolveScreenTitle('/settings', pages, modules)).toEqual({
      title: 'Tên settings',
      fullTitle: 'Tên settings',
      icon: 'settings',
    });
  });

  it('màn con của phân hệ → `Phân hệ · Màn`, icon của phân hệ', () => {
    expect(resolveScreenTitle('/demo/reports', pages, modules)).toEqual({
      title: 'Tên dashboard',
      fullTitle: 'Tên demo · Tên dashboard',
      icon: 'apps',
    });
  });

  it('màn trùng tên phân hệ → không lặp "Phân hệ · Phân hệ"', () => {
    const identical = buildMenu([], MODULES, () => ({ title: 'Cùng tên' }), user);

    expect(resolveScreenTitle('/demo', [], identical.modules)?.fullTitle).toBe('Cùng tên');
  });

  it('khớp SÂU NHẤT: route con của màn thuộc màn đó, không thuộc trang chủ phân hệ', () => {
    expect(resolveScreenTitle('/demo/reports/detail', pages, modules)?.title).toBe('Tên dashboard');
    expect(resolveScreenTitle('/demo/reports/detail/12', pages, modules)?.title).toBe(
      'Tên dashboard',
    );
    expect(resolveScreenTitle('/demo/other', pages, modules)?.title).toBe('Tên demoLibrary');
  });

  it('khớp theo PHÂN ĐOẠN: `/demox` không thuộc `/demo`', () => {
    expect(resolveScreenTitle('/demox', pages, modules)).toBeUndefined();
    expect(resolveScreenTitle('/settingsx', pages, modules)).toBeUndefined();
  });

  it('URL không thuộc mục nào → undefined', () => {
    expect(resolveScreenTitle('/khong-co', pages, modules)).toBeUndefined();
    expect(resolveScreenTitle('/', pages, modules)).toBeUndefined();
  });

  it('mục bị ẩn khỏi menu (thiếu quyền) không có tên', () => {
    const limited = buildMenu(PAGES, MODULES, labelOf, userWith([]));

    expect(resolveScreenTitle('/demo/reports', limited.pages, limited.modules)).toBeUndefined();
  });
});

/** Route của mọi `page.tsx` dưới `src/app/[locale]`, bỏ route nhóm `(x)`; route động (`[...rest]`) không tính. */
function pageRoutes(): Set<string> {
  const routes = new Set<string>();
  const prefix = 'src/app/[locale]/';

  for (const path of REPO_PATHS) {
    if (!path.startsWith(prefix) || !path.endsWith('/page.tsx')) continue;
    const segments = path
      .slice(prefix.length, -'page.tsx'.length)
      .split('/')
      .filter((segment) => segment !== '' && !/^\(.+\)$/.test(segment));
    if (segments.some((segment) => segment.startsWith('['))) continue;
    routes.add(`/${segments.join('/')}`);
  }
  return routes;
}

describe('route có thật cho mọi path đã khai', () => {
  const routes = pageRoutes();

  it('bộ dò route hoạt động (trang chủ ↔ (public)/page.tsx, nhóm bị bỏ khỏi URL)', () => {
    expect(routes).toContain('/');
    expect(routes).toContain('/about');
    expect(routes).toContain('/dashboard');
    expect([...routes].some((route) => route.includes('('))).toBe(false);
  });

  it('mỗi giá trị của PATHS có page.tsx', () => {
    const missing = Object.values(PATHS).filter((path) => !routes.has(path));

    expect(missing, `Thiếu page.tsx cho: ${missing.join(', ')}`).toEqual([]);
  });

  it('mỗi path của NAV_PAGES có page.tsx', () => {
    const missing = NAV_PAGES.map((page) => page.path).filter((path) => !routes.has(path));

    expect(missing, `Thiếu page.tsx cho: ${missing.join(', ')}`).toEqual([]);
  });

  it('mỗi path của NAV_MODULES (phân hệ và màn hình) có page.tsx', () => {
    const paths = NAV_MODULES.flatMap((navModule) => [
      navModule.path,
      ...navModule.screens.map((screen) => screen.path),
    ]);
    const missing = paths.filter((path) => !routes.has(path));

    expect(missing, `Thiếu page.tsx cho: ${missing.join(', ')}`).toEqual([]);
  });

  it('mọi mục menu nằm dưới vùng cần đăng nhập — proxy chặn người lạ trước khi tới guard', () => {
    const paths = [
      ...NAV_PAGES.map((page) => page.path),
      ...NAV_MODULES.flatMap((navModule) => [
        navModule.path,
        ...navModule.screens.map((s) => s.path),
      ]),
    ];
    const open = paths.filter(
      (path) =>
        !PROTECTED_PATH_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`)),
    );

    expect(open, `Không nằm trong PROTECTED_PATH_PREFIXES: ${open.join(', ')}`).toEqual([]);
  });
});

describe('cấu hình điều hướng nhất quán', () => {
  const ids = [
    ...NAV_PAGES.map((page) => page.id),
    ...NAV_MODULES.flatMap((navModule) => [navModule.id, ...navModule.screens.map((s) => s.id)]),
  ];

  it('path của trang tĩnh duy nhất và bắt đầu bằng "/"', () => {
    const paths = NAV_PAGES.map((page) => page.path);

    expect(new Set(paths).size).toBe(paths.length);
    expect(paths.every((path) => path.startsWith('/'))).toBe(true);
  });

  it.each([
    ['vi', viMessages],
    ['en', enMessages],
  ] as const)('mọi id điều hướng có `title` trong shell.nav (%s)', (_locale, messages) => {
    const nav = messages.shell.nav as Record<string, { title?: string }>;
    const missing = ids.filter((id) => !nav[id]?.title);

    expect(missing).toEqual([]);
  });

  it('mọi phân hệ có ít nhất một màn hình, và màn đầu là trang chủ phân hệ', () => {
    for (const navModule of NAV_MODULES) {
      expect(navModule.screens.length).toBeGreaterThan(0);
      expect(navModule.screens[0].path).toBe(navModule.path);
    }
  });
});

/**
 * Chiều ngược của "menu nằm dưới vùng cần đăng nhập": đi từ CÂY THƯ MỤC, không từ menu — nên bắt cả trang ẩn khỏi menu và route có
 * tham số (`[id]`). Thêm page dưới `(app)` mà quên khai `PROTECTED_PATH_PREFIXES` thì proxy không chặn người lạ; page dưới `(auth)` mà
 * quên `GUEST_ONLY_PATHS` thì người đã đăng nhập vẫn vào được trang khách.
 */
describe('mọi route theo nhóm có chính sách truy cập đúng', () => {
  const prefix = 'src/app/[locale]/';
  const GROUP = /^\(.+\)$/;

  /** Các `page.tsx` thuộc một nhóm route → đường URL (bỏ nhóm; giữ nguyên segment động `[id]`). */
  const routesOfGroup = (group: string): string[] =>
    [...REPO_PATHS]
      .filter((path) => path.startsWith(prefix) && path.endsWith('/page.tsx'))
      .map((path) => path.slice(prefix.length, -'/page.tsx'.length).split('/'))
      .filter((segments) => segments.includes(group))
      .map((segments) => `/${segments.filter((segment) => !GROUP.test(segment)).join('/')}`);

  const isProtected = (route: string) =>
    PROTECTED_PATH_PREFIXES.some((item) => route === item || route.startsWith(`${item}/`));
  const isGuestOnly = (route: string) => GUEST_ONLY_PATHS.includes(route);

  it('bộ dò nhóm hoạt động', () => {
    expect(routesOfGroup('(app)')).toContain('/dashboard');
    expect(routesOfGroup('(auth)')).toContain('/login');
    expect(routesOfGroup('(public)')).toContain('/about');
  });

  it('mọi page dưới `(app)` thuộc PROTECTED_PATH_PREFIXES (proxy chặn người lạ)', () => {
    const open = routesOfGroup('(app)').filter((route) => !isProtected(route));

    expect(open, `Khai thêm vào PROTECTED_PATH_PREFIXES: ${open.join(', ')}`).toEqual([]);
  });

  it('mọi page dưới `(auth)` thuộc GUEST_ONLY_PATHS', () => {
    const open = routesOfGroup('(auth)').filter((route) => !isGuestOnly(route));

    expect(open, `Khai thêm vào GUEST_ONLY_PATHS: ${open.join(', ')}`).toEqual([]);
  });

  it('page dưới `(public)` không bị khai nhầm là riêng tư hay trang khách', () => {
    const wrong = routesOfGroup('(public)').filter(
      (route) => isProtected(route) || isGuestOnly(route),
    );

    expect(wrong, `Route công khai nằm trong danh sách riêng tư: ${wrong.join(', ')}`).toEqual([]);
  });
});
