/**
 * Provider của app — `StoreHydration` · `LocaleSync` · `SessionBootstrap` / `bootstrapApp` · `getQueryClient` · `DisplayUrlSync`.
 *
 * Lỗi cần chặn:
 *  - đổi ngôn ngữ mà câu lỗi HTTP / Zod vẫn là ngôn ngữ cũ (chúng nằm ngoài React nên không tự cập nhật);
 *  - `bootstrapApp` đăng ký trùng khi React Strict Mode chạy effect hai lần, hoặc rò listener sau dispose;
 *  - phiên kết thúc / đổi tài khoản mà cache, hàng đợi tải lên, thẻ tác vụ của người cũ còn sót.
 */

import { QueryClient } from '@tanstack/react-query';
import { act, render, waitFor } from '@testing-library/react';
import { z } from 'zod';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import DisplayUrlSync from '@/app/_providers/sync/DisplayUrlSync';
import { bootstrapApp } from '@/app/_providers/bootstrap';
import { getQueryClient } from '@/app/_providers/query-client';
import SessionBootstrap from '@/app/_providers/sync/SessionBootstrap';
import StoreHydration from '@/app/_providers/sync/StoreHydration';
import LocaleSync from '@/app/_providers/sync/LocaleSync';
import { configureZodLocale, validationMessages } from '@/core/config';
import { configureErrorMessages } from '@/core/http';
import { errorMessages } from '@/core/http/errors/error-messages';
import { useDisplayStore } from '@/domains/preferences';
import { establishSession, useSessionStore } from '@/domains/session';
import { clearSession } from '@/domains/session/lifecycle/session.lifecycle';
import { subscribeSessionSignals } from '@/domains/session/lifecycle/session.sync';
import enMessages from '@/messages/en';
import viMessages from '@/messages/vi';
import { useToastStore } from '@/shared/ui/overlays/toast/toast.store';
import { useServerTaskStore } from '@/shared/widgets/progress-center/server-tasks';
import { useUploadQueueStore } from '@/shared/widgets/progress-center/upload-queue';
import { IntlWrapper, renderInRouter } from '@tests/helpers/render';
import { navigationMock } from '@tests/helpers/navigation-mock';

vi.mock('@/domains/session/lifecycle/session.sync', () => ({
  broadcastSessionSignal: vi.fn(),
  subscribeSessionSignals: vi.fn(() => vi.fn()),
}));

const user = (id: string) => ({
  id,
  name: id,
  email: `${id}@example.com`,
  roles: [],
  permissions: [],
});

const toastTitles = () => useToastStore.getState().toasts.map((toast) => toast.title);

describe('StoreHydration', () => {
  it('nạp state đã lưu vào các store persist và báo "đã nạp"', async () => {
    vi.resetModules();
    const { default: FreshHydration } = await import('@/app/_providers/sync/StoreHydration');
    const { arePersistedStoresHydrated } = await import('@/shared/utils/browser/storage.utils');
    const { useThemeStore } = await import('@/domains/preferences');
    localStorage.setItem(
      'next-base:theme',
      JSON.stringify({ state: { theme: 'dark', accent: 'blue' }, version: 1 }),
    );

    expect(arePersistedStoresHydrated()).toBe(false);
    expect(useThemeStore.getState().theme).toBe('light');

    render(<FreshHydration />);

    expect(arePersistedStoresHydrated()).toBe(true);
    expect(useThemeStore.getState()).toMatchObject({ theme: 'dark', accent: 'blue' });
    localStorage.clear();
  });

  it('không vẽ gì ra DOM', () => {
    const { container } = render(<StoreHydration />);

    expect(container).toBeEmptyDOMElement();
  });
});

describe('LocaleSync', () => {
  afterEach(() => {
    configureErrorMessages(viMessages.errors.http);
    configureZodLocale('vi', viMessages.validation);
  });

  const mount = (locale: 'vi' | 'en') => (
    <IntlWrapper locale={locale}>
      <LocaleSync />
    </IntlWrapper>
  );

  const requiredMessage = () => {
    const result = z.string().min(1).safeParse('');
    return result.success ? undefined : result.error.issues[0]?.message;
  };

  it('cấu hình câu lỗi HTTP theo ngôn ngữ đang hiển thị, đổi ngôn ngữ thì đổi theo', () => {
    const { rerender } = render(mount('en'));

    expect(errorMessages().timeout).toBe(enMessages.errors.http.timeout);
    expect(errorMessages().timeout).not.toBe(viMessages.errors.http.timeout);

    rerender(mount('vi'));

    expect(errorMessages().timeout).toBe(viMessages.errors.http.timeout);
  });

  it('cấu hình locale Zod toàn cục: câu validator đổi theo ngôn ngữ', () => {
    const { rerender } = render(mount('en'));

    expect(validationMessages()).toEqual(enMessages.validation);
    expect(requiredMessage()).toBe(enMessages.validation.required);
    expect(z.string().email().safeParse('khong-phai-email').error?.issues[0]?.message).not.toBe(
      z.string().min(1).safeParse('').error?.issues[0]?.message,
    );

    rerender(mount('vi'));

    expect(validationMessages()).toEqual(viMessages.validation);
    expect(requiredMessage()).toBe(viMessages.validation.required);
    expect(requiredMessage()).not.toBe(enMessages.validation.required);
  });

  it('không vẽ gì ra DOM', () => {
    const { container } = render(mount('vi'));

    expect(container).toBeEmptyDOMElement();
  });
});

describe('bootstrapApp', () => {
  let dispose: (() => void) | undefined;
  let queryClient: QueryClient;
  let onSessionExpired: ReturnType<typeof vi.fn<() => void>>;

  function seedAccountState(): AbortSignal[] {
    const signals: AbortSignal[] = [];
    const handler = (_file: File, { signal }: { signal: AbortSignal }) =>
      new Promise<string>((_resolve, reject) => {
        signals.push(signal);
        signal.addEventListener('abort', () => reject(new Error('đã huỷ')));
      });
    queryClient.setQueryData(['private'], 'a');
    useUploadQueueStore
      .getState()
      .enqueue([new File(['x'], 'a.txt'), new File(['x'], 'b.txt')], handler);
    useServerTaskStore.getState().start({ label: 'Nhập vật tư', message: 'Đang chạy' });
    return signals;
  }

  const accountScopedState = () => ({
    cache: queryClient.getQueryData(['private']),
    uploads: useUploadQueueStore.getState().tasks.length,
    imports: useServerTaskStore.getState().tasks.length,
  });

  const clearAccountState = () => {
    queryClient.clear();
    useUploadQueueStore.getState().cancel();
    useServerTaskStore.getState().clear();
  };

  beforeEach(() => {
    useSessionStore.setState({ ...useSessionStore.getInitialState(), status: 'anonymous' }, true);
    queryClient = new QueryClient();
    onSessionExpired = vi.fn<() => void>();
    clearAccountState();
    vi.clearAllMocks();
  });

  afterEach(() => {
    dispose?.();
    dispose = undefined;
    clearAccountState();
  });

  const boot = () => bootstrapApp({ queryClient, onSessionExpired });

  it('gọi trùng không đăng ký thêm; dispose cho phép khởi tạo lại', () => {
    dispose = boot();
    expect(boot()).toBe(dispose);
    expect(subscribeSessionSignals).toHaveBeenCalledTimes(1);

    const stop = vi.mocked(subscribeSessionSignals).mock.results[0].value as () => void;
    dispose();
    expect(stop).toHaveBeenCalledTimes(1);

    const previousDispose = dispose;
    dispose = boot();
    previousDispose();
    expect(subscribeSessionSignals).toHaveBeenCalledTimes(2);
    expect(stop).toHaveBeenCalledTimes(1);
  });

  it('dispose của lần khởi tạo CŨ không phá lần khởi tạo mới', () => {
    const first = boot();
    first();
    dispose = boot();
    first();

    useSessionStore.setState({ user: user('a'), status: 'authenticated' });
    queryClient.setQueryData(['private'], 'a');
    clearSession('logout');

    expect(queryClient.getQueryData(['private'])).toBeUndefined();
  });

  it('dừng cả listener hết phiên lẫn listener đổi người sau dispose', () => {
    dispose = boot();
    useSessionStore.setState({ user: user('a'), status: 'authenticated' });
    dispose();
    dispose = undefined;
    queryClient.setQueryData(['private'], 'kept');

    establishSession({ accessToken: 't', user: user('b') });
    clearSession('logout');

    expect(queryClient.getQueryData(['private'])).toBe('kept');
  });

  it('khởi tạo lỗi dọn đăng ký trước đó và vẫn có thể thử lại', () => {
    vi.mocked(subscribeSessionSignals).mockImplementationOnce(() => {
      throw new Error('sync failed');
    });
    expect(() => boot()).toThrow('sync failed');

    useSessionStore.setState({ user: user('a'), status: 'authenticated' });
    queryClient.setQueryData(['private'], 'kept');
    clearSession('logout');
    expect(queryClient.getQueryData(['private'])).toBe('kept');

    dispose = boot();
    useSessionStore.setState({ user: user('a'), status: 'authenticated' });
    clearSession('logout');
    expect(queryClient.getQueryData(['private'])).toBeUndefined();
  });

  it.each(['logout', 'expired', 'remote'] as const)(
    'phiên kết thúc (%s) xoá cache, hàng đợi tải lên và thẻ tác vụ của người cũ',
    (reason) => {
      dispose = boot();
      useSessionStore.setState({ user: user('a'), status: 'authenticated' });
      const signals = seedAccountState();

      clearSession(reason);

      expect(accountScopedState()).toEqual({ cache: undefined, uploads: 0, imports: 0 });
      expect(signals[0].aborted).toBe(true);
    },
  );

  it('đổi tài khoản trực tiếp xoá dữ liệu của người cũ', () => {
    dispose = boot();
    useSessionStore.setState({ user: user('a'), status: 'authenticated' });
    const signals = seedAccountState();

    establishSession({ accessToken: 't', user: user('b') });

    expect(accountScopedState()).toEqual({ cache: undefined, uploads: 0, imports: 0 });
    expect(signals[0].aborted).toBe(true);
  });

  it('làm mới token của cùng một người dùng không reset gì', () => {
    dispose = boot();
    establishSession({ accessToken: 't1', user: user('a') });
    const signals = seedAccountState();

    establishSession({ accessToken: 't2', user: user('a') });

    expect(accountScopedState()).toEqual({ cache: 'a', uploads: 2, imports: 1 });
    expect(signals[0].aborted).toBe(false);
  });

  it('chỉ phiên HẾT HẠN mới gọi `onSessionExpired`; đăng xuất chủ động và đăng xuất từ tab khác thì không', () => {
    dispose = boot();

    useSessionStore.setState({ user: user('a'), status: 'authenticated' });
    clearSession('logout');
    useSessionStore.setState({ user: user('a'), status: 'authenticated' });
    clearSession('remote');
    expect(onSessionExpired).not.toHaveBeenCalled();

    useSessionStore.setState({ user: user('a'), status: 'authenticated' });
    clearSession('expired');
    expect(onSessionExpired).toHaveBeenCalledTimes(1);
  });

  it('sau dispose, hết phiên và đổi người không còn đụng tới dữ liệu', () => {
    dispose = boot();
    useSessionStore.setState({ user: user('a'), status: 'authenticated' });
    const signals = seedAccountState();
    dispose();
    dispose = undefined;

    establishSession({ accessToken: 't', user: user('b') });
    clearSession('logout');

    expect(accountScopedState()).toEqual({ cache: 'a', uploads: 2, imports: 1 });
    expect(signals[0].aborted).toBe(false);
  });
});

describe('SessionBootstrap', () => {
  beforeEach(() => {
    useSessionStore.setState({ ...useSessionStore.getInitialState(), status: 'anonymous' }, true);
    useToastStore.setState({ toasts: [] });
    vi.clearAllMocks();
  });

  it('phiên hết hạn → toast cảnh báo đã dịch theo ngôn ngữ đang hiển thị', () => {
    const { unmount } = render(
      <IntlWrapper locale="en">
        <SessionBootstrap />
      </IntlWrapper>,
    );
    useSessionStore.setState({ user: user('a'), status: 'authenticated' });

    act(() => clearSession('expired'));

    expect(toastTitles()).toEqual([enMessages.common.sessionExpired]);
    unmount();
  });

  it('đăng xuất chủ động → không toast', () => {
    const { unmount } = render(
      <IntlWrapper>
        <SessionBootstrap />
      </IntlWrapper>,
    );
    useSessionStore.setState({ user: user('a'), status: 'authenticated' });

    act(() => clearSession('logout'));

    expect(toastTitles()).toEqual([]);
    unmount();
  });

  it('gỡ component thì dừng đồng bộ phiên (dispose)', () => {
    const { unmount } = render(
      <IntlWrapper>
        <SessionBootstrap />
      </IntlWrapper>,
    );
    expect(subscribeSessionSignals).toHaveBeenCalledTimes(1);
    const stop = vi.mocked(subscribeSessionSignals).mock.results[0].value as () => void;

    unmount();

    expect(stop).toHaveBeenCalledTimes(1);
  });
});

describe('getQueryClient', () => {
  it('ở trình duyệt luôn trả MỘT client để cache sống qua mọi lần render', () => {
    expect(getQueryClient()).toBe(getQueryClient());
  });
});

describe('DisplayUrlSync', () => {
  beforeEach(() => {
    localStorage.clear();
    useDisplayStore.setState({ mode: 'standard', uiScale: 1.1 });
    window.history.replaceState({}, '', '/');
  });

  const display = () => {
    const { mode, uiScale } = useDisplayStore.getState();
    return { mode, uiScale };
  };

  it('URL có `display` / `scale` hợp lệ → URL thắng lựa chọn đã lưu, không viết lại URL', async () => {
    renderInRouter(<DisplayUrlSync />, {
      pathname: '/dashboard',
      search: '?q=thep&display=tv&scale=1.3',
    });

    await waitFor(() => expect(display()).toEqual({ mode: 'tv', uiScale: 1.3 }));
    expect(navigationMock.replace).not.toHaveBeenCalled();
  });

  it('URL không mang param → giữ lựa chọn đã lưu và viết lên URL (bằng `replace`, giữ param nghiệp vụ)', async () => {
    useDisplayStore.setState({ mode: 'tv', uiScale: 1.2 });

    renderInRouter(<DisplayUrlSync />, { pathname: '/dashboard', search: '?q=thep' });

    await waitFor(() =>
      expect(navigationMock.replace).toHaveBeenCalledWith(
        '/dashboard?q=thep&display=tv&scale=1.2',
        {
          scroll: false,
        },
      ),
    );
    expect(display()).toEqual({ mode: 'tv', uiScale: 1.2 });
  });

  it('chế độ thường là mặc định → không ghi gì lên URL', async () => {
    renderInRouter(<DisplayUrlSync />, { pathname: '/dashboard', search: '?tab=1' });

    await waitFor(() => expect(display().mode).toBe('standard'));
    expect(navigationMock.replace).not.toHaveBeenCalled();
  });

  it('param rác (`?display=abc&scale=99`) coi như không có → giữ lựa chọn hợp lệ đã lưu', async () => {
    useDisplayStore.setState({ mode: 'tv', uiScale: 1.3 });

    renderInRouter(<DisplayUrlSync />, { pathname: '/dashboard', search: '?display=abc&scale=99' });

    await waitFor(() => expect(navigationMock.replace).toHaveBeenCalled());
    expect(display()).toEqual({ mode: 'tv', uiScale: 1.3 });
  });

  it('người dùng đổi chế độ → URL đổi theo, giữ hash', async () => {
    window.history.replaceState({}, '', '/dashboard?q=thep#muc-3');
    renderInRouter(<DisplayUrlSync />, { pathname: '/dashboard', search: '?q=thep' });
    await waitFor(() => expect(display().mode).toBe('standard'));

    act(() => useDisplayStore.getState().setMode('tv'));

    await waitFor(() =>
      expect(navigationMock.replace).toHaveBeenCalledWith(
        '/dashboard?q=thep&display=tv&scale=1.1#muc-3',
        { scroll: false },
      ),
    );
  });
});
