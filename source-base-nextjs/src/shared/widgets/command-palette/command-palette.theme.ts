import { MODAL_OVERLAY_CLASS, MODAL_SLOT_CLASSES } from '@/shared/ui/overlays/modal.theme';
import { POPUP_ITEM_CLASS, POPUP_ITEM_ICON_CLASS } from '@/shared/ui/overlays/popup-surface.theme';
import { cn } from '@/shared/utils/style/cn';

/**
 * command-palette.theme.ts — bảng class của Command Palette (⌘K).
 *
 * Dùng:   <DialogPrimitive.Content className={COMMAND_PALETTE_SLOT_CLASSES.panel}>
 *         slot: overlay · panel · searchRow · escBadge · list · groupLabel · item · itemIcon
 *         · itemBody · itemText · footer · footerHint
 * Spotlight của macOS, CÙNG hình ở cả hai theme: lớp phủ gần như trong (không tối màn), bảng KÍNH mờ `rim-glass` neo ~16dvh,
 *         ô tìm chữ 18px, icon trong ô bo, hàng đang trỏ TÔ ĐẶC màu nhấn chữ trắng (như hàng chọn Finder). Tối chỉ khác bảng
 *         màu (token tự lật) — không ngoặc góc, không lưới, không ray đỉnh.
 * Lưu ý:  ⛔ KHÔNG dùng `MODAL_SLOT_CLASSES.panel` (canh giữa) — palette neo gần đỉnh, chỉ mượn `surface` (nền · viền · bóng ·
 *         bo `2xl` + `squircle`) của `MODAL_SLOT_CLASSES`.
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
  | 'itemIconTile'
  | 'itemBody'
  | 'itemText'
  | 'footer'
  | 'footerHint';

export const COMMAND_PALETTE_SLOT_CLASSES = {
  overlay: cn(MODAL_OVERLAY_CLASS, 'bg-neutral-10/10 backdrop-blur-[2px] backdrop-saturate-100'),
  panel: cn(
    'fixed inset-x-0 top-[16dvh] z-50 mx-auto flex w-[calc(100%-2rem)] max-w-xl flex-col sm:max-w-2xl',
    'max-h-[min(28rem,70dvh)] touch:max-h-[min(28rem,70dvh)] outline-none',
    'phone:top-0 phone:mx-0 phone:h-dvh phone:max-h-none phone:w-full phone:max-w-none phone:border-0',
    'phone:pt-[var(--safe-t,0px)] phone:pb-[var(--safe-b,0px)]',
    MODAL_SLOT_CLASSES.surface,
    'rim-glass bg-none bg-bg-glass backdrop-blur-2xl backdrop-saturate-180',
    'shadow-[inset_0_1px_0_color-mix(in_srgb,var(--color-neutral-0)_70%,transparent),0_0_0_1px_color-mix(in_srgb,var(--color-border-strong)_45%,transparent),0_28px_70px_-18px_var(--color-shadow-popup)]',
    'origin-top data-[state=open]:animate-pop-in data-[state=closed]:animate-pop-out',
  ),
  searchRow: cn(
    'relative flex shrink-0 items-center gap-2 px-1 py-1',
    'border-b border-divider-default',
    'px-2 py-1.5 [&_input]:text-body-18 [&_svg]:size-5!',
  ),
  escBadge: 'mr-1 shrink-0 max-lg:hidden touch:hidden',
  closeButton: 'mr-1',
  list: 'relative min-h-0 flex-1 overflow-y-auto p-1.5',
  groupLabel: 'px-2.5 pt-2.5 pb-1 text-caption-10-medium tracking-wide text-fg-muted uppercase',
  item: cn(
    POPUP_ITEM_CLASS,
    'group w-full text-left max-lg:min-h-12 touch:min-h-12',
    'gap-2.5 rounded-lg px-2 py-1.5',
    'data-[highlighted]:bg-primary-6 data-[highlighted]:text-neutral-0',
    'data-[highlighted]:shadow-[inset_0_1px_0_color-mix(in_srgb,var(--color-neutral-0)_22%,transparent)]',
    '[&[data-highlighted]_*]:text-neutral-0',
  ),
  itemIcon: cn(
    POPUP_ITEM_ICON_CLASS,
    'transition-colors duration-150 group-data-[highlighted]:text-action-base',
    'text-link group-data-[highlighted]:text-neutral-0',
  ),
  /** Ô bo bọc icon (như icon app trong Spotlight): mặt `bg-surface`, viền mảnh; hàng đang trỏ → ô thành lớp phủ trắng 20%. */
  itemIconTile: cn(
    'inline-flex shrink-0 items-center justify-center',
    'size-8 rounded-lg bg-bg-surface edge-hi',
    'shadow-[0_0_0_1px_color-mix(in_srgb,var(--color-border-strong)_55%,transparent),0_1px_2px_var(--color-shadow-popup)]',
    'transition-colors duration-150 group-data-[highlighted]:bg-neutral-0/20 group-data-[highlighted]:shadow-none',
  ),
  itemBody: 'min-w-0 flex-1',
  itemText: 'block truncate',
  footer: cn(
    'relative flex shrink-0 items-center gap-4 px-3 py-2',
    'border-t border-divider-default',
    'max-lg:hidden touch:hidden',
  ),
  footerHint: 'flex items-center gap-1.5 text-caption-12 text-fg-muted',
} satisfies Record<CommandPaletteSlot, string>;
