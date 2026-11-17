'use client';

import { useCallback, useEffect, useState, type RefObject } from 'react';

/**
 * `const { isFullscreen, toggle } = useFullscreen(ref)` — `ref` là element sẽ phóng to (gắn vào JSX).
 * `isFullscreen` đồng bộ qua `fullscreenchange` (ESC vẫn đúng); bị trình duyệt từ chối thì im lặng.
 */
export function useFullscreen<T extends HTMLElement>(ref: RefObject<T | null>) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const sync = () => setIsFullscreen(document.fullscreenElement === ref.current);
    document.addEventListener('fullscreenchange', sync);
    return () => document.removeEventListener('fullscreenchange', sync);
  }, [ref]);

  const toggle = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    if (document.fullscreenElement === el) {
      void document.exitFullscreen();
    } else {
      void el.requestFullscreen().catch(() => undefined);
    }
  }, [ref]);

  return { isFullscreen, toggle };
}
