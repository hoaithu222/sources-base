'use client';

import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { useTranslations } from 'next-intl';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import { cn } from '@/shared/utils/style/cn';

export type AvatarSize = '3xs' | '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
export type AvatarShape = 'circle' | 'square';
export type AvatarVariant = 'auto' | 'brand';

export interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: AvatarSize;
  shape?: AvatarShape;
  bordered?: boolean;
  variant?: AvatarVariant;
  initialsCount?: 1 | 2;
  fallback?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const AVATAR_BASE_CLASSES = 'relative inline-flex shrink-0 overflow-hidden';

const AVATAR_IMAGE_CLASSES = 'h-full w-full object-cover animate-fade-in';

const AVATAR_FALLBACK_BASE_CLASSES = 'flex h-full w-full items-center justify-center select-none';

const AVATAR_BORDERED_CLASSES = 'ring-2 ring-primary-5';

const AVATAR_CLICKABLE_CLASSES = cn(
  'cursor-pointer transition-[opacity,box-shadow] duration-150 ease-out',
  'hover:opacity-85',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus',
);

const AVATAR_SIZE_CLASSES = {
  '3xs': 'size-4',
  '2xs': 'size-5',
  xs: 'size-6',
  sm: 'size-8',
  md: 'size-10',
  lg: 'size-12',
  xl: 'size-16',
  xxl: 'size-32',
} satisfies Record<AvatarSize, string>;

const AVATAR_FALLBACK_SIZE_CLASSES = {
  '3xs': 'text-caption-9-medium',
  '2xs': 'text-caption-9-medium',
  xs: 'text-caption-10-tight-medium',
  sm: 'text-caption-12-tight-medium',
  md: 'text-body-16-medium',
  lg: 'text-body-18-medium',
  xl: 'text-h3-medium',
  xxl: 'text-h1-medium',
} satisfies Record<AvatarSize, string>;

const AVATAR_ICON_PX = {
  '3xs': 10,
  '2xs': 12,
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  xxl: 64,
} satisfies Record<AvatarSize, number>;

const AVATAR_SHAPE_CLASSES = {
  circle: 'rounded-full',
  square: 'rounded-none',
} satisfies Record<AvatarShape, string>;

const AVATAR_PALETTE_CLASSES = [
  'bg-primary-7 text-neutral-0',
  'bg-blue-6 text-neutral-0',
  'bg-teal-7 text-neutral-0',
  'bg-yellow-5 text-yellow-9',
  'bg-purple-6 text-neutral-0',
  'bg-pink-7 text-neutral-0',
];

const AVATAR_BRAND_BG_CLASSES = 'bg-linear-to-b from-primary-7 to-sky-8 text-neutral-0';

const AVATAR_EMPTY_BG_CLASSES = 'bg-bg-pressed text-fg-muted';

function getInitials(name: string, maxChars: 1 | 2 = 2): string {
  const parts = name.trim().split(/\s+/).slice(0, maxChars);
  return parts
    .map((word) => word[0] ?? '')
    .join('')
    .toUpperCase();
}

function nameToColor(name: string): string {
  let hash = 0;
  for (const char of name) hash += char.charCodeAt(0);
  return AVATAR_PALETTE_CLASSES[hash % AVATAR_PALETTE_CLASSES.length];
}

function getFallbackBgClass(variant: AvatarVariant, name: string | undefined): string {
  if (variant === 'brand') return AVATAR_BRAND_BG_CLASSES;
  return name ? nameToColor(name) : AVATAR_EMPTY_BG_CLASSES;
}

/**
 * Avatar — ảnh đại diện của một người, dựng trên Radix Avatar; ảnh chưa tải / lỗi thì hiện chữ cái
 * đầu của `name`, không có `name` thì `fallback`, cuối cùng là icon user.
 *
 * Có `onClick` thì avatar render thành `<button type="button">` thật (vào thứ tự tab, bấm được bằng
 * Enter / Space, tên đọc màn hình = `alt` ?? `name`). Avatar nằm trong một nút / trigger khác thì
 * KHÔNG truyền `onClick` (nút lồng nút).
 * Sửa giao diện: cỡ → `AVATAR_SIZE_CLASSES` + `AVATAR_FALLBACK_SIZE_CLASSES` + `AVATAR_ICON_PX` · hình →
 * `AVATAR_SHAPE_CLASSES` · nền + chữ → `AVATAR_PALETTE_CLASSES` / `AVATAR_BRAND_BG_CLASSES` /
 * `AVATAR_EMPTY_BG_CLASSES` (mỗi ô bảng màu tự mang màu chữ) · viền → `AVATAR_BORDERED_CLASSES` · khi bấm được
 * (hover, vòng focus) → `AVATAR_CLICKABLE_CLASSES`.
 * Lưu ý: `3xs` / `2xs` chỉ để nhận mặt trong dòng chữ nhỏ, không làm phần tử bấm; lý do cỡ nhỏ,
 * `brand` và hiệu ứng fade ảnh — docs/notes/components/primitives.md.
 *
 * @param props.src - URL ảnh; bỏ trống hoặc tải lỗi → hiện fallback.
 * @param props.alt - Chữ thay thế của ảnh. Mặc định lấy `name`, không có thì "Ảnh đại diện" theo ngôn ngữ (khoá
 *   `ui.primitives.avatar.defaultLabel`).
 * @param props.name - Họ tên: sinh chữ cái đầu và chọn màu nền ổn định theo tên (`variant="auto"`).
 * @param props.size - Cỡ: `3xs` 16px | `2xs` 20px | `xs` 24px | `sm` 32px | `md` 40px | `lg` 48px
 *   | `xl` 64px | `xxl` 128px. Mặc định `md`.
 * @param props.shape - Hình: `circle` | `square` (góc vuông). Mặc định `circle`.
 * @param props.bordered - `true` → vòng viền 2px màu thương hiệu. Mặc định `false`.
 * @param props.variant - Nền chữ cái: `auto` (màu theo tên) | `brand` (gradient thương hiệu, cho avatar
 *   user duy nhất ở header / hồ sơ). Mặc định `auto`.
 * @param props.initialsCount - Số chữ cái lấy từ `name`: `2` ("Nguyễn Văn A" → "NV") | `1` ("N").
 *   Mặc định `2`.
 * @param props.fallback - Nội dung khi chưa có ảnh và không có `name`. Mặc định icon user.
 * @param props.onClick - Có thì avatar thành nút bấm (xem trên).
 * @param props.className - Class thêm cho khung ngoài (ghi đè được cỡ / viền).
 *
 * @example
 * <Avatar name="Nguyễn Văn A" src={user.avatarUrl} />
 *
 * <Avatar name="Trần Bình" size="lg" variant="brand" onClick={openProfile} />
 */
function Avatar({
  src,
  alt,
  name,
  size = 'md',
  shape = 'circle',
  bordered = false,
  variant = 'auto',
  initialsCount = 2,
  fallback,
  onClick,
  className,
}: AvatarProps) {
  const t = useTranslations('ui.primitives');
  const clickable = onClick !== undefined;
  const initials = name ? getInitials(name, initialsCount) : '';
  const label = alt ?? name ?? t('avatar.defaultLabel');

  const avatarClassName = cn(
    AVATAR_BASE_CLASSES,
    AVATAR_SIZE_CLASSES[size],
    AVATAR_SHAPE_CLASSES[shape],
    bordered && AVATAR_BORDERED_CLASSES,
    clickable && AVATAR_CLICKABLE_CLASSES,
    bordered && clickable && 'focus-visible:ring-4',
    className,
  );
  const fallbackClassName = cn(
    AVATAR_FALLBACK_BASE_CLASSES,
    AVATAR_FALLBACK_SIZE_CLASSES[size],
    getFallbackBgClass(variant, name),
  );

  const content = (
    <>
      {src && <AvatarPrimitive.Image alt={label} className={AVATAR_IMAGE_CLASSES} src={src} />}
      <AvatarPrimitive.Fallback className={fallbackClassName}>
        {initials || fallback || <SystemIcon name="user-outline" size={AVATAR_ICON_PX[size]} />}
      </AvatarPrimitive.Fallback>
    </>
  );

  if (!clickable) {
    return <AvatarPrimitive.Root className={avatarClassName}>{content}</AvatarPrimitive.Root>;
  }

  return (
    <AvatarPrimitive.Root asChild className={avatarClassName}>
      <button aria-label={label} type="button" onClick={onClick}>
        {content}
      </button>
    </AvatarPrimitive.Root>
  );
}

export default Avatar;
