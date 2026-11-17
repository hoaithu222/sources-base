/**
 * Quyền — MỘT luật cho guard, menu và nút trong feature (`canAccess`).
 *
 * Lỗi đã sửa: `usePermission` từng tự gọi `hasPermission(user, …)` nên ở chế độ demo (không có ai đăng
 * nhập) nó trả `false` — feature làm theo `reuse-first.md` ẩn MỌI nút theo quyền trong demo, trong khi
 * guard và menu (`canAccess`) lại mở hết. Giờ cả ba cùng đi qua `canAccess`.
 */

import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { canAccess, establishSession, usePermission, useSessionStore } from '@/domains/session';
import { hasPermission } from '@/domains/session/model/permission.utils';

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

const USER = {
  id: 'u1',
  email: 'a@b.vn',
  name: 'A',
  roles: ['editor'],
  permissions: ['user:view', 'user:create', 'report:export'],
};

beforeEach(() => {
  config.authEnabled = true;
  useSessionStore.setState(useSessionStore.getInitialState(), true);
  localStorage.clear();
});
afterEach(() => {
  config.authEnabled = true;
});

describe('hasPermission — hàm thuần theo `user`', () => {
  it('khớp chuỗi `resource:action` đã lưu', () => {
    expect(hasPermission(USER, { resource: 'user', action: 'create' })).toBe(true);
    expect(hasPermission(USER, { resource: 'user', action: 'delete' })).toBe(false);
  });

  it('bỏ trống `action` thì hiểu là `view`', () => {
    expect(hasPermission(USER, { resource: 'user' })).toBe(true);
    expect(hasPermission(USER, { resource: 'report' })).toBe(false);
  });

  it('vai trò admin vượt mọi kiểm quyền chi tiết', () => {
    const admin = { ...USER, roles: ['admin'], permissions: [] };
    expect(hasPermission(admin, { resource: 'bất-kỳ', action: 'delete' })).toBe(true);
  });

  it('chưa đăng nhập thì không có quyền gì — kể cả khi kiểm đăng nhập tắt', () => {
    config.authEnabled = false;
    expect(hasPermission(null, { resource: 'user' })).toBe(false);
  });
});

describe('canAccess — luật chung của guard, menu, `usePermission`', () => {
  it('phải thoả MỌI quyền trong danh sách (quyền cộng dồn từ phân hệ xuống trang)', () => {
    expect(canAccess(USER, [{ resource: 'user' }, { resource: 'user', action: 'create' }])).toBe(
      true,
    );
    expect(canAccess(USER, [{ resource: 'user' }, { resource: 'user', action: 'delete' }])).toBe(
      false,
    );
  });

  it('danh sách rỗng → vào được', () => {
    expect(canAccess(null, [])).toBe(true);
  });

  it('kiểm đăng nhập tắt (chế độ demo) → mọi quyền mở, kể cả khi không có ai đăng nhập', () => {
    config.authEnabled = false;
    expect(canAccess(null, [{ resource: 'report', action: 'update' }])).toBe(true);
  });
});

describe('usePermission', () => {
  it('⛔ chế độ demo (không ai đăng nhập) → `true`, cùng kết quả với guard và menu', () => {
    config.authEnabled = false;
    const { result } = renderHook(() => usePermission({ resource: 'report', action: 'export' }));
    expect(result.current).toBe(true);
  });

  it('kiểm đăng nhập bật, chưa đăng nhập → `false`', () => {
    const { result } = renderHook(() => usePermission({ resource: 'report', action: 'export' }));
    expect(result.current).toBe(false);
  });

  it('có quyền → `true`; quyền bị thu hồi → tự render lại thành `false`', () => {
    establishSession({ accessToken: 't', user: USER });
    const { result } = renderHook(() => usePermission({ resource: 'report', action: 'export' }));
    expect(result.current).toBe(true);

    act(() => {
      useSessionStore.setState({ user: { ...USER, permissions: [] } });
    });
    expect(result.current).toBe(false);
  });
});
