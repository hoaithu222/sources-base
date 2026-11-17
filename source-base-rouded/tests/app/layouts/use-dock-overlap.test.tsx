/**
 * `useDockOverlap` — Dock ghim đáy đè lên trang khoá cao: vùng cuộn `[data-dock-aware]` NẰM DƯỚI Dock nhận
 * `--dock-overlap` = phần bị lấn + khe 8px; vùng lệch ngang khỏi Dock, vùng thò khỏi màn (trang trôi) hoặc khi tắt thì không.
 * jsdom không dựng layout → rect giả lập bằng `vi.spyOn`.
 */

import { act, render } from '@testing-library/react';
import { useRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useDockOverlap } from '@/app/layouts/useDockOverlap';

type Box = { top: number; bottom: number; left: number; right: number };

const rect = ({ top, bottom, left, right }: Box) =>
  ({
    top,
    bottom,
    left,
    right,
    width: right - left,
    height: bottom - top,
    x: left,
    y: top,
  }) as DOMRect;

function Shell({ enabled }: { enabled: boolean }) {
  const mainRef = useRef<HTMLElement>(null);
  useDockOverlap(mainRef, enabled);
  return (
    <>
      <main ref={mainRef}>
        <div data-page-shell="scroll">
          <div data-dock-aware="margin" data-testid="under">
            <div data-dock-aware="margin" data-testid="nested" />
          </div>
          <div data-dock-aware data-testid="aside" />
          <div data-dock-aware data-testid="tall" />
        </div>
        <div data-page-shell="flow">
          <div data-dock-aware data-testid="flow" />
        </div>
      </main>
      <nav className="dock-shell" />
    </>
  );
}

const BOXES: Record<string, Box> = {
  under: { top: 200, bottom: 884, left: 16, right: 1000 },
  nested: { top: 300, bottom: 884, left: 16, right: 1000 },
  flow: { top: 200, bottom: 884, left: 16, right: 1000 },
  aside: { top: 200, bottom: 884, left: 1300, right: 1900 },
  tall: { top: 200, bottom: 2400, left: 16, right: 1900 },
  dock: { top: 830, bottom: 888, left: 760, right: 1160 },
};

function mockLayout() {
  vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(900);
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
    this: HTMLElement,
  ) {
    const key = this.classList.contains('dock-shell') ? 'dock' : this.dataset.testid;
    return rect(BOXES[key ?? ''] ?? { top: 0, bottom: 0, left: 0, right: 0 });
  });
}

const nextFrame = () =>
  act(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())));

afterEach(() => vi.restoreAllMocks());

describe('useDockOverlap', () => {
  it('chỉ vùng nằm dưới Dock (cùng dải ngang, trọn trong màn) nhận --dock-overlap = lấn + 8px', async () => {
    mockLayout();
    const { getByTestId } = render(<Shell enabled />);
    await nextFrame();

    expect(getByTestId('under').style.getPropertyValue('--dock-overlap')).toBe('62px');
    expect(getByTestId('aside').style.getPropertyValue('--dock-overlap')).toBe('');
    expect(getByTestId('tall').style.getPropertyValue('--dock-overlap')).toBe('');
  });

  it('vùng nằm trong vùng đã chừa thì bỏ qua; trang trôi (không khoá cao) không bao giờ bị ghi', async () => {
    mockLayout();
    const { getByTestId } = render(<Shell enabled />);
    await nextFrame();

    expect(getByTestId('nested').style.getPropertyValue('--dock-overlap')).toBe('');
    expect(getByTestId('flow').style.getPropertyValue('--dock-overlap')).toBe('');
  });

  it('tắt (Dock không ghim đáy) → không ghi gì; gỡ hook → dọn biến', async () => {
    mockLayout();
    const { getByTestId, rerender, unmount } = render(<Shell enabled={false} />);
    await nextFrame();
    expect(getByTestId('under').style.getPropertyValue('--dock-overlap')).toBe('');

    rerender(<Shell enabled />);
    await nextFrame();
    const under = getByTestId('under');
    expect(under.style.getPropertyValue('--dock-overlap')).toBe('62px');

    unmount();
    expect(under.style.getPropertyValue('--dock-overlap')).toBe('');
  });
});
