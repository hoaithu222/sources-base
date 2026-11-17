import { cn } from '@/shared/utils/style/cn';

export type SkeletonVariant = 'text' | 'rectangle' | 'circle';
export type SkeletonRounded = 'none' | 'sm' | 'md' | 'lg' | 'full';

export interface SkeletonProps {
  variant?: SkeletonVariant;
  width?: number | string;
  height?: number | string;
  rounded?: SkeletonRounded;
  className?: string;
}

const SKELETON_BASE_CLASSES = cn(
  'block bg-divider-default [background-size:200%_100%]',
  'bg-[linear-gradient(90deg,transparent_25%,color-mix(in_srgb,var(--color-neutral-0)_60%,transparent)_50%,transparent_75%)]',
  'dark:bg-[linear-gradient(90deg,transparent_25%,color-mix(in_srgb,var(--color-sky-4)_16%,transparent)_46%,color-mix(in_srgb,var(--color-sky-3)_24%,transparent)_50%,color-mix(in_srgb,var(--color-sky-4)_16%,transparent)_54%,transparent_75%)]',
  'dark:shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--color-sky-5)_10%,transparent)]',
  'animate-shimmer motion-reduce:animate-none',
);

const SKELETON_VARIANT_CLASSES = {
  text: 'h-3',
  rectangle: '',
  circle: 'aspect-square rounded-full',
} satisfies Record<SkeletonVariant, string>;

const SKELETON_ROUNDED_CLASSES = {
  none: '',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full',
} satisfies Record<SkeletonRounded, string>;

function toCssSize(value: number | string | undefined): string | undefined {
  if (value == null) return undefined;
  return typeof value === 'number' ? `${value}px` : value;
}

/**
 * Skeleton — khối xương giữ chỗ trong lúc chờ dữ liệu (nền nhạt + vệt sáng quét ngang), giữ đúng bố cục
 * để trang không nhảy khi dữ liệu về.
 *
 * Mỗi khối là `role="status"` + `aria-label="Đang tải"`. Ghép nhiều khối (dòng chữ, ảnh tròn) để phác
 * hình nội dung thật; chờ một thao tác (đang lưu, đang gửi) thì dùng `Spinner` / `<Button loading>`.
 * Sửa giao diện: hình → `SKELETON_VARIANT_CLASSES` · bo góc → `SKELETON_ROUNDED_CLASSES`
 * · nền + vệt sáng → `SKELETON_BASE_CLASSES`.
 * Lưu ý: vệt sáng là gradient rộng 200% chạy `animate-shimmer` (nhịp thiết kế cho đúng bề rộng đó);
 * đổi `background-size` là lộ điểm nối.
 *
 * @param props.variant - Hình: `text` (cao 12px, một dòng chữ) | `rectangle` (theo `width` / `height`)
 *   | `circle` (vuông tỉ lệ 1:1, bo tròn — chỉ cần `width`). Mặc định `rectangle`.
 * @param props.width - Bề ngang: số → px, chuỗi → giá trị CSS (`'60%'`, `'12rem'`). Mặc định theo khung cha.
 * @param props.height - Chiều cao: số → px, chuỗi → giá trị CSS; ghi đè chiều cao của `text`.
 * @param props.rounded - Bo góc: `none` | `sm` | `md` | `lg` | `full`. Mặc định `none`.
 * @param props.className - Class thêm (vd `w-full`, khoảng cách).
 *
 * @example
 * <Skeleton variant="rectangle" width={240} height={120} rounded="md" />
 *
 * <Skeleton variant="circle" width={40} />
 */
function Skeleton({
  variant = 'rectangle',
  width,
  height,
  rounded = 'none',
  className,
}: SkeletonProps) {
  const skeletonClassName = cn(
    SKELETON_BASE_CLASSES,
    SKELETON_VARIANT_CLASSES[variant],
    SKELETON_ROUNDED_CLASSES[rounded],
    className,
  );

  return (
    <span
      aria-busy
      aria-label="Đang tải"
      className={skeletonClassName}
      role="status"
      style={{ width: toCssSize(width), height: toCssSize(height) }}
    />
  );
}

export default Skeleton;
