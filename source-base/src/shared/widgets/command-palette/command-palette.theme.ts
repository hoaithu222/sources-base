import { MODAL_OVERLAY_CLASS, MODAL_SLOT_CLASSES } from '@/shared/ui/overlays/modal.theme';
import { POPUP_ITEM_CLASS, POPUP_ITEM_ICON_CLASS } from '@/shared/ui/overlays/popup-surface.theme';
import { cn } from '@/shared/utils/style/cn';

/**
 * command-palette.theme.ts — bảng class của Command Palette (⌘K).
 *
 * Dùng:   <DialogPrimitive.Content className={COMMAND_PALETTE_SLOT_CLASSES.panel}>
 *         slot: overlay · panel · searchRow · escBadge · list · groupLabel · item · itemIcon
 *         · itemBody · itemText · footer · footerHint
 *         ngoặc góc: COMMAND_PALETTE_CORNER_CLASSES (tl · tr · bl · br) · vân + vạch đỉnh: COMMAND_PALETTE_DECOR_CLASSES
 * Lưu ý:  ⛔ `overflow-visible` ở `panel` BẮT BUỘC (4 ngoặc góc nằm ngoài biên); KHÔNG `rounded-*`.
 *         ⛔ KHÔNG dùng `MODAL_SLOT_CLASSES.panel` (canh giữa) — palette neo gần đỉnh, chỉ mượn `surface` (nền ·
 *         viền · bóng: light sạch, dark quầng — cùng Modal) và slot trang trí `texture` / `corner` / `topRail`
 *         của `MODAL_SLOT_CLASSES`.
 */

type CommandPaletteSlot =
  | 'overlay'
  | 'panel'
  | 'searchRow'
  | 'escBadge'
  | 'closeButton'
  | 'list'
  | 'groupLabel'
  | 'item'
  | 'itemIcon'
  | 'itemBody'
  | 'itemText'
  | 'footer'
  | 'footerHint';

type CommandPaletteCorner = 'tl' | 'tr' | 'bl' | 'br';

export const COMMAND_PALETTE_SLOT_CLASSES = {
  overlay: MODAL_OVERLAY_CLASS,
  panel: cn(
    'fixed inset-x-0 top-[10dvh] z-50 mx-auto flex w-[calc(100%-2rem)] max-w-xl flex-col',
    'max-h-[min(28rem,70dvh)] touch:max-h-[min(28rem,70dvh)] overflow-visible outline-none',
    'phone:top-0 phone:mx-0 phone:h-dvh phone:max-h-none phone:w-full phone:max-w-none phone:border-0',
    'phone:pt-[var(--safe-t,0px)] phone:pb-[var(--safe-b,0px)]',
    MODAL_SLOT_CLASSES.surface,
    'origin-top data-[state=open]:animate-pop-in data-[state=closed]:animate-pop-out',
  ),
  searchRow: cn(
    'relative flex shrink-0 items-center gap-2 px-1 py-1',
    'border-b border-divider-default dark:border-divider-strong',
  ),
  escBadge: 'mr-1 shrink-0 max-lg:hidden touch:hidden',
  closeButton: 'mr-1',
  list: 'relative min-h-0 flex-1 overflow-y-auto p-1.5',
  groupLabel: 'px-2.5 pt-2.5 pb-1 text-caption-10-medium tracking-wide text-fg-muted uppercase',
  item: cn(POPUP_ITEM_CLASS, 'group w-full text-left max-lg:min-h-12 touch:min-h-12'),
  itemIcon: cn(
    POPUP_ITEM_ICON_CLASS,
    'transition-colors duration-150 group-data-[highlighted]:text-action-base',
  ),
  itemBody: 'min-w-0 flex-1',
  itemText: 'block truncate',
  footer: cn(
    'relative flex shrink-0 items-center gap-4 px-3 py-2',
    'border-t border-divider-default dark:border-divider-strong',
    'max-lg:hidden touch:hidden',
  ),
  footerHint: 'flex items-center gap-1.5 text-caption-12 text-fg-muted',
} satisfies Record<CommandPaletteSlot, string>;

export const COMMAND_PALETTE_DECOR_CLASSES = {
  texture: MODAL_SLOT_CLASSES.texture,
  topRail: MODAL_SLOT_CLASSES.topRail,
} satisfies Record<'texture' | 'topRail', string>;

export const COMMAND_PALETTE_CORNER_CLASSES = {
  tl: cn(MODAL_SLOT_CLASSES.corner.tl, 'phone:hidden'),
  tr: cn(MODAL_SLOT_CLASSES.corner.tr, 'phone:hidden'),
  bl: cn(MODAL_SLOT_CLASSES.corner.bl, 'phone:hidden'),
  br: cn(MODAL_SLOT_CLASSES.corner.br, 'phone:hidden'),
} satisfies Record<CommandPaletteCorner, string>;
