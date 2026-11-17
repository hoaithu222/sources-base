import { useState } from 'react';

import { cn } from '@/shared/utils/style/cn';
import { SystemIcon, type BoldSystemIconName } from '@/shared/ui/icons/Icons';
import ImageLightbox from '@/shared/ui/media/image/lightbox/ImageLightbox';
import { TEXT_ELLIPSIS_CLASSES } from '@/shared/ui/primitives/text-ellipsis.theme';

export type CardScreenshotVariant = 'default' | 'ghost' | 'solid';
export type CardScreenshotSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';
export type CardScreenshotAspect = 'square' | '4:3' | '16:9' | '21:9' | 'auto';
export type CardScreenshotRounded = 'none' | 'sm' | 'md' | 'lg';
export type CardScreenshotOverlay = 'none' | 'gradient' | 'solid';
export type CardScreenshotCaptionPos = 'below' | 'overlay' | 'none';

export interface CardScreenshotActionIcon {
  name: BoldSystemIconName;
  /** Nhãn trợ năng, dùng luôn cho tooltip gốc của trình duyệt. */
  label?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
}

export interface CardScreenshotProps {
  src?: string;
  alt?: string;
  title?: string;
  description?: string;

  variant?: CardScreenshotVariant;
  size?: CardScreenshotSize;
  aspect?: CardScreenshotAspect;
  rounded?: CardScreenshotRounded;
  overlay?: CardScreenshotOverlay;
  captionPos?: CardScreenshotCaptionPos;

  badge?: React.ReactNode;
  actions?: React.ReactNode;
  actionIcons?: CardScreenshotActionIcon[];
  footer?: React.ReactNode;
  placeholder?: React.ReactNode;

  preview?: boolean;
  onMediaClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;

  className?: string;
}

const CARD_SCREENSHOT_BASE_CLASSES = 'relative flex w-full flex-col overflow-hidden';

/** Thẻ trắng viền trung tính `border-default` + `--elev-1`, rê → `border-strong` + `--elev-2`; cùng một hình ở cả hai theme. */
const CARD_SCREENSHOT_VARIANT_CLASSES = {
  default: cn(
    'border border-border-default bg-bg-surface',
    'shadow-(--elev-1)',
    'transition-[border-color,box-shadow] duration-150 ease-out',
    'hover:border-border-strong hover:shadow-(--elev-2)',
  ),
  ghost: cn(
    'border border-divider-default bg-transparent',
    'transition-[border-color] duration-150 ease-out',
    'hover:border-border-strong',
  ),
  solid: cn(
    'border border-divider-default bg-bg-surface',
    'transition-[border-color,box-shadow] duration-150 ease-out',
    'hover:border-border-strong hover:shadow-(--elev-2)',
  ),
} satisfies Record<CardScreenshotVariant, string>;

const CARD_SCREENSHOT_SIZE_CLASSES = {
  sm: 'max-w-40',
  md: 'max-w-60',
  lg: 'max-w-80',
  xl: 'max-w-100',
  full: 'max-w-none',
} satisfies Record<CardScreenshotSize, string>;

const CARD_SCREENSHOT_ROUNDED_CLASSES = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
} satisfies Record<CardScreenshotRounded, string>;

const CARD_SCREENSHOT_ASPECT_CLASSES = {
  square: 'aspect-square',
  '4:3': 'aspect-[4/3]',
  '16:9': 'aspect-video',
  '21:9': 'aspect-[21/9]',
  auto: 'aspect-auto',
} satisfies Record<CardScreenshotAspect, string>;

const CARD_SCREENSHOT_OVERLAY_CLASSES = {
  none: 'hidden',
  gradient: 'bg-linear-to-t from-neutral-10/90 via-neutral-10/40 to-transparent',
  solid: 'bg-neutral-10/65',
} satisfies Record<CardScreenshotOverlay, string>;

const CARD_SCREENSHOT_ON_MEDIA_CLASSES = {
  caption: 'absolute inset-x-0 bottom-0 z-10 px-4 pb-3 pt-8',
  title: 'text-neutral-0',
  description: 'text-neutral-3',
} satisfies Record<'caption' | 'title' | 'description', string>;

const CARD_SCREENSHOT_MEDIA_TRIGGER_CLASSES = cn(
  'absolute inset-0 z-10 flex cursor-pointer items-center justify-center',
  'bg-neutral-10/40 text-neutral-0 opacity-0 transition-[opacity] duration-200 ease-out',
  'group-hover/media:opacity-100 focus-visible:opacity-100',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring-focus',
);

const CARD_SCREENSHOT_ACTION_BUTTON_CLASSES = cn(
  'flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md',
  'border border-neutral-0/20 bg-neutral-10/60 text-neutral-0 backdrop-blur-sm',
  'transition-[background-color,box-shadow,color,border-color] duration-150 ease-out',
  'enabled:hover:border-teal-5/60 enabled:hover:bg-neutral-10/85 enabled:hover:text-teal-5',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus',
  'disabled:cursor-not-allowed disabled:opacity-50',
);

/** Tên trợ năng của vùng ảnh khi bấm được: "Xem ảnh …" nếu mở lightbox, ngược lại là alt / tiêu đề. */
function mediaLabelOf(preview: boolean, alt: string, title?: string): string {
  const name = alt || title || '';
  if (preview) return name ? `Xem ảnh ${name}` : 'Xem ảnh';
  return name || 'Ảnh';
}

/**
 * CardScreenshot — thẻ ảnh / ảnh chụp màn hình có tiêu đề, mô tả, huy hiệu, nút nhanh và lightbox. Figma: 994-3063.
 *
 * Bấm vào ảnh: `preview` → mở `ImageLightbox`; không thì gọi `onMediaClick`. Khi đó vùng ảnh có một nút
 * phủ (rê chuột / focus thì tối ảnh, `preview` hiện icon mắt) nên vào được bằng Tab, Enter / Space kích
 * hoạt. `onClick` là của CẢ thẻ (chuột).
 * Chỉ cần ảnh thu nhỏ không khung → `ImagePreview`.
 * Sửa giao diện: khung → `CARD_SCREENSHOT_VARIANT_CLASSES` · cỡ → `CARD_SCREENSHOT_SIZE_CLASSES` · tỉ lệ
 * ảnh → `CARD_SCREENSHOT_ASPECT_CLASSES` · lớp phủ → `CARD_SCREENSHOT_OVERLAY_CLASSES` · lớp bấm trên ảnh →
 * `CARD_SCREENSHOT_MEDIA_TRIGGER_CLASSES` · nút góc → `CARD_SCREENSHOT_ACTION_BUTTON_CLASSES`.
 * Lưu ý: `actionIcons[].name` BẮT BUỘC `-bold` (icon nét mảnh chìm trên ảnh). Caption đè lên ảnh luôn chữ
 * sáng cố định. Lý do thiết kế: notes/components/surfaces-cards.md.
 *
 * @param props.src - URL ảnh; bỏ trống hoặc tải lỗi → hiện `placeholder`.
 * @param props.alt - Văn bản thay thế của ảnh (cũng là tên của lightbox). Mặc định `""`.
 * @param props.title - Tiêu đề (một dòng, cắt `…`).
 * @param props.description - Mô tả dưới tiêu đề (một dòng, cắt `…`).
 * @param props.variant - Khung: `default` (thẻ có bóng nghỉ) | `ghost` (trong suốt) | `solid` (nền mặt, phẳng).
 *   Mặc định `default`.
 * @param props.size - Bề rộng tối đa: `sm` 160px | `md` 240px | `lg` 320px | `xl` 400px | `full`.
 *   Mặc định `md`.
 * @param props.aspect - Tỉ lệ vùng ảnh: `square` | `4:3` | `16:9` | `21:9` | `auto`. Mặc định `4:3`.
 * @param props.rounded - Bo góc thẻ: `none` | `sm` | `md` | `lg`. Mặc định `lg`.
 * @param props.overlay - Lớp phủ trên ảnh: `none` | `gradient` (đỡ chữ caption) | `solid` (làm mờ cả ảnh).
 *   Mặc định `none`.
 * @param props.captionPos - Vị trí khối tiêu đề / mô tả: `below` | `overlay` (đè lên đáy ảnh) | `none`.
 *   Mặc định `below`.
 * @param props.badge - Góc trên trái của ảnh (vd `<Badge>` trạng thái).
 * @param props.actions - Góc trên phải, THAY `actionIcons`; bấm vào đây không kích hoạt lightbox / `onClick`.
 * @param props.actionIcons - Nút icon nhanh ở góc trên phải: `{ name, label?, onClick?, disabled? }[]`;
 *   mảng rỗng = không hiện.
 * @param props.footer - Hàng dưới caption (tag, tiến độ, meta…), có vạch ngăn phía trên.
 * @param props.placeholder - Nội dung thay icon ảnh mặc định khi không có `src` hoặc ảnh lỗi.
 * @param props.preview - `true` → bấm ảnh mở `ImageLightbox` (bỏ qua `onMediaClick`). Mặc định `false`.
 * @param props.onMediaClick - Bấm vùng ảnh (chuột hoặc Enter / Space); bỏ qua khi `preview`.
 * @param props.onClick - Bấm vào cả thẻ.
 * @param props.className - Class thêm cho thẻ.
 *
 * @example
 * <CardScreenshot src={url} alt="Mặt bằng tầng 3" title="Tầng 3" description="Cập nhật 02/10" preview />
 *
 * <CardScreenshot src={url} captionPos="overlay" overlay="gradient" title="Camera 01"
 *   actionIcons={[{ name: 'trash-bold', label: 'Xoá', onClick: remove }]} />
 */
function CardScreenshot({
  src,
  alt = '',
  title,
  description,
  variant = 'default',
  size = 'md',
  aspect = '4:3',
  rounded = 'lg',
  overlay = 'none',
  captionPos = 'below',
  badge,
  actions,
  actionIcons,
  footer,
  placeholder,
  preview = false,
  onMediaClick,
  onClick,
  className,
}: CardScreenshotProps) {
  const [hasError, setHasError] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const showPlaceholder = !src || hasError;
  const mediaInteractive = !showPlaceholder && (preview || !!onMediaClick);
  const onMedia = captionPos === 'overlay';
  const showActions = !!actions || (actionIcons?.length ?? 0) > 0;

  const handleMediaClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (showPlaceholder) return;
    if (preview) {
      e.stopPropagation();
      setLightboxOpen(true);
      return;
    }
    onMediaClick?.(e);
  };

  const cardClassName = cn(
    CARD_SCREENSHOT_BASE_CLASSES,
    CARD_SCREENSHOT_VARIANT_CLASSES[variant],
    CARD_SCREENSHOT_SIZE_CLASSES[size],
    CARD_SCREENSHOT_ROUNDED_CLASSES[rounded],
    onClick && 'cursor-pointer',
    className,
  );
  const mediaClassName = cn(
    'relative w-full overflow-hidden',
    CARD_SCREENSHOT_ASPECT_CLASSES[aspect],
    mediaInteractive && 'group/media cursor-pointer',
  );
  const overlayClassName = cn(
    'pointer-events-none absolute inset-0',
    CARD_SCREENSHOT_OVERLAY_CLASSES[overlay],
  );
  const captionClassName = cn(
    'flex flex-col gap-1 px-4 py-3',
    onMedia && CARD_SCREENSHOT_ON_MEDIA_CLASSES.caption,
  );
  const titleClassName = cn(
    TEXT_ELLIPSIS_CLASSES,
    'text-body-14-semibold text-fg-heading',
    onMedia && CARD_SCREENSHOT_ON_MEDIA_CLASSES.title,
  );
  const descriptionClassName = cn(
    TEXT_ELLIPSIS_CLASSES,
    'text-caption-12 text-fg-body',
    onMedia && CARD_SCREENSHOT_ON_MEDIA_CLASSES.description,
  );

  const captionBlock = (title || description) && captionPos !== 'none' && (
    <div className={captionClassName}>
      {title && <p className={titleClassName}>{title}</p>}
      {description && <p className={descriptionClassName}>{description}</p>}
    </div>
  );

  return (
    <>
      <div className={cardClassName} onClick={onClick}>
        <div className={mediaClassName} onClick={handleMediaClick}>
          {showPlaceholder ? (
            <div className="absolute inset-0 flex items-center justify-center bg-bg-subtle">
              {placeholder ?? <SystemIcon className="text-fg-muted" name="image-bold" size={40} />}
            </div>
          ) : (
            <img
              alt={alt}
              className="absolute inset-0 size-full object-cover"
              loading="lazy"
              src={src}
              onError={() => setHasError(true)}
            />
          )}

          <div aria-hidden className={overlayClassName} />

          {mediaInteractive && (
            <button
              aria-label={mediaLabelOf(preview, alt, title)}
              className={CARD_SCREENSHOT_MEDIA_TRIGGER_CLASSES}
              type="button"
            >
              {preview && <SystemIcon name="eye-bold" size={20} />}
            </button>
          )}

          {!!badge && (
            <div className="absolute left-3 top-3 z-10 flex items-center gap-2 rounded-full bg-bg-surface/90 backdrop-blur-sm">
              {badge}
            </div>
          )}

          {showActions && (
            <div
              className="absolute right-3 top-3 z-10 flex items-center gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              {actions
                ? actions
                : actionIcons?.map((a) => (
                    <button
                      key={a.name + (a.label ?? '')}
                      aria-label={a.label ?? a.name}
                      className={CARD_SCREENSHOT_ACTION_BUTTON_CLASSES}
                      disabled={a.disabled}
                      title={a.label}
                      type="button"
                      onClick={a.onClick}
                    >
                      <SystemIcon name={a.name} size={14} />
                    </button>
                  ))}
            </div>
          )}

          {onMedia && captionBlock}
        </div>

        {captionPos === 'below' && captionBlock}

        {!!footer && <div className="border-t border-divider-default px-4 py-3">{footer}</div>}
      </div>

      {preview && src && !hasError && (
        <ImageLightbox alt={alt} open={lightboxOpen} src={src} onOpenChange={setLightboxOpen} />
      )}
    </>
  );
}

export default CardScreenshot;
