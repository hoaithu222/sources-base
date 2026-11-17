import Text from '@/shared/ui/primitives/Text';
import { cn } from '@/shared/utils/style/cn';

export type ProgressVariant = 'primary' | 'success' | 'warning' | 'error' | 'neutral';
export type ProgressSize = 'xs' | 'sm' | 'md' | 'lg';

export interface ProgressProps {
  label?: string;
  value?: number;
  max?: number;
  variant?: ProgressVariant;
  size?: ProgressSize;
  showValue?: boolean;
  className?: string;
  ref?: React.Ref<HTMLDivElement>;
}

const PROGRESS_BASE_CLASSES = 'flex w-full items-center gap-2';

/** Rãnh tối: lõm nhẹ (bóng trong đỉnh) + vạch chia mảnh mỗi 10% — chỉ lộ ở phần CHƯA đạt. */
const PROGRESS_TRACK_BASE_CLASSES = cn(
  'min-w-0 flex-1 bg-bg-track',
  'dark:shadow-[inset_0_1px_2px_var(--color-shadow-popup)]',
);

/** Thanh đạt: dốc nhạt → đậm theo `--progress-tone` + quầng; tối thêm điểm sáng ở ĐẦU thanh (`::after`, chỉ khi > 0%). */
const PROGRESS_FILL_BASE_CLASSES = cn(
  'relative h-full bg-linear-to-r transition-[width] duration-300 ease-out motion-reduce:transition-none',
  'from-[color-mix(in_srgb,var(--progress-tone)_45%,transparent)] to-(--progress-tone)',
);

const PROGRESS_FILL_HEAD_CLASSES = cn(
  "dark:after:absolute dark:after:inset-y-0 dark:after:right-0 dark:after:w-0.5 dark:after:content-['']",
  'dark:after:bg-[color-mix(in_srgb,var(--progress-tone)_35%,var(--color-neutral-0))]',
  'dark:after:shadow-[0_0_6px_1px_var(--progress-tone)]',
);

const PROGRESS_VALUE_BASE_CLASSES = 'w-9 shrink-0 text-right tabular-nums text-fg-body';

const PROGRESS_TRACK_SIZE_CLASSES = {
  xs: 'h-1',
  sm: 'h-1.5',
  md: 'h-2',
  lg: 'h-3',
} satisfies Record<ProgressSize, string>;

const PROGRESS_FILL_GLOW_CLASSES =
  'dark:shadow-[0_0_8px_color-mix(in_srgb,var(--progress-tone)_50%,transparent)]';

/** Màu tone qua biến `--progress-tone` (thân dốc + quầng + điểm đầu); `neutral` không quầng. */
const PROGRESS_FILL_VARIANT_CLASSES = {
  primary: cn('[--progress-tone:var(--color-primary-5)]', PROGRESS_FILL_GLOW_CLASSES),
  success: cn('[--progress-tone:var(--color-success)]', PROGRESS_FILL_GLOW_CLASSES),
  warning: cn('[--progress-tone:var(--color-warning)]', PROGRESS_FILL_GLOW_CLASSES),
  error: cn('[--progress-tone:var(--color-error)]', PROGRESS_FILL_GLOW_CLASSES),
  neutral: '[--progress-tone:var(--color-fg-muted)]',
} satisfies Record<ProgressVariant, string>;

function toPercent(value: number, max: number): number {
  if (!(max > 0) || !Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, (value / max) * 100));
}

/**
 * Progress — thanh tiến độ ngang có thể kèm cột % bên phải: tiến độ gói thầu trong ô bảng, dung lượng
 * đã dùng, bước tải lên. Rãnh vuông + phần đã đạt chuyển sắc (theme tối có quầng).
 *
 * Chỗ hẹp hoặc cần nhấn mạnh một con số thì dùng `ProgressCircle`; đọc thô kiểu "mức nước" dùng
 * `LiquidGauge`.
 * Sửa giao diện: màu + quầng → `PROGRESS_FILL_VARIANT_CLASSES` · chiều cao → `PROGRESS_TRACK_SIZE_CLASSES`
 * · cột % → `PROGRESS_VALUE_BASE_CLASSES` · rãnh (vạch chia tối) → `PROGRESS_TRACK_BASE_CLASSES`
 * · điểm sáng đầu thanh → `PROGRESS_FILL_HEAD_CLASSES`.
 * Lưu ý: chữ % màu trung tính (màu trạng thái nằm ở thanh); cột % rộng CỐ ĐỊNH (`w-9`) để nhiều thanh
 * xếp chồng thẳng hàng — đừng bỏ (docs/notes/components/feedback.md).
 *
 * @param props.label - Tên đọc màn hình của thanh (`aria-label`). Mặc định "Hoàn thành N%".
 * @param props.value - Giá trị hiện tại, cùng đơn vị với `max`. Mặc định `0`.
 * @param props.max - Giá trị ứng với 100%. `max` ≤ 0 hoặc `value` không phải số hữu hạn → 0%; kết quả
 *   kẹp trong 0–100%. Mặc định `100`.
 * @param props.variant - Màu thanh: `primary` | `success` | `warning` | `error` | `neutral`.
 *   Mặc định `primary`.
 * @param props.size - Chiều cao thanh: `xs` 4px | `sm` 6px | `md` 8px | `lg` 12px. Mặc định `md`.
 * @param props.showValue - `true` → hiện % đã làm tròn ở cột bên phải. Mặc định `false`.
 * @param props.className - Class thêm cho hàng ngoài (thanh + cột %).
 * @param props.ref - Trỏ tới `<div>` hàng ngoài (React 19: `ref` là prop thường).
 *
 * @example
 * <Progress value={72} showValue />
 *
 * <Progress label="Đã tải lên" max={files.length} size="sm" value={doneCount} variant="success" />
 */
function Progress({
  label,
  value = 0,
  max = 100,
  variant = 'primary',
  size = 'md',
  showValue = false,
  className,
  ref,
}: ProgressProps) {
  const pct = toPercent(value, max);
  const rounded = Math.round(pct);

  const progressClassName = cn(PROGRESS_BASE_CLASSES, className);
  const trackClassName = cn(PROGRESS_TRACK_BASE_CLASSES, PROGRESS_TRACK_SIZE_CLASSES[size]);
  const fillClassName = cn(
    PROGRESS_FILL_BASE_CLASSES,
    PROGRESS_FILL_VARIANT_CLASSES[variant],
    pct > 0 && PROGRESS_FILL_HEAD_CLASSES,
  );
  const valueClassName = cn(PROGRESS_VALUE_BASE_CLASSES, variant === 'neutral' && 'text-fg-muted');

  return (
    <div ref={ref} className={progressClassName}>
      <div
        aria-label={label ?? `Hoàn thành ${rounded}%`}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={rounded}
        className={trackClassName}
        role="progressbar"
      >
        <div className={fillClassName} style={{ width: `${pct}%` }} />
      </div>
      {showValue && (
        <Text aria-hidden className={valueClassName} size="tiny">
          {rounded}%
        </Text>
      )}
    </div>
  );
}

export default Progress;
