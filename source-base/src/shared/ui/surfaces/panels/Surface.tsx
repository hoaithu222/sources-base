import { memo } from 'react';
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';

import { cn } from '@/shared/utils/style/cn';
import { HUD_HOVER_GLOW, HUD_PANEL_FILL } from '@/shared/ui/primitives/hud.theme';

export type SurfacePadding = 'none' | 'sm' | 'md' | 'lg';
export type SurfaceTone = 'base' | 'sunken';

export interface SurfaceProps {
  as?: ElementType;
  padding?: SurfacePadding;
  tone?: SurfaceTone;
  interactive?: boolean;
  rounded?: boolean;
  children?: ReactNode;
  className?: string;
}

/** Theme tối: mặt rọi từ trên (HUD_PANEL_FILL) + viền ánh xanh + quầng trong rất nhẹ — theme sáng chỉ viền + nền. */
const SURFACE_BASE_CLASSES = cn(
  'border border-border-default',
  HUD_PANEL_FILL,
  'dark:border-sky-5/30',
  'dark:shadow-[inset_0_1px_0_color-mix(in_srgb,var(--color-sky-5)_10%,transparent),inset_0_0_18px_-10px_color-mix(in_srgb,var(--color-sky-5)_30%,transparent)]',
);

const SURFACE_PADDING_CLASSES = {
  none: '',
  sm: 'p-2',
  md: 'p-3',
  lg: 'p-4',
} satisfies Record<SurfacePadding, string>;

const SURFACE_TONE_CLASSES = {
  base: 'bg-bg-surface',
  sunken: 'bg-bg-subtle',
} satisfies Record<SurfaceTone, string>;

const SURFACE_INTERACTIVE_CLASSES = cn(
  'cursor-pointer text-left transition-[border-color,box-shadow] duration-200 ease-out',
  'hover:border-primary-5/60 hover:shadow-[0_4px_14px_-6px_var(--color-shadow-popup)]',
  HUD_HOVER_GLOW,
  'active:border-primary-5 active:shadow-none',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus',
);

/**
 * Surface — mặt nền trần: khung `viền + nền` với 4 bậc đệm, không tiêu đề; nền chung cho hộp nội dung phẳng.
 *
 * Nhận thêm mọi thuộc tính của `<div>` (`onClick`, `role`, `aria-*`…). Cần tiêu đề → `BoxPanel`; khung
 * HUD → `HudFrame`.
 * Sửa giao diện: đệm → `SURFACE_PADDING_CLASSES` · nền → `SURFACE_TONE_CLASSES` · viền + mặt HUD (tối) → `SURFACE_BASE_CLASSES`
 * · phản hồi `interactive` → `SURFACE_INTERACTIVE_CLASSES`.
 * Lưu ý: `interactive` CHỈ đổi phản hồi hình (viền sáng, tay trỏ) — hộp bấm được phải là phần tử bấm thật
 * (`as="button"`, tự gắn `type="button"` để không gửi form) thì bàn phím và trình đọc màn hình mới với tới.
 * Lý do thiết kế: notes/components/surfaces.md.
 *
 * @param props.as - Thẻ / component render ra (`div`, `section`, `button`…). Mặc định `div`.
 * @param props.padding - Đệm trong: `none` | `sm` (8px) | `md` (12px) | `lg` (16px). Mặc định `none`.
 * @param props.tone - Nền: `base` (`bg-surface`) | `sunken` (`bg-subtle`, khi hộp nằm trên một mặt khác).
 *   Mặc định `base`.
 * @param props.interactive - `true` → tay trỏ + viền sáng và bóng nhẹ khi rê, vòng focus khi tab tới.
 *   Mặc định `false`.
 * @param props.rounded - `true` → bo góc `rounded`; mặc định VUÔNG cho khớp ngôn ngữ hình của bộ kit.
 * @param props.children - Nội dung.
 * @param props.className - Class thêm (đệm ngoài thang thì truyền ở đây).
 *
 * @example
 * <Surface padding="md" tone="sunken">…</Surface>
 *
 * <Surface as="button" padding="sm" interactive onClick={open}>Mở chi tiết</Surface>
 */
const Surface = memo(function Surface({
  as,
  padding = 'none',
  tone = 'base',
  interactive,
  rounded,
  children,
  className,
  ...rest
}: SurfaceProps & Omit<ComponentPropsWithoutRef<'div'>, keyof SurfaceProps>) {
  const Tag = (as ?? 'div') as ElementType;
  const buttonType = Tag === 'button' ? 'button' : undefined;

  const surfaceClassName = cn(
    SURFACE_BASE_CLASSES,
    SURFACE_PADDING_CLASSES[padding],
    SURFACE_TONE_CLASSES[tone],
    interactive && SURFACE_INTERACTIVE_CLASSES,
    rounded && 'rounded',
    className,
  );

  return (
    <Tag className={surfaceClassName} type={buttonType} {...rest}>
      {children}
    </Tag>
  );
});

export default Surface;
