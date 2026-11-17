'use client';

import { useTranslations } from 'next-intl';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import { cn } from '@/shared/utils/style/cn';

export type BadgeColor =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'info'
  | 'indigo'
  | 'success'
  | 'warning'
  | 'error'
  | 'neutral';
export type BadgeVariant = 'tinted' | 'solid' | 'disabled' | 'outline';
export type BadgeSize = 'lg' | 'md' | 'sm' | 'xs';
export type BadgeShape = 'pill' | 'tag';

export interface BadgeProps extends Omit<React.ComponentProps<'span'>, 'color'> {
  color?: BadgeColor;
  variant?: BadgeVariant;
  size?: BadgeSize;
  shape?: BadgeShape;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  dot?: boolean;
  onRemove?: () => void;
  removeLabel?: string;
}

const BADGE_BASE_CLASSES = cn(
  'inline-flex items-center justify-center align-middle',
  'whitespace-nowrap tabular-nums ring-inset',
);

/** `pill` = viên tròn hai đầu (nhãn chung, chip lọc) · `tag` = thẻ góc nhỏ 6px (trạng thái trong ô bảng). */
const BADGE_SHAPE_CLASSES = {
  pill: 'rounded-full',
  tag: 'rounded-sm',
} satisfies Record<BadgeShape, string>;

const BADGE_ICON_BASE_CLASSES = 'inline-flex items-center justify-center shrink-0';

const BADGE_DOT_BASE_CLASSES = 'shrink-0 rounded-full bg-current';

const BADGE_REMOVE_CLASSES = cn(
  'cursor-pointer rounded-full opacity-70',
  'transition-[opacity,background-color] duration-150 ease-out',
  'hover:bg-current/15 hover:opacity-100',
  'focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus',
);

const BADGE_SIZE_CLASSES = {
  lg: 'min-w-7 gap-1 px-2 py-0.5 text-body-14-semibold',
  md: 'min-w-6 gap-1 px-2 py-0.5 text-caption-12-medium',
  sm: 'min-w-5 gap-1 px-1.5 py-0.5 text-caption-12-tight-medium',
  xs: 'min-w-4 gap-0.5 px-1 py-0 text-caption-10-tight-medium',
} satisfies Record<BadgeSize, string>;

const BADGE_ICON_SIZE_CLASSES = {
  lg: 'size-4',
  md: 'size-4',
  sm: 'size-3.5',
  xs: 'size-3',
} satisfies Record<BadgeSize, string>;

const BADGE_DOT_SIZE_CLASSES = {
  lg: 'size-1.5',
  md: 'size-1',
  sm: 'size-1',
  xs: 'size-1',
} satisfies Record<BadgeSize, string>;

const BADGE_COLOR_CLASSES = {
  primary: {
    tinted: cn(
      'bg-primary-5/12 text-primary-7 ring-1 ring-primary-5/20',
      'dark:bg-primary-5/26 dark:text-primary-3 dark:ring-primary-5/55',
    ),
    solid: 'bg-primary-7 text-neutral-0',
    disabled: cn(
      'bg-primary-5/6 text-primary-8/50 ring-1 ring-primary-5/15',
      'dark:text-primary-4/50',
    ),
    outline: cn(
      'bg-transparent text-primary-7 ring-1 ring-primary-6',
      'dark:text-primary-4 dark:ring-primary-5',
    ),
  },
  secondary: {
    tinted: cn(
      'bg-secondary-5/12 text-secondary-7 ring-1 ring-secondary-5/20',
      'dark:bg-secondary-5/26 dark:text-secondary-4 dark:ring-secondary-5/55',
    ),
    solid: 'bg-secondary-7 text-neutral-0',
    disabled: cn(
      'bg-secondary-5/6 text-secondary-8/50 ring-1 ring-secondary-5/15',
      'dark:text-secondary-4/50',
    ),
    outline: cn(
      'bg-transparent text-secondary-7 ring-1 ring-secondary-6',
      'dark:text-secondary-4 dark:ring-secondary-5',
    ),
  },
  accent: {
    tinted: cn(
      'bg-accent-5/12 text-accent-8 ring-1 ring-accent-5/20',
      'dark:bg-accent-5/24 dark:text-yellow-3 dark:ring-accent-5/55',
    ),
    solid: 'bg-accent-5 text-accent-9',
    disabled: cn('bg-accent-5/6 text-accent-9/50 ring-1 ring-accent-5/15', 'dark:text-accent-5/50'),
    outline: cn(
      'bg-transparent text-accent-8 ring-1 ring-accent-6',
      'dark:text-accent-5 dark:ring-accent-5',
    ),
  },
  info: {
    tinted: cn(
      'bg-info-5/12 text-info-7 ring-1 ring-info-5/20',
      'dark:bg-info-5/28 dark:text-blue-3 dark:ring-info-5/60',
    ),
    solid: 'bg-info-6 text-neutral-0',
    disabled: cn('bg-info-5/6 text-info-8/50 ring-1 ring-info-5/15', 'dark:text-info-5/50'),
    outline: cn(
      'bg-transparent text-info-7 ring-1 ring-info-6',
      'dark:text-info-5 dark:ring-info-5',
    ),
  },
  indigo: {
    tinted: cn(
      'bg-indigo-5/12 text-indigo-7 ring-1 ring-indigo-5/20',
      'dark:bg-indigo-5/26 dark:text-indigo-3 dark:ring-indigo-5/55',
    ),
    solid: 'bg-indigo-6 text-neutral-0',
    disabled: cn('bg-indigo-5/6 text-indigo-8/50 ring-1 ring-indigo-5/15', 'dark:text-indigo-4/50'),
    outline: cn(
      'bg-transparent text-indigo-7 ring-1 ring-indigo-6',
      'dark:text-indigo-4 dark:ring-indigo-5',
    ),
  },
  success: {
    tinted: cn(
      'bg-success-5/12 text-success-8 ring-1 ring-success-5/20',
      'dark:bg-success-5/22 dark:text-green-3 dark:ring-success-5/55',
    ),
    solid: 'bg-success-7 text-neutral-0',
    disabled: cn(
      'bg-success-5/6 text-success-8/50 ring-1 ring-success-5/15',
      'dark:text-success-5/50',
    ),
    outline: cn(
      'bg-transparent text-success-8 ring-1 ring-success-6',
      'dark:text-success-5 dark:ring-success-5',
    ),
  },
  warning: {
    tinted: cn(
      'bg-warning-5/12 text-warning-7 ring-1 ring-warning-5/20',
      'dark:bg-warning-5/28 dark:text-orange-3 dark:ring-warning-5/60',
    ),
    solid: 'bg-warning-5 text-warning-9',
    disabled: cn(
      'bg-warning-5/6 text-warning-9/50 ring-1 ring-warning-5/15',
      'dark:text-warning-5/50',
    ),
    outline: cn(
      'bg-transparent text-warning-7 ring-1 ring-warning-6',
      'dark:text-warning-5 dark:ring-warning-5',
    ),
  },
  error: {
    tinted: cn(
      'bg-error-5/12 text-error-7 ring-1 ring-error-5/20',
      'dark:bg-error-5/28 dark:text-red-3 dark:ring-error-5/60',
    ),
    solid: 'bg-error-6 text-neutral-0',
    disabled: cn('bg-error-5/6 text-error-8/50 ring-1 ring-error-5/15', 'dark:text-error-5/50'),
    outline: cn(
      'bg-transparent text-error-7 ring-1 ring-error-6',
      'dark:text-error-5 dark:ring-error-5',
    ),
  },
  neutral: {
    tinted:
      'bg-bg-pressed text-fg-body ring-1 ring-border-default dark:bg-bg-track dark:ring-border-strong',
    solid: 'bg-neutral-7 text-neutral-0',
    disabled: 'bg-bg-subtle text-fg-faint ring-1 ring-border-default',
    outline: 'bg-transparent text-fg-body ring-1 ring-border-strong',
  },
} satisfies Record<BadgeColor, Record<BadgeVariant, string>>;

/**
 * Badge — nhãn trạng thái dạng viên (pill): "Hoạt động", "Chờ duyệt", số đếm, bộ lọc đang áp dụng.
 *
 * Nhận thêm mọi thuộc tính của `<span>` (`title`, `aria-*`…). Figma 76:3123 ("type × stage" →
 * `color × variant`). Badge để ĐỌC; cần bấm để làm một việc thì dùng `Button`. `onRemove` chỉ thêm
 * nút gỡ "x" ở cuối (chip bộ lọc, tag).
 * Sửa giao diện: màu → `BADGE_COLOR_CLASSES[color][variant]` · hình → `BADGE_SHAPE_CLASSES` · cỡ → `BADGE_SIZE_CLASSES`
 * (+ `BADGE_ICON_SIZE_CLASSES` / `BADGE_DOT_SIZE_CLASSES`) · nút gỡ → `BADGE_REMOVE_CLASSES`.
 * Lưu ý: hình học (cỡ, đệm, chữ) giống nhau ở hai theme, chỉ màu đổi bậc (sáng chữ `-7` / `-8`; tối `tinted` nền
 * tông ~26% + chữ `-3` sáng). `tinted` = viên nhạt kiểu macOS: nền tông 12% (≈ bậc 1), chữ bậc 7–8, vòng tông 20% chỉ
 * đủ tách khỏi dòng bảng có nền màu, cỡ `md` chữ 12px medium đệm ngang 8px; viền là
 * `ring-inset` nên mọi variant cùng cỡ; nền đặc vàng / cam (`accent` / `warning` solid) dùng chữ `-9` thay
 * chữ trắng — docs/notes/components/primitives.md.
 *
 * @param props.color - Màu: `primary` | `secondary` | `accent` | `info` | `indigo` | `success` | `warning`
 *   | `error` | `neutral`. Mặc định `primary`.
 * @param props.variant - Kiểu tô: `tinted` (nền mờ + viền mảnh) | `solid` (nền đặc) | `disabled` (chữ
 *   nhạt) | `outline` (chỉ viền). Mặc định `tinted`.
 * @param props.size - Cỡ: `lg` (chữ 14px, badge đứng một mình làm nhãn của cả thẻ) | `md` (12px, đúng
 *   Figma) | `sm` (12px gọn, ô bảng / list dày) | `xs` (10px, chỉ báo đếm). Mặc định `md`.
 * @param props.shape - Hình: `pill` (viên tròn hai đầu) | `tag` (góc 6px — trạng thái trong ô bảng, cột "Trạng thái").
 *   Mặc định `pill`.
 * @param props.startIcon - Icon trước nhãn (thường `<SystemIcon />`).
 * @param props.endIcon - Icon sau nhãn, đứng trước nút gỡ.
 * @param props.dot - `true` → chấm tròn trước nhãn, cùng màu chữ. Mặc định `false`.
 * @param props.onRemove - Có thì hiện nút "x" cuối badge; click KHÔNG nổi bọt lên phần tử cha.
 * @param props.removeLabel - `aria-label` của nút "x". Mặc định "Xoá {children}" khi `children` là chuỗi, theo ngôn ngữ
 *   (khoá `ui.primitives.badge.remove`).
 * @param props.ref - Trỏ tới phần tử `<span>` gốc (React 19: `ref` là prop thường).
 *
 * @example
 * <Badge color="success" variant="solid" size="sm" dot>Hoạt động</Badge>
 *
 * <Badge color="neutral" onRemove={() => clearFilter('status')}>Đang thi công</Badge>
 *
 * <Badge color="warning" shape="tag" size="sm">Đang TH</Badge>
 */
function Badge({
  color = 'primary',
  variant = 'tinted',
  size = 'md',
  shape = 'pill',
  startIcon,
  endIcon,
  dot = false,
  onRemove,
  removeLabel,
  className,
  children,
  ref,
  ...props
}: BadgeProps) {
  const t = useTranslations('ui.primitives');
  const handleRemove = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onRemove?.();
  };

  const badgeClassName = cn(
    BADGE_BASE_CLASSES,
    BADGE_SHAPE_CLASSES[shape],
    BADGE_SIZE_CLASSES[size],
    BADGE_COLOR_CLASSES[color][variant],
    className,
  );
  const iconClassName = cn(BADGE_ICON_BASE_CLASSES, BADGE_ICON_SIZE_CLASSES[size]);
  const dotClassName = cn(BADGE_DOT_BASE_CLASSES, BADGE_DOT_SIZE_CLASSES[size]);
  const removeClassName = cn(iconClassName, BADGE_REMOVE_CLASSES);

  return (
    <span ref={ref} className={badgeClassName} {...props}>
      {startIcon && <span className={iconClassName}>{startIcon}</span>}
      {dot && <span aria-hidden className={dotClassName} />}
      {children}
      {endIcon && <span className={iconClassName}>{endIcon}</span>}
      {onRemove && (
        <button
          aria-label={
            removeLabel ??
            t('badge.remove', { name: typeof children === 'string' ? children : '' }).trim()
          }
          className={removeClassName}
          type="button"
          onClick={handleRemove}
        >
          <SystemIcon name="xmark-outline" size={10} />
        </button>
      )}
    </span>
  );
}

export default Badge;
