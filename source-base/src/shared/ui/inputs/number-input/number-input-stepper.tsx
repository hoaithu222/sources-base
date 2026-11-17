import { SystemIcon } from '@/shared/ui/icons/Icons';
import { cn } from '@/shared/utils/style/cn';
import type { NumberInputBorder, NumberInputSize } from './number-input.types';

interface NumberInputStepperProps {
  border: NumberInputBorder;
  size: NumberInputSize;
  disabled?: boolean;
  atMax: boolean;
  atMin: boolean;
  className?: string;
  buttonClassName?: string;
  onStep: (direction: 1 | -1) => void;
  onMouseDown: React.MouseEventHandler;
}

const NUMBER_INPUT_STEPPER_CLASSES = {
  default: 'flex shrink-0 flex-col border-l border-border-default',
  none: 'flex shrink-0 flex-col',
  bottomLine: 'flex shrink-0 flex-col',
} satisfies Record<NumberInputBorder, string>;

const NUMBER_INPUT_STEPPER_BTN_CLASSES = cn(
  'flex w-7 flex-1 cursor-pointer items-center justify-center',
  'text-fg-muted transition-[color,background-color,box-shadow] duration-150 ease-out',
  'hover:bg-primary-5/10 hover:text-action-base active:bg-primary-5/20',
  'disabled:cursor-not-allowed disabled:opacity-50',
  'disabled:hover:bg-transparent disabled:hover:text-fg-muted',
  'dark:hover:text-primary-3',
  'dark:hover:bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-primary-5)_22%,transparent),color-mix(in_srgb,var(--color-primary-5)_6%,transparent))]',
  'dark:hover:shadow-[inset_0_0_8px_color-mix(in_srgb,var(--color-primary-5)_35%,transparent)]',
  'dark:disabled:hover:bg-none dark:disabled:hover:shadow-none dark:disabled:hover:text-fg-muted',
);

/**
 * NumberInputStepper — cột hai nút tăng / giảm bên phải NumberInput; chỉ NumberInput dùng.
 *
 * Hai nút `tabIndex={-1}` (bàn phím dùng ↑ ↓ trong ô), nhãn trợ năng "Tăng" / "Giảm".
 * Sửa giao diện: cột + vách ngăn trái → `NUMBER_INPUT_STEPPER_CLASSES[border]` · nút →
 * `NUMBER_INPUT_STEPPER_BTN_CLASSES`.
 * Lưu ý: `onMouseDown` phải `preventDefault` để nút bấm không cướp focus của ô nhập; nút ở biên min / max
 * tự tắt (mờ 50%, bỏ hover).
 *
 * @param props.border - Kiểu viền của NumberInput cha; `none` / `bottomLine` bỏ vách ngăn trái.
 * @param props.size - Cỡ của NumberInput cha; `sm` dùng mũi tên 8px, còn lại 10px.
 * @param props.disabled - `true` → khoá cả hai nút.
 * @param props.atMax - `true` → khoá nút tăng (đã chạm `max`).
 * @param props.atMin - `true` → khoá nút giảm (đã chạm `min`).
 * @param props.className - Class của cột nút.
 * @param props.buttonClassName - Class của TỪNG nút.
 * @param props.onStep - Gọi với `1` (tăng) hoặc `-1` (giảm).
 * @param props.onMouseDown - Gắn vào `mousedown` của hai nút; truyền hàm gọi `e.preventDefault()`.
 *
 * @example
 * <NumberInputStepper
 *   atMin
 *   atMax={false}
 *   border="default"
 *   size="md"
 *   onMouseDown={(e) => e.preventDefault()}
 *   onStep={stepBy}
 * />
 */
function NumberInputStepper({
  border,
  size,
  disabled,
  atMax,
  atMin,
  className,
  buttonClassName,
  onStep,
  onMouseDown,
}: NumberInputStepperProps) {
  const stepperClassName = cn(NUMBER_INPUT_STEPPER_CLASSES[border], className);
  const stepUpClassName = cn(
    NUMBER_INPUT_STEPPER_BTN_CLASSES,
    border === 'default' && 'border-b border-border-default',
    buttonClassName,
  );
  const stepDownClassName = cn(NUMBER_INPUT_STEPPER_BTN_CLASSES, buttonClassName);
  const iconSize = size === 'sm' ? 8 : 10;

  return (
    <div className={stepperClassName}>
      <button
        aria-label="Tăng"
        className={stepUpClassName}
        disabled={disabled || atMax}
        tabIndex={-1}
        type="button"
        onClick={() => onStep(1)}
        onMouseDown={onMouseDown}
      >
        <SystemIcon name="angle-up-outline" size={iconSize} />
      </button>
      <button
        aria-label="Giảm"
        className={stepDownClassName}
        disabled={disabled || atMin}
        tabIndex={-1}
        type="button"
        onClick={() => onStep(-1)}
        onMouseDown={onMouseDown}
      >
        <SystemIcon name="angle-down-outline" size={iconSize} />
      </button>
    </div>
  );
}

export default NumberInputStepper;
