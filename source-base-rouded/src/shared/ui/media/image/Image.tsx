import { useState } from 'react';
import { images } from '@/assets/image';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import { cn } from '@/shared/utils/style/cn';
import type { ImageName } from '@/assets/image';
import ImageLightbox from './lightbox/ImageLightbox';

export type ImageFit = 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
export type ImageRounded = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface ImageProps {
  name: ImageName;
  alt: string;
  width?: number | string;
  height?: number | string;
  fit?: ImageFit;
  rounded?: ImageRounded;
  preview?: boolean;
  onClick?: (e: React.MouseEvent<HTMLImageElement>) => void;
  loading?: 'eager' | 'lazy';
  className?: string;
}

const IMAGE_FIT_CLASSES = {
  cover: 'object-cover',
  contain: 'object-contain',
  fill: 'object-fill',
  none: 'object-none',
  'scale-down': 'object-scale-down',
} satisfies Record<ImageFit, string>;

const IMAGE_ROUNDED_CLASSES = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  full: 'rounded-full',
} satisfies Record<ImageRounded, string>;

const IMAGE_INTERACTIVE_CLASSES = cn(
  'cursor-pointer transition-[opacity] duration-200 ease-out hover:opacity-85',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus',
);

/** Ô ảnh lỗi — viền mảnh + nền chìm + icon mờ. */
const IMAGE_FALLBACK_CLASSES =
  'flex items-center justify-center border border-border-default bg-bg-subtle text-fg-muted';

/** Tên trợ năng của ảnh mở lightbox: "Xem ảnh <alt>". */
const previewLabelOf = (alt: string) => (alt ? `Xem ảnh ${alt}` : 'Xem ảnh');

/**
 * Image — ảnh HỆ THỐNG gọi theo tên trong registry `src/assets/image/` (logo, minh hoạ, trạng thái rỗng).
 *
 * Ảnh từ URL / dữ liệu người dùng → `ImagePreview` (có placeholder) hoặc `CardScreenshot` (thẻ ảnh).
 * Có `preview` hoặc `onClick` thì ảnh bấm được: `role="button"`, vào được bằng Tab, Enter / Space kích hoạt.
 * Sửa giao diện: object-fit → `IMAGE_FIT_CLASSES` · bo góc → `IMAGE_ROUNDED_CLASSES` · ô lỗi →
 * `IMAGE_FALLBACK_CLASSES`.
 * Lưu ý: tên không có trong registry → render `null` (+ cảnh báo ở DEV); thêm ảnh: bỏ file vào
 * `src/assets/image/` rồi `npm run generate:images`. Tải lỗi → khung `role="img"` + icon, không mở lightbox.
 * Lý do thiết kế: notes/components/media.md.
 *
 * @param props.name - Tên ảnh trong registry (`ImageName`).
 * @param props.alt - BẮT BUỘC: văn bản thay thế; `""` khi ảnh chỉ trang trí.
 * @param props.width - Bề rộng: số = px, chuỗi = giá trị CSS (`"100%"`).
 * @param props.height - Chiều cao: số = px, chuỗi = giá trị CSS.
 * @param props.fit - object-fit: `cover` | `contain` | `fill` | `none` | `scale-down`. Mặc định `cover`.
 * @param props.rounded - Bo góc: `none` | `sm` | `md` | `lg` | `xl` | `full`. Mặc định `none`.
 * @param props.preview - `true` → bấm ảnh mở `ImageLightbox` (zoom / xoay); khi đó bỏ qua `onClick`.
 *   Mặc định `false`.
 * @param props.onClick - Bấm ảnh (chuột hoặc Enter / Space); bỏ qua khi `preview`.
 * @param props.loading - Thuộc tính `loading` của `<img>`: `lazy` | `eager`. Mặc định `lazy`.
 * @param props.className - Class thêm cho `<img>` (hoặc khung lỗi).
 *
 * @example
 * <Image name="logo" alt="VCI" width={120} />
 *
 * <Image name="pms-logo-icon" alt="PMS" preview fit="cover" rounded="md" width={64} height={64} />
 */
function Image({
  name,
  alt,
  width,
  height,
  fit = 'cover',
  rounded = 'none',
  preview = false,
  onClick,
  loading = 'lazy',
  className,
}: ImageProps) {
  const [open, setOpen] = useState(false);
  const [hasError, setHasError] = useState(false);

  const src = images[name];
  const interactive = preview || !!onClick;

  const handleClick: React.MouseEventHandler<HTMLImageElement> = (e) => {
    if (preview) {
      e.stopPropagation();
      setOpen(true);
      return;
    }
    onClick?.(e);
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLImageElement> = (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    e.currentTarget.click();
  };

  if (!src) {
    if (import.meta.env.DEV) {
      console.warn(`[Image] name "${String(name)}" not found. Run \`npm run generate:images\`.`);
    }
    return null;
  }

  if (hasError) {
    const fallbackClassName = cn(IMAGE_FALLBACK_CLASSES, IMAGE_ROUNDED_CLASSES[rounded], className);
    return (
      <div aria-label={alt} className={fallbackClassName} role="img" style={{ width, height }}>
        <SystemIcon name="image-outline" size={24} />
      </div>
    );
  }

  const imageClassName = cn(
    IMAGE_FIT_CLASSES[fit],
    IMAGE_ROUNDED_CLASSES[rounded],
    interactive && IMAGE_INTERACTIVE_CLASSES,
    className,
  );

  return (
    <>
      <img
        alt={alt}
        aria-label={preview ? previewLabelOf(alt) : undefined}
        className={imageClassName}
        loading={loading}
        role={interactive ? 'button' : undefined}
        src={src}
        style={{ width, height }}
        tabIndex={interactive ? 0 : undefined}
        onClick={interactive ? handleClick : undefined}
        onError={() => setHasError(true)}
        onKeyDown={interactive ? handleKeyDown : undefined}
      />

      {preview && <ImageLightbox alt={alt} open={open} src={src} onOpenChange={setOpen} />}
    </>
  );
}

export default Image;
