/**
 * Bộ báo lỗi tập trung của React Query.
 *
 * Lý do nó tồn tại: báo lỗi ở interceptor HTTP là báo theo TỪNG LƯỢT gọi mạng,
 * nên query có `retry` hiện toast trước khi thử lại xong. Ở đây chỉ báo MỘT
 * lần, sau khi đã thử lại hết.
 */

import { describe, expect, it, vi } from 'vitest';

import { AppError } from '@/core/http';
import { createQueryClient } from '@/core/query';

const NO_DELAY = { retryDelay: 0 } as const;

describe('query', () => {
  it('⛔ lỗi hạ tầng: thử lại rồi mới báo — đúng MỘT lần', async () => {
    const notifyUser = vi.fn();
    const client = createQueryClient({ notifyUser });
    const queryFn = vi
      .fn()
      .mockRejectedValue(new AppError('server', 'Lỗi máy chủ', { status: 500 }));

    await client.fetchQuery({ queryKey: ['a'], queryFn, ...NO_DELAY }).catch(() => undefined);

    expect(queryFn).toHaveBeenCalledTimes(2);
    expect(notifyUser).toHaveBeenCalledExactlyOnceWith('Lỗi máy chủ');
  });

  it('thử lại thành công → KHÔNG báo gì', async () => {
    const notifyUser = vi.fn();
    const client = createQueryClient({ notifyUser });
    const queryFn = vi
      .fn()
      .mockRejectedValueOnce(new AppError('network', 'Mất mạng'))
      .mockResolvedValue('ok');

    await expect(client.fetchQuery({ queryKey: ['b'], queryFn, ...NO_DELAY })).resolves.toBe('ok');
    expect(notifyUser).not.toHaveBeenCalled();
  });

  it('4xx không thử lại — thử bao nhiêu lần cũng ra đúng câu trả lời đó', async () => {
    const client = createQueryClient();
    const queryFn = vi.fn().mockRejectedValue(new AppError('forbidden', 'x', { status: 403 }));

    await client.fetchQuery({ queryKey: ['c'], queryFn, ...NO_DELAY }).catch(() => undefined);
    expect(queryFn).toHaveBeenCalledTimes(1);
  });

  it('`meta.silentError` → màn hình tự lo, không báo', async () => {
    const notifyUser = vi.fn();
    const client = createQueryClient({ notifyUser });

    await client
      .fetchQuery({
        queryKey: ['d'],
        queryFn: () => Promise.reject(new AppError('not_found', 'x', { status: 404 })),
        meta: { silentError: true },
      })
      .catch(() => undefined);

    expect(notifyUser).not.toHaveBeenCalled();
  });
});

describe('mutation', () => {
  const run = (
    client: ReturnType<typeof createQueryClient>,
    error: unknown,
    meta?: { silentError?: boolean },
  ) =>
    client
      .getMutationCache()
      .build(client, { mutationFn: () => Promise.reject(error), meta })
      .execute(undefined)
      .catch(() => undefined);

  it('báo câu của lỗi tầng HTTP và đánh dấu lỗi đã báo', async () => {
    const notifyUser = vi.fn();
    const client = createQueryClient({ notifyUser });
    const error = new AppError('business', 'Mã đã tồn tại');

    await run(client, error);
    expect(notifyUser).toHaveBeenCalledExactlyOnceWith('Mã đã tồn tại');
    expect(error.notified).toBe(true);
  });

  it('lỗi do màn hình tự ném (không phải `AppError`) KHÔNG bị đưa ra toast', async () => {
    const notifyUser = vi.fn();
    await run(createQueryClient({ notifyUser }), new Error('duplicate_code'));
    expect(notifyUser).not.toHaveBeenCalled();
  });

  it('request bị huỷ, 401 và lỗi đã báo rồi → bỏ qua', async () => {
    const notifyUser = vi.fn();
    const client = createQueryClient({ notifyUser });
    const notified = new AppError('business', 'x');
    notified.notified = true;

    await run(client, new AppError('canceled', 'x'));
    await run(client, new AppError('unauthorized', 'x', { status: 401 }));
    await run(client, notified);
    expect(notifyUser).not.toHaveBeenCalled();
  });

  it('`meta.silentError` → form tự vẽ lỗi, không báo', async () => {
    const notifyUser = vi.fn();
    await run(createQueryClient({ notifyUser }), new AppError('business', 'x'), {
      silentError: true,
    });
    expect(notifyUser).not.toHaveBeenCalled();
  });

  it('`enabled: false` → tắt báo tập trung, lỗi KHÔNG bị đánh dấu đã báo', async () => {
    const notifyUser = vi.fn();
    const error = new AppError('business', 'x');
    await run(createQueryClient({ notifyUser, enabled: false }), error);
    expect(notifyUser).not.toHaveBeenCalled();
    expect(error.notified).toBe(false);
  });
});
