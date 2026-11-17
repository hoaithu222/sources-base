/**
 * Promise giải quyết từ bên ngoài — dựng đúng THỨ TỰ hoàn thành của các request bất đồng bộ
 * (A gọi trước nhưng về sau B) mà không cần ngủ thật.
 *
 * `createDeferred` — một promise lẻ. `createGate` — nhiều lời gọi API giả tra theo khoá; test tự
 * quyết lời gọi nào xong trước, xong sau, hay bị từ chối (bọc `act` để React xử lý xong cập nhật).
 */

import { act } from '@testing-library/react';
import { vi } from 'vitest';

export interface Deferred<T> {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason?: unknown) => void;
}

export function createDeferred<T = void>(): Deferred<T> {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

/**
 * Cổng điều khiển lời gọi API giả: `request(key)` trả promise đang treo (và là `vi.fn` để đếm lời
 * gọi); `resolve(key, value)` / `reject(key)` cho lời gọi đó về. Gọi `resolve` cho khoá chưa
 * `request` là ném — bài kiểm sai kịch bản thì đỏ ngay chứ không treo.
 */
export function createGate<T>() {
  const pending = new Map<string, Deferred<T>>();
  const take = (key: string) => {
    const deferred = pending.get(key);
    if (!deferred) throw new Error(`Lời gọi "${key}" chưa xảy ra`);
    return deferred;
  };
  return {
    request: vi.fn((key: string) => {
      const deferred = createDeferred<T>();
      pending.set(key, deferred);
      return deferred.promise;
    }),
    resolve: (key: string, value: T) => act(async () => take(key).resolve(value)),
    reject: (key: string, reason: unknown = new Error('Mất mạng')) =>
      act(async () => take(key).reject(reason)),
  };
}

export type Gate<T> = ReturnType<typeof createGate<T>>;
