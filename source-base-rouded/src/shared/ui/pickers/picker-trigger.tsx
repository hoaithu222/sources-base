import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type KeyboardEvent,
} from 'react';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import {
  FIELD_CLEAR_BUTTON_CLASS,
  FIELD_CLEAR_ICON,
  FIELD_CONTROL_CLASS,
  FIELD_HEIGHT,
  FIELD_ICON_CLASS,
  fieldSurface,
  type FieldSize,
} from '@/shared/ui/inputs/field.theme';
import { TOUCH_HIT_CLASSES } from '@/shared/ui/primitives/touch-hit.theme';
import { cn } from '@/shared/utils/style/cn';
import { TEXT_ELLIPSIS_CLASSES } from '@/shared/ui/primitives/text-ellipsis.theme';

type PickerTriggerCursor = 'editable' | 'readonly';
type PickerTriggerIconSide = 'start' | 'end';
type PickerTriggerTextState = 'filled' | 'empty';

interface PickerTriggerProps extends React.HTMLAttributes<HTMLDivElement> {
  open: boolean;
  disabled: boolean;
  invalid?: boolean;
  displayText: string;
  placeholder?: string;
  canClear?: boolean;
  onClear?: (e: React.MouseEvent) => void;
  size?: FieldSize;
  icon?: React.ComponentProps<typeof SystemIcon>['name'] | null;
  iconSide?: PickerTriggerIconSide;
  editable?: boolean;
  onInputChange?: (raw: string) => string | void;
  onInputCommit?: (raw: string) => string | void;
  inputError?: boolean;
  onRequestOpen?: () => void;
  autoFocus?: boolean;
}

const PICKER_TRIGGER_BASE_CLASSES = 'flex items-center gap-2 px-3 select-none text-body-14';

const PICKER_TRIGGER_CURSOR_CLASSES = {
  editable: 'cursor-text',
  readonly: 'cursor-pointer',
} satisfies Record<PickerTriggerCursor, string>;

const PICKER_TRIGGER_ICON_BUTTON_CLASSES = cn(
  FIELD_ICON_CLASS,
  TOUCH_HIT_CLASSES.icon,
  '-ml-0.5 cursor-pointer transition-colors duration-150 ease-out hover:text-fg-heading',
  'disabled:cursor-not-allowed disabled:hover:text-fg-muted',
);

const PICKER_TRIGGER_ICON_CLASSES = {
  start: cn(FIELD_ICON_CLASS, '-ml-0.5'),
  end: FIELD_ICON_CLASS,
} satisfies Record<PickerTriggerIconSide, string>;

/** Cỡ icon lịch / đồng hồ theo cao ô: `sm` 14px · `md` / `lg` 16px — cùng thang icon đầu ô của `Input`. */
const PICKER_TRIGGER_ICON_PX = { sm: 14, md: 16, lg: 16 } satisfies Record<FieldSize, number>;

const PICKER_TRIGGER_INPUT_CLASSES = cn(FIELD_CONTROL_CLASS, 'h-full tabular-nums');

const PICKER_TRIGGER_TEXT_CLASSES = {
  filled: cn(TEXT_ELLIPSIS_CLASSES, 'flex-1 text-body-14 tabular-nums text-fg-heading'),
  empty: cn(TEXT_ELLIPSIS_CLASSES, 'flex-1 text-body-14 text-fg-faint'),
} satisfies Record<PickerTriggerTextState, string>;

/**
 * PickerTrigger — ô kích hoạt panel của mọi picker ngày / giờ: chữ giá trị hoặc placeholder, icon, nút xoá;
 * ở chế độ `editable` là ô gõ thẳng giá trị.
 *
 * Helper NỘI BỘ của nhóm `pickers/`: đặt làm `children` của `Popover` (Radix `asChild` gắn `onClick` /
 * `ref` / `aria-expanded` vào khung ngoài). Nhận thêm mọi thuộc tính của `<div>` cho khung ngoài.
 * Sửa giao diện: class → `PICKER_TRIGGER_*_CLASSES` · cao → `FIELD_HEIGHT` · khung / focus / lỗi / tắt →
 * `fieldSurface` · ô icon / ô nhập / nút ✕ dùng chung `FIELD_ICON_CLASS` / `FIELD_CONTROL_CLASS` /
 * `FIELD_CLEAR_BUTTON_CLASS` của field. Chữ luôn `truncate` (rê chuột thấy đủ qua `title`).
 * Lưu ý: `id` / `aria-*` đi theo phần tử NHẬN FOCUS (`editable` → `<input>`, còn lại → khung ngoài, khi đó
 * khung có `role="button"`, vào được bằng Tab, Enter / Space mở panel). `data-state` luôn lấy từ `open`.
 * Gõ tay: `onInputCommit` PHẢI trả chuỗi chuẩn khi Enter. Lý do: notes/components/pickers.md (## PickerTrigger).
 *
 * @param props.open - Panel đang mở (tô viền focus, `data-state="open"`).
 * @param props.disabled - Khoá ô: không gõ, không vào bằng Tab.
 * @param props.invalid - `true` → viền đỏ + `aria-invalid` (lỗi từ form).
 * @param props.displayText - Giá trị đã format để hiển thị; rỗng → hiện `placeholder`.
 * @param props.placeholder - Chữ gợi ý khi chưa có giá trị (vd `'DD/MM/YYYY'`). Mặc định `''`.
 * @param props.canClear - `true` → hiện nút ✕ "Xóa giá trị". Mặc định `false`.
 * @param props.onClear - Gọi khi bấm ✕ (đã chặn lan, không mở panel).
 * @param props.size - Cao ô: `sm` 32px | `md` 36px | `lg` 40px. Mặc định `md`.
 * @param props.icon - Icon đầu ô (`SystemIcon` name, vd `clock-outline`); `null` = không icon.
 *   Mặc định `calendar-outline`.
 * @param props.iconSide - Chỗ đặt icon khi KHÔNG `editable`: `start` (đầu ô) | `end` (cuối ô — picker tháng).
 *   Mặc định `start`.
 * @param props.editable - `true` → ô `<input>` gõ thẳng giá trị. Mặc định `false`.
 * @param props.onInputChange - Mỗi lần gõ (khi `editable`); trả `string` để viết lại chữ trong ô (vd tự chèn `:`).
 * @param props.onInputCommit - Khi Enter / rời ô; trả `string` dạng chuẩn để ghi lại ô (BẮT BUỘC khi Enter).
 * @param props.inputError - `true` → tô lỗi cho chữ đang gõ. Mặc định `false`.
 * @param props.onRequestOpen - Gọi khi ô nhập nhận focus (click hoặc Tab) — dùng để mở panel.
 * @param props.autoFocus - Focus ô nhập ngay khi mount (vd vừa vào chế độ sửa trên lưới). Mặc định `false`.
 * @param props.id - Gắn lên phần tử nhận focus để nhãn NGOÀI trỏ tới.
 * @param props.aria-labelledby - Gắn lên phần tử nhận focus, trỏ tới nhãn NGOÀI.
 * @param props.aria-describedby - Gắn lên phần tử nhận focus, trỏ tới dòng mô tả / lỗi.
 * @param props.aria-invalid - Ghi đè `aria-invalid`. Mặc định theo `invalid` / `inputError`.
 *
 * @example
 * <Popover content={panel} open={open} onOpenChange={setOpen}>
 *   <PickerTrigger canClear={!!value} disabled={false} displayText={text} editable open={open}
 *     placeholder="DD/MM/YYYY" onClear={clear} onInputCommit={commit} />
 * </Popover>
 */
export function PickerTrigger({
  open,
  disabled,
  invalid,
  displayText,
  placeholder = '',
  canClear = false,
  onClear,
  size = 'md',
  editable = false,
  onInputChange,
  onInputCommit,
  inputError = false,
  onRequestOpen,
  icon = 'calendar-outline',
  iconSide = 'start',
  autoFocus = false,
  className,
  id,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  onKeyDown,
  ...rest
}: PickerTriggerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [buffer, setBuffer] = useState(displayText);

  const isError = invalid || inputError;

  const a11yProps = {
    id,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid ?? (isError || undefined),
  };

  const commit = (raw: string) => {
    const normalized = onInputCommit?.(raw);
    if (typeof normalized === 'string') setBuffer(normalized);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const formatted = onInputChange?.(raw);
    setBuffer(typeof formatted === 'string' ? formatted : raw);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commit(buffer);
    } else if (e.key === 'Escape') {
      setBuffer(displayText);
      (e.target as HTMLInputElement).blur();
    }
  };

  const handleInputBlur = (e: FocusEvent<HTMLInputElement>) => {
    const next = e.relatedTarget as HTMLElement | null;
    if (next && next.closest('[data-radix-popper-content-wrapper]')) return;
    commit(buffer);
  };

  const handleTriggerKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e);
    if (editable || disabled || e.defaultPrevented || e.target !== e.currentTarget) return;
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    e.currentTarget.click();
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClear?.(e);
  };

  useEffect(() => {
    if (!editable) return;
    const focused = document.activeElement === inputRef.current;

    if (!focused) setBuffer(displayText);
  }, [displayText, editable]);

  const triggerClassName = cn(
    PICKER_TRIGGER_BASE_CLASSES,
    FIELD_HEIGHT[size],
    PICKER_TRIGGER_CURSOR_CLASSES[editable ? 'editable' : 'readonly'],
    fieldSurface({ focusMode: 'trigger', invalid: isError, disabled }),
    className,
  );
  const textClassName = PICKER_TRIGGER_TEXT_CLASSES[displayText ? 'filled' : 'empty'];
  const iconAtEnd = !editable && iconSide === 'end';
  const iconPx = PICKER_TRIGGER_ICON_PX[size];
  const staticIcon = icon && (
    <span className={PICKER_TRIGGER_ICON_CLASSES[iconSide]}>
      <SystemIcon name={icon} size={iconPx} />
    </span>
  );
  const readonlyProps = editable
    ? {}
    : {
        ...a11yProps,
        role: 'button',
        tabIndex: disabled ? -1 : 0,
        'aria-disabled': disabled || undefined,
      };

  return (
    <div
      {...rest}
      {...readonlyProps}
      className={triggerClassName}
      data-state={open ? 'open' : 'closed'}
      onKeyDown={handleTriggerKeyDown}
    >
      {icon &&
        !iconAtEnd &&
        (editable ? (
          <button
            aria-label="Mở bảng chọn"
            className={PICKER_TRIGGER_ICON_BUTTON_CLASSES}
            disabled={disabled}
            tabIndex={-1}
            type="button"
            onMouseDown={(e) => e.preventDefault()}
          >
            <SystemIcon name={icon} size={iconPx} />
          </button>
        ) : (
          staticIcon
        ))}

      {editable ? (
        <input
          ref={inputRef}
          {...a11yProps}
          autoFocus={autoFocus}
          className={PICKER_TRIGGER_INPUT_CLASSES}
          disabled={disabled}
          placeholder={placeholder}
          spellCheck={false}
          type="text"
          value={buffer}
          onBlur={handleInputBlur}
          onChange={handleChange}
          onClick={(e) => e.stopPropagation()}
          onFocus={() => onRequestOpen?.()}
          onKeyDown={handleKeyDown}
          onMouseDown={(e) => e.stopPropagation()}
        />
      ) : (
        <span className={textClassName} title={displayText || undefined}>
          {displayText || placeholder}
        </span>
      )}

      {canClear && (
        <button
          aria-label="Xóa giá trị"
          className={FIELD_CLEAR_BUTTON_CLASS}
          tabIndex={-1}
          type="button"
          onClick={handleClear}
          onMouseDown={(e) => e.preventDefault()}
        >
          <SystemIcon name="xmark-outline" size={FIELD_CLEAR_ICON.all} />
        </button>
      )}

      {iconAtEnd && staticIcon}
    </div>
  );
}
