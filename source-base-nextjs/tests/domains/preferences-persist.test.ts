/**
 * Khôi phục tuỳ chọn hiển thị / theme từ localStorage — dữ liệu lưu là đầu vào KHÔNG tin cậy.
 *
 * Lỗi cần chặn: zustand `persist` chỉ gọi `migrate` khi `version` đổi, còn cùng version thì
 * trộn thẳng JSON vào store — `uiScale: 99` chạm tới `--ui-scale`. Và `migrate` của theme
 * vứt theme hợp lệ đã lưu ở mọi lần tăng version.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  selectEffectiveUiScale,
  UI_SCALE_VALUES,
  useDisplayStore,
  useThemeStore,
} from '@/domains/preferences';
import {
  DISPLAY_INITIAL_STATE,
  DISPLAY_STORAGE,
} from '@/domains/preferences/display/display.constants';
import { THEME_STORAGE } from '@/domains/preferences/theme/theme.constants';

const { key: DISPLAY_STORAGE_KEY, version: DISPLAY_STORAGE_VERSION } = DISPLAY_STORAGE;
const { key: THEME_STORAGE_KEY, version: THEME_STORAGE_VERSION } = THEME_STORAGE;
const OLD_VERSION = 0;

const envelope = (state: unknown, version: number) => JSON.stringify({ state, version });

async function restoreDisplay(raw: string) {
  localStorage.setItem(DISPLAY_STORAGE_KEY, raw);
  await useDisplayStore.persist.rehydrate();
  return useDisplayStore.getState();
}

async function restoreTheme(raw: string) {
  localStorage.setItem(THEME_STORAGE_KEY, raw);
  await useThemeStore.persist.rehydrate();
  return useThemeStore.getState();
}

const savedDisplay = () => {
  const { mode, uiScale } = useDisplayStore.getState();
  return { mode, uiScale };
};

function resetStores() {
  useDisplayStore.setState(useDisplayStore.getInitialState(), true);
  useThemeStore.setState(useThemeStore.getInitialState(), true);
  localStorage.clear();
}

beforeEach(resetStores);
afterEach(resetStores);

describe('display store — khôi phục', () => {
  it('⛔ cùng version nhưng giá trị rác → về mặc định, `uiScale` ngoài dải không lọt vào store', async () => {
    const state = await restoreDisplay(
      envelope({ mode: 'garbage', uiScale: 99 }, DISPLAY_STORAGE_VERSION),
    );

    expect(state).toMatchObject(DISPLAY_INITIAL_STATE);
    expect(selectEffectiveUiScale({ ...state, mode: 'tv' })).toBeLessThanOrEqual(
      Math.max(...UI_SCALE_VALUES),
    );
  });

  it('⛔ chỉ một field sai → giữ field hợp lệ, field sai về mặc định', async () => {
    await restoreDisplay(envelope({ mode: 'tv', uiScale: 99 }, DISPLAY_STORAGE_VERSION));
    expect(savedDisplay()).toEqual({ mode: 'tv', uiScale: DISPLAY_INITIAL_STATE.uiScale });

    await restoreDisplay(envelope({ mode: 'cinema', uiScale: 1.3 }, DISPLAY_STORAGE_VERSION));
    expect(savedDisplay()).toEqual({ mode: DISPLAY_INITIAL_STATE.mode, uiScale: 1.3 });
  });

  it('dữ liệu hợp lệ cùng version được dùng nguyên', async () => {
    await restoreDisplay(envelope({ mode: 'tv', uiScale: 1.2 }, DISPLAY_STORAGE_VERSION));
    expect(savedDisplay()).toEqual({ mode: 'tv', uiScale: 1.2 });
  });

  it.each([
    ['`uiScale` là chuỗi', { mode: 'tv', uiScale: '1.2' }, { mode: 'tv', uiScale: 1.1 }],
    ['`uiScale` là null', { mode: 'tv', uiScale: null }, { mode: 'tv', uiScale: 1.1 }],
    ['`uiScale` = 1 (ngoài dải TV)', { mode: 'tv', uiScale: 1 }, { mode: 'tv', uiScale: 1.1 }],
    ['`mode` sai hoa thường', { mode: 'TV', uiScale: 1.2 }, { mode: 'standard', uiScale: 1.2 }],
    ['`mode` là số', { mode: 1, uiScale: 1.2 }, { mode: 'standard', uiScale: 1.2 }],
  ])('field sai kiểu (%s) → chỉ field đó về mặc định', async (_name, stored, expected) => {
    await restoreDisplay(envelope(stored, DISPLAY_STORAGE_VERSION));
    expect(savedDisplay()).toEqual(expected);
  });

  it('⛔ field lạ bị bỏ, store không nhận thêm khoá nào ngoài state + action', async () => {
    const before = Object.keys(useDisplayStore.getState()).sort();

    await restoreDisplay(
      envelope({ mode: 'tv', uiScale: 1.2, overscan: 5, extra: 'x' }, DISPLAY_STORAGE_VERSION),
    );

    expect(Object.keys(useDisplayStore.getState()).sort()).toEqual(before);
    expect(savedDisplay()).toEqual({ mode: 'tv', uiScale: 1.2 });
  });

  it('khôi phục xong action của store vẫn gọi được', async () => {
    await restoreDisplay(envelope({ mode: 'tv', uiScale: 1.2 }, DISPLAY_STORAGE_VERSION));

    useDisplayStore.getState().setMode('standard');
    expect(useDisplayStore.getState().mode).toBe('standard');
  });

  it('version cũ → `migrate` nắn: giữ `mode`, giữ `uiScale` nếu còn trong dải', async () => {
    await restoreDisplay(envelope({ mode: 'tv', uiScale: 1.2 }, 1));
    expect(savedDisplay()).toEqual({ mode: 'tv', uiScale: 1.2 });
  });

  it('version cũ với `uiScale` của dải cũ → về mặc định; `overscan` đã bỏ không còn', async () => {
    await restoreDisplay(envelope({ mode: 'tv', uiScale: 2, overscan: 4 }, 1));

    expect(savedDisplay()).toEqual({ mode: 'tv', uiScale: DISPLAY_INITIAL_STATE.uiScale });
    expect(useDisplayStore.getState()).not.toHaveProperty('overscan');
  });

  it('migrate xong thì ghi lại bản mới nhất xuống localStorage', async () => {
    await restoreDisplay(envelope({ mode: 'tv', uiScale: 2, overscan: 4 }, 1));

    expect(JSON.parse(localStorage.getItem(DISPLAY_STORAGE_KEY) ?? 'null')).toEqual({
      state: { mode: 'tv', uiScale: DISPLAY_INITIAL_STATE.uiScale },
      version: DISPLAY_STORAGE_VERSION,
    });
  });

  it('version của bản app MỚI HƠN (rollback) cũng bị kiểm lại, không tin', async () => {
    await restoreDisplay(envelope({ mode: 'tv', uiScale: 99 }, DISPLAY_STORAGE_VERSION + 1));
    expect(savedDisplay()).toEqual({ mode: 'tv', uiScale: DISPLAY_INITIAL_STATE.uiScale });
  });

  it.each([
    ['chuỗi không phải JSON', '{hỏng'],
    ['JSON `null`', 'null'],
    ['state là null', envelope(null, DISPLAY_STORAGE_VERSION)],
    ['state là chuỗi', envelope('rác', DISPLAY_STORAGE_VERSION)],
    ['state là mảng', envelope(['tv', 1.2], DISPLAY_STORAGE_VERSION)],
    ['state là số', envelope(42, DISPLAY_STORAGE_VERSION)],
    ['thiếu state', JSON.stringify({ version: DISPLAY_STORAGE_VERSION })],
    ['thiếu version', JSON.stringify({ state: { mode: 'garbage', uiScale: 99 } })],
  ])('dữ liệu hỏng (%s) → mặc định, không nổ', async (_name, raw) => {
    const state = await restoreDisplay(raw);

    expect(state).toMatchObject(DISPLAY_INITIAL_STATE);
    expect(Object.keys(state).filter((key) => /^\d+$/.test(key))).toEqual([]);
  });
});

describe('theme store — khôi phục', () => {
  it('⛔ cùng version nhưng giá trị rác → light (mặc định base sáng)', async () => {
    const state = await restoreTheme(envelope({ theme: 'garbage' }, THEME_STORAGE_VERSION));
    expect(state.theme).toBe('light');
  });

  it.each([
    ['light', 'light'],
    ['dark', 'dark'],
  ] as const)('cùng version, theme hợp lệ `%s` được giữ', async (theme, expected) => {
    useThemeStore.setState({ theme: theme === 'light' ? 'dark' : 'light' });

    await restoreTheme(envelope({ theme }, THEME_STORAGE_VERSION));
    expect(useThemeStore.getState().theme).toBe(expected);
  });

  it('⛔ version cũ mà theme đã lưu hợp lệ → giữ, không vứt về light', async () => {
    const state = await restoreTheme(envelope({ theme: 'dark' }, OLD_VERSION));
    expect(state.theme).toBe('dark');
  });

  it('version cũ + theme rác → light', async () => {
    const state = await restoreTheme(envelope({ theme: 'sepia' }, OLD_VERSION));
    expect(state.theme).toBe('light');
  });

  it('version mới hơn + theme hợp lệ → giữ', async () => {
    const state = await restoreTheme(envelope({ theme: 'dark' }, THEME_STORAGE_VERSION + 1));
    expect(state.theme).toBe('dark');
  });

  it('migrate xong thì ghi lại đúng version hiện tại với theme đã giữ', async () => {
    await restoreTheme(envelope({ theme: 'dark', legacy: true }, OLD_VERSION));

    expect(JSON.parse(localStorage.getItem(THEME_STORAGE_KEY) ?? 'null')).toEqual({
      state: { theme: 'dark', accent: 'vci' },
      version: THEME_STORAGE_VERSION,
    });
  });

  it.each([
    ['theme là số', { theme: 1 }],
    ['theme là null', { theme: null }],
    ['theme sai hoa thường', { theme: 'Light' }],
    ['thiếu theme', {}],
  ])('field sai (%s) → light', async (_name, state) => {
    useThemeStore.setState({ theme: 'dark' });

    await restoreTheme(envelope(state, THEME_STORAGE_VERSION));
    expect(useThemeStore.getState().theme).toBe('light');
  });

  it('⛔ field lạ bị bỏ, store không nhận thêm khoá nào ngoài state + action', async () => {
    const before = Object.keys(useThemeStore.getState()).sort();

    await restoreTheme(envelope({ theme: 'dark', accent: 'red' }, THEME_STORAGE_VERSION));

    expect(Object.keys(useThemeStore.getState()).sort()).toEqual(before);
    expect(useThemeStore.getState().theme).toBe('dark');
  });

  it('khôi phục xong action của store vẫn gọi được', async () => {
    await restoreTheme(envelope({ theme: 'light' }, THEME_STORAGE_VERSION));

    useThemeStore.getState().toggleTheme();
    expect(useThemeStore.getState().theme).toBe('dark');
  });

  it.each([
    ['chuỗi không phải JSON', '{hỏng'],
    ['JSON `null`', 'null'],
    ['state là null', envelope(null, THEME_STORAGE_VERSION)],
    ['state là chuỗi', envelope('light', THEME_STORAGE_VERSION)],
    ['state là mảng', envelope(['light'], THEME_STORAGE_VERSION)],
    ['thiếu state', JSON.stringify({ version: THEME_STORAGE_VERSION })],
  ])('dữ liệu hỏng (%s) → light, không nổ', async (_name, raw) => {
    const state = await restoreTheme(raw);

    expect(state.theme).toBe('light');
    expect(Object.keys(state).filter((key) => /^\d+$/.test(key))).toEqual([]);
  });
});

describe('localStorage hỏng không được chặn đổi tuỳ chọn', () => {
  it('⛔ ghi lỗi (hết quota, trình duyệt chặn lưu trữ) → store vẫn đổi, không ném', () => {
    const write = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Bộ nhớ trình duyệt đầy', 'QuotaExceededError');
    });

    expect(() => useDisplayStore.getState().setMode('tv')).not.toThrow();
    expect(() => useThemeStore.getState().setTheme('light')).not.toThrow();
    expect(useDisplayStore.getState().mode).toBe('tv');
    expect(useThemeStore.getState().theme).toBe('light');

    write.mockRestore();
  });
});
