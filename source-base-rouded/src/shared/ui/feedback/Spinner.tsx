import { cn } from '@/shared/utils/style/cn';

export type SpinnerSize = 'sm' | 'md' | 'lg';
export type SpinnerColor =
  'primary' | 'brand' | 'info' | 'success' | 'warning' | 'danger' | 'neutral' | 'inherit';

export interface SpinnerProps {
  label?: string;
  size?: SpinnerSize;
  color?: SpinnerColor;
  className?: string;
}

const SPINNER_BASE_CLASSES =
  'relative inline-block shrink-0 animate-spin motion-reduce:animate-none';

const SPINNER_TRACK_BASE_CLASSES = 'absolute inset-0 rounded-full border-divider-default';

const SPINNER_ARC_BASE_CLASSES = cn(
  'absolute inset-0 rounded-full border-current',
  '[mask-image:conic-gradient(transparent_25%,currentColor)]',
);

const SPINNER_SIZE_CLASSES = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
} satisfies Record<SpinnerSize, string>;

const SPINNER_RING_SIZE_CLASSES = {
  sm: 'border-2',
  md: 'border-[3px]',
  lg: 'border-4',
} satisfies Record<SpinnerSize, string>;

const SPINNER_COLOR_CLASSES = {
  primary: 'text-primary-6',
  brand: 'text-primary-5',
  info: 'text-info',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-error',
  neutral: 'text-fg-body',
  inherit: 'text-current',
} satisfies Record<SpinnerColor, string>;

/**
 * Spinner — vòng xoay báo "đang tải / đang xử lý" (`role="status"`, `aria-live="polite"`): cung chuyển
 * sắc quay trên rãnh mờ `divider-default`.
 *
 * Nút đang gửi thì dùng `<Button loading>` (đã gắn sẵn Spinner); giữ chỗ cho nội dung sắp hiện thì
 * dùng `Skeleton`.
 * Sửa giao diện: đường kính → `SPINNER_SIZE_CLASSES` · bề dày vòng → `SPINNER_RING_SIZE_CLASSES`
 * · màu cung → `SPINNER_COLOR_CLASSES` · rãnh / cung → `SPINNER_TRACK_BASE_CLASSES` /
 * `SPINNER_ARC_BASE_CLASSES`.
 * Lưu ý: `inherit` (nút đặc) đổi rãnh sang 25% màu chữ; giảm chuyển động → vòng đứng yên
 * nhưng cung + rãnh vẫn hiện — docs/notes/components/feedback.md.
 *
 * @param props.label - Tên đọc màn hình (`aria-label`). Mặc định "Đang tải".
 * @param props.size - Cỡ: `sm` 16px | `md` 32px | `lg` 48px. Mặc định `md`.
 * @param props.color - Màu: `primary` | `brand` | `info` | `success` | `warning` | `danger` | `neutral`
 *   | `inherit` (theo màu chữ của cha — dùng trong nút). Mặc định `primary`.
 * @param props.className - Class thêm.
 *
 * @example
 * <Spinner size="sm" color="inherit" />
 *
 * <Spinner label="Đang tải danh sách" size="lg" />
 */
function Spinner({ label = 'Đang tải', size = 'md', color = 'primary', className }: SpinnerProps) {
  const inherit = color === 'inherit';

  const spinnerClassName = cn(
    SPINNER_BASE_CLASSES,
    SPINNER_SIZE_CLASSES[size],
    SPINNER_COLOR_CLASSES[color],
    className,
  );
  const trackClassName = cn(
    SPINNER_TRACK_BASE_CLASSES,
    SPINNER_RING_SIZE_CLASSES[size],
    inherit && 'border-current/25',
  );
  const arcClassName = cn(SPINNER_ARC_BASE_CLASSES, SPINNER_RING_SIZE_CLASSES[size]);

  return (
    <span aria-label={label} aria-live="polite" className={spinnerClassName} role="status">
      <span aria-hidden className={trackClassName} />
      <span aria-hidden className={arcClassName} />
    </span>
  );
}

export default Spinner;
