/**
 * Nạp store `persist` SAU hydrate — `skipHydration: true` + `registerPersistedStore` + `rehydratePersistedStores`.
 *
 * zustand mặc định nạp localStorage NGAY lúc tạo store, nên lần render đầu ở trình duyệt đã khác HTML server (lỗi hydration
 * mismatch). Ba store của domain (theme · display · session) vì vậy bắt đầu bằng state MẶC ĐỊNH và chỉ nhận giá trị đã lưu khi
 * `StoreHydration` gọi `rehydratePersistedStores()` — bài kiểm này giữ cả hai nửa: chưa nạp thì chưa đọc, nạp rồi thì đủ cả ba.
 * (Quy ước ở mức mã nguồn — mọi `persist(` có `skipHydration` và được đăng ký — do `policy/data/persist-stores` giữ.)
 *
 * Mỗi ca nạp lại module (`vi.resetModules`) để store được TẠO với localStorage đã gieo sẵn, đúng như một lần tải trang thật.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DISPLAY_STORAGE } from '@/domains/preferences/display/display.constants';
import { THEME_STORAGE } from '@/domains/preferences/theme/theme.constants';
import { SESSION_STORAGE } from '@/domains/session/model/session.constants';

const USER = {
  id: 'u1',
  email: 'a@b.vn',
  name: 'An',
  roles: ['editor'],
  permissions: ['user:view'],
};

const seed = (key: string, version: number, state: unknown) =>
  localStorage.setItem(key, JSON.stringify({ state, version }));

function seedAll() {
  seed(THEME_STORAGE.key, THEME_STORAGE.version, { theme: 'dark', accent: 'blue' });
  seed(DISPLAY_STORAGE.key, DISPLAY_STORAGE.version, { mode: 'tv', uiScale: 1.2 });
  seed(SESSION_STORAGE.key, SESSION_STORAGE.version, { user: USER });
}

/** Nạp mới toàn bộ module liên quan — store được tạo lại với localStorage hiện có. */
async function boot() {
  vi.resetModules();
  const [preferences, session, storage] = await Promise.all([
    import('@/domains/preferences'),
    import('@/domains/session'),
    import('@/shared/utils/browser/storage.utils'),
  ]);
  return { ...preferences, ...session, ...storage };
}

beforeEach(() => {
  localStorage.clear();
});

describe('trước khi nạp — store bắt đầu bằng state mặc định dù localStorage đã có dữ liệu', () => {
  it('theme · display · session đều là mặc định, `arePersistedStoresHydrated()` là false', async () => {
    seedAll();
    const app = await boot();

    expect(app.useThemeStore.getState()).toMatchObject({ theme: 'light', accent: 'vci' });
    expect(app.useDisplayStore.getState()).toMatchObject({ mode: 'standard' });
    expect(app.useSessionStore.getState()).toMatchObject({ user: null, status: 'idle' });
    expect(app.arePersistedStoresHydrated()).toBe(false);
  });

  it('`hasHydrated()` của persist báo chưa nạp', async () => {
    seedAll();
    const app = await boot();

    expect(app.useThemeStore.persist.hasHydrated()).toBe(false);
    expect(app.useDisplayStore.persist.hasHydrated()).toBe(false);
    expect(app.useSessionStore.persist.hasHydrated()).toBe(false);
  });

  it('đổi state trước khi nạp vẫn ghi xuống localStorage (ghi không bị chặn bởi skipHydration)', async () => {
    const app = await boot();
    app.useThemeStore.getState().setTheme('dark');

    const saved = JSON.parse(localStorage.getItem(THEME_STORAGE.key) ?? 'null') as {
      state: { theme: string };
    };
    expect(saved.state.theme).toBe('dark');
  });
});

describe('rehydratePersistedStores — nạp MỌI store đã đăng ký một lần', () => {
  it('cả ba store nhận giá trị đã lưu và `arePersistedStoresHydrated()` thành true', async () => {
    seedAll();
    const app = await boot();

    app.rehydratePersistedStores();

    expect(app.useThemeStore.getState()).toMatchObject({ theme: 'dark', accent: 'blue' });
    expect(app.useDisplayStore.getState()).toMatchObject({ mode: 'tv', uiScale: 1.2 });
    expect(app.useSessionStore.getState().user).toEqual(USER);
    expect(app.useSessionStore.getState()).toMatchObject({ accessToken: null, status: 'idle' });
    expect(app.arePersistedStoresHydrated()).toBe(true);
  });

  it('báo cho người nghe đúng một lần, và gỡ đăng ký thì không báo nữa', async () => {
    const app = await boot();
    const heard = vi.fn();
    const ignored = vi.fn();
    app.subscribePersistedStoresHydrated(heard);
    app.subscribePersistedStoresHydrated(ignored)();

    app.rehydratePersistedStores();

    expect(heard).toHaveBeenCalledOnce();
    expect(ignored).not.toHaveBeenCalled();
  });

  it('localStorage trống hoặc hỏng: giữ mặc định, không ném, vẫn đánh dấu đã nạp', async () => {
    localStorage.setItem(THEME_STORAGE.key, '{hỏng');
    localStorage.setItem(DISPLAY_STORAGE.key, 'null');
    const app = await boot();

    expect(() => app.rehydratePersistedStores()).not.toThrow();
    expect(app.useThemeStore.getState()).toMatchObject({ theme: 'light' });
    expect(app.useDisplayStore.getState()).toMatchObject({ mode: 'standard' });
    expect(app.useSessionStore.getState().user).toBeNull();
    expect(app.arePersistedStoresHydrated()).toBe(true);
  });

  it('dữ liệu lưu sai kiểu bị nắn như khi gọi `persist.rehydrate()` riêng lẻ', async () => {
    seed(THEME_STORAGE.key, THEME_STORAGE.version, { theme: 'sepia', accent: 'blue' });
    seed(DISPLAY_STORAGE.key, DISPLAY_STORAGE.version, { mode: 'tv', uiScale: 99 });
    seed(SESSION_STORAGE.key, SESSION_STORAGE.version, { user: { id: 'u1' } });
    const app = await boot();

    app.rehydratePersistedStores();

    expect(app.useThemeStore.getState()).toMatchObject({ theme: 'light', accent: 'blue' });
    expect(app.useDisplayStore.getState()).toMatchObject({ mode: 'tv', uiScale: 1.1 });
    expect(app.useSessionStore.getState()).toMatchObject({ user: null });
  });
});
