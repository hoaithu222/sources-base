/**
 * Ảnh xem trước kiểu khung header ở menu "Kiểu header" (`HeaderSkinPreview`).
 *
 * Giữ: ảnh là trang trí thuần (aria-hidden + inert, không chữ, không heading / liên kết — chip bên trong là `<button>` nên PHẢI inert);
 * dựng bằng cấu hình THẬT của kiểu (biến hình học của `HEADER_SKIN_SPECS[skin].vars`, thanh khay chỉ ở họ khay) qua ghi đè
 * `HeaderSkinOverrideContext` — không đụng store (đổi ảnh xem trước không được đổi kiểu đang chọn của thanh header).
 */

import { render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { HEADER_SKIN_ORDER, useHeaderSkinStore } from '@/shared/widgets/header/header-skin.store';
import { HEADER_SKIN_SPECS } from '@/shared/widgets/header/page-header/header-skin.theme';
import HeaderSkinPreview from '@/shared/widgets/header/user-menu/skin-preview/HeaderSkinPreview';

const TRAY_SKINS: readonly string[] = ['tray-flip', 'tray', 'tray-slant', 'command', 'facet'];

afterEach(() => useHeaderSkinStore.setState(useHeaderSkinStore.getInitialState(), true));

function renderPreview(skin: (typeof HEADER_SKIN_ORDER)[number]) {
  const { container } = render(<HeaderSkinPreview skin={skin} />);
  const frame = container.querySelector<HTMLElement>('[data-skin-preview]');
  if (!frame) throw new Error('thiếu khung xem trước');
  return { container, frame };
}

describe('HeaderSkinPreview — ảnh xem trước một kiểu khung', () => {
  it.each(HEADER_SKIN_ORDER)(
    'kiểu "%s": trang trí thuần (aria-hidden + inert), không chữ, không heading / liên kết',
    (skin) => {
      const { frame } = renderPreview(skin);

      expect(frame).toHaveAttribute('aria-hidden', 'true');
      expect(frame).toHaveAttribute('inert');
      expect(frame).toHaveAttribute('data-skin-preview', skin);
      expect(frame.textContent).toBe('');
      expect(frame.querySelector('h1, h2, a')).toBeNull();
    },
  );

  it.each(HEADER_SKIN_ORDER)(
    'kiểu "%s": sân khấu mang biến hình học của chính kiểu đó (không dùng kiểu trong store)',
    (skin) => {
      const { frame } = renderPreview(skin);
      const stage = frame.firstElementChild;
      const firstVar = HEADER_SKIN_SPECS[skin].vars.split(' ')[0];

      expect(stage?.className).toContain(firstVar);
      expect(stage?.className).toContain('scale-50');
    },
  );

  it.each(HEADER_SKIN_ORDER)(
    'kiểu "%s": thanh khay chỉ có ở họ khay (2 thanh: trái + phải), kiểu khác không',
    (skin) => {
      const { frame } = renderPreview(skin);

      expect(frame.querySelectorAll('[data-shelf]')).toHaveLength(
        TRAY_SKINS.includes(skin) ? 2 : 0,
      );
    },
  );

  it('có 3 chip (2 trái + 1 phải); vẽ ảnh KHÔNG đổi kiểu đang chọn trong store', () => {
    const before = useHeaderSkinStore.getState().skin;
    const { frame } = renderPreview('hex');

    expect(frame.querySelectorAll('button')).toHaveLength(3);
    expect(useHeaderSkinStore.getState().skin).toBe(before);
  });
});
