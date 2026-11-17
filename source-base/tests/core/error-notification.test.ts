/**
 * Lỗi → thông báo cho người dùng: MỘT chỗ quyết (`claimErrorMessage`), dùng chung bởi bộ báo lỗi
 * tập trung (`createQueryClient`) và `showErrorToast`.
 *
 * Ba lỗi cũ bài này khoá lại:
 *   1. Công thức "câu riêng trong `onError`" mà docs dạy KHÔNG BAO GIỜ chạy: `MutationCache.onError`
 *      chạy trước và đã đánh dấu lỗi là đã báo. Câu riêng chỉ chạy khi khai `silentError`.
 *   2. 401 khi refresh hỏng + mutation có `showErrorToast` → toast đôi (cạnh toast "phiên hết hạn").
 *   3. Lỗi không phải `AppError` từng lộ nguyên `Error.message` (tiếng Anh kỹ thuật) ra toast.
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { AppError, apiClient, claimErrorMessage, configureHttp } from '@/core/http';
import { createQueryClient } from '@/core/query';
import { showErrorToast, showToast } from '@/shared/ui/overlays/toast/toast.api';
import { useToastStore } from '@/shared/ui/overlays/toast/toast.store';

import { mockHttp } from '@tests/helpers/http-mock';

const toastTitles = () => useToastStore.getState().toasts.map((toast) => toast.title);

/** QueryClient giống của app: báo tập trung bằng toast lỗi. */
const appLikeClient = () =>
  createQueryClient({ notifyUser: (message) => showToast('error', message) });

function runMutation(
  client: ReturnType<typeof createQueryClient>,
  options: {
    mutationFn: () => Promise<unknown>;
    meta?: { silentError?: boolean };
    onError?: (error: unknown) => void;
  },
) {
  return client
    .getMutationCache()
    .build(client, options)
    .execute(undefined)
    .catch(() => undefined);
}

beforeEach(() => useToastStore.setState({ toasts: [] }));

describe('câu riêng cho một mutation', () => {
  it('`silentError` + `onError: showErrorToast(e, { message })` → hiện ĐÚNG câu truyền vào', async () => {
    await runMutation(appLikeClient(), {
      mutationFn: () => Promise.reject(new AppError('business', 'Kế hoạch đang được dùng')),
      meta: { silentError: true },
      onError: (error) => showErrorToast(error, { message: 'Không xoá được kế hoạch' }),
    });

    expect(toastTitles()).toEqual(['Không xoá được kế hoạch']);
  });

  it('thiếu `silentError` → bộ báo tập trung báo trước, câu riêng KHÔNG chạy — vẫn chỉ một toast', async () => {
    await runMutation(appLikeClient(), {
      mutationFn: () => Promise.reject(new AppError('business', 'Mã kế hoạch đã có')),
      onError: (error) => showErrorToast(error, { message: 'Câu riêng không bao giờ hiện' }),
    });

    expect(toastTitles()).toEqual(['Mã kế hoạch đã có']);
  });
});

describe('401 khi làm mới phiên thất bại', () => {
  let restore: () => void = () => {};

  afterEach(() => {
    restore();
    configureHttp({});
  });

  it('⛔ không toast nào từ lỗi — thông báo "phiên hết hạn" là việc của `onSessionEnd`', async () => {
    configureHttp({
      auth: { getAccessToken: () => 'token-cu', refreshAccessToken: async () => null },
    });
    restore = mockHttp(() => ({ status: 401, data: {} }));

    await runMutation(appLikeClient(), {
      mutationFn: () => apiClient.post('/ke-hoach/1/xoa'),
      onError: (error) => showErrorToast(error),
    });

    expect(toastTitles()).toEqual([]);
  });
});

describe('showErrorToast ngoài React Query', () => {
  it('chỉ câu của `AppError` lên giao diện; lỗi khác hiện câu dự phòng', () => {
    showErrorToast(new AppError('business', 'Email đã được sử dụng'));
    showErrorToast(new TypeError("Cannot read properties of undefined (reading 'id')"));
    showErrorToast(new Error('boom'), { fallback: 'Không lưu được. Thử lại sau.' });

    expect(toastTitles()).toEqual([
      'Email đã được sử dụng',
      'Đã xảy ra lỗi',
      'Không lưu được. Thử lại sau.',
    ]);
  });

  it('request bị huỷ không báo; cùng một lỗi gọi hai lần chỉ hiện một lần', () => {
    const error = new AppError('server', 'Máy chủ đang bảo trì');

    expect(showErrorToast(new DOMException('Aborted', 'AbortError'))).toBeUndefined();
    showErrorToast(error);
    expect(showErrorToast(error)).toBeUndefined();

    expect(toastTitles()).toEqual(['Máy chủ đang bảo trì']);
  });
});

describe('claimErrorMessage', () => {
  it('trả câu một lần rồi đánh dấu đã báo', () => {
    const error = new AppError('validation', 'Tên không được trống');
    expect(claimErrorMessage(error)).toBe('Tên không được trống');
    expect(error.notified).toBe(true);
    expect(claimErrorMessage(error, { message: 'Câu khác' })).toBeNull();
  });
});
