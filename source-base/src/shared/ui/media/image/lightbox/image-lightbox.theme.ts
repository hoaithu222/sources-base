import { cn } from '@/shared/utils/style/cn';
import { HUD_HOVER_GLOW, HUD_PANEL_FILL } from '@/shared/ui/primitives/hud.theme';

/**
 * image-lightbox.theme — bề mặt nổi + nút nổi dùng chung của khung xem ảnh (thanh công cụ, bộ đếm, nút góc, nút ‹ ›).
 *
 * Dùng:   cn(IMAGE_LIGHTBOX_SURFACE_CLASSES, 'px-3 py-1.5') · cn(IMAGE_LIGHTBOX_FLOAT_BUTTON_CLASSES, 'size-9')
 * Sửa:    nền / viền / bóng → IMAGE_LIGHTBOX_SURFACE_CLASSES
 *         · hover / focus của nút nổi → IMAGE_LIGHTBOX_FLOAT_BUTTON_CLASSES
 * Lưu ý:  nút nổi đè thẳng lên lớp phủ nên hover dùng nền ĐỤC (`bg-dialog-raised`), KHÔNG `bg-nav-hover` (trong suốt
 *         → lộ ảnh phía sau); nút NẰM TRONG thanh công cụ (`LightboxToolButton`) mới dùng `bg-nav-hover`.
 *         Quầng teal, mặt rọi từ trên (`HUD_PANEL_FILL`), quầng rê (`HUD_HOVER_GLOW`) chỉ qua `dark:`.
 */

export const IMAGE_LIGHTBOX_SURFACE_CLASSES = cn(
  'border border-border-strong bg-bg-popup backdrop-blur-md',
  HUD_PANEL_FILL,
  'shadow-[0_8px_24px_var(--color-shadow-popup)]',
  'dark:border-border-popup dark:shadow-[0_0_20px_color-mix(in_srgb,var(--color-teal-5)_12%,transparent),0_8px_24px_var(--color-shadow-popup)]',
);

export const IMAGE_LIGHTBOX_FLOAT_BUTTON_CLASSES = cn(
  IMAGE_LIGHTBOX_SURFACE_CLASSES,
  'flex cursor-pointer items-center justify-center text-fg-subheading outline-none',
  'transition-[color,background-color,border-color,box-shadow] duration-150 ease-out',
  'hover:border-primary-5/50 hover:bg-bg-dialog-raised hover:text-fg-heading active:bg-bg-pressed',
  HUD_HOVER_GLOW,
  'focus-visible:ring-2 focus-visible:ring-ring-focus',
);
