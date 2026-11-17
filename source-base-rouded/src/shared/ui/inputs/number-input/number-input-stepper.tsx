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

/**
 * `default`: cột cắt theo góc phải của khung `rounded-md` — nền rê của hai nút không lòi ra ngoài góc bo.
 * Vách trái mảnh `divider-default`, KHÔNG vạch ngang giữa hai nút (gọn như stepper macOS).
 */
const NUMBER_INPUT_STEPPER_CLASSES = {
  default: 'flex shrink-0 flex-col overflow-hidden rounded-r-md border-l border-divider-default',
  none: 'flex shrink-0 flex-col',
  bottomLine: 'flex shrink-0 flex-col',
} satisfies Record<NumberInputBorder, string>;

/** Vạch ngang giữa nút tăng / giảm: trong suốt (giữ 1px để hai nút cao bằng nhau). */
const NUMBER_INPUT_STEPPER_SPLIT_CLASSES = 'border-b border-transparent';

const NUMBER_INPUT_STEPPER_BTN_CLASSES = cn(
  'flex w-7 flex-1 cursor-pointer items-center justify-center',
  'text-fg-faint transition-[color,background-color,box-shadow] duration-150 ease-out',
  'hover:bg-bg-subtle hover:text-fg-heading active:bg-bg-pressed',
  'group-hover/field:text-fg-muted group-focus-within/field:text-fg-muted',
  'disabled:cursor-not-allowed disabled:opacity-50',
  'disabled:hover:bg-transparent disabled:hover:text-fg-faint',
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
    border === 'default' && NUMBER_INPUT_STEPPER_SPLIT_CLASSES,
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
