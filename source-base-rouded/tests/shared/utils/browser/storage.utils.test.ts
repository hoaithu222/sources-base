/**
 * `safeStorage` / `createSafeJSONStorage` — lớp `localStorage` KHÔNG ném lỗi dùng chung (trước đây 3 bản chép tay
 * trong `useLocalStorage`, `useFormDraft`, `useMultiTabSync`; store `persist` thì không có lớp nào): hết quota hay
 * Safari riêng tư làm `setItem` ném, và lỗi đó bay thẳng ra khỏi `set()` của store zustand.
 */

import { afterEach, describe, expect, it, vi } from 'vitest';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { createSafeJSONStorage, safeStorage } from '@/shared/utils/browser/storage.utils';

/** Kho bộ nhớ của `tests/setup.ts` gắn hàm lên instance; jsdom gốc thì ở prototype. */
const spyStorage = (method: 'getItem' | 'setItem' | 'removeItem') =>
  vi.spyOn(Object.hasOwn(localStorage, method) ? localStorage : Storage.prototype, method);

const quotaExceeded = () => {
  throw new DOMException('đầy', 'QuotaExceededError');
};

afterEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
});

describe('safeStorage', () => {
  it('đọc / ghi / xoá như localStorage khi kho hoạt động', () => {
    expect(safeStorage.setItem('k', 'v')).toBe(true);
    expect(safeStorage.getItem('k')).toBe('v');
    expect(safeStorage.removeItem('k')).toBe(true);
    expect(safeStorage.getItem('k')).toBeNull();
  });

  it('kho ném lỗi → không ném ra ngoài: đọc ra `null`, ghi / xoá trả `false`', () => {
    spyStorage('getItem').mockImplementation(quotaExceeded);
    spyStorage('setItem').mockImplementation(quotaExceeded);
    spyStorage('removeItem').mockImplementation(quotaExceeded);

    expect(safeStorage.getItem('k')).toBeNull();
    expect(safeStorage.setItem('k', 'v')).toBe(false);
    expect(safeStorage.removeItem('k')).toBe(false);
  });
});

describe('createSafeJSONStorage — storage cho zustand `persist`', () => {
  const makeStore = () =>
    create<{ n: number; inc: () => void }>()(
      persist((set) => ({ n: 0, inc: () => set((s) => ({ n: s.n + 1 })) }), {
        name: 'safe-store-test',
        storage: createSafeJSONStorage(),
      }),
    );

  it('lưu state dạng JSON xuống localStorage', () => {
    const store = makeStore();
    store.getState().inc();
    expect(JSON.parse(localStorage.getItem('safe-store-test') ?? '{}')).toMatchObject({
      state: { n: 1 },
    });
  });

  it('hết quota → `set()` vẫn chạy, state trong bộ nhớ vẫn đổi', () => {
    const store = makeStore();
    spyStorage('setItem').mockImplementation(quotaExceeded);
    expect(() => store.getState().inc()).not.toThrow();
    expect(store.getState().n).toBe(1);
  });
});
