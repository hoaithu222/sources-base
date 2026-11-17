import { useEffect, useRef, useState } from 'react';

import { usePrefersReducedMotion } from '../browser/usePrefersReducedMotion';

export interface UseCountUpOptions {
  duration?: number;
  disabled?: boolean;
}

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

/**
 * `const shown = useCountUp(value, { duration, disabled })` — số chạy tới `value` bằng rAF (`duration` ms, mặc định 900).
 * Trả SỐ ĐANG CHẠY (chỉ để HIỂN THỊ); `prefers-reduced-motion` hoặc `disabled` → trả thẳng `value`.
 */
export function useCountUp(target: number, options: UseCountUpOptions = {}): number {
  const { duration = 900, disabled = false } = options;
  const reducedMotion = usePrefersReducedMotion();
  const skip = disabled || reducedMotion || !Number.isFinite(target);

  const [display, setDisplay] = useState(() => (skip ? target : 0));

  const displayRef = useRef(display);

  useEffect(() => {
    if (skip) {
      displayRef.current = target;
      setDisplay(target);
      return;
    }

    const from = displayRef.current;
    if (from === target) return;

    let frame = 0;
    let start: number | null = null;

    const step = (now: number) => {
      start ??= now;
      const progress = Math.min(1, (now - start) / duration);
      const next = progress === 1 ? target : from + (target - from) * easeOutCubic(progress);
      displayRef.current = next;
      setDisplay(next);
      if (progress < 1) frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, duration, skip]);

  return display;
}
