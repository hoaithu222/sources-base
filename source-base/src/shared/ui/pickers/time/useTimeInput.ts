import { useCallback, useEffect, useRef, useState } from 'react';
import { isCompleteDigitEntry, parseTimeInput, shouldReportWhileTyping } from './parse-time.utils';

interface UseTimeInputOptions {
  onCommit: (value: string | null) => void;
  /** Số ms im lặng thì coi như gõ xong → validate + lưu. `0` = tắt debounce. */
  commitDelay: number;
  /** Gọi khi người dùng chốt HẲN (Enter / rời ô) — dùng để đóng panel. */
  onSettled: () => void;
  /** Đẩy message lỗi ra ngoài để form hiện dưới field. `null` = hợp lệ. */
  onParseError?: (message: string | null) => void;
}

interface UseTimeInputResult {
  parseError: string | null;
  reset: () => void;
  handleInputChange: (raw: string) => string | void;
  handleInputCommit: (raw: string) => string | void;
}

/**
 * useTimeInput — hành vi GÕ TAY của `TimePicker`: kiểm cú pháp, báo lỗi, tự chốt khi ngừng gõ.
 *
 * Hook NỘI BỘ; `handleInputChange` / `handleInputCommit` gắn vào `onInputChange` / `onInputCommit` của
 * `PickerTrigger`, gọi `reset()` khi giá trị đổi bằng đường khác (bấm cột, nút xoá).
 * Lưu ý: nhánh ngừng-gõ chỉ LƯU, KHÔNG ghi lại chữ trong ô (gõ tiếp sẽ hỏng); ba đường chốt (đang gõ ·
 * ngừng gõ · Enter / rời ô) ở notes/components/pickers.md (## useTimeInput).
 *
 * @returns `{ parseError, reset, handleInputChange, handleInputCommit }`.
 *
 * @example
 * const { parseError, reset, handleInputChange, handleInputCommit } = useTimeInput({
 *   commitDelay: 500, onCommit: onChange, onParseError, onSettled: closePanel });
 */
export function useTimeInput({
  onCommit,
  commitDelay,
  onSettled,
  onParseError,
}: UseTimeInputOptions): UseTimeInputResult {
  const [parseError, setParseError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const latest = useRef({ onCommit, onSettled, onParseError });
  useEffect(() => {
    latest.current = { onCommit, onSettled, onParseError };
  });

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const report = useCallback((message: string | null) => {
    setParseError(message);
    latest.current.onParseError?.(message);
  }, []);

  const cancelPending = useCallback(() => clearTimeout(timerRef.current), []);

  const reset = useCallback(() => {
    cancelPending();
    report(null);
  }, [cancelPending, report]);

  const commit = useCallback(
    (raw: string): string | undefined => {
      const res = parseTimeInput(raw);
      if (!res.ok) {
        report(res.message);
        return undefined;
      }
      latest.current.onCommit(res.value);
      report(null);
      return res.value ?? '';
    },
    [report],
  );

  const handleInputChange = useCallback(
    (raw: string) => {
      const res = parseTimeInput(raw);
      report(res.ok || !shouldReportWhileTyping(raw) ? null : res.message);

      cancelPending();
      if (commitDelay > 0) {
        timerRef.current = setTimeout(() => void commit(raw), commitDelay);
      }

      if (res.ok && res.value && isCompleteDigitEntry(raw)) return res.value;
    },
    [cancelPending, commit, commitDelay, report],
  );

  const handleInputCommit = useCallback(
    (raw: string) => {
      cancelPending();
      const normalized = commit(raw);
      if (normalized === undefined) return;
      latest.current.onSettled();
      return normalized;
    },
    [cancelPending, commit],
  );

  return { parseError, reset, handleInputChange, handleInputCommit };
}
