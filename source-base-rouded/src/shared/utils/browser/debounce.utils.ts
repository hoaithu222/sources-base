export interface DebouncedFunction<TArgs extends unknown[]> {
  (...args: TArgs): void;
  /** Huỷ lần gọi đang chờ. Gọi trong cleanup effect — không thì `fn` vẫn chạy sau khi unmount. */
  cancel: () => void;
  /** Chạy NGAY lần gọi đang chờ (nếu có) thay vì đợi hết `wait`. */
  flush: () => void;
}

/**
 * Hoãn `fn` tới khi ngừng gọi `wait` ms: `const save = debounce(() => api.save(v), 300)`.
 * Trả `void` (không có giá trị lần chạy trước); chỉ có `.cancel()` / `.flush()` —
 * không `leading` / `trailing` / `maxWait` như lodash.
 */
export function debounce<TArgs extends unknown[]>(
  fn: (...args: TArgs) => unknown,
  wait = 0,
): DebouncedFunction<TArgs> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let pendingArgs: TArgs | undefined;

  const cancel = () => {
    if (timer !== undefined) clearTimeout(timer);
    timer = undefined;
    pendingArgs = undefined;
  };

  const invoke = () => {
    const args = pendingArgs;
    timer = undefined;
    pendingArgs = undefined;
    if (args) fn(...args);
  };

  const debounced = (...args: TArgs) => {
    pendingArgs = args;
    if (timer !== undefined) clearTimeout(timer);
    timer = setTimeout(invoke, wait);
  };

  debounced.cancel = cancel;
  debounced.flush = () => {
    if (timer === undefined) return;
    clearTimeout(timer);
    invoke();
  };

  return debounced;
}
