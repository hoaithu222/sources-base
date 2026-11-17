import { useCallback, useLayoutEffect, useRef } from 'react';

/**
 * `const stable = useEventCallback(fn)` — identity ổn định giữa các render nhưng luôn gọi bản `fn` mới nhất.
 * Dùng khi truyền handler xuống component / cột được memo mà không muốn rebuild mỗi render (vd bảng khi gõ).
 */
export function useEventCallback<T extends (...args: never[]) => unknown>(fn: T): T {
  const ref = useRef(fn);
  useLayoutEffect(() => {
    ref.current = fn;
  });
  return useCallback(
    (...args: Parameters<T>): ReturnType<T> => ref.current(...args) as ReturnType<T>,
    [],
  ) as T;
}
