import { useId } from 'react';
import { cn } from '@/shared/utils/style/cn';

export type ProgressCircleVariant =
  'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
export type ProgressCircleSize = 'xs' | 'sm' | 'md' | 'lg';

export interface ProgressCircleProps {
  label?: string;
  value?: number;
  max?: number;
  variant?: ProgressCircleVariant;
  size?: ProgressCircleSize;
  showValue?: boolean;
  className?: string;
  ref?: React.Ref<HTMLDivElement>;
}

const PROGRESS_CIRCLE_BASE_CLASSES = 'relative shrink-0';

const PROGRESS_CIRCLE_TRACK_CLASSES = 'absolute inset-0 size-full';

const PROGRESS_CIRCLE_ARC_LAYER_CLASSES = 'absolute inset-0 size-full -rotate-90';

const PROGRESS_CIRCLE_ARC_CLASSES =
  'transition-[stroke-dashoffset] duration-500 ease-out motion-reduce:transition-none';

const PROGRESS_CIRCLE_VALUE_BASE_CLASSES =
  'absolute inset-0 grid place-items-center tabular-nums text-fg-heading';

const PROGRESS_CIRCLE_SIZE_CLASSES = {
  xs: 'size-6',
  sm: 'size-9',
  md: 'size-12',
  lg: 'size-16',
} satisfies Record<ProgressCircleSize, string>;

const PROGRESS_CIRCLE_STROKE_WIDTHS = {
  xs: 14,
  sm: 12,
  md: 10,
  lg: 9,
} satisfies Record<ProgressCircleSize, number>;

const PROGRESS_CIRCLE_VALUE_SIZE_CLASSES = {
  xs: null,
  sm: 'text-caption-10-semibold',
  md: 'text-caption-12-semibold',
  lg: 'text-body-14-semibold',
} satisfies Record<ProgressCircleSize, string | null>;

const PROGRESS_CIRCLE_VARIANT_CLASSES = {
  primary: 'text-primary-6 dark:text-primary-5',
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-error',
  info: 'text-info',
  neutral: 'text-fg-muted',
} satisfies Record<ProgressCircleVariant, string>;

function toPercent(value: number, max: number): number {
  if (!(max > 0) || !Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, (value / max) * 100));
}

/**
 * ProgressCircle — vòng tròn tiến độ có % ở tâm, bản tròn của `Progress`: ô bảng hẹp, thẻ KPI, biểu
 * tượng trạng thái tải lên.
 *
 * Cung chuyển sắc, rãnh và cung là hai lớp SVG chồng nhau.
 * Sửa giao diện: màu cung → `PROGRESS_CIRCLE_VARIANT_CLASSES` · cỡ → `PROGRESS_CIRCLE_SIZE_CLASSES`
 * · bề dày nét → `PROGRESS_CIRCLE_STROKE_WIDTHS` · cỡ chữ % → `PROGRESS_CIRCLE_VALUE_SIZE_CLASSES`
 * · lớp / chuyển động cung → `PROGRESS_CIRCLE_ARC_LAYER_CLASSES` / `PROGRESS_CIRCLE_ARC_CLASSES`.
 * Lưu ý: nắp tròn đã được BÙ (nét ngắn đi một bề dày, điểm đầu xoay tới nửa bề dày) để mép cung đúng
 * số; cung gần 0% / 100% quay về nắp `butt`; độ dài cung chạy qua `stroke-dashoffset`; KHÔNG vẽ cung
 * khi 0%; bề dày nét tính theo viewBox 100×100 — docs/notes/components/feedback.md.
 *
 * @param props.label - Tên đọc màn hình (`aria-label`). Mặc định "Hoàn thành N%".
 * @param props.value - Giá trị hiện tại, cùng đơn vị với `max`. Mặc định `0`.
 * @param props.max - Giá trị ứng với 100%. `max` ≤ 0 hoặc `value` không phải số hữu hạn → 0%; kết quả
 *   kẹp trong 0–100%. Mặc định `100`.
 * @param props.variant - Màu cung: `primary` | `success` | `warning` | `error` | `info` | `neutral`.
 *   Mặc định `primary`.
 * @param props.size - Đường kính: `xs` 24px | `sm` 36px | `md` 48px | `lg` 64px. Mặc định `sm`.
 * @param props.showValue - `true` → hiện % đã làm tròn ở tâm; bị bỏ qua ở `size="xs"` (không đủ chỗ).
 *   Mặc định `false`.
 * @param props.className - Class thêm cho khung ngoài.
 * @param props.ref - Trỏ tới `<div role="progressbar">` ngoài cùng (React 19: `ref` là prop thường).
 *
 * @example
 * <ProgressCircle value={100} size="sm" variant="success" showValue />
 *
 * <ProgressCircle label="Đang tải tệp" max={total} size="xs" value={loaded} />
 */
function ProgressCircle({
  label,
  value = 0,
  max = 100,
  variant = 'primary',
  size = 'sm',
  showValue = false,
  className,
  ref,
}: ProgressCircleProps) {
  const gradientId = `progress-circle-${useId().replace(/[^\w-]/g, '')}`;

  const pct = toPercent(value, max);
  const rounded = Math.round(pct);

  const strokeWidth = PROGRESS_CIRCLE_STROKE_WIDTHS[size];
  const radius = 50 - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  const arcLength = (pct / 100) * circumference;
  const roundCaps = arcLength > strokeWidth && arcLength < circumference - strokeWidth;
  const dash = roundCaps ? arcLength - strokeWidth : arcLength;
  const capTurn = roundCaps ? (strokeWidth / 2 / circumference) * 360 : 0;
  const arcStyle = { strokeDasharray: circumference, strokeDashoffset: circumference - dash };
  const valueSizeClassName = PROGRESS_CIRCLE_VALUE_SIZE_CLASSES[size];

  const progressCircleClassName = cn(
    PROGRESS_CIRCLE_BASE_CLASSES,
    PROGRESS_CIRCLE_SIZE_CLASSES[size],
    className,
  );
  const arcLayerClassName = cn(
    PROGRESS_CIRCLE_ARC_LAYER_CLASSES,
    PROGRESS_CIRCLE_VARIANT_CLASSES[variant],
  );
  const trackClassName = cn(
    PROGRESS_CIRCLE_TRACK_CLASSES,
    PROGRESS_CIRCLE_VARIANT_CLASSES[variant],
  );
  const valueClassName = cn(PROGRESS_CIRCLE_VALUE_BASE_CLASSES, valueSizeClassName);

  return (
    <div
      ref={ref}
      aria-label={label ?? `Hoàn thành ${rounded}%`}
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={rounded}
      className={progressCircleClassName}
      role="progressbar"
    >
      <svg aria-hidden className={trackClassName} viewBox="0 0 100 100">
        <circle
          cx={50}
          cy={50}
          fill="none"
          r={radius}
          stroke="var(--color-bg-track)"
          strokeWidth={strokeWidth}
        />
      </svg>

      {dash > 0 && (
        <svg aria-hidden className={arcLayerClassName} viewBox="0 0 100 100">
          <defs>
            <linearGradient id={gradientId} x1="1" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="currentColor" />
              <stop
                offset="1"
                stopColor="color-mix(in srgb, currentColor 70%, var(--color-fg-heading))"
              />
            </linearGradient>
          </defs>
          <circle
            className={PROGRESS_CIRCLE_ARC_CLASSES}
            cx={50}
            cy={50}
            fill="none"
            r={radius}
            stroke={`url(#${gradientId})`}
            strokeLinecap={roundCaps ? 'round' : 'butt'}
            strokeWidth={strokeWidth}
            style={arcStyle}
            transform={`rotate(${capTurn} 50 50)`}
          />
        </svg>
      )}

      {showValue && valueSizeClassName && (
        <span aria-hidden className={valueClassName}>
          {rounded}%
        </span>
      )}
    </div>
  );
}

export default ProgressCircle;
