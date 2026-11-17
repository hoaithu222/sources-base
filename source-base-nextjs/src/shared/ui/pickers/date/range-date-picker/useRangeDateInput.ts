'use client';

import { useCallback } from 'react';
import type { Dayjs } from 'dayjs';
import type { DateRange } from '../shared/date-picker.types';
import { tryParseDateRange } from '../shared/parse-date.utils';

interface UseRangeDateInputOptions {
  allParseFormats: string[];
  isOff: (date: Dayjs) => boolean;
  onRangeChange?: (range: DateRange) => void;
  setPendingFrom: (date: Dayjs | null) => void;
  setTriggerError: (error: boolean) => void;
  setViewMonth: (month: Dayjs) => void;
}

/**
 * useRangeDateInput — GÕ TAY khoảng ngày của `RangeDatePicker`: kiểm tra khi gõ, chốt khi Enter / rời ô.
 *
 * Hook NỘI BỘ; hai handler gắn vào `onInputChange` / `onInputCommit` của `PickerTrigger`.
 * Lưu ý: gõ chỉ cập nhật cờ lỗi + tháng đang xem; chỉ Enter / rời ô mới gọi `onRangeChange`. Ô rỗng khi
 * chốt = xoá khoảng.
 *
 * @returns `{ handleTriggerInputChange, handleTriggerInputCommit }`.
 *
 * @example
 * const { handleTriggerInputChange, handleTriggerInputCommit } = useRangeDateInput({ allParseFormats,
 *   isOff, onRangeChange, setPendingFrom, setTriggerError, setViewMonth });
 */
export function useRangeDateInput({
  allParseFormats,
  isOff,
  onRangeChange,
  setPendingFrom,
  setTriggerError,
  setViewMonth,
}: UseRangeDateInputOptions) {
  const handleTriggerInputChange = useCallback(
    (raw: string) => {
      if (!raw.trim()) {
        setTriggerError(false);
        return;
      }
      const parsed = tryParseDateRange(raw, allParseFormats);
      if (!parsed) {
        setTriggerError(true);
        return;
      }
      if (parsed.from && isOff(parsed.from)) {
        setTriggerError(true);
        return;
      }
      if (parsed.to && isOff(parsed.to)) {
        setTriggerError(true);
        return;
      }
      setTriggerError(false);
      if (parsed.from) setViewMonth(parsed.from.startOf('month'));
    },
    [allParseFormats, isOff, setTriggerError, setViewMonth],
  );

  const handleTriggerInputCommit = useCallback(
    (raw: string) => {
      const trimmed = raw.trim();
      if (!trimmed) {
        onRangeChange?.({ from: null, to: null });
        setPendingFrom(null);
        setTriggerError(false);
        return;
      }
      const parsed = tryParseDateRange(trimmed, allParseFormats);
      if (!parsed) {
        setTriggerError(true);
        return;
      }
      if (parsed.from && isOff(parsed.from)) {
        setTriggerError(true);
        return;
      }
      if (parsed.to && isOff(parsed.to)) {
        setTriggerError(true);
        return;
      }
      onRangeChange?.({
        from: parsed.from ? parsed.from.toDate() : null,
        to: parsed.to ? parsed.to.toDate() : null,
      });
      setPendingFrom(null);
      setTriggerError(false);
    },
    [allParseFormats, isOff, onRangeChange, setPendingFrom, setTriggerError],
  );

  return { handleTriggerInputChange, handleTriggerInputCommit };
}
