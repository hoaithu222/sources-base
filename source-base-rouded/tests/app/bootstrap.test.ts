import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { bootstrapApp } from '@/app/bootstrap';
import { queryClient } from '@/app/providers';
import { establishSession, useSessionStore } from '@/domains/session';
import { clearSession } from '@/domains/session/lifecycle/session.lifecycle';
import { subscribeSessionSignals } from '@/domains/session/lifecycle/session.sync';
import type { UploadHandler } from '@/shared/ui';
import { showToast } from '@/shared/ui';
import { useServerTaskStore } from '@/shared/widgets/progress-center/server-tasks';
import { useUploadQueueStore } from '@/shared/widgets/progress-center/upload-queue';

vi.mock('@/domains/session/lifecycle/session.sync', () => ({
  broadcastSessionSignal: vi.fn(),
  subscribeSessionSignals: vi.fn(() => vi.fn()),
}));

vi.mock('@/shared/ui/overlays/toast/toast.api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/shared/ui/overlays/toast/toast.api')>()),
  showToast: vi.fn(),
}));

let dispose: (() => void) | undefined;
const user = (id: string) => ({
  id,
  name: id,
  email: `${id}@example.com`,
  roles: [],
  permissions: [],
});

function seedAccountState(): AbortSignal[] {
  const signals: AbortSignal[] = [];
  const handler: UploadHandler = (_file, { signal }) =>
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

describe('vòng đời bootstrap app', () => {
  beforeEach(() => {
    useSessionStore.setState({ ...useSessionStore.getInitialState(), status: 'anonymous' }, true);
    queryClient.clear();
    useUploadQueueStore.getState().cancel();
    useServerTaskStore.getState().clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    dispose?.();
    dispose = undefined;
    queryClient.clear();
    useUploadQueueStore.getState().cancel();
    useServerTaskStore.getState().clear();
    vi.restoreAllMocks();
  });

  it('gọi trùng không đăng ký thêm; dispose cho phép khởi tạo lại', () => {
    dispose = bootstrapApp();
    expect(bootstrapApp()).toBe(dispose);
    expect(subscribeSessionSignals).toHaveBeenCalledTimes(1);
    const stop = vi.mocked(subscribeSessionSignals).mock.results[0].value as () => void;
    dispose();
    expect(stop).toHaveBeenCalledTimes(1);
    const previousDispose = dispose;
    dispose = bootstrapApp();
    previousDispose();
    expect(subscribeSessionSignals).toHaveBeenCalledTimes(2);
    useSessionStore.setState({ user: user('a'), status: 'authenticated' });
    queryClient.setQueryData(['private'], 'a');
    clearSession('logout');
    expect(queryClient.getQueryData(['private'])).toBeUndefined();
  });

  it('xoá dữ liệu người cũ khi đổi tài khoản trực tiếp', () => {
    dispose = bootstrapApp();
    useSessionStore.setState({ user: user('a'), status: 'authenticated' });
    queryClient.setQueryData(['private'], 'a');
    establishSession({ accessToken: 't', user: user('b') });
    expect(queryClient.getQueryData(['private'])).toBeUndefined();
  });

  it('dispose dừng cả listener hết phiên và listener đổi người', () => {
    dispose = bootstrapApp();
    useSessionStore.setState({ user: user('a'), status: 'authenticated' });
    dispose();
    queryClient.setQueryData(['private'], 'kept');
    establishSession({ accessToken: 't', user: user('b') });
    clearSession('logout');
    expect(queryClient.getQueryData(['private'])).toBe('kept');
  });

  it('khởi tạo lỗi dọn đăng ký trước đó và vẫn có thể thử lại', () => {
    vi.mocked(subscribeSessionSignals).mockImplementationOnce(() => {
      throw new Error('sync failed');
    });
    expect(() => bootstrapApp()).toThrow('sync failed');
    useSessionStore.setState({ user: user('a'), status: 'authenticated' });
    queryClient.setQueryData(['private'], 'kept');
    clearSession('logout');
    expect(queryClient.getQueryData(['private'])).toBe('kept');
    dispose = bootstrapApp();
    useSessionStore.setState({ user: user('a'), status: 'authenticated' });
    clearSession('logout');
    expect(queryClient.getQueryData(['private'])).toBeUndefined();
  });

  it.each(['logout', 'expired', 'remote'] as const)(
    'phiên kết thúc (%s) xoá cache, hàng đợi tải lên và thẻ tác vụ của người cũ',
    (reason) => {
      dispose = bootstrapApp();
      useSessionStore.setState({ user: user('a'), status: 'authenticated' });
      const signals = seedAccountState();

      clearSession(reason);

      expect(accountScopedState()).toEqual({ cache: undefined, uploads: 0, imports: 0 });
      expect(signals[0].aborted).toBe(true);
    },
  );

  it('đổi tài khoản trực tiếp xoá cache, hàng đợi tải lên và thẻ tác vụ của người cũ', () => {
    dispose = bootstrapApp();
    useSessionStore.setState({ user: user('a'), status: 'authenticated' });
    const signals = seedAccountState();

    establishSession({ accessToken: 't', user: user('b') });

    expect(accountScopedState()).toEqual({ cache: undefined, uploads: 0, imports: 0 });
    expect(signals[0].aborted).toBe(true);
  });

  it('làm mới token của cùng một người dùng không reset gì', () => {
    dispose = bootstrapApp();
    establishSession({ accessToken: 't1', user: user('a') });
    const signals = seedAccountState();

    establishSession({ accessToken: 't2', user: user('a') });

    expect(accountScopedState()).toEqual({ cache: 'a', uploads: 2, imports: 1 });
    expect(signals[0].aborted).toBe(false);
  });

  it('người dùng đăng nhập sau không thấy và không chạy tiếp hàng đợi của người trước', () => {
    dispose = bootstrapApp();
    useSessionStore.setState({ user: user('a'), status: 'authenticated' });
    seedAccountState();

    clearSession('logout');
    useSessionStore.setState({ user: user('b'), status: 'authenticated' });

    expect(accountScopedState()).toEqual({ cache: undefined, uploads: 0, imports: 0 });
  });

  it('phiên hết hạn vẫn báo toast cảnh báo, đăng xuất chủ động thì không', () => {
    dispose = bootstrapApp();
    useSessionStore.setState({ user: user('a'), status: 'authenticated' });
    clearSession('logout');
    expect(showToast).not.toHaveBeenCalled();

    useSessionStore.setState({ user: user('a'), status: 'authenticated' });
    clearSession('expired');
    expect(showToast).toHaveBeenCalledExactlyOnceWith(
      'warning',
      'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
    );
  });

  it('sau dispose, hết phiên và đổi người không còn đụng tới hàng đợi tải lên', () => {
    dispose = bootstrapApp();
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
