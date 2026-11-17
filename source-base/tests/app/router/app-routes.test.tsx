/**
 * Router — khai báo route là NGUỒN DUY NHẤT; path, menu và đích điều hướng đều
 * phải khớp với nó.
 *
 * Lỗi đã xảy ra thật: `PATHS.PROFILE` và `PATHS.SETTINGS` được khai và được
 * `AppHeader` điều hướng tới, nhưng KHÔNG route nào mount chúng. Bấm "Hồ sơ
 * cá nhân" trong menu người dùng rơi thẳng vào catch-all `*` và ra trang 404.
 *
 * `tsc` không thấy loại lỗi này (path là chuỗi hợp lệ), lint cũng không. Chỉ
 * có bài kiểm đối chiếu HAI DANH SÁCH mới bắt được — nên nó ở đây.
 */

import { matchRoutes, type RouteObject } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { appRoutes } from '@/app/router';
import { toModuleMenu, toPageMenu } from '@/app/router/menu';
import { getRoutePath, MODULE_REGISTRY } from '@/app/router/modules';
import { APP_PAGES, FALLBACK_PAGES, GUEST_PAGES } from '@/app/router/static.routes';
import { canAccess } from '@/domains/session';
import { PATHS } from '@/shared/constants/paths.constants';

/** Bỏ catch-all `*` (con của route gốc) — nó khớp mọi thứ nên giữ lại là phép kiểm luôn xanh giả. */
const CONCRETE_ROUTES: RouteObject[] = appRoutes.map(({ children = [] }) => ({
  children: children.filter((r) => r.path !== '*'),
}));

const STATIC_PAGES = [...GUEST_PAGES, ...APP_PAGES, ...FALLBACK_PAGES];

describe('bảng route', () => {
  it.each(Object.entries(PATHS))('PATHS.%s (%s) có route thật', (_key, path) => {
    const matched = matchRoutes(CONCRETE_ROUTES, path);

    expect(matched, `Không route nào mount "${path}"`).not.toBeNull();
    // `matchRoutes` trả mảng rỗng khi chỉ khớp route cha mà không có lá.
    expect(matched?.length ?? 0).toBeGreaterThan(0);
  });

  it('URL lạ rơi vào catch-all chứ không văng lỗi', () => {
    expect(matchRoutes(appRoutes, '/duong-dan-khong-ton-tai')).not.toBeNull();
  });

  it('KHÔNG có path nào bị khai trùng', () => {
    const values = Object.values(PATHS);
    expect(new Set(values).size).toBe(values.length);
  });
});

describe('trang tĩnh', () => {
  it('mỗi entry dùng một path của `PATHS` — không chuỗi path nào viết lại ở chỗ khác', () => {
    const declared = STATIC_PAGES.map((page) => page.path).sort();
    expect(declared).toEqual(Object.values<string>(PATHS).sort());
  });

  it('`id` không trùng nhau, và không trùng id của phân hệ', () => {
    const ids = [...STATIC_PAGES, ...MODULE_REGISTRY].map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('entry nào cũng có tiêu đề cho tab trình duyệt', () => {
    expect(STATIC_PAGES.filter((page) => !page.meta.title)).toEqual([]);
  });
});

describe('menu và đích điều hướng lấy từ khai báo route', () => {
  it('nhóm "Điều hướng chung" của bảng lệnh = trang tĩnh có `icon`', () => {
    expect(toPageMenu(APP_PAGES).map(({ id, title, href }) => ({ id, title, href }))).toEqual([
      { id: 'home', title: 'Trang chủ', href: PATHS.HOME },
      { id: 'profile', title: 'Hồ sơ cá nhân', href: PATHS.PROFILE },
      { id: 'settings', title: 'Cài đặt', href: PATHS.SETTINGS },
    ]);
    expect(toPageMenu(GUEST_PAGES)).toEqual([]);
  });

  it('mọi mục Dock trỏ tới một route có thật', () => {
    for (const item of toModuleMenu(MODULE_REGISTRY)) {
      expect(matchRoutes(CONCRETE_ROUTES, item.href), `Dock "${item.id}"`).not.toBeNull();
    }
  });

  it('`getRoutePath(id)` trả path đầy đủ; id lạ trả `undefined` thay vì một chuỗi sai', () => {
    expect(getRoutePath('demo')).toBe('/demo');
    expect(getRoutePath('demo.composed')).toBe('/demo/ghep');
    expect(getRoutePath('khong-co')).toBeUndefined();
  });

  it('kiểm đăng nhập tắt (chế độ demo) → mọi route mở, menu hiện đủ', () => {
    expect(canAccess(null, [{ resource: 'report', action: 'update' }])).toBe(true);
  });
});
