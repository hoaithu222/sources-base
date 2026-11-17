import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { UploadHandler } from '@/shared/ui';
import { createDeferred, type Deferred } from '@tests/helpers/deferred';

type QueueStore =
  (typeof import('@/shared/widgets/progress-center/upload-queue/upload-queue.store'))['useUploadQueueStore'];
type ServerTaskStore =
  (typeof import('@/shared/widgets/progress-center/server-tasks/server-task.store'))['useServerTaskStore'];

interface HandlerCall {
  file: File;
  signal: AbortSignal;
  onProgress: (percent: number) => void;
  result: Deferred<string>;
}

let queue: QueueStore;
let serverTasks: ServerTaskStore;

beforeEach(async () => {
  vi.resetModules();
  ({ useUploadQueueStore: queue } =
    await import('@/shared/widgets/progress-center/upload-queue/upload-queue.store'));
  ({ useServerTaskStore: serverTasks } =
    await import('@/shared/widgets/progress-center/server-tasks/server-task.store'));
});

async function loadResetProgressCenter(): Promise<() => void> {
  const { resetProgressCenter } =
    await import('@/shared/widgets/progress-center/progress-center.lifecycle');
  return resetProgressCenter;
}

const file = (name: string) => new File(['x'], name, { type: 'text/plain' });
const names = (calls: HandlerCall[]) => calls.map((call) => call.file.name);
const snapshot = () =>
  queue.getState().tasks.map(({ name, status, progress, url, error }) => ({
    name,
    status,
    progress,
    url,
    error,
  }));
const summary = () => snapshot().map(({ name, status, url }) => [name, status, url]);

async function flush(): Promise<void> {
  for (let i = 0; i < 20; i += 1) await Promise.resolve();
}

function controlledHandler() {
  const calls: HandlerCall[] = [];
  const handler: UploadHandler = (target, { onProgress, signal }) => {
    const result = createDeferred<string>();
    calls.push({ file: target, signal, onProgress, result });
    return result.promise;
  };
  return { handler, calls };
}

const enqueue = (fileNames: string[], handler: UploadHandler) =>
  queue.getState().enqueue(fileNames.map(file), handler);

describe('hàng đợi tải lên — mỗi task chạy bằng handler của lần enqueue tạo ra nó', () => {
  it('tệp xếp hàng của lô A vẫn dùng handler A dù lô B được enqueue khi A1 đang chạy', async () => {
    const a = controlledHandler();
    const b = controlledHandler();

    enqueue(['A1', 'A2'], a.handler);
    await flush();
    enqueue(['B1'], b.handler);
    a.calls[0].result.resolve('url-a1');
    await flush();

    expect(names(a.calls)).toEqual(['A1', 'A2']);
    expect(names(b.calls)).toEqual([]);

    a.calls[1].result.resolve('url-a2');
    await flush();
    expect(names(b.calls)).toEqual(['B1']);

    b.calls[0].result.resolve('url-b1');
    await flush();
    expect(summary()).toEqual([
      ['A1', 'success', 'url-a1'],
      ['A2', 'success', 'url-a2'],
      ['B1', 'success', 'url-b1'],
    ]);
  });

  it('retryFailed chạy lại từng task lỗi bằng đúng handler gốc của nó', async () => {
    const a = controlledHandler();
    const b = controlledHandler();

    enqueue(['A1'], a.handler);
    enqueue(['B1'], b.handler);
    a.calls[0].result.reject(new Error('lỗi A1'));
    await flush();
    b.calls[0].result.reject(new Error('lỗi B1'));
    await flush();
    expect(snapshot().map((task) => task.status)).toEqual(['error', 'error']);

    queue.getState().retryFailed();
    await flush();
    expect(names(a.calls)).toEqual(['A1', 'A1']);
    expect(names(b.calls)).toEqual(['B1']);

    a.calls[1].result.resolve('url-a1');
    await flush();
    expect(names(b.calls)).toEqual(['B1', 'B1']);

    b.calls[1].result.resolve('url-b1');
    await flush();
    expect(summary()).toEqual([
      ['A1', 'success', 'url-a1'],
      ['B1', 'success', 'url-b1'],
    ]);
  });

  it('retryFailed xoá lỗi cũ và đặt lại tiến độ của task được chạy lại', async () => {
    const a = controlledHandler();
    enqueue(['A1'], a.handler);
    a.calls[0].onProgress(60);
    a.calls[0].result.reject(new Error('mạng đứt'));
    await flush();
    expect(snapshot()[0]).toMatchObject({ status: 'error', error: 'mạng đứt' });

    queue.getState().retryFailed();
    await flush();
    expect(snapshot()[0]).toMatchObject({ status: 'uploading', progress: 0, error: undefined });
  });
});

describe('hàng đợi tải lên — cancel / clear / reset', () => {
  it('cancel làm signal của handler đang chạy bị abort và xoá sạch hàng đợi', async () => {
    const a = controlledHandler();
    enqueue(['A1', 'A2'], a.handler);
    await flush();
    expect(a.calls[0].signal.aborted).toBe(false);

    queue.getState().cancel();

    expect(a.calls[0].signal.aborted).toBe(true);
    expect(queue.getState().tasks).toEqual([]);
  });

  it('cancel với handler lờ signal và không bao giờ settle không chặn lô enqueue ngay sau đó', async () => {
    const stuck = controlledHandler();
    const next = controlledHandler();

    enqueue(['S1', 'S2'], stuck.handler);
    await flush();
    queue.getState().cancel();

    enqueue(['N1', 'N2'], next.handler);
    await flush();
    expect(names(next.calls)).toEqual(['N1']);

    next.calls[0].result.resolve('url-n1');
    await flush();
    next.calls[1].result.resolve('url-n2');
    await flush();

    expect(summary()).toEqual([
      ['N1', 'success', 'url-n1'],
      ['N2', 'success', 'url-n2'],
    ]);
    expect(names(stuck.calls)).toEqual(['S1']);
  });

  it('promise cũ settle muộn (resolve) không đổi task mới và không chạy tiếp S2', async () => {
    const stuck = controlledHandler();
    const next = controlledHandler();

    enqueue(['S1', 'S2'], stuck.handler);
    await flush();
    queue.getState().cancel();
    enqueue(['N1', 'N2'], next.handler);
    await flush();
    next.calls[0].onProgress(30);
    const before = snapshot();

    stuck.calls[0].onProgress(90);
    stuck.calls[0].result.resolve('url-muộn');
    await flush();

    expect(snapshot()).toEqual(before);
    expect(names(stuck.calls)).toEqual(['S1']);
    expect(names(next.calls)).toEqual(['N1']);
  });

  it('promise cũ settle muộn (reject) không đổi task mới', async () => {
    const stuck = controlledHandler();
    const next = controlledHandler();

    enqueue(['S1'], stuck.handler);
    await flush();
    queue.getState().cancel();
    enqueue(['N1'], next.handler);
    await flush();
    const before = snapshot();

    stuck.calls[0].result.reject(new Error('lỗi muộn'));
    await flush();

    expect(snapshot()).toEqual(before);
    expect(snapshot()[0].status).toBe('uploading');
  });

  it('cancel khi không có gì chạy vẫn cho enqueue lô mới chạy bình thường', async () => {
    const a = controlledHandler();
    queue.getState().cancel();

    enqueue(['A1'], a.handler);
    await flush();
    a.calls[0].result.resolve('url-a1');
    await flush();

    expect(summary()).toEqual([['A1', 'success', 'url-a1']]);
  });

  it('clear xoá danh sách nhưng KHÔNG abort upload đang chạy; kết quả muộn không hồi sinh task', async () => {
    const a = controlledHandler();
    enqueue(['A1'], a.handler);
    await flush();

    queue.getState().clear();
    expect(queue.getState().tasks).toEqual([]);
    expect(a.calls[0].signal.aborted).toBe(false);

    a.calls[0].onProgress(50);
    a.calls[0].result.resolve('url-a1');
    await flush();
    expect(queue.getState().tasks).toEqual([]);
  });

  it('sau clear, lô mới chờ upload đang chạy xong rồi mới chạy bằng handler của nó', async () => {
    const a = controlledHandler();
    const b = controlledHandler();
    enqueue(['A1'], a.handler);
    await flush();
    queue.getState().clear();

    enqueue(['B1'], b.handler);
    await flush();
    expect(names(b.calls)).toEqual([]);

    a.calls[0].result.resolve('url-a1');
    await flush();
    expect(names(b.calls)).toEqual(['B1']);
  });

  it('resetProgressCenter xoá cả hàng đợi tải lên lẫn thẻ tác vụ máy chủ và abort upload đang chạy', async () => {
    const a = controlledHandler();
    enqueue(['A1', 'A2'], a.handler);
    await flush();
    serverTasks.getState().start({ label: 'Nhập vật tư', message: 'Đang đọc…' });
    const resetProgressCenter = await loadResetProgressCenter();

    resetProgressCenter();

    expect(a.calls[0].signal.aborted).toBe(true);
    expect(queue.getState().tasks).toEqual([]);
    expect(serverTasks.getState().tasks).toEqual([]);
  });

  it('resetProgressCenter: luồng nhập phía máy chủ bơm tiến độ muộn không dựng lại thẻ', async () => {
    const id = serverTasks.getState().start({ label: 'Nhập', message: 'Đang đọc…' });
    const resetProgressCenter = await loadResetProgressCenter();

    resetProgressCenter();
    serverTasks.getState().update(id, { progress: 50 });
    serverTasks.getState().finishSuccess(id, 'Xong');

    expect(serverTasks.getState().tasks).toEqual([]);
  });

  it('resetProgressCenter không chặn lô enqueue ngay sau đó dù handler cũ không bao giờ settle', async () => {
    const stuck = controlledHandler();
    const next = controlledHandler();
    enqueue(['S1'], stuck.handler);
    await flush();
    const resetProgressCenter = await loadResetProgressCenter();

    resetProgressCenter();
    enqueue(['N1'], next.handler);
    await flush();

    expect(names(next.calls)).toEqual(['N1']);
  });
});

describe('hàng đợi tải lên — tiến độ và lỗi', () => {
  it('tiến độ gọi muộn của task đã xong không ghi đè trạng thái', async () => {
    const a = controlledHandler();
    enqueue(['A1'], a.handler);
    await flush();
    a.calls[0].result.resolve('url-a1');
    await flush();

    a.calls[0].onProgress(40);

    expect(snapshot()[0]).toMatchObject({ status: 'success', progress: 100, url: 'url-a1' });
  });

  it('tiến độ gọi muộn của lần chạy lỗi cũ không ghi đè lần thử lại', async () => {
    const a = controlledHandler();
    enqueue(['A1'], a.handler);
    await flush();
    a.calls[0].result.reject(new Error('đứt'));
    await flush();
    queue.getState().retryFailed();
    await flush();
    a.calls[1].onProgress(30);

    a.calls[0].onProgress(95);

    expect(snapshot()[0]).toMatchObject({ status: 'uploading', progress: 30 });
  });

  it('tiến độ của task đang chạy được làm tròn và cập nhật', async () => {
    const a = controlledHandler();
    enqueue(['A1'], a.handler);
    await flush();

    a.calls[0].onProgress(41.6);

    expect(snapshot()[0]).toMatchObject({ status: 'uploading', progress: 42 });
  });

  it('uploader ném đồng bộ → task báo lỗi và hàng đợi chạy tiếp tệp sau', async () => {
    const handler: UploadHandler = (target) => {
      if (target.name === 'hong.txt') throw new Error('nổ đồng bộ');
      return Promise.resolve(`url-${target.name}`);
    };

    enqueue(['hong.txt', 'on.txt'], handler);
    await flush();

    expect(snapshot().map(({ name, status, url, error }) => [name, status, url, error])).toEqual([
      ['hong.txt', 'error', undefined, 'nổ đồng bộ'],
      ['on.txt', 'success', 'url-on.txt', undefined],
    ]);
  });

  it('uploader ném giá trị không phải Error → task lỗi KHÔNG có `error` (thẻ tự hiện câu mặc định theo ngôn ngữ)', async () => {
    const handler: UploadHandler = () => Promise.reject('chuỗi trần');

    enqueue(['A1'], handler);
    await flush();

    expect(snapshot()[0]).toMatchObject({ status: 'error', error: undefined });
  });

  it('task pending không có handler (state bị ghi từ ngoài) báo lỗi thay vì kẹt hàng đợi', async () => {
    const ok = controlledHandler();
    queue.setState({
      tasks: [
        {
          id: 'ngoai-store',
          file: file('mo-coi.txt'),
          name: 'mo-coi.txt',
          size: 1,
          type: 'text/plain',
          status: 'pending',
          progress: 0,
        },
      ],
    });

    enqueue(['A1'], ok.handler);
    await flush();

    expect(snapshot().map(({ name, status }) => [name, status])).toEqual([
      ['mo-coi.txt', 'error'],
      ['A1', 'uploading'],
    ]);
  });
});
