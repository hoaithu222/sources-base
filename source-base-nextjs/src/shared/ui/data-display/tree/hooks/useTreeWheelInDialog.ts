'use client';

import { useEffect } from 'react';
import type { RefObject } from 'react';

import { OPEN_DIALOG_SELECTOR } from '@/shared/constants/dom.constants';

/** Cho lăn chuột cuộn được cây nằm trong Radix Dialog (react-remove-scroll chặn `wheel` ở document). */
export function useTreeWheelInDialog(containerRef: RefObject<HTMLDivElement | null>): void {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const onWheel = (event: WheelEvent) => {
      if (!document.querySelector(OPEN_DIALOG_SELECTOR)) return;
      let node = event.target as HTMLElement | null;
      while (node && node !== container.parentElement) {
        if (node.scrollHeight > node.clientHeight) {
          const overflowY = getComputedStyle(node).overflowY;
          if (overflowY === 'auto' || overflowY === 'scroll') {
            event.preventDefault();
            node.scrollTop += event.deltaY;
            return;
          }
        }
        node = node.parentElement;
      }
    };
    container.addEventListener('wheel', onWheel, { passive: false });
    return () => container.removeEventListener('wheel', onWheel);
  }, [containerRef]);
}
