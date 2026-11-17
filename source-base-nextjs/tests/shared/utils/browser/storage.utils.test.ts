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

describe('registerPersistedStore / rehydratePersistedStores — nạp state đã lưu SAU hydrate', () => {
  type StorageModule = typeof import('@/shared/utils/browser/storage.utils');

  /** Module có biến trạng thái toàn cục (`storesHydrated`, danh sách store) → nạp BẢN MỚI cho mỗi ca. */
  async function freshStorageModule(): Promise<StorageModule> {
    vi.resetModules();
    return import('@/shared/utils/browser/storage.utils');
  }

  function makeStore(name: string, StorageUtils: StorageModule) {
    return create<{ n: number }>()(
      persist(() => ({ n: 0 }), {
        name,
        storage: StorageUtils.createSafeJSONStorage(),
        skipHydration: true,
      }),
    );
  }

  const saved = (name: string, n: number) =>
    localStorage.setItem(name, JSON.stringify({ state: { n }, version: 0 }));

  it('store `skipHydration` không tự nạp; `rehydratePersistedStores()` nạp MỌI store đã đăng ký', async () => {
    const utils = await freshStorageModule();
    const a = makeStore('persisted-a', utils);
    const b = makeStore('persisted-b', utils);
    saved('persisted-a', 3);
    saved('persisted-b', 7);
    utils.registerPersistedStore(a);
    utils.registerPersistedStore(b);

    expect(a.getState().n).toBe(0);
    expect(b.getState().n).toBe(0);

    utils.rehydratePersistedStores();

    expect(a.getState().n).toBe(3);
    expect(b.getState().n).toBe(7);
  });

  it('store KHÔNG đăng ký thì không bị nạp', async () => {
    const utils = await freshStorageModule();
    const registered = makeStore('persisted-registered', utils);
    const stray = makeStore('persisted-stray', utils);
    saved('persisted-registered', 1);
    saved('persisted-stray', 2);
    utils.registerPersistedStore(registered);

    utils.rehydratePersistedStores();

    expect(registered.getState().n).toBe(1);
    expect(stray.getState().n).toBe(0);
  });

  it('đăng ký cùng một store hai lần chỉ nạp một lần', async () => {
    const utils = await freshStorageModule();
    const store = makeStore('persisted-twice', utils);
    const rehydrate = vi.spyOn(store.persist, 'rehydrate');
    utils.registerPersistedStore(store);
    utils.registerPersistedStore(store);

    utils.rehydratePersistedStores();

    expect(rehydrate).toHaveBeenCalledTimes(1);
  });

  it('`arePersistedStoresHydrated` đổi false → true sau lần nạp đầu; người nghe được báo đúng một lần mỗi lần nạp', async () => {
    const utils = await freshStorageModule();
    const listener = vi.fn();
    const unsubscribe = utils.subscribePersistedStoresHydrated(listener);

    expect(utils.arePersistedStoresHydrated()).toBe(false);
    expect(listener).not.toHaveBeenCalled();

    utils.rehydratePersistedStores();

    expect(utils.arePersistedStoresHydrated()).toBe(true);
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    utils.rehydratePersistedStores();
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
