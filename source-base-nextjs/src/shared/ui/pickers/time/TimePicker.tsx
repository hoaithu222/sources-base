'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useMemo, useState } from 'react';
import { OPEN_DIALOG_SELECTOR } from '@/shared/constants/dom.constants';
import Popover from '@/shared/ui/overlays/Popover';
import type { FieldSize } from '@/shared/ui/inputs/field.theme';
import { formatTimeValue, splitTimeValue } from './parse-time.utils';
import { PickerTrigger } from '../picker-trigger';
import { TimeColumn } from './time-column';
import { useTimeInput } from './useTimeInput';

export type TimePickerSize = FieldSize;

export interface TimePickerProps {
  value?: string | null;
  onChange?: (value: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  size?: TimePickerSize;
  className?: string;
  minuteStep?: number;
  allowManualInput?: boolean;
  autoFocus?: boolean;
  onParseError?: (message: string | null) => void;
  commitDelay?: number;
  id?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
}

const TIME_PICKER_CLASSES = {
  panel: 'w-44 p-0',
  hourColumn: 'border-r border-divider-nav',
  error: 'border-t border-divider-nav px-3 py-2 text-caption-12 text-error',
};

/**
 * TimePicker — chọn GIỜ trong ngày ("HH:mm", 24h): bấm từ 2 cột Giờ · Phút hoặc gõ thẳng vào ô.
 *
 * Ngày + giờ → `DateTimePicker`. Trong form dùng `TimeField` (đã nối nhãn, hiện lỗi gõ tay qua `onParseError`).
 * Sửa giao diện: panel → `TIME_PICKER_CLASSES` · cột giờ / phút → `time-column.tsx` · gõ tay →
 * `useTimeInput.ts` + `parse-time.utils.ts` · ô kích hoạt → `picker-trigger.tsx`.
 * Lưu ý: gõ tay đọc số theo độ dài như bàn phím số: `1530` → 15:30, `930` → 09:30, `15` → 15:00; ô rỗng khi
 * chốt = xoá giá trị. Giá trị gõ sai KHÔNG được lưu (giá trị cũ giữ nguyên) — chỉ báo qua `onParseError`.
 * Trong Modal panel portal vào `DialogContent` để cột cuộn được.
 * Lý do thiết kế: docs/notes/components/pickers.md (## TimePicker, ## useTimeInput).
 *
 * @param props.value - Giờ đang chọn dạng `"HH:mm"` (24h); `null` / `undefined` = chưa chọn.
 * @param props.onChange - Gọi với `"HH:mm"` mới (bấm cột, gõ xong, Enter / rời ô); `null` khi xoá.
 * @param props.placeholder - Chữ khi chưa chọn. Mặc định `'HH:mm'`.
 * @param props.disabled - Khoá ô: không mở panel, không gõ, ẩn ✕. Mặc định `false`.
 * @param props.invalid - `true` → viền đỏ + `aria-invalid` (lỗi từ form). Mặc định `false`.
 * @param props.size - Cao ô: `sm` 32px | `md` 36px | `lg` 40px. Mặc định `md`.
 * @param props.className - Class thêm cho ô kích hoạt.
 * @param props.minuteStep - Bước phút trong DANH SÁCH chọn (phút); KHÔNG ràng buộc giá trị gõ tay. Mặc định `1`.
 * @param props.allowManualInput - `true` → gõ giờ thẳng vào ô; `false` → ô chỉ bấm để mở panel.
 *   Mặc định `true`.
 * @param props.autoFocus - Focus ô ngay khi mount → tự mở panel (vd vừa vào chế độ sửa trên lưới).
 *   Mặc định `false`.
 * @param props.onParseError - Nhận câu báo lỗi (theo ngôn ngữ hiện tại) khi gõ sai; `null` khi hợp lệ trở lại.
 * @param props.commitDelay - Ngừng gõ bao nhiêu ms thì tự kiểm + lưu (không cần Enter); `0` = chỉ chốt khi
 *   Enter / rời ô. Mặc định `500`.
 * @param props.id - Gắn lên phần tử nhận focus để nhãn NGOÀI trỏ tới.
 * @param props.aria-labelledby - Trỏ tới nhãn NGOÀI (các `*Field` của form truyền vào).
 * @param props.aria-describedby - Trỏ tới dòng mô tả / lỗi.
 * @param props.aria-invalid - Ghi đè `aria-invalid`. Mặc định theo `invalid` / lỗi gõ tay.
 *
 * @example
 * <TimePicker value={time} onChange={setTime} minuteStep={15} onParseError={setTimeError} />
 *
 * <TimePicker allowManualInput={false} size="sm" value="09:30" onChange={setTime} />
 */
function TimePicker({
  value,
  onChange,
  placeholder = 'HH:mm',
  disabled = false,
  invalid = false,
  size,
  className,
  minuteStep = 1,
  allowManualInput = true,
  autoFocus = false,
  onParseError,
  commitDelay = 500,
  id,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
}: TimePickerProps) {
  const t = useTranslations('ui.pickers');
  const [open, setOpen] = useState(false);
  const [container, setContainer] = useState<HTMLElement | null>(null);

  const { hour: selHour, minute: selMinute } = useMemo(() => splitTimeValue(value), [value]);

  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);
  const minutes = useMemo(
    () =>
      Array.from({ length: Math.ceil(60 / minuteStep) }, (_, i) => i * minuteStep).filter(
        (m) => m < 60,
      ),
    [minuteStep],
  );

  const closePanel = useCallback(() => setOpen(false), []);

  const { parseError, reset, handleInputChange, handleInputCommit } = useTimeInput({
    commitDelay,
    onCommit: (next) => onChange?.(next),
    onParseError,
    onSettled: closePanel,
  });

  const pickHour = useCallback(
    (h: number) => {
      onChange?.(formatTimeValue(h, selMinute ?? 0));
      reset();
    },
    [onChange, selMinute, reset],
  );

  const pickMinute = useCallback(
    (m: number) => {
      onChange?.(formatTimeValue(selHour ?? 0, m));
      reset();
    },
    [onChange, selHour, reset],
  );

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange?.(null);
      reset();
    },
    [onChange, reset],
  );

  const handleOpenChange = useCallback((next: boolean) => {
    if (next) {
      setContainer((document.querySelector(OPEN_DIALOG_SELECTOR) as HTMLElement) ?? null);
    }
    setOpen(next);
  }, []);

  return (
    <Popover
      align="start"
      className={TIME_PICKER_CLASSES.panel}
      container={container}
      content={
        <>
          <div className="flex">
            <TimeColumn
              className={TIME_PICKER_CLASSES.hourColumn}
              items={hours}
              label={t('time.hour')}
              value={selHour}
              onPick={pickHour}
            />
            <TimeColumn
              items={minutes}
              label={t('time.minute')}
              value={selMinute}
              onPick={pickMinute}
            />
          </div>
          {parseError && <p className={TIME_PICKER_CLASSES.error}>{parseError}</p>}
        </>
      }
      disabled={disabled}
      open={open}
      sideOffset={6}
      onOpenAutoFocus={(e) => e.preventDefault()}
      onOpenChange={disabled ? undefined : handleOpenChange}
    >
      <PickerTrigger
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid}
        aria-labelledby={ariaLabelledBy}
        autoFocus={autoFocus}
        canClear={!!value && !disabled}
        className={className}
        disabled={disabled}
        displayText={value ?? ''}
        editable={allowManualInput}
        icon={null}
        id={id}
        inputError={!!parseError}
        invalid={invalid}
        open={open}
        placeholder={placeholder}
        size={size}
        onClear={handleClear}
        onInputChange={handleInputChange}
        onInputCommit={handleInputCommit}
        onRequestOpen={() => !disabled && handleOpenChange(true)}
      />
    </Popover>
  );
}

export default TimePicker;
