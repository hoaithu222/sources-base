'use client';

import { useEffect, useMemo, useState } from 'react';
import { useEventCallback, useLatestRequest } from '@/shared/hooks';
import { debounce } from '@/shared/utils/browser/debounce.utils';

interface UseAsyncValidationOptions {
  fn: (value: string) => Promise<boolean>;
  debounceMs?: number;
  errorMessage: string;
}

/**
 * useAsyncValidation — kiểm một giá trị qua API có debounce (email / tên đăng nhập đã tồn tại chưa…).
 *
 * Gọi `validate(value)` ở `onBlur` (hoặc khi gõ) rồi hiện `asyncError` dưới ô. Chỉ lượt kiểm MỚI NHẤT được
 * ghi `asyncError` / `isValidating`; `validate('')` và `reset()` huỷ cả lượt đang chờ lẫn lượt đang chạy.
 * Lưu ý: `fn` ném lỗi (mất mạng) → coi như hợp lệ; ràng buộc thật vẫn do máy chủ kiểm lúc gửi.
 *
 * @param options.fn - `(value) => Promise<boolean>`: `true` = HỢP LỆ, `false` = không hợp lệ. Luôn gọi bản
 *   mới nhất, không cần `useCallback`.
 * @param options.debounceMs - Thời gian chờ trước khi gọi `fn`, ms. Mặc định `500`.
 * @param options.errorMessage - Câu lỗi khi `fn` trả `false`.
 * @returns `{ validate, isValidating, asyncError, reset }` — `validate` / `reset` giữ nguyên identity.
 *
 * @example
 * const { validate, isValidating, asyncError } = useAsyncValidation({
 *   fn: (email) => api.isEmailFree(email),
 *   errorMessage: 'Email đã được dùng',
 * });
 */
export function useAsyncValidation({
  fn,
  debounceMs = 500,
  errorMessage,
}: UseAsyncValidationOptions) {
  const [isValidating, setIsValidating] = useState(false);
  const [asyncError, setAsyncError] = useState<string | undefined>();
  const { begin, invalidate } = useLatestRequest();

  const run = useEventCallback(async (value: string) => {
    const isCurrent = begin();
    setIsValidating(true);
    let error: string | undefined;
    try {
      error = (await fn(value)) ? undefined : errorMessage;
    } catch {
      error = undefined;
    }
    if (!isCurrent()) return;
    setAsyncError(error);
    setIsValidating(false);
  });

  const debouncedRun = useMemo(() => debounce(run, debounceMs), [run, debounceMs]);

  useEffect(() => () => debouncedRun.cancel(), [debouncedRun]);

  const reset = useEventCallback(() => {
    debouncedRun.cancel();
    invalidate();
    setAsyncError(undefined);
    setIsValidating(false);
  });

  const validate = useEventCallback((value: string) => {
    if (!value) {
      reset();
      return;
    }
    invalidate();
    debouncedRun(value);
  });

  return { validate, isValidating, asyncError, reset };
}
