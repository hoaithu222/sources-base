'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';

/** Chiều cao px cho arborist: `height` số dùng thẳng, chuỗi ("100%") thì đo `containerRef`. */
export function useTreeContainerHeight(height: number | string) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isFixedHeight = typeof height === 'number';
  const [measuredHeight, setMeasuredHeight] = useState(0);

  useEffect(() => {
    if (isFixedHeight) return;
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      const node = containerRef.current;
      if (node) setMeasuredHeight(node.clientHeight);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [isFixedHeight]);

  // eslint-disable-next-line react-hooks/exhaustive-deps -- CỐ Ý không có dep array: đối chiếu mỗi render để tự chữa phép đo; setState có so-bằng nên không lặp.
  useLayoutEffect(() => {
    if (isFixedHeight) return;
    const el = containerRef.current;
    if (!el) return;
    const real = el.clientHeight;
    setMeasuredHeight((prev) => (prev === real ? prev : real));
  });

  const arboristHeight = isFixedHeight ? height : measuredHeight;

  return { containerRef, arboristHeight };
}
