'use client';

import { useCallback, useLayoutEffect, useState } from 'react';

export interface ElementSize {
  width: number;
  height: number;
}

/**
 * `const [boxRef, { width, height }] = useElementSize<HTMLDivElement>()` — gắn `boxRef` vào phần tử cần đo.
 * Content box (px, đã trừ padding), đo đồng bộ khi gắn node rồi bám ResizeObserver; `{0, 0}` khi chưa gắn.
 */
export function useElementSize<T extends HTMLElement>() {
  const [node, setNode] = useState<T | null>(null);
  const [size, setSize] = useState<ElementSize>({ width: 0, height: 0 });

  const ref = useCallback((el: T | null) => setNode(el), []);

  useLayoutEffect(() => {
    if (!node) return;

    const apply = (width: number, height: number) =>
      setSize((prev) =>
        Math.abs(prev.width - width) < 1 && Math.abs(prev.height - height) < 1
          ? prev
          : { width, height },
      );

    const cs = getComputedStyle(node);
    apply(
      node.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight),
      node.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom),
    );

    if (typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver((entries) => {
      const box = entries[0]?.contentRect;
      if (!box) return;
      apply(box.width, box.height);
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, [node]);

  return [ref, size] as const;
}
