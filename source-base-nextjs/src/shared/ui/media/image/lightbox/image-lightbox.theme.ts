import { cn } from '@/shared/utils/style/cn';

/**
 * image-lightbox.theme — bề mặt nổi + nút nổi dùng chung của khung xem ảnh (thanh công cụ, bộ đếm, nút góc, nút ‹ ›).
 *
 * Dùng:   cn(IMAGE_LIGHTBOX_SURFACE_CLASSES, 'px-3 py-1.5') · cn(IMAGE_LIGHTBOX_FLOAT_BUTTON_CLASSES, 'size-9')
 * Sửa:    nền / viền / bóng → IMAGE_LIGHTBOX_SURFACE_CLASSES
 *         · hover / focus của nút nổi → IMAGE_LIGHTBOX_FLOAT_BUTTON_CLASSES
 * Lưu ý:  nút nổi đè thẳng lên lớp phủ nên hover dùng nền ĐỤC (`bg-dialog-raised`), KHÔNG `bg-nav-hover` (trong suốt
 *         → lộ ảnh phía sau); nút NẰM TRONG thanh công cụ (`LightboxToolButton`) mới dùng `bg-nav-hover`.
 *         MỘT diện mạo cho cả hai theme, KHÔNG quầng.
 *         Góc: bề mặt `rounded-lg` · nút nổi `rounded-md` (tầng control).
 */

export const IMAGE_LIGHTBOX_SURFACE_CLASSES = cn(
  'rounded-lg border border-border-strong bg-bg-popup backdrop-blur-md',
  'shadow-[0_8px_24px_var(--color-shadow-popup)]',
);

export const IMAGE_LIGHTBOX_FLOAT_BUTTON_CLASSES = cn(
  IMAGE_LIGHTBOX_SURFACE_CLASSES,
  'flex cursor-pointer items-center justify-center rounded-md text-fg-subheading outline-none',
  'transition-[color,background-color,border-color,box-shadow] duration-150 ease-out',
  'hover:border-primary-5/50 hover:bg-bg-dialog-raised hover:text-fg-heading active:bg-bg-pressed',
  'focus-visible:ring-2 focus-visible:ring-ring-focus',
);
