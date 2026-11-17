import { useTranslations } from 'next-intl';
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

/** Rãnh: viên thuốc (`rounded-lg`, cắt thanh theo góc). */
const PROGRESS_TRACK_BASE_CLASSES = 'min-w-0 flex-1 overflow-hidden rounded-lg bg-bg-track';

/**
 * Thanh đạt: viên thuốc, dốc DỌC rất nhẹ bậc 5 → bậc 6 của tone (`--progress-tone` → `--progress-deep`) cho màu tươi mà
 * vẫn phẳng.
 */
const PROGRESS_FILL_BASE_CLASSES = cn(
  'relative h-full rounded-lg transition-[width] duration-300 ease-out motion-reduce:transition-none',
  'bg-linear-to-b from-(--progress-tone) to-(--progress-deep)',
);

const PROGRESS_VALUE_BASE_CLASSES = 'w-9 shrink-0 text-right tabular-nums text-fg-body';

/** Thanh mảnh kiểu macOS: mặc định `md` 6px. */
const PROGRESS_TRACK_SIZE_CLASSES = {
  xs: 'h-1',
  sm: 'h-1.25',
  md: 'h-1.5',
  lg: 'h-2.5',
} satisfies Record<ProgressSize, string>;

/** Màu tone qua `--progress-tone` (bậc 5, đỉnh dốc) và `--progress-deep` (bậc 6, đáy dốc). */
const PROGRESS_FILL_VARIANT_CLASSES = {
  primary: '[--progress-tone:var(--color-primary-5)] [--progress-deep:var(--color-primary-6)]',
  success: '[--progress-tone:var(--color-success)] [--progress-deep:var(--color-success-6)]',
  warning: '[--progress-tone:var(--color-warning)] [--progress-deep:var(--color-warning-6)]',
  error: '[--progress-tone:var(--color-error)] [--progress-deep:var(--color-error-6)]',
  neutral: '[--progress-tone:var(--color-fg-muted)] [--progress-deep:var(--color-fg-muted)]',
} satisfies Record<ProgressVariant, string>;

function toPercent(value: number, max: number): number {
  if (!(max > 0) || !Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, (value / max) * 100));
}

/**
 * Progress — thanh tiến độ ngang có thể kèm cột % bên phải: tiến độ gói thầu trong ô bảng, dung lượng
 * đã dùng, bước tải lên. Viên thuốc bo tròn, thanh đạt dốc dọc nhẹ theo tone — cùng hình ở hai theme.
 *
 * Chỗ hẹp hoặc cần nhấn mạnh một con số thì dùng `ProgressCircle`; đọc thô kiểu "mức nước" dùng
 * `LiquidGauge`.
 * Sửa giao diện: màu → `PROGRESS_FILL_VARIANT_CLASSES` · chiều cao → `PROGRESS_TRACK_SIZE_CLASSES`
 * · cột % → `PROGRESS_VALUE_BASE_CLASSES` · rãnh → `PROGRESS_TRACK_BASE_CLASSES` · dốc thanh → `PROGRESS_FILL_BASE_CLASSES`.
 * Lưu ý: chữ % màu trung tính (màu trạng thái nằm ở thanh); cột % rộng CỐ ĐỊNH (`w-9`) để nhiều thanh
 * xếp chồng thẳng hàng — đừng bỏ (docs/notes/components/feedback.md).
 *
 * @param props.label - Tên đọc màn hình của thanh (`aria-label`). Mặc định "Hoàn thành N%" theo ngôn ngữ (khoá
 *   `ui.feedback.progress.completed`).
 * @param props.value - Giá trị hiện tại, cùng đơn vị với `max`. Mặc định `0`.
 * @param props.max - Giá trị ứng với 100%. `max` ≤ 0 hoặc `value` không phải số hữu hạn → 0%; kết quả
 *   kẹp trong 0–100%. Mặc định `100`.
 * @param props.variant - Màu thanh: `primary` | `success` | `warning` | `error` | `neutral`.
 *   Mặc định `primary`.
 * @param props.size - Chiều cao thanh: `xs` 4px | `sm` 5px | `md` 6px | `lg` 10px. Mặc định `md`.
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
  const t = useTranslations('ui.feedback');
  const pct = toPercent(value, max);
  const rounded = Math.round(pct);

  const progressClassName = cn(PROGRESS_BASE_CLASSES, className);
  const trackClassName = cn(PROGRESS_TRACK_BASE_CLASSES, PROGRESS_TRACK_SIZE_CLASSES[size]);
  const fillClassName = cn(PROGRESS_FILL_BASE_CLASSES, PROGRESS_FILL_VARIANT_CLASSES[variant]);
  const valueClassName = cn(PROGRESS_VALUE_BASE_CLASSES, variant === 'neutral' && 'text-fg-muted');

  return (
    <div ref={ref} className={progressClassName}>
      <div
        aria-label={label ?? t('progress.completed', { percent: rounded })}
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
