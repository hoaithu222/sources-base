import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useUpload, type UseUploadOptions } from '@/shared/ui/media/upload/hooks/useUpload';
import type { UploadFile, UploadHandler } from '@/shared/ui/media/upload/upload.types';
import { createDeferred, type Deferred } from '@tests/helpers/deferred';

interface HandlerCall {
  file: File;
  signal: AbortSignal;
  onProgress: (percent: number) => void;
  result: Deferred<string>;
}

const file = (name: string, type = 'text/plain') => new File(['x'], name, { type });
const names = (list: { name: string }[]) => list.map((entry) => entry.name);

function controlledHandler(options: { cooperative?: boolean } = {}) {
  const calls: HandlerCall[] = [];
  const handler: UploadHandler = (target, { onProgress, signal }) => {
    const result = createDeferred<string>();
    calls.push({ file: target, signal, onProgress, result });
    if (options.cooperative) {
      signal.addEventListener('abort', () => result.reject(new Error('đã huỷ')));
    }
    return result.promise;
  };
  return { handler, calls };
}

function renderUpload(options: UseUploadOptions) {
  return renderHook(() => useUpload(options));
}

function stubObjectUrls() {
  const original = { create: URL.createObjectURL, revoke: URL.revokeObjectURL };
  const create = vi.fn(() => 'blob:xem-truoc');
  const revoke = vi.fn();
  Object.defineProperty(URL, 'createObjectURL', {
    configurable: true,
    writable: true,
    value: create,
  });
  Object.defineProperty(URL, 'revokeObjectURL', {
    configurable: true,
    writable: true,
    value: revoke,
  });
  return {
    create,
    revoke,
    restore: () => {
      Object.defineProperty(URL, 'createObjectURL', {
        configurable: true,
        writable: true,
        value: original.create,
      });
      Object.defineProperty(URL, 'revokeObjectURL', {
        configurable: true,
        writable: true,
        value: original.revoke,
      });
    },
  };
}

describe('useUpload — multiple=false chỉ nhận một tệp', () => {
  it('chỉ thêm, tải và trả về tệp hợp lệ đầu tiên; các tệp còn lại bị bỏ, không tải', () => {
    const { handler, calls } = controlledHandler();
    const { result } = renderUpload({ multiple: false, onUpload: handler });

    let added: UploadFile[] = [];
    act(() => {
      added = result.current.addFiles([file('a.txt'), file('b.txt'), file('c.txt')]);
    });

    expect(names(added)).toEqual(['a.txt']);
    expect(names(result.current.files)).toEqual(['a.txt']);
    expect(calls.map((call) => call.file.name)).toEqual(['a.txt']);
  });

  it('chế độ thuần state (không onUpload): vẫn chỉ trả về một tệp, trạng thái pending', () => {
    const { result } = renderUpload({ multiple: false });

    let added: UploadFile[] = [];
    act(() => {
      added = result.current.addFiles([file('a.txt'), file('b.txt')]);
    });

    expect(added.map(({ name, status }) => [name, status])).toEqual([['a.txt', 'pending']]);
    expect(names(result.current.files)).toEqual(['a.txt']);
  });

  it('tệp đầu không hợp lệ thì lấy tệp hợp lệ kế tiếp; tệp lỗi vẫn báo onReject như trước', () => {
    const { handler, calls } = controlledHandler();
    const onReject = vi.fn();
    const { result } = renderUpload({
      multiple: false,
      accept: '.pdf',
      onUpload: handler,
      onReject,
    });

    let added: UploadFile[] = [];
    act(() => {
      added = result.current.addFiles([
        file('hong.txt'),
        file('a.pdf', 'application/pdf'),
        file('b.pdf', 'application/pdf'),
        file('hong-nua.txt'),
      ]);
    });

    expect(names(added)).toEqual(['a.pdf']);
    expect(calls.map((call) => call.file.name)).toEqual(['a.pdf']);
    expect(onReject).toHaveBeenCalledTimes(1);
    expect(
      onReject.mock.calls[0][0].map(
        ({ file: rejected, error }: { file: File; error: { code: string } }) => [
          rejected.name,
          error.code,
        ],
      ),
    ).toEqual([
      ['hong.txt', 'file-invalid-type'],
      ['hong-nua.txt', 'file-invalid-type'],
    ]);
  });

  it('không tạo object URL xem trước cho ảnh bị bỏ', () => {
    const urls = stubObjectUrls();
    try {
      const { result } = renderUpload({ multiple: false });

      act(() => {
        result.current.addFiles([file('1.png', 'image/png'), file('2.png', 'image/png')]);
      });

      expect(urls.create).toHaveBeenCalledTimes(1);
    } finally {
      urls.restore();
    }
  });

  it('multiple=true giữ nguyên: nhận, tải và trả về mọi tệp hợp lệ', () => {
    const { handler, calls } = controlledHandler();
    const { result } = renderUpload({ multiple: true, onUpload: handler });

    let added: UploadFile[] = [];
    act(() => {
      added = result.current.addFiles([file('a.txt'), file('b.txt'), file('c.txt')]);
    });

    expect(names(added)).toEqual(['a.txt', 'b.txt', 'c.txt']);
    expect(names(result.current.files)).toEqual(['a.txt', 'b.txt', 'c.txt']);
    expect(calls.map((call) => call.file.name)).toEqual(['a.txt', 'b.txt', 'c.txt']);
  });
});

describe('useUpload — cancelFile và kết quả muộn', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('cancelFile với handler lờ signal: tệp sang paused ngay và isUploading về false', () => {
    const { handler, calls } = controlledHandler();
    const { result } = renderUpload({ onUpload: handler });
    act(() => {
      result.current.addFiles([file('a.txt')]);
    });
    const id = result.current.files[0].id;
    expect(result.current.isUploading).toBe(true);

    act(() => {
      result.current.cancelFile(id);
    });

    expect(calls[0].signal.aborted).toBe(true);
    expect(result.current.files[0].status).toBe('paused');
    expect(result.current.isUploading).toBe(false);
  });

  it('kết quả muộn của lần tải đã huỷ bị bỏ qua và không gọi onFileSettled', async () => {
    const { handler, calls } = controlledHandler();
    const onFileSettled = vi.fn();
    const { result } = renderUpload({ onUpload: handler, onFileSettled });
    act(() => {
      result.current.addFiles([file('a.txt')]);
    });
    act(() => {
      result.current.cancelFile(result.current.files[0].id);
    });

    await act(async () => {
      calls[0].onProgress(70);
      calls[0].result.resolve('url-muộn');
    });

    expect(result.current.files[0]).toMatchObject({ status: 'paused', progress: 0 });
    expect(result.current.files[0].url).toBeUndefined();
    expect(onFileSettled).not.toHaveBeenCalled();
  });

  it('handler hợp tác (reject khi abort): tệp paused và không báo lỗi', async () => {
    const { handler } = controlledHandler({ cooperative: true });
    const onFileSettled = vi.fn();
    const { result } = renderUpload({ onUpload: handler, onFileSettled });
    act(() => {
      result.current.addFiles([file('a.txt')]);
    });

    await act(async () => {
      result.current.cancelFile(result.current.files[0].id);
    });

    expect(result.current.files[0]).toMatchObject({ status: 'paused', error: undefined });
    expect(onFileSettled).not.toHaveBeenCalled();
  });

  it('thử lại sau khi huỷ: kết quả muộn của lần cũ không đè lên lần chạy mới', async () => {
    const { handler, calls } = controlledHandler();
    const onFileSettled = vi.fn();
    const { result } = renderUpload({ onUpload: handler, onFileSettled });
    act(() => {
      result.current.addFiles([file('a.txt')]);
    });
    const id = result.current.files[0].id;
    act(() => {
      result.current.cancelFile(id);
    });
    act(() => {
      result.current.retryFile(id);
    });
    expect(calls).toHaveLength(2);
    expect(result.current.files[0].status).toBe('uploading');

    await act(async () => {
      calls[0].result.reject(new Error('lỗi muộn của lần cũ'));
    });
    expect(result.current.files[0]).toMatchObject({ status: 'uploading', error: undefined });

    await act(async () => {
      calls[1].onProgress(40);
    });
    expect(result.current.files[0].progress).toBe(40);

    await act(async () => {
      calls[1].result.resolve('url-moi');
    });
    expect(result.current.files[0]).toMatchObject({ status: 'success', url: 'url-moi' });
    expect(onFileSettled).toHaveBeenCalledTimes(1);
  });

  it('lần cũ settle muộn không làm mất khả năng huỷ lần chạy mới', async () => {
    const { handler, calls } = controlledHandler();
    const { result } = renderUpload({ onUpload: handler });
    act(() => {
      result.current.addFiles([file('a.txt')]);
    });
    const id = result.current.files[0].id;
    act(() => {
      result.current.cancelFile(id);
    });
    act(() => {
      result.current.retryFile(id);
    });
    await act(async () => {
      calls[0].result.reject(new Error('muộn'));
    });

    act(() => {
      result.current.cancelFile(id);
    });

    expect(calls[1].signal.aborted).toBe(true);
    expect(result.current.files[0].status).toBe('paused');
  });

  it('removeFile khi đang tải: abort, gỡ khỏi danh sách và bỏ qua kết quả muộn', async () => {
    const { handler, calls } = controlledHandler();
    const onFileSettled = vi.fn();
    const { result } = renderUpload({ onUpload: handler, onFileSettled });
    act(() => {
      result.current.addFiles([file('a.txt')]);
    });

    act(() => {
      result.current.removeFile(result.current.files[0].id);
    });
    await act(async () => {
      calls[0].result.resolve('url-muộn');
    });

    expect(calls[0].signal.aborted).toBe(true);
    expect(result.current.files).toEqual([]);
    expect(onFileSettled).not.toHaveBeenCalled();
  });

  it('unmount abort mọi lần tải đang chạy', () => {
    const { handler, calls } = controlledHandler();
    const { result, unmount } = renderUpload({ onUpload: handler });
    act(() => {
      result.current.addFiles([file('a.txt'), file('b.txt')]);
    });

    unmount();

    expect(calls.map((call) => call.signal.aborted)).toEqual([true, true]);
  });

  it('tải thành công và lỗi thật vẫn báo onFileSettled đúng một lần mỗi tệp', async () => {
    const { handler, calls } = controlledHandler();
    const onFileSettled = vi.fn();
    const { result } = renderUpload({ onUpload: handler, onFileSettled });
    act(() => {
      result.current.addFiles([file('a.txt'), file('b.txt')]);
    });

    await act(async () => {
      calls[0].result.resolve('url-a');
      calls[1].result.reject(new Error('mạng đứt'));
    });

    expect(
      result.current.files.map(({ name, status, url, error }) => [name, status, url, error]),
    ).toEqual([
      ['a.txt', 'success', 'url-a', undefined],
      ['b.txt', 'error', undefined, 'mạng đứt'],
    ]);
    expect(onFileSettled).toHaveBeenCalledTimes(2);
  });
});
