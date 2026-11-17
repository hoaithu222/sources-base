/**
 * Guard phía trình duyệt — `AuthGate` · `GuestGate` · `PermissionGate` · `useSessionGate`, khi kiểm đăng nhập BẬT (rồi TẮT).
 *
 * Mỗi ca là một hành vi người dùng thấy được và đã từng sai:
 *  - F5 lúc máy chủ lỗi bị đá về trang đăng nhập (giờ: màn "thử lại", giữ URL).
 *  - Mở thẳng `/login` khi đang có phiên vẫn thấy form.
 *  - Phiên hết hạn mà không nhớ trang đang làm; đăng xuất chủ động mà vẫn nhớ (lộ đích cho người kế tiếp).
 *  - `?next=` trỏ ra ngoài app bị đi theo (open-redirect).
 *  - Quyền bị thu hồi khi đang đứng trong route mà trang vẫn hiện.
 */

import { act, render, renderHook, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { navigationMock } from '@tests/helpers/navigation-mock';
import { createDeferred } from '@tests/helpers/deferred';
import { mockHttp } from '@tests/helpers/http-mock';
import type { MockHandler, MockReply } from '@tests/helpers/http-mock';
import { IntlWrapper } from '@tests/helpers/render';
import type { Locale } from '@/core/i18n';

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

const { AuthGate, GuestGate, PermissionGate } = await import('@/app/_guards');
const { useSessionGate } = await import('@/app/_guards/useSessionGate');
const { establishSession, logout, useSessionStore } = await import('@/domains/session');
const { clearSession } = await import('@/domains/session/lifecycle/session.lifecycle');

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

let restoreHttp: () => void = () => {};
const useHttp = (handler: MockHandler) => {
  const spy = vi.fn(handler);
  restoreHttp = mockHttp(spy);
  return spy;
};

function renderGate(ui: React.ReactElement, locale: Locale = 'vi') {
  return render(ui, {
    wrapper: ({ children }) => <IntlWrapper locale={locale}>{children}</IntlWrapper>,
  });
}

const BODY = <p>Nội dung được bảo vệ</p>;

beforeEach(() => {
  config.authEnabled = true;
  useSessionStore.setState(useSessionStore.getInitialState(), true);
  localStorage.clear();
  window.history.replaceState({}, '', '/');
});

afterEach(() => {
  restoreHttp();
  restoreHttp = () => {};
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

  it('còn phiên thật → khôi phục rồi `signed-in`', async () => {
    useHttp(() => sessionReply());
    const { result } = renderHook(() => useSessionGate());

    await waitFor(() => expect(result.current).toBe('signed-in'));
  });

  it('máy chủ lỗi → `unavailable` (chưa biết còn phiên hay không)', async () => {
    useHttp(() => ({ status: 503, data: {} }));
    const { result } = renderHook(() => useSessionGate());

    await waitFor(() => expect(result.current).toBe('unavailable'));
  });

  it('kiểm đăng nhập tắt (demo) → `open`, KHÔNG gọi mạng', () => {
    config.authEnabled = false;
    const http = useHttp(() => ({ status: 200, data: {} }));

    const { result } = renderHook(() => useSessionGate());

    expect(result.current).toBe('open');
    expect(http).not.toHaveBeenCalled();
  });
});

describe('AuthGate', () => {
  it('đang khôi phục phiên → màn chờ, KHÔNG lộ nội dung và không chuyển trang', async () => {
    const reply = createDeferred<MockReply>();
    useHttp(() => reply.promise);

    renderGate(<AuthGate>{BODY}</AuthGate>);

    expect(screen.getByText('Đang tải…')).toBeInTheDocument();
    expect(screen.queryByText('Nội dung được bảo vệ')).not.toBeInTheDocument();
    expect(navigationMock.replace).not.toHaveBeenCalled();

    await act(async () => reply.resolve(sessionReply()));
    expect(await screen.findByText('Nội dung được bảo vệ')).toBeInTheDocument();
  });

  it('có phiên → hiện nội dung, không chuyển trang', () => {
    establishSession({ accessToken: 't', user: USER });

    renderGate(<AuthGate>{BODY}</AuthGate>);

    expect(screen.getByText('Nội dung được bảo vệ')).toBeInTheDocument();
    expect(navigationMock.replace).not.toHaveBeenCalled();
  });

  it('máy chủ xác nhận không có phiên → replace về /login kèm ?next= ĐỦ đường định vào (query)', async () => {
    useHttp(() => ({ status: 401, data: {} }));
    window.history.replaceState({}, '', '/bao-cao?nam=2026');
    navigationMock.setLocation('/bao-cao', '?nam=2026');

    renderGate(<AuthGate>{BODY}</AuthGate>);

    await waitFor(() =>
      expect(navigationMock.replace).toHaveBeenCalledWith(
        `/login?next=${encodeURIComponent('/bao-cao?nam=2026')}`,
      ),
    );
    expect(screen.queryByText('Nội dung được bảo vệ')).not.toBeInTheDocument();
  });

  it('⛔ máy chủ lỗi → màn "thử lại", KHÔNG đá về /login, giữ nguyên URL', async () => {
    useHttp(() => ({ status: 503, data: {} }));
    navigationMock.setLocation('/bao-cao');

    renderGate(<AuthGate>{BODY}</AuthGate>);

    expect(await screen.findByText('Không kiểm tra được phiên đăng nhập')).toBeInTheDocument();
    expect(screen.queryByText('Nội dung được bảo vệ')).not.toBeInTheDocument();
    expect(navigationMock.replace).not.toHaveBeenCalled();
    expect(navigationMock.push).not.toHaveBeenCalled();
  });

  it('bấm "Thử lại" khi máy chủ đã sống → vào đúng nội dung đang định mở', async () => {
    let up = false;
    useHttp(() => (up ? sessionReply() : { status: 503, data: {} }));

    renderGate(<AuthGate>{BODY}</AuthGate>);
    const retry = await screen.findByRole('button', { name: 'Thử lại' });
    up = true;
    await userEvent.click(retry);

    expect(await screen.findByText('Nội dung được bảo vệ')).toBeInTheDocument();
  });

  it('chữ màn "thử lại" theo ngôn ngữ đang hiển thị', async () => {
    useHttp(() => ({ status: 503, data: {} }));

    renderGate(<AuthGate>{BODY}</AuthGate>, 'en');

    expect(await screen.findByText('Could not verify your session')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
  });

  it('phiên hết hạn giữa chừng → về /login và GIỮ đích quay lại', async () => {
    establishSession({ accessToken: 't', user: USER });
    window.history.replaceState({}, '', '/bao-cao?nam=2026');
    navigationMock.setLocation('/bao-cao', '?nam=2026');
    renderGate(<AuthGate>{BODY}</AuthGate>);
    expect(screen.getByText('Nội dung được bảo vệ')).toBeInTheDocument();

    act(() => clearSession('expired'));

    await waitFor(() =>
      expect(navigationMock.replace).toHaveBeenCalledWith(
        `/login?next=${encodeURIComponent('/bao-cao?nam=2026')}`,
      ),
    );
    expect(screen.queryByText('Nội dung được bảo vệ')).not.toBeInTheDocument();
  });

  it('⛔ bấm đăng xuất (chỉ gọi `logout()`) → guard tự về /login, KHÔNG ghi đích quay lại', async () => {
    useHttp(() => ({ status: 200, data: { data: null } }));
    establishSession({ accessToken: 't', user: USER });
    navigationMock.setLocation('/bao-cao');
    renderGate(<AuthGate>{BODY}</AuthGate>);

    await act(() => logout());

    await waitFor(() => expect(navigationMock.replace).toHaveBeenCalledWith('/login'));
    expect(navigationMock.replace).not.toHaveBeenCalledWith(expect.stringContaining('next='));
  });

  it('đăng xuất từ tab khác (`remote`) → về /login có đích quay lại', async () => {
    establishSession({ accessToken: 't', user: USER });
    navigationMock.setLocation('/ho-so');
    renderGate(<AuthGate>{BODY}</AuthGate>);

    act(() => clearSession('remote'));

    await waitFor(() =>
      expect(navigationMock.replace).toHaveBeenCalledWith(
        `/login?next=${encodeURIComponent('/ho-so')}`,
      ),
    );
  });

  it('kiểm đăng nhập tắt (demo) → hiện thẳng nội dung, không chờ, không gọi mạng, không chuyển trang', () => {
    config.authEnabled = false;
    const http = useHttp(() => ({ status: 200, data: {} }));

    renderGate(<AuthGate>{BODY}</AuthGate>);

    expect(screen.getByText('Nội dung được bảo vệ')).toBeInTheDocument();
    expect(http).not.toHaveBeenCalled();
    expect(navigationMock.replace).not.toHaveBeenCalled();
  });
});

describe('GuestGate', () => {
  const FORM = <p>Form đăng nhập</p>;

  it('không có phiên → hiện form', async () => {
    useHttp(() => ({ status: 401, data: {} }));

    renderGate(<GuestGate>{FORM}</GuestGate>);

    expect(screen.getByText('Form đăng nhập')).toBeInTheDocument();
    await waitFor(() => expect(useSessionStore.getState().status).toBe('anonymous'));
    expect(screen.getByText('Form đăng nhập')).toBeInTheDocument();
    expect(navigationMock.replace).not.toHaveBeenCalled();
  });

  it('máy chủ lỗi → vẫn hiện form (người dùng chủ động vào trang khách)', async () => {
    useHttp(() => 'network-error');

    renderGate(<GuestGate>{FORM}</GuestGate>);

    await waitFor(() => expect(useSessionStore.getState().status).toBe('unavailable'));
    expect(screen.getByText('Form đăng nhập')).toBeInTheDocument();
    expect(navigationMock.replace).not.toHaveBeenCalled();
  });

  it('⛔ mở THẲNG /login khi đang có phiên → thay form bằng màn chờ rồi replace về bảng điều khiển', async () => {
    useHttp(() => sessionReply());

    renderGate(<GuestGate>{FORM}</GuestGate>);

    await waitFor(() => expect(navigationMock.replace).toHaveBeenCalledWith('/dashboard'));
    expect(screen.queryByText('Form đăng nhập')).not.toBeInTheDocument();
    expect(screen.getByText('Đang tải…')).toBeInTheDocument();
  });

  it('đăng nhập xong (có `?next=`) → replace tới đúng trang định vào, giữ cả query và hash', async () => {
    window.history.replaceState(
      {},
      '',
      `/login?next=${encodeURIComponent('/bao-cao?nam=2026#muc-3')}`,
    );
    useSessionStore.setState({ status: 'anonymous' });
    renderGate(<GuestGate>{FORM}</GuestGate>);
    expect(screen.getByText('Form đăng nhập')).toBeInTheDocument();

    act(() => establishSession({ accessToken: 't', user: USER }));

    await waitFor(() =>
      expect(navigationMock.replace).toHaveBeenCalledWith('/bao-cao?nam=2026#muc-3'),
    );
  });

  it('đăng nhập xong không có `?next=` → về bảng điều khiển', async () => {
    useSessionStore.setState({ status: 'anonymous' });
    renderGate(<GuestGate>{FORM}</GuestGate>);

    act(() => establishSession({ accessToken: 't', user: USER }));

    await waitFor(() => expect(navigationMock.replace).toHaveBeenCalledWith('/dashboard'));
    expect(navigationMock.replace).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['protocol-relative', '//evil.example/steal'],
    ['URL tuyệt đối', 'https://evil.example/a'],
    ['gạch chéo ngược', '/\\evil.example/a'],
    ['javascript:', 'javascript:alert(1)'],
    ['đường tương đối', 'bao-cao'],
  ])('⛔ `?next=` không an toàn (%s) → bỏ qua, về bảng điều khiển', async (_name, unsafe) => {
    window.history.replaceState({}, '', `/login?next=${encodeURIComponent(unsafe)}`);
    useSessionStore.setState({ status: 'anonymous' });
    renderGate(<GuestGate>{FORM}</GuestGate>);

    act(() => establishSession({ accessToken: 't', user: USER }));

    await waitFor(() => expect(navigationMock.replace).toHaveBeenCalledWith('/dashboard'));
    expect(navigationMock.replace).toHaveBeenCalledTimes(1);
  });

  it('kiểm đăng nhập tắt (demo) → hiện form, không gọi mạng, không chuyển trang', () => {
    config.authEnabled = false;
    const http = useHttp(() => ({ status: 200, data: {} }));

    renderGate(<GuestGate>{FORM}</GuestGate>);

    expect(screen.getByText('Form đăng nhập')).toBeInTheDocument();
    expect(http).not.toHaveBeenCalled();
    expect(navigationMock.replace).not.toHaveBeenCalled();
  });
});

describe('PermissionGate', () => {
  const REQUIRED = { resource: 'report', action: 'view' } as const;

  it('có quyền → hiện nội dung', () => {
    establishSession({ accessToken: 't', user: USER });

    renderGate(<PermissionGate permission={REQUIRED}>{BODY}</PermissionGate>);

    expect(screen.getByText('Nội dung được bảo vệ')).toBeInTheDocument();
  });

  it('thiếu quyền → hiện màn 403 TẠI CHỖ, không lộ nội dung, không chuyển trang', () => {
    establishSession({ accessToken: 't', user: { ...USER, permissions: [] } });

    renderGate(<PermissionGate permission={REQUIRED}>{BODY}</PermissionGate>);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Bạn không có quyền truy cập' }),
    ).toBeInTheDocument();
    expect(screen.queryByText('Nội dung được bảo vệ')).not.toBeInTheDocument();
    expect(navigationMock.replace).not.toHaveBeenCalled();
    expect(navigationMock.push).not.toHaveBeenCalled();
  });

  it('màn 403 theo ngôn ngữ đang hiển thị', () => {
    establishSession({ accessToken: 't', user: { ...USER, permissions: [] } });

    renderGate(<PermissionGate permission={REQUIRED}>{BODY}</PermissionGate>, 'en');

    expect(
      screen.getByRole('heading', { level: 1, name: 'You do not have access' }),
    ).toBeInTheDocument();
  });

  it('vai trò admin vào được dù không có quyền chi tiết', () => {
    establishSession({ accessToken: 't', user: { ...USER, permissions: [], roles: ['admin'] } });

    renderGate(<PermissionGate permission={REQUIRED}>{BODY}</PermissionGate>);

    expect(screen.getByText('Nội dung được bảo vệ')).toBeInTheDocument();
  });

  it('quyền bị thu hồi KHI ĐANG ĐỨNG trong route → chuyển sang 403 ngay', () => {
    establishSession({ accessToken: 't', user: USER });
    renderGate(<PermissionGate permission={REQUIRED}>{BODY}</PermissionGate>);
    expect(screen.getByText('Nội dung được bảo vệ')).toBeInTheDocument();

    act(() => {
      useSessionStore.setState({ user: { ...USER, permissions: [] } });
    });

    expect(screen.queryByText('Nội dung được bảo vệ')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Bạn không có quyền truy cập',
    );
  });

  it('kiểm đăng nhập tắt (demo) → mở hết, kể cả khi chưa có người dùng', () => {
    config.authEnabled = false;

    renderGate(<PermissionGate permission={REQUIRED}>{BODY}</PermissionGate>);

    expect(screen.getByText('Nội dung được bảo vệ')).toBeInTheDocument();
  });
});
