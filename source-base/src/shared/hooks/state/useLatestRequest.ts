import { useCallback, useEffect, useRef } from 'react';

/**
 * Chỉ lượt gọi MỚI NHẤT được ghi state — lượt cũ về muộn thì bị bỏ qua.
 *
 * Dùng:   const { begin, invalidate } = useLatestRequest();
 *         const isCurrent = begin();            // ngay trước khi gọi API
 *         const data = await api(); if (!isCurrent()) return;   // sau MỖI await, trước setState
 * Lưu ý:  `begin()` vô hiệu mọi lượt trước đó; `invalidate()` vô hiệu tất cả (reset / đổi dữ liệu cha).
 *         Unmount tự vô hiệu, và `begin()` gọi sau unmount trả checker luôn `false`.
 *         `begin` / `invalidate` giữ identity qua mọi lần render nên dùng thẳng được trong deps.
 */

export function useLatestRequest() {
  const seq = useRef(0);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      seq.current += 1;
    };
  }, []);

  const begin = useCallback(() => {
    const id = ++seq.current;
    return () => alive.current && seq.current === id;
  }, []);

  const invalidate = useCallback(() => {
    seq.current += 1;
  }, []);

  return { begin, invalidate };
}
