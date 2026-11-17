'use client';

import { useCallback, useLayoutEffect, useRef, useState } from 'react';

import { safeStorage } from '@/shared/utils/browser/storage.utils';

type SetValue<T> = (value: T | ((prev: T) => T)) => void;

function readStored<T>(key: string, initialValue: T, parse?: (raw: unknown) => T | undefined): T {
  const item = safeStorage.getItem(key);
  if (!item) return initialValue;
  try {
    const raw: unknown = JSON.parse(item);
    if (!parse) return raw as T;
    const parsed = parse(raw);
    return parsed === undefined ? initialValue : parsed;
  } catch {
    return initialValue;
  }
}

function writeStored(key: string, value: unknown): void {
  try {
    safeStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Giá trị không tuần tự hoá được (vòng tham chiếu, BigInt): giữ trong bộ nhớ, bỏ ghi đĩa.
  }
}

/**
 * `const [value, setValue, removeValue] = useLocalStorage(key, initial, { parse })` — `setValue` nhận cả `(prev) => next`.
 * Đổi `key` thì đọc lại khoá mới. `parse(raw)` kiểm giá trị đọc ra (đã `JSON.parse`): trả `undefined` → dùng `initial`.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options?: { parse?: (raw: unknown) => T | undefined },
): [T, SetValue<T>, () => void] {
  const parse = options?.parse;
  const [state, setState] = useState(() => ({ key, value: readStored(key, initialValue, parse) }));

  let current = state;
  if (state.key !== key) {
    current = { key, value: readStored(key, initialValue, parse) };
    setState(current);
  }

  const latest = useRef({ value: current.value, initialValue });
  useLayoutEffect(() => {
    latest.current = { value: current.value, initialValue };
  });

  const commit = useCallback(
    (next: T) => {
      latest.current.value = next;
      setState((prev) =>
        prev.key === key && Object.is(prev.value, next) ? prev : { key, value: next },
      );
    },
    [key],
  );

  const setValue: SetValue<T> = useCallback(
    (value) => {
      const next = value instanceof Function ? value(latest.current.value) : value;
      commit(next);
      writeStored(key, next);
    },
    [key, commit],
  );

  const removeValue = useCallback(() => {
    commit(latest.current.initialValue);
    safeStorage.removeItem(key);
  }, [key, commit]);

  return [current.value, setValue, removeValue];
}
