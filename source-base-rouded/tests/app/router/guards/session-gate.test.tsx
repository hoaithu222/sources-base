/**
 * `useSessionGate` — một chỗ quyết guard rẽ nhánh nào (đã gộp `authEnabled`), và `AuthGuard` là nơi
 * DUY NHẤT đưa người dùng về `/login`, kể cả ngay sau khi bấm đăng xuất.
 *
 * Đăng xuất CHỦ ĐỘNG không ghi đích quay lại (người đăng nhập kế tiếp có thể là người khác); phiên hết
 * hạn / bị đăng xuất từ tab khác thì ghi, để đăng nhập lại là về đúng chỗ đang làm.
 */

import { act, render, renderHook, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { mockHttp } from '@tests/helpers/http-mock';
import type { MockHandler } from '@tests/helpers/http-mock';

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

const { AuthGuard, GuestGuard } = await import('@/app/router/guards');
const { useSessionGate } = await import('@/app/router/guards/useSessionGate');
const { establishSession, logout, useSessionStore } = await import('@/domains/session');
const { clearSession } = await import('@/domains/session/lifecycle/session.lifecycle');

const USER = { id: 'u1', email: 'an@congty.vn', name: 'An', roles: [], permissions: [] };

let restore: () => void = () => {};
const useHttp = (handler: MockHandler) => {
  const spy = vi.fn(handler);
  restore = mockHttp(spy);
  return spy;
};

beforeEach(() => {
  config.authEnabled = true;
  useSessionStore.setState(useSessionStore.getInitialState(), true);
  localStorage.clear();
});
afterEach(() => {
  restore();
  restore = () => {};
});

describe('useSessionGate', () => {
  it.each([
    ['authenticated', 'signed-in'],
    ['anonymous', 'signed-out'],
  ] as const)('phiên `%s` → `%s`, không gọi mạng', (status, gate) => {
    const http = useHttp(() => ({ status: 200, data: {} }));
    useSessionStore.setState({ status, user: status === 'authenticated' ? USER : null });

    const { result } = renderHook(() => useSessionGate());

    expect(result.current).toBe(gate);
    expect(http).not.toHaveBeenCalled();
  });

  it('chưa hỏi máy chủ → `pending`, rồi theo câu trả lời (401 → `signed-out`)', async () => {
    useHttp(() => ({ status: 401, data: {} }));
    const { result } = renderHook(() => useSessionGate());

    expect(result.current).toBe('pending');
    await waitFor(() => expect(result.current).toBe('signed-out'));
  });

  it('máy chủ lỗi → `unavailable` (chưa biết còn phiên hay không)', async () => {
    useHttp(() => ({ status: 503, data: {} }));
    const { result } = renderHook(() => useSessionGate());

    await waitFor(() => expect(result.current).toBe('unavailable'));
  });

  it('kiểm đăng nhập tắt (chế độ demo) → `open`, KHÔNG gọi mạng', () => {
    config.authEnabled = false;
    const http = useHttp(() => ({ status: 200, data: {} }));

    const { result } = renderHook(() => useSessionGate());

    expect(result.current).toBe('open');
    expect(http).not.toHaveBeenCalled();
  });
});

describe('guard ở chế độ demo', () => {
  const ROUTES: RouteObject[] = [
    { element: <GuestGuard />, children: [{ path: '/login', element: <p>Form đăng nhập</p> }] },
    { element: <AuthGuard />, children: [{ path: '/', element: <p>Trang chủ</p> }] },
  ];

  it.each([
    ['/', 'Trang chủ'],
    ['/login', 'Form đăng nhập'],
  ])('mở `%s` → hiện thẳng trang, không chờ, không chuyển hướng', (path, text) => {
    config.authEnabled = false;
    render(<RouterProvider router={createMemoryRouter(ROUTES, { initialEntries: [path] })} />);
    expect(screen.getByText(text)).toBeInTheDocument();
  });
});

describe('AuthGuard đưa về trang đăng nhập khi phiên kết thúc', () => {
  const ROUTES: RouteObject[] = [
    { element: <GuestGuard />, children: [{ path: '/login', element: <p>Form đăng nhập</p> }] },
    { element: <AuthGuard />, children: [{ path: '/bao-cao', element: <p>Trang báo cáo</p> }] },
  ];

  function renderSignedIn() {
    establishSession({ accessToken: 't', user: USER });
    const router = createMemoryRouter(ROUTES, { initialEntries: ['/bao-cao?nam=2026#muc-3'] });
    render(<RouterProvider router={router} />);
    expect(screen.getByText('Trang báo cáo')).toBeInTheDocument();
    return router;
  }

  it('⛔ bấm đăng xuất (chỉ gọi `logout()`) → guard tự về /login, KHÔNG ghi đích quay lại', async () => {
    useHttp(() => ({ status: 200, data: { data: null } }));
    const router = renderSignedIn();

    await act(() => logout());

    expect(await screen.findByText('Form đăng nhập')).toBeInTheDocument();
    expect(router.state.location.state).toBeNull();
  });

  it.each(['expired', 'remote'] as const)(
    'phiên kết thúc vì `%s` → về /login, GIỮ đích quay lại (đủ query + hash)',
    async (reason) => {
      const router = renderSignedIn();

      act(() => clearSession(reason));

      expect(await screen.findByText('Form đăng nhập')).toBeInTheDocument();
      expect(router.state.location.state).toEqual({ from: '/bao-cao?nam=2026#muc-3' });
    },
  );
});
