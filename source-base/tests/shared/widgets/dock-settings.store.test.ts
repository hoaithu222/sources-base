/**
 * Khôi phục `useDockSettingsStore` từ localStorage — dữ liệu lưu là đầu vào KHÔNG tin cậy.
 *
 * Lỗi cần chặn: zustand `persist` chỉ gọi `migrate` khi `version` đổi, còn cùng version thì trộn
 * thẳng JSON vào store — `mode: 'x'` làm Dock không khớp chế độ nào.
 * Cùng khuôn với `header-skin.store.test.ts`.
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { DOCK_MODE_OPTIONS } from '@/shared/widgets/dock/dock-settings.constants';
import {
  DEFAULT_DOCK_SETTINGS,
  useDockSettingsStore,
} from '@/shared/widgets/dock/dock-settings.store';

const DOCK_KEY = 'dock-storage';
const VERSION = 1;
const OLD_VERSION = 0;

const envelope = (state: unknown, version: number) => JSON.stringify({ state, version });

async function restoreDock(raw: string) {
  localStorage.setItem(DOCK_KEY, raw);
  await useDockSettingsStore.persist.rehydrate();
  return useDockSettingsStore.getState();
}

const dockValues = () => {
  const { mode, magnify } = useDockSettingsStore.getState();
  return { mode, magnify };
};

function resetStore() {
  useDockSettingsStore.setState(useDockSettingsStore.getInitialState(), true);
  localStorage.clear();
}

beforeEach(resetStore);
afterEach(resetStore);

describe('dock settings — khôi phục', () => {
  it('⛔ cùng version nhưng `mode` / `magnify` rác → mặc định', async () => {
    useDockSettingsStore.setState({ mode: 'hidden', magnify: false });

    await restoreDock(envelope({ mode: 'x', magnify: 'yes' }, VERSION));

    expect(dockValues()).toEqual(DEFAULT_DOCK_SETTINGS);
  });

  it('⛔ chỉ một field sai → giữ field hợp lệ, field sai về mặc định', async () => {
    useDockSettingsStore.setState({ mode: 'pinned', magnify: false });
    await restoreDock(envelope({ mode: 'hidden', magnify: 'yes' }, VERSION));
    expect(dockValues()).toEqual({ mode: 'hidden', magnify: DEFAULT_DOCK_SETTINGS.magnify });

    await restoreDock(envelope({ mode: 'x', magnify: false }, VERSION));
    expect(dockValues()).toEqual({ mode: DEFAULT_DOCK_SETTINGS.mode, magnify: false });
  });

  it.each(DOCK_MODE_OPTIONS.map((option) => option.value))(
    'cùng version, `mode` hợp lệ `%s` được giữ',
    async (mode) => {
      await restoreDock(envelope({ mode, magnify: false }, VERSION));
      expect(dockValues()).toEqual({ mode, magnify: false });
    },
  );

  it.each([
    ['`mode` là số', { mode: 1, magnify: false }, { mode: 'pinned', magnify: false }],
    [
      '`mode` sai hoa thường',
      { mode: 'Hidden', magnify: false },
      { mode: 'pinned', magnify: false },
    ],
    ['`magnify` là null', { mode: 'hidden', magnify: null }, { mode: 'hidden', magnify: true }],
    ['`magnify` là số', { mode: 'hidden', magnify: 0 }, { mode: 'hidden', magnify: true }],
    ['`magnify` là chuỗi', { mode: 'hidden', magnify: 'false' }, { mode: 'hidden', magnify: true }],
    ['thiếu `magnify`', { mode: 'collapsed' }, { mode: 'collapsed', magnify: true }],
  ])('field sai kiểu (%s) → chỉ field đó về mặc định', async (_name, stored, expected) => {
    useDockSettingsStore.setState({ magnify: false });

    await restoreDock(envelope(stored, VERSION));
    expect(dockValues()).toEqual(expected);
  });

  it('version cũ: giữ giá trị hợp lệ, nắn giá trị lạ', async () => {
    await restoreDock(envelope({ mode: 'autohide', magnify: false }, OLD_VERSION));
    expect(dockValues()).toEqual({ mode: 'autohide', magnify: false });

    await restoreDock(envelope({ mode: 'floating', magnify: 'yes' }, OLD_VERSION));
    expect(dockValues()).toEqual(DEFAULT_DOCK_SETTINGS);
  });

  it('version MỚI hơn (rollback) cũng bị kiểm lại', async () => {
    await restoreDock(envelope({ mode: 'x', magnify: false }, VERSION + 1));
    expect(dockValues()).toEqual({ mode: DEFAULT_DOCK_SETTINGS.mode, magnify: false });
  });

  it('migrate xong thì ghi lại đúng version hiện tại', async () => {
    await restoreDock(envelope({ mode: 'hidden', magnify: false, legacy: 1 }, OLD_VERSION));

    expect(JSON.parse(localStorage.getItem(DOCK_KEY) ?? 'null')).toEqual({
      state: { mode: 'hidden', magnify: false },
      version: VERSION,
    });
  });

  it('⛔ field lạ bị bỏ, store không nhận thêm khoá nào ngoài state + action', async () => {
    const before = Object.keys(useDockSettingsStore.getState()).sort();

    await restoreDock(envelope({ mode: 'hidden', magnify: false, position: 'top' }, VERSION));

    expect(Object.keys(useDockSettingsStore.getState()).sort()).toEqual(before);
  });

  it('khôi phục xong action của store vẫn gọi được', async () => {
    await restoreDock(envelope({ mode: 'hidden', magnify: false }, VERSION));

    useDockSettingsStore.getState().setMode('collapsed');
    useDockSettingsStore.getState().setMagnify(true);
    expect(dockValues()).toEqual({ mode: 'collapsed', magnify: true });
  });

  it.each([
    ['chuỗi không phải JSON', '{hỏng'],
    ['JSON `null`', 'null'],
    ['state là null', envelope(null, VERSION)],
    ['state là chuỗi', envelope('hidden', VERSION)],
    ['state là mảng', envelope(['hidden', false], VERSION)],
    ['state là số', envelope(42, VERSION)],
    ['thiếu state', JSON.stringify({ version: VERSION })],
  ])('dữ liệu hỏng (%s) → mặc định, không nổ', async (_name, raw) => {
    const state = await restoreDock(raw);

    expect(dockValues()).toEqual(DEFAULT_DOCK_SETTINGS);
    expect(Object.keys(state).filter((key) => /^\d+$/.test(key))).toEqual([]);
  });
});
