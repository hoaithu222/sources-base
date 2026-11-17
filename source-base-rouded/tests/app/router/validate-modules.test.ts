/**
 * Registry sai phải dừng NGAY lúc nạp, kèm thông báo chỉ đúng chỗ — không phải
 * thành một route chết mà tới lúc người dùng bấm mới lộ.
 */

import { describe, expect, it } from 'vitest';

import type { ModuleDef, RouteDef } from '@/app/router/definition';
import { findModuleProblems, MODULE_REGISTRY, validateModules } from '@/app/router/modules';
import { PATHS } from '@/shared/constants/paths.constants';

const Page = () => null;

function moduleOf(overrides: Partial<ModuleDef> & Pick<ModuleDef, 'id' | 'path'>): ModuleDef {
  return {
    meta: { title: overrides.id, icon: 'grid-2-outline' },
    children: [{ index: true, page: Page }],
    ...overrides,
  };
}

const page = (path: string, extra: Partial<RouteDef> = {}): RouteDef =>
  ({ path, page: Page, meta: { title: path }, ...extra }) as RouteDef;

describe('validateModules', () => {
  it('registry thật của app hợp lệ, không đụng path của trang tĩnh', () => {
    expect(findModuleProblems(MODULE_REGISTRY, Object.values(PATHS))).toEqual([]);
  });

  it('cấu hình đúng mẫu → không ném', () => {
    const report = moduleOf({
      id: 'report',
      path: '/reports',
      children: [
        { index: true, page: Page },
        page('create'),
        { path: ':id', children: [{ index: true, page: Page }, page('settings')] },
      ],
    });
    expect(() => validateModules([report, moduleOf({ id: 'user', path: '/users' })])).not.toThrow();
  });

  it('trùng id phân hệ', () => {
    const modules = [
      moduleOf({ id: 'user', path: '/users' }),
      moduleOf({ id: 'user', path: '/staff' }),
    ];
    expect(() => validateModules(modules)).toThrow(/Trùng id "user"/);
  });

  it('trùng id giữa route con và phân hệ khác', () => {
    const modules = [
      moduleOf({ id: 'user', path: '/users' }),
      moduleOf({
        id: 'report',
        path: '/reports',
        children: [{ index: true, page: Page }, page('create', { id: 'user' })],
      }),
    ];
    expect(() => validateModules(modules)).toThrow(/Trùng id "user"/);
  });

  it('trùng path giữa hai phân hệ', () => {
    const modules = [
      moduleOf({ id: 'user', path: '/users' }),
      moduleOf({ id: 'staff', path: '/users' }),
    ];
    expect(() => validateModules(modules)).toThrow(/Trùng path "\/users"/);
  });

  it('phân hệ khai trùng path của một trang tĩnh', () => {
    const modules = [moduleOf({ id: 'settings', path: '/settings' })];
    expect(() => validateModules(modules, Object.values(PATHS))).toThrow(
      /Trùng path "\/settings".*trang tĩnh/,
    );
  });

  it('trùng path giữa hai route con — `:id` và `:slug` là cùng một mẫu', () => {
    const report = moduleOf({
      id: 'report',
      path: '/reports',
      children: [{ index: true, page: Page }, page(':id'), page(':slug')],
    });
    expect(() => validateModules([report])).toThrow(/Trùng path "\/reports\/:slug"/);
  });

  it('⛔ path con tuyệt đối (`/outside`) bị từ chối, kèm hướng dẫn khai ở đúng cấp', () => {
    const report = moduleOf({
      id: 'report',
      path: '/reports',
      children: [
        { index: true, page: Page },
        { path: 'settings', children: [page('/outside')] },
      ],
    });
    expect(() => validateModules([report])).toThrow(
      /"\/outside": path con phải TƯƠNG ĐỐI.*nằm ngoài "\/reports\/settings"/s,
    );
  });

  it('path phân hệ phải tuyệt đối và tĩnh', () => {
    const relative = moduleOf({ id: 'a', path: 'reports' as ModuleDef['path'] });
    const dynamic = moduleOf({ id: 'b', path: '/reports/:id' });
    expect(() => validateModules([relative])).toThrow(/path "reports" phải TUYỆT ĐỐI/);
    expect(() => validateModules([dynamic])).toThrow(/path "\/reports\/:id" phải TUYỆT ĐỐI/);
  });

  it('landingPath không trỏ tới route đã khai', () => {
    const report = moduleOf({
      id: 'report',
      path: '/reports',
      meta: { title: 'Báo cáo', icon: 'grid-2-outline', landingPath: '/reports/summary' },
    });
    expect(() => validateModules([report])).toThrow(
      /landingPath "\/reports\/summary" không trỏ tới route/,
    );
  });

  it('landingPath khớp một route con (kể cả route động, kèm query) → hợp lệ', () => {
    const report = moduleOf({
      id: 'report',
      path: '/reports',
      meta: { title: 'Báo cáo', icon: 'grid-2-outline', landingPath: '/reports/2026?tab=summary' },
      children: [page(':year')],
    });
    expect(findModuleProblems([report])).toEqual([]);
  });

  it('không có trang index mà cũng không khai landingPath', () => {
    const report = moduleOf({ id: 'report', path: '/reports', children: [page('create')] });
    expect(() => validateModules([report])).toThrow(/không có trang index tại "\/reports"/);
  });

  it('permission của route con trùng quyền cấp cha đã áp', () => {
    const report = moduleOf({
      id: 'report',
      path: '/reports',
      children: [
        { index: true, page: Page },
        page('create', { permission: { resource: 'report' } }),
      ],
    });
    expect(() => validateModules([report])).toThrow(/"create": permission trùng với quyền cấp cha/);
  });

  it('defaultTab không có trong tabTitles', () => {
    const report = moduleOf({
      id: 'report',
      path: '/reports',
      meta: {
        title: 'Báo cáo',
        icon: 'grid-2-outline',
        tabTitles: { summary: 'Tổng quan' },
        defaultTab: 'detail',
      },
    });
    expect(() => validateModules([report])).toThrow(/defaultTab "detail" không có trong tabTitles/);
  });

  it('liệt kê MỌI lỗi trong một lần ném, không dừng ở lỗi đầu tiên', () => {
    const modules = [
      moduleOf({ id: 'user', path: '/users' }),
      moduleOf({ id: 'user', path: '/users' }),
    ];
    expect(findModuleProblems(modules)).toHaveLength(2);
    expect(() => validateModules(modules)).toThrow(/\[module-registry\]/);
  });
});
