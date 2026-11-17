import { useCallback, useState } from 'react';

/**
 * Đo chiều cao THẬT của tầng header trên (header 2 tầng); gắn `groupRowRef` vào `<tr>` tầng trên, `groupRowHeight` là `top`
 * của tầng dưới. Đọc `contentRect` (chiều cao LAYOUT) — `getBoundingClientRect` bị `transform` của Modal / Drawer đang mở
 * co lại, mà hết hiệu ứng thì không có lần đo nào nữa → tầng dưới dính lệch.
 */
export function useTableGroupRowHeight() {
  const [groupRowHeight, setGroupRowHeight] = useState(0);
  const groupRowRef = useCallback((node: HTMLTableRowElement | null) => {
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => setGroupRowHeight(entry.contentRect.height));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { groupRowHeight, groupRowRef };
}
