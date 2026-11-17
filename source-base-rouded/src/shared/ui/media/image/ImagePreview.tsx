import { useState } from 'react';
import Skeleton from '@/shared/ui/feedback/Skeleton';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import { cn } from '@/shared/utils/style/cn';
import ImageLightbox from './lightbox/ImageLightbox';

export type ImagePreviewSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';
export type ImagePreviewRounded = 'none' | 'sm' | 'md' | 'full';

export interface ImagePreviewProps extends Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  'src' | 'alt' | 'className' | 'onClick'
> {
  src?: string;
  alt?: string;
  disabled?: boolean;
  size?: ImagePreviewSize;
  rounded?: ImagePreviewRounded;
  preview?: boolean;
  fallback?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  className?: string;
}

const IMAGE_PREVIEW_BASE_CLASSES = 'group/preview relative shrink-0 overflow-hidden';

const IMAGE_PREVIEW_SIZE_CLASSES = {
  sm: 'size-8',
  md: 'size-11',
  lg: 'size-16',
  xl: 'size-20',
  full: 'size-full shrink',
} satisfies Record<ImagePreviewSize, string>;

const IMAGE_PREVIEW_ROUNDED_CLASSES = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  full: 'rounded-full',
} satisfies Record<ImagePreviewRounded, string>;

const IMAGE_PREVIEW_INTERACTIVE_CLASSES =
  'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus';

/** Ô chưa có ảnh / ảnh lỗi — nền chìm + icon mờ. */
const IMAGE_PREVIEW_PLACEHOLDER_CLASSES =
  'flex size-full items-center justify-center bg-bg-subtle text-fg-muted';

const IMAGE_PREVIEW_IMAGE_CLASSES =
  'absolute inset-0 size-full max-w-none object-cover transition-[opacity] duration-200 ease-out';

const IMAGE_PREVIEW_MASK_CLASSES = cn(
  'pointer-events-none absolute inset-0 flex items-center justify-center',
  'bg-neutral-10/45 text-neutral-0 opacity-0 transition-[opacity] duration-200 ease-out',
  'group-hover/preview:opacity-100 group-focus-visible/preview:opacity-100',
);

const IMAGE_PREVIEW_ICON_SIZES = {
  sm: 12,
  md: 20,
  lg: 28,
  xl: 32,
  full: 40,
} satisfies Record<ImagePreviewSize, number>;

const IMAGE_PREVIEW_MASK_ICON_SIZES = {
  sm: 14,
  md: 16,
  lg: 20,
  xl: 20,
  full: 24,
} satisfies Record<ImagePreviewSize, number>;

/** Tên trợ năng của khung bấm được: "Xem ảnh …" khi mở lightbox, ngược lại là `alt`. */
function interactiveLabelOf(preview: boolean, alt: string): string {
  if (preview) return alt ? `Xem ảnh ${alt}` : 'Xem ảnh';
  return alt || 'Ảnh';
}

/**
 * ImagePreview — ảnh thu nhỏ từ URL: khung chờ tải, placeholder dự phòng, lightbox tuỳ chọn. Figma PMS-NEW 994-1697.
 *
 * Nhận thêm thuộc tính của `<img>` (`srcSet`, `referrerPolicy`, `onLoad`…), gắn vào thẻ ảnh bên trong.
 * Có `preview` hoặc `onClick` (và đang có ảnh) thì khung bấm được: `role="button"`, vào được bằng Tab,
 * Enter / Space kích hoạt; rê chuột / focus thì tối ảnh (`preview` hiện icon mắt). Ảnh chưa tải xong thì hiện
 * `Skeleton` rồi ảnh mờ dần vào. Ảnh hệ thống theo tên → `Image`; thẻ ảnh có tiêu đề → `CardScreenshot`.
 * Sửa giao diện: cỡ → `IMAGE_PREVIEW_SIZE_CLASSES` · bo góc → `IMAGE_PREVIEW_ROUNDED_CLASSES` · lớp rê chuột →
 * `IMAGE_PREVIEW_MASK_CLASSES`.
 * Lưu ý: lấp đầy khung cha dùng `size="full"` — `className="w-full"` trên cỡ cố định KHÔNG gỡ được
 * `size-*`. Ghi đè `onError` thì placeholder lỗi không bật. Lý do thiết kế: notes/components/media.md.
 *
 * @param props.src - URL ảnh; bỏ trống → placeholder.
 * @param props.alt - Văn bản thay thế (cũng là tên của lightbox). Mặc định `""`.
 * @param props.disabled - `true` → luôn hiện placeholder, không bấm được. Mặc định `false`.
 * @param props.size - Cỡ khung: `sm` 32px | `md` 44px | `lg` 64px | `xl` 80px | `full` (lấp khung cha).
 *   Mặc định `md`.
 * @param props.rounded - Bo góc khung: `none` | `sm` | `md` | `full`. Mặc định `none`.
 * @param props.preview - `true` → bấm ảnh mở lightbox toàn màn hình (xoay / zoom); bỏ qua `onClick`.
 *   Mặc định `false`.
 * @param props.fallback - Nội dung thay icon mặc định khi không có `src` / `disabled` / lỗi tải.
 * @param props.onClick - Bấm khung ảnh (chuột hoặc Enter / Space); không gọi khi đang hiện placeholder.
 * @param props.className - Class thêm cho khung ngoài.
 * @param props.loading - `loading` của `<img>`; UI kit đổi mặc định thành `lazy`.
 *
 * @example
 * <ImagePreview src={url} alt="Ảnh hiện trường" preview />
 *
 * <ImagePreview src={url} size="lg" rounded="md" fallback={<Text size="tiny">Chưa có ảnh</Text>} />
 */
function ImagePreview({
  src,
  alt = '',
  disabled = false,
  size = 'md',
  rounded = 'none',
  preview = false,
  fallback,
  onClick,
  className,
  loading = 'lazy',
  onLoad,
  ...imgProps
}: ImagePreviewProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const hasError = !!src && failedSrc === src;
  const showPlaceholder = disabled || !src || hasError;
  const isInteractive = !showPlaceholder && (preview || !!onClick);
  const loaded = loadedSrc === src;

  const handleClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (showPlaceholder) return;
    if (preview) {
      setLightboxOpen(true);
      return;
    }
    onClick?.(e);
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.target !== e.currentTarget || (e.key !== 'Enter' && e.key !== ' ')) return;
    e.preventDefault();
    e.currentTarget.click();
  };

  const handleLoad: React.ReactEventHandler<HTMLImageElement> = (e) => {
    setLoadedSrc(src ?? null);
    onLoad?.(e);
  };

  const rootClassName = cn(
    IMAGE_PREVIEW_BASE_CLASSES,
    IMAGE_PREVIEW_SIZE_CLASSES[size],
    IMAGE_PREVIEW_ROUNDED_CLASSES[rounded],
    isInteractive && IMAGE_PREVIEW_INTERACTIVE_CLASSES,
    className,
  );

  return (
    <>
      <div
        aria-label={isInteractive ? interactiveLabelOf(preview, alt) : undefined}
        className={rootClassName}
        role={isInteractive ? 'button' : undefined}
        tabIndex={isInteractive ? 0 : undefined}
        onClick={handleClick}
        onKeyDown={isInteractive ? handleKeyDown : undefined}
      >
        {showPlaceholder ? (
          <div className={IMAGE_PREVIEW_PLACEHOLDER_CLASSES}>
            {fallback ?? <SystemIcon name="image-outline" size={IMAGE_PREVIEW_ICON_SIZES[size]} />}
          </div>
        ) : (
          <>
            {!loaded && (
              <span aria-hidden className="absolute inset-0">
                <Skeleton className="size-full" />
              </span>
            )}
            <img
              alt={alt}
              className={cn(IMAGE_PREVIEW_IMAGE_CLASSES, !loaded && 'opacity-0')}
              loading={loading}
              src={src}
              onError={() => setFailedSrc(src ?? null)}
              onLoad={handleLoad}
              {...imgProps}
            />
          </>
        )}

        {isInteractive && (
          <span aria-hidden className={IMAGE_PREVIEW_MASK_CLASSES}>
            {preview && <SystemIcon name="eye-bold" size={IMAGE_PREVIEW_MASK_ICON_SIZES[size]} />}
          </span>
        )}
      </div>

      {preview && src && !hasError && (
        <ImageLightbox alt={alt} open={lightboxOpen} src={src} onOpenChange={setLightboxOpen} />
      )}
    </>
  );
}

export default ImagePreview;
