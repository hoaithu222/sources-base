/**
 * Nút "Lên đầu trang" của `/demo`: ẩn khi còn ở đầu trang, hiện sau khi cuộn quá ngưỡng, bấm thì cuộn về 0.
 * Chỉ hiện dưới `lg` do class `lg:hidden` — jsdom không tính CSS nên bài kiểm giữ phần logic cuộn.
 */

import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import DemoScrollTopButton from '@/features/demo/library/components/shell/DemoScrollTopButton';

function setup() {
  const el = document.createElement('div');
  let top = 0;
  Object.defineProperty(el, 'scrollTop', { get: () => top, configurable: true });
  el.scrollTo = vi.fn() as unknown as typeof el.scrollTo;
  render(<DemoScrollTopButton scrollRef={{ current: el }} />);
  const scrollTo = (value: number) => {
    top = value;
    act(() => {
      fireEvent.scroll(el);
    });
  };
  return { el, scrollTo };
}

describe('DemoScrollTopButton', () => {
  it('còn ở đầu trang thì chưa có nút', () => {
    setup();
    expect(screen.queryByRole('button', { name: 'Lên đầu trang' })).toBeNull();
  });

  it('cuộn quá ngưỡng thì hiện, cuộn lại gần đầu thì ẩn', () => {
    const { scrollTo } = setup();

    scrollTo(900);
    expect(screen.getByRole('button', { name: 'Lên đầu trang' })).toBeInTheDocument();

    scrollTo(40);
    expect(screen.queryByRole('button', { name: 'Lên đầu trang' })).toBeNull();
  });

  it('bấm nút cuộn vùng cuộn về đầu (top: 0)', () => {
    const { el, scrollTo } = setup();
    scrollTo(900);

    fireEvent.click(screen.getByRole('button', { name: 'Lên đầu trang' }));

    expect(el.scrollTo).toHaveBeenCalledWith(expect.objectContaining({ top: 0 }));
  });
});
