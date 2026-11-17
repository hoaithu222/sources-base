import type { ReactNode } from 'react';
import { memo } from 'react';
import { cn } from '@/shared/utils/style/cn';
import { SystemIcon, type BoldSystemIconName } from '@/shared/ui/icons/Icons';
import AnimatedNumber from '@/shared/ui/data-display/AnimatedNumber';

export type SummaryPillColor =
  | 'sky'
  | 'green'
  | 'yellow'
  | 'orange'
  | 'indigo'
  | 'pink'
  | 'fuchsia'
  | 'purple'
  | 'blue'
  | 'red'
  | 'teal';
export type SummaryPillSize = 'sm' | 'md';

export interface SummaryPillProps {
  icon: BoldSystemIconName;
  label: string;
  value: number | string;
  animate?: boolean;
  hint?: ReactNode;
  color?: SummaryPillColor;
  size?: SummaryPillSize;
  className?: string;
}

/**
 * Viên thuốc thật — `rounded-2xl` (20px ≥ nửa cao 28–32px), nền tông 10–14% + vòng 1px tông 20%. Cùng một hình ở cả hai
 * theme.
 */
const SUMMARY_PILL_BASE_CLASSES = cn(
  'relative inline-flex items-center whitespace-nowrap rounded-2xl',
  'shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--summary-pill-tone)_20%,transparent)]',
);

/** Nền tông nhạt (bậc 5, 10–14% — vàng cần đậm hơn mới thấy); tối đổi sang bậc 6 pha 20–30% để thấy trên nền than chì. */
const SUMMARY_PILL_COLOR_CLASSES = {
  sky: 'bg-primary-5/10 dark:bg-primary-6/30',
  green: 'bg-success-5/12 dark:bg-success-6/30',
  yellow: 'bg-accent-5/14 dark:bg-accent-6/30',
  orange: 'bg-orange-5/10 dark:bg-orange-6/20',
  indigo: 'bg-indigo-5/10 dark:bg-indigo-6/30',
  pink: 'bg-pink-5/10 dark:bg-pink-6/20',
  fuchsia: 'bg-fuchsia-5/10 dark:bg-fuchsia-6/20',
  purple: 'bg-purple-5/10 dark:bg-purple-6/20',
  blue: 'bg-blue-5/10 dark:bg-blue-6/20',
  red: 'bg-error-5/10 dark:bg-error-6/30',
  teal: 'bg-teal-5/12 dark:bg-teal-6/20',
} satisfies Record<SummaryPillColor, string>;

const SUMMARY_PILL_SIZE_CLASSES = {
  sm: 'h-7 gap-1.5 px-1.5',
  md: 'h-8 gap-2 px-2',
} satisfies Record<SummaryPillSize, string>;

/** Sáng: bậc đủ tương phản (≥ 3:1) trên nền tông nhạt — xanh lá / vàng / teal cần bậc 7. Tối: bậc 5 sáng hơn trên nền than chì. */
const SUMMARY_PILL_ICON_COLOR_CLASSES = {
  sky: 'text-primary-6 dark:text-primary-5',
  green: 'text-success-7 dark:text-success-5',
  yellow: 'text-accent-7 dark:text-accent-5',
  orange: 'text-orange-6 dark:text-orange-5',
  indigo: 'text-indigo-6 dark:text-indigo-5',
  pink: 'text-pink-6 dark:text-pink-5',
  fuchsia: 'text-fuchsia-6 dark:text-fuchsia-5',
  purple: 'text-purple-6 dark:text-purple-5',
  blue: 'text-blue-6 dark:text-blue-5',
  red: 'text-error-6 dark:text-error-5',
  teal: 'text-teal-7 dark:text-teal-5',
} satisfies Record<SummaryPillColor, string>;

const SUMMARY_PILL_LABEL_COLOR_CLASSES = {
  sky: 'text-primary-8 dark:text-primary-2',
  green: 'text-success-8 dark:text-success-2',
  yellow: 'text-accent-8 dark:text-accent-2',
  orange: 'text-orange-8 dark:text-orange-2',
  indigo: 'text-indigo-8 dark:text-indigo-2',
  pink: 'text-pink-8 dark:text-pink-2',
  fuchsia: 'text-fuchsia-8 dark:text-fuchsia-2',
  purple: 'text-purple-8 dark:text-purple-2',
  blue: 'text-blue-8 dark:text-blue-2',
  red: 'text-error-8 dark:text-error-2',
  teal: 'text-teal-8 dark:text-teal-2',
} satisfies Record<SummaryPillColor, string>;

const SUMMARY_PILL_LABEL_SIZE_CLASSES = {
  sm: 'text-caption-10',
  md: 'text-caption-12-medium',
} satisfies Record<SummaryPillSize, string>;

const SUMMARY_PILL_VALUE_BASE_CLASSES = 'text-fg-heading tabular-nums';

const SUMMARY_PILL_VALUE_SIZE_CLASSES = {
  sm: 'text-body-16-semibold',
  md: 'text-body-18-semibold',
} satisfies Record<SummaryPillSize, string>;

const SUMMARY_PILL_HINT_SIZE_CLASSES = {
  sm: 'text-caption-10',
  md: 'text-caption-10',
} satisfies Record<SummaryPillSize, string>;

const SUMMARY_PILL_ICON_SIZE = { sm: 14, md: 16 } satisfies Record<SummaryPillSize, number>;

/** Tên token màu thật của từng tone (Figma dùng tên legacy: sky → primary, green → success…). */
const SUMMARY_PILL_TONE_TOKEN = {
  sky: 'primary',
  green: 'success',
  yellow: 'accent',
  orange: 'orange',
  indigo: 'indigo',
  pink: 'pink',
  fuchsia: 'fuchsia',
  purple: 'purple',
  blue: 'blue',
  red: 'error',
  teal: 'teal',
} satisfies Record<SummaryPillColor, string>;

/**
 * SummaryPill — viên KPI gọn trong page header: [icon] Nhãn Giá-trị (gợi ý). Figma: 10144-454330.
 *
 * Thường xếp 3–5 viên trong slot `summary` của page header. Thẻ KPI lớn trong thân trang → `SummaryCard`.
 * Viên thuốc nền tông nhạt, chữ thường, không quầng — cùng một hình ở cả hai theme.
 * Sửa giao diện: màu → các bảng `SUMMARY_PILL_*_COLOR_CLASSES` · cỡ → các bảng `SUMMARY_PILL_*_SIZE_CLASSES`.
 * Lưu ý: `sky` = họ `primary` (xanh LÁ); muốn xanh dương dùng `blue`. Nhãn dùng bậc đôi -8 (sáng) / -2
 * (tối) — text-contrast.md §1. Lý do thiết kế: notes/components/surfaces-cards.md.
 *
 * @param props.icon - Icon đầu viên, BẮT BUỘC nét đậm `*-bold`.
 * @param props.label - Nhãn trước giá trị.
 * @param props.value - Giá trị KPI: số (đếm lên, định dạng vi-VN) hoặc chuỗi đã định dạng sẵn.
 * @param props.animate - Đếm lên khi là SỐ. Mặc định `true`.
 * @param props.hint - Chữ phụ nhỏ sau giá trị, vd `"(8 chờ)"`. `null` / `false` / `""` / `0` coi như KHÔNG có
 *   (viết `hint={count && …}` không in chữ "0" lạc).
 * @param props.color - Tone của nền, icon, nhãn: `sky` | `green` | `yellow` | `orange` | `indigo`
 *   | `pink` | `fuchsia` | `purple` | `blue` | `red` | `teal`. Mặc định `sky`.
 * @param props.size - `sm` (28px, nhãn 10px) | `md` (32px). Mặc định `md`.
 * @param props.className - Class thêm cho viên.
 *
 * @example
 * <SummaryPill color="green" icon="cube-bold" label="Hồ sơ" value={128} hint="(8 chờ)" />
 */
const SummaryPill = memo(function SummaryPill({
  icon,
  label,
  value,
  animate = true,
  hint,
  color = 'sky',
  size = 'md',
  className,
}: SummaryPillProps) {
  const hasHint = hint != null && hint !== false && hint !== '' && hint !== 0;
  const pillStyle = {
    ['--summary-pill-tone' as string]: `var(--color-${SUMMARY_PILL_TONE_TOKEN[color]}-5)`,
  };

  const pillClassName = cn(
    SUMMARY_PILL_BASE_CLASSES,
    SUMMARY_PILL_COLOR_CLASSES[color],
    SUMMARY_PILL_SIZE_CLASSES[size],
    className,
  );
  const iconClassName = cn('shrink-0', SUMMARY_PILL_ICON_COLOR_CLASSES[color]);
  const labelClassName = cn(
    'shrink-0',
    SUMMARY_PILL_LABEL_COLOR_CLASSES[color],
    SUMMARY_PILL_LABEL_SIZE_CLASSES[size],
  );
  const valueClassName = cn(SUMMARY_PILL_VALUE_BASE_CLASSES, SUMMARY_PILL_VALUE_SIZE_CLASSES[size]);
  const hintClassName = cn('text-fg-muted', SUMMARY_PILL_HINT_SIZE_CLASSES[size]);

  return (
    <div className={pillClassName} style={pillStyle}>
      <SystemIcon className={iconClassName} name={icon} size={SUMMARY_PILL_ICON_SIZE[size]} />
      <span className={labelClassName}>{label}</span>
      <span className="flex items-baseline gap-1">
        <span className={valueClassName}>
          {typeof value === 'number' ? <AnimatedNumber disabled={!animate} value={value} /> : value}
        </span>
        {hasHint && <span className={hintClassName}>{hint}</span>}
      </span>
    </div>
  );
});

export default SummaryPill;
