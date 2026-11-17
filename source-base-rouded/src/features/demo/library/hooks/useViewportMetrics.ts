import { useEffect, useState } from 'react';

import { useMediaQuery } from '@/shared/hooks';

export interface DemoSafeInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface DemoViewportMetrics {
  width: number;
  height: number;
  dpr: number;
  safe: DemoSafeInsets;
  /** Con trỏ chính của máy: `coarse` ngón tay · `fine` chuột / trackpad · `none` không có. */
  pointer: 'coarse' | 'fine' | 'none';
  hover: boolean;
  standalone: boolean;
}

const EMPTY_SAFE: DemoSafeInsets = { top: 0, right: 0, bottom: 0, left: 0 };

const toPx = (value: string | undefined) => Number.parseFloat(value ?? '') || 0;

function readSafe(probe: HTMLElement | null): DemoSafeInsets {
  if (!probe) return EMPTY_SAFE;
  const style = getComputedStyle(probe);
  return {
    top: toPx(style.paddingTop),
    right: toPx(style.paddingRight),
    bottom: toPx(style.paddingBottom),
    left: toPx(style.paddingLeft),
  };
}

const sameSafe = (a: DemoSafeInsets, b: DemoSafeInsets) =>
  a.top === b.top && a.right === b.right && a.bottom === b.bottom && a.left === b.left;

/**
 * useViewportMetrics — số đo TRỰC TIẾP của khung nhìn: `innerWidth × innerHeight`, `devicePixelRatio`, bốn
 * `--safe-*` đã giải ra px, con trỏ chính / hover và chế độ toàn màn. Cập nhật khi đổi cỡ, xoay máy, zoom.
 *
 * `--safe-*` là chuỗi `env(...)` thô nên phải đo qua phần tử thăm dò có `padding: var(--safe-*)` —
 * truyền ref của nó vào đây (nó nằm trong DOM của nơi gọi, ẩn, không chiếm chỗ).
 *
 * @param probeRef - Ref tới phần tử thăm dò `padding: var(--safe-t) var(--safe-r) var(--safe-b) var(--safe-l)`.
 * @returns Số đo hiện tại (px / hệ số), đo lại mỗi `resize` / `orientationchange` / thu phóng.
 *
 * @example
 * const probeRef = useRef<HTMLDivElement>(null);
 * const { width, height, safe } = useViewportMetrics(probeRef);
 */
export function useViewportMetrics(
  probeRef: React.RefObject<HTMLElement | null>,
): DemoViewportMetrics {
  const coarse = useMediaQuery('(pointer: coarse)');
  const fine = useMediaQuery('(pointer: fine)');
  const hover = useMediaQuery('(hover: hover)');
  const standalone = useMediaQuery('(display-mode: standalone)');

  const [size, setSize] = useState(() => ({
    width: typeof window === 'undefined' ? 0 : window.innerWidth,
    height: typeof window === 'undefined' ? 0 : window.innerHeight,
    dpr: typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1,
  }));
  const [safe, setSafe] = useState<DemoSafeInsets>(EMPTY_SAFE);

  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      setSize((prev) => {
        const next = {
          width: window.innerWidth,
          height: window.innerHeight,
          dpr: window.devicePixelRatio || 1,
        };
        return prev.width === next.width && prev.height === next.height && prev.dpr === next.dpr
          ? prev
          : next;
      });
      const nextSafe = readSafe(probeRef.current);
      setSafe((prev) => (sameSafe(prev, nextSafe) ? prev : nextSafe));
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener('resize', schedule);
    window.addEventListener('orientationchange', schedule);
    window.visualViewport?.addEventListener('resize', schedule);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('orientationchange', schedule);
      window.visualViewport?.removeEventListener('resize', schedule);
    };
  }, [probeRef]);

  let pointer: DemoViewportMetrics['pointer'] = 'none';
  if (coarse) pointer = 'coarse';
  else if (fine) pointer = 'fine';
  return { ...size, safe, pointer, hover, standalone };
}
