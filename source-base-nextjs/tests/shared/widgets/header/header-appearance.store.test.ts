/**
 * Khôi phục `useHeaderAppearanceStore` (kiểu thanh header: `brand` gradient · `glass` kính mờ) từ localStorage — dữ liệu
 * lưu là đầu vào KHÔNG tin cậy.
 *
 * Lỗi cần chặn: zustand `persist` chỉ gọi `migrate` khi `version` đổi, còn cùng version thì trộn thẳng JSON vào store —
 * `appearance: 'garbage'` làm `HEADER_APPEARANCE_CLASSES[appearance]` ra `undefined`, thanh mất nền + màu chữ. Cùng khuôn
 * với `dock-settings.store.test.ts`.
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import enMessages from '@/messages/en';
import viMessages from '@/messages/vi';
import { rehydratePersistedStores } from '@/shared/utils/browser/storage.utils';
import {
  HEADER_APPEARANCE_ORDER,
  useHeaderAppearanceStore,
} from '@/shared/widgets/header/chrome/header-appearance.store';
import { HEADER_APPEARANCE_CLASSES } from '@/shared/widgets/header/header.theme';

/** Khoá lưu `localStorage` — hợp đồng bền vững: đổi khoá là mất lựa chọn đã lưu của người dùng. */
const KEY = 'next-base:header-appearance';
const VERSION = 1;

const envelope = (state: unknown, version: number) => JSON.stringify({ state, version });

async function restore(raw: string) {
  localStorage.setItem(KEY, raw);
  await useHeaderAppearanceStore.persist.rehydrate();
  return useHeaderAppearanceStore.getState();
}

function resetStore() {
  useHeaderAppearanceStore.setState(useHeaderAppearanceStore.getInitialState(), true);
  localStorage.clear();
}

beforeEach(resetStore);
afterEach(resetStore);

describe('header appearance — mặc định + hành động', () => {
  it('mặc định `brand` (gradient BIDV); setAppearance đổi kiểu và được lưu', () => {
    expect(useHeaderAppearanceStore.getState().appearance).toBe('brand');

    useHeaderAppearanceStore.getState().setAppearance('glass');

    expect(useHeaderAppearanceStore.getState().appearance).toBe('glass');
    expect(JSON.parse(localStorage.getItem(KEY) ?? 'null')).toEqual({
      state: { appearance: 'glass' },
      version: VERSION,
    });
  });

  it('mỗi kiểu hợp lệ có nhãn menu (vi + en) + bảng class khai ĐỦ chín biến `--hdr-*` mà phần con đọc', () => {
    const vars = [
      '--hdr-fg:',
      '--hdr-fg-muted:',
      '--hdr-hover:',
      '--hdr-active:',
      '--hdr-bar:',
      '--hdr-divider:',
      '--hdr-field:',
      '--hdr-field-border:',
      '--hdr-ring:',
    ];
    for (const appearance of HEADER_APPEARANCE_ORDER) {
      expect(viMessages.ui.widgets.header.appearance[appearance], appearance).toBeTruthy();
      expect(enMessages.ui.widgets.header.appearance[appearance], appearance).toBeTruthy();
      const missing = vars.filter((name) => !HEADER_APPEARANCE_CLASSES[appearance].includes(name));
      expect(missing, appearance).toEqual([]);
    }
  });
});

describe('header appearance — khôi phục', () => {
  it.each(HEADER_APPEARANCE_ORDER)(
    'cùng version, kiểu hợp lệ `%s` được giữ',
    async (appearance) => {
      expect((await restore(envelope({ appearance }, VERSION))).appearance).toBe(appearance);
    },
  );

  it.each([
    ['kiểu không tồn tại', { appearance: 'tray' }],
    ['sai hoa thường', { appearance: 'Glass' }],
    ['không phải chuỗi', { appearance: 1 }],
    ['thiếu field', {}],
  ])('⛔ %s → về `brand`', async (_name, state) => {
    useHeaderAppearanceStore.setState({ appearance: 'glass' });
    expect((await restore(envelope(state, VERSION))).appearance).toBe('brand');
  });

  it.each([
    ['chuỗi không phải JSON', '{hỏng'],
    ['JSON `null`', 'null'],
    ['state là mảng', envelope(['glass'], VERSION)],
    ['thiếu state', JSON.stringify({ version: VERSION })],
  ])('dữ liệu hỏng (%s) → mặc định, không nổ', async (_name, raw) => {
    expect((await restore(raw)).appearance).toBe('brand');
  });

  it('⛔ field lạ bị bỏ, store không nhận thêm khoá nào', async () => {
    const before = Object.keys(useHeaderAppearanceStore.getState()).sort();
    await restore(envelope({ appearance: 'glass', skin: 'hex' }, VERSION));
    expect(Object.keys(useHeaderAppearanceStore.getState()).sort()).toEqual(before);
  });
});

describe('header appearance — nạp sau hydrate (`skipHydration`)', () => {
  it('dữ liệu đã lưu KHÔNG tự vào store; chỉ `rehydratePersistedStores()` mới nạp (store đã đăng ký)', () => {
    localStorage.setItem(KEY, envelope({ appearance: 'glass' }, VERSION));

    expect(useHeaderAppearanceStore.getState().appearance).toBe('brand');

    rehydratePersistedStores();

    expect(useHeaderAppearanceStore.getState().appearance).toBe('glass');
  });
});
