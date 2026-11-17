import { cn } from '@/shared/utils/style/cn';
import { HUD_PANEL_FILL } from '@/shared/ui/primitives/hud.theme';
import { TEXT_ELLIPSIS_CLASSES } from '@/shared/ui/primitives/text-ellipsis.theme';
import type { PanelCardDensity, PanelCardVariant } from './panel-card.types';

/**
 * Bảng class của PanelCard — PanelCard.tsx chỉ chọn ô rồi ghép bằng cn().
 * Sửa: đệm / chữ → PANEL_CARD_DENSITY_CLASSES · nền → PANEL_CARD_VARIANT_CLASSES · header → PANEL_CARD_HEADER.
 */

type PanelCardPart = 'root' | 'body' | 'footer' | 'titleRow' | 'title' | 'note' | 'state';
type PanelCardDensityPart = 'body' | 'footer' | 'title' | 'note';

export const PANEL_CARD_BASE_CLASSES = {
  root: 'flex h-full min-h-0 flex-col overflow-hidden',
  body: 'relative min-h-0 flex-1 overflow-hidden',
  footer: 'flex shrink-0 items-center justify-between gap-2 border-t border-border-default',
  titleRow: 'flex min-w-0 items-baseline gap-1.5',
  title: cn(TEXT_ELLIPSIS_CLASSES, 'text-fg-heading'),
  note: 'shrink-0 tabular-nums text-fg-muted',
  state: 'flex h-full min-h-0 flex-col items-center justify-center gap-2',
} satisfies Record<PanelCardPart, string>;

export const PANEL_CARD_DENSITY_CLASSES = {
  compact: {
    body: 'p-1.5',
    footer: 'px-1.5 py-1',
    title: 'text-caption-12-semibold',
    note: 'text-caption-10',
  },
  default: {
    body: 'p-2',
    footer: 'px-2 py-1.5',
    title: 'text-body-14-semibold',
    note: 'text-caption-12',
  },
  relaxed: {
    body: 'p-3',
    footer: 'px-3 py-2',
    title: 'text-body-16-semibold',
    note: 'text-body-13',
  },
} satisfies Record<PanelCardDensity, Record<PanelCardDensityPart, string>>;

/** Class của vỏ `section`; `hud` để trống vì khung do `HudFrame` vẽ; `plain` theme tối cùng mặt `Surface`. */
export const PANEL_CARD_VARIANT_CLASSES = {
  hud: '',
  overlay: cn(
    'border border-border-strong shadow-[0_8px_24px_var(--color-shadow-popup)]',
    'bg-[color-mix(in_srgb,var(--color-bg-surface)_92%,transparent)]',
  ),
  plain: cn('border border-border-default bg-bg-surface', HUD_PANEL_FILL, 'dark:border-sky-5/30'),
} satisfies Record<PanelCardVariant, string>;

export const PANEL_CARD_FLUSH_CLASSES = {
  body: 'p-0',
  state: 'p-3',
} satisfies Record<'body' | 'state', string>;

/** Hình học header theo density, truyền thẳng xuống `DetailPanelHeader`. */
export const PANEL_CARD_HEADER = {
  compact: { size: 'sm', className: 'min-h-7', innerClassName: 'gap-1 px-1.5 py-0.5' },
  default: { size: 'sm', className: 'min-h-8', innerClassName: 'gap-1.5 px-2 py-1' },
  relaxed: { size: 'md', className: 'min-h-10', innerClassName: 'gap-2 px-3 py-1.5' },
} satisfies Record<
  PanelCardDensity,
  { size: 'sm' | 'md'; className: string; innerClassName: string }
>;

export const PANEL_CARD_ACTION_ICON = {
  compact: 12,
  default: 14,
  relaxed: 16,
} satisfies Record<PanelCardDensity, number>;

/** Nới vùng chạm của nút header bằng `::after` (chỉ `touch:`) mà không phóng nút. */
export const PANEL_CARD_TOUCH_HIT =
  "relative touch:after:absolute touch:after:-inset-1.5 touch:after:content-['']";
