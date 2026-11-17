/**
 * Guard của router khi kiểm đăng nhập BẬT.
 *
 * Mỗi ca dưới đây là một hành vi người dùng nhìn thấy được và đã từng sai:
 *
 *  - F5 lúc máy chủ lỗi bị đá về trang đăng nhập (giờ: màn "thử lại").
 *  - Mở thẳng `/login` khi đang có phiên vẫn thấy form đăng nhập.
 *  - Quyền bị thu hồi khi đang đứng trong route mà trang vẫn hiện.
 *  - Đăng nhập xong quay về thiếu `#hash`, hoặc bị dẫn ra ngoài app.
 */

import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, Outlet, RouterProvider } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { mockHttp } from '@tests/helpers/http-mock';
import type { MockReply } from '@tests/helpers/http-mock';

vi.mock('@/core/config', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/core/config')>();
  return { ...actual, appConfig: { ...actual.appConfig, authEnabled: true } };
});

const { AuthGuard, GuestGuard, PermissionGuard, resolveReturnPath } =
  await import('@/app/router/guards');
const { DisplayUrlSync } = await import('@/app/router/sync');
const { useDisplayStore } = await import('@/domains/preferences');
const { establishSession, useSessionStore } = await import('@/domains/session');

const USER = {
  id: 'u1',
  email: 'an@congty.vn',
  name: 'Nguyễn Văn An',
  roles: ['editor'],
  permissions: ['report:view'],
};

const sessionReply = (): MockReply => ({
  status: 200,
  data: { data: { accessToken: 'token-moi', user: USER } },
});

const ROUTES: RouteObject[] = [
  {
    element: <GuestGuard />,
    children: [{ path: '/login', element: <p>Form đăng nhập</p> }],
  },
  {
    element: <AuthGuard />,
    children: [
      { path: '/', element: <p>Trang chủ</p> },
      {
        element: (
          <PermissionGuard permission={{ resource: 'report', action: 'view' }}>
            <Outlet />
          </PermissionGuard>
        ),
        children: [{ path: '/bao-cao', element: <p>Trang báo cáo</p> }],
      },
    ],
  },
  { path: '/403', element: <p>Không có quyền</p> },
];

function renderAt(path: string) {
  const router = createMemoryRouter(ROUTES, { initialEntries: [path] });
  render(<RouterProvider router={router} />);
  return router;
}

let restore: () => void = () => {};

beforeEach(() => {
  useSessionStore.setState(useSessionStore.getInitialState(), true);
  useDisplayStore.setState({ mode: 'standard', uiScale: 1.1 });
  localStorage.clear();
});
afterEach(() => restore());

describe('AuthGuard', () => {
  it('còn phiên → khôi phục rồi vào trang', async () => {
    restore = mockHttp(() => sessionReply());
    renderAt('/');
    expect(await screen.findByText('Trang chủ')).toBeInTheDocument();
  });

  it('máy chủ xác nhận không có phiên → về trang đăng nhập, nhớ ĐỦ đường định vào (query + hash)', async () => {
    restore = mockHttp(() => ({ status: 401, data: {} }));
    const router = renderAt('/bao-cao?nam=2026#muc-3');

    expect(await screen.findByText('Form đăng nhập')).toBeInTheDocument();
    expect(router.state.location.state).toEqual({ from: '/bao-cao?nam=2026#muc-3' });
  });

  it('⛔ máy chủ lỗi → màn "thử lại", KHÔNG đá về trang đăng nhập, giữ nguyên URL', async () => {
    restore = mockHttp(() => ({ status: 503, data: {} }));
    const router = renderAt('/bao-cao');

    expect(await screen.findByText('Không kết nối được máy chủ')).toBeInTheDocument();
    expect(screen.queryByText('Form đăng nhập')).not.toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/bao-cao');
  });

  it('bấm "Thử lại" khi máy chủ đã sống → vào đúng trang đang định mở', async () => {
    let up = false;
    restore = mockHttp(() => (up ? sessionReply() : { status: 503, data: {} }));
    renderAt('/bao-cao');

    const retry = await screen.findByRole('button', { name: 'Thử lại' });
    up = true;
    await userEvent.click(retry);

    expect(await screen.findByText('Trang báo cáo')).toBeInTheDocument();
  });

  it('phiên hết hạn giữa chừng → guard tự đưa về trang đăng nhập', async () => {
    establishSession({ accessToken: 't', user: USER });
    renderAt('/');
    expect(screen.getByText('Trang chủ')).toBeInTheDocument();

    act(() => {
      useSessionStore.setState({ user: null, accessToken: null, status: 'anonymous' });
    });
    expect(await screen.findByText('Form đăng nhập')).toBeInTheDocument();
  });
});

describe('GuestGuard', () => {
  it('⛔ mở THẲNG /login khi đang có phiên → khôi phục rồi về trang chủ', async () => {
    restore = mockHttp(() => sessionReply());
    renderAt('/login');

    expect(await screen.findByText('Trang chủ')).toBeInTheDocument();
    expect(screen.queryByText('Form đăng nhập')).not.toBeInTheDocument();
  });

  it('không có phiên → hiện form đăng nhập', async () => {
    restore = mockHttp(() => ({ status: 401, data: {} }));
    renderAt('/login');
    expect(await screen.findByText('Form đăng nhập')).toBeInTheDocument();
  });

  it('máy chủ lỗi → vẫn hiện form (người dùng chủ động vào trang khách)', async () => {
    restore = mockHttp(() => 'network-error');
    renderAt('/login');
    expect(await screen.findByText('Form đăng nhập')).toBeInTheDocument();
  });

  /** Mở `/login` với `state.from` cho trước, rồi xác lập phiên như `useLogin` làm. */
  async function loginFrom(from: unknown) {
    useSessionStore.setState({ status: 'anonymous' });
    const router = createMemoryRouter(ROUTES, {
      initialEntries: [{ pathname: '/login', state: { from } }],
    });
    render(<RouterProvider router={router} />);
    expect(screen.getByText('Form đăng nhập')).toBeInTheDocument();

    act(() => establishSession({ accessToken: 't', user: USER }));
    await waitFor(() => expect(screen.queryByText('Form đăng nhập')).not.toBeInTheDocument());
    return router;
  }

  it('đăng nhập xong → guard tự đưa về đúng trang định vào, giữ cả query và hash', async () => {
    const router = await loginFrom('/bao-cao?nam=2026#muc-3');

    expect(screen.getByText('Trang báo cáo')).toBeInTheDocument();
    const { pathname, search, hash } = router.state.location;
    expect(pathname + search + hash).toBe('/bao-cao?nam=2026#muc-3');
  });

  it('⛔ đích quay lại trỏ ra ngoài app → bỏ qua, về trang chủ', async () => {
    const router = await loginFrom('//evil.example/steal');

    expect(screen.getByText('Trang chủ')).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/');
  });
});

describe('guard + đồng bộ chế độ hiển thị', () => {
  it('⛔ đang bật chế độ TV: bị đưa về đăng nhập vẫn nhớ đích, đăng nhập xong về đúng chỗ', async () => {
    useDisplayStore.setState({ mode: 'tv', uiScale: 1.2 });
    restore = mockHttp(() => ({ status: 401, data: {} }));

    const router = createMemoryRouter(
      [
        {
          element: (
            <>
              <DisplayUrlSync />
              <Outlet />
            </>
          ),
          children: ROUTES,
        },
      ],
      { initialEntries: ['/bao-cao?nam=2026#muc-3'] },
    );
    render(<RouterProvider router={router} />);

    // `DisplayUrlSync` viết thêm `?display=tv` lên URL của trang đăng nhập —
    // việc đó không được làm rơi `state.from` do `AuthGuard` đặt.
    await waitFor(() => expect(router.state.location.search).toBe('?display=tv&scale=1.2'));
    expect(router.state.location.pathname).toBe('/login');

    act(() => establishSession({ accessToken: 't', user: USER }));
    expect(await screen.findByText('Trang báo cáo')).toBeInTheDocument();
    expect(router.state.location.hash).toBe('#muc-3');
  });
});

describe('resolveReturnPath', () => {
  it('giữ nguyên đường nội bộ, đủ query và hash', () => {
    expect(resolveReturnPath({ from: '/bao-cao?nam=2026#muc-3' })).toBe('/bao-cao?nam=2026#muc-3');
  });

  it.each([
    ['không có state', null],
    ['state không có from', {}],
    ['from không phải chuỗi', { from: 42 }],
    ['URL tuyệt đối', { from: 'https://evil.example/a' }],
    ['protocol-relative', { from: '//evil.example/a' }],
    ['gạch chéo ngược', { from: '/\\evil.example/a' }],
    ['ký tự điều khiển chen giữa', { from: '/\t/evil.example/a' }],
    ['đường tương đối', { from: 'bao-cao' }],
    ['javascript:', { from: 'javascript:alert(1)' }],
  ])('%s → về đích dự phòng', (_name, state) => {
    expect(resolveReturnPath(state)).toBe('/');
    expect(resolveReturnPath(state, '/trang-khac')).toBe('/trang-khac');
  });
});

describe('PermissionGuard', () => {
  it('có quyền → vào', () => {
    establishSession({ accessToken: 't', user: USER });
    renderAt('/bao-cao');
    expect(screen.getByText('Trang báo cáo')).toBeInTheDocument();
  });

  it('⛔ quyền bị thu hồi KHI ĐANG ĐỨNG trong route → chuyển sang 403 ngay', async () => {
    establishSession({ accessToken: 't', user: USER });
    renderAt('/bao-cao');
    expect(screen.getByText('Trang báo cáo')).toBeInTheDocument();

    // Lượt refresh kế tiếp trả hồ sơ mới, không còn `report:view`.
    act(() => {
      useSessionStore.setState({ user: { ...USER, permissions: [] } });
    });

    await waitFor(() => expect(screen.getByText('Không có quyền')).toBeInTheDocument());
    expect(screen.queryByText('Trang báo cáo')).not.toBeInTheDocument();
  });

  it('vai trò admin vào được dù không có quyền chi tiết', () => {
    establishSession({ accessToken: 't', user: { ...USER, permissions: [], roles: ['admin'] } });
    renderAt('/bao-cao');
    expect(screen.getByText('Trang báo cáo')).toBeInTheDocument();
  });
});
