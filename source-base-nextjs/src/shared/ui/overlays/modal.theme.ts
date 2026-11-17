import { HUD_TITLE_MARK } from '@/shared/ui/primitives/hud.theme';
import { cn } from '@/shared/utils/style/cn';

/**
 * modal.theme — lớp phủ, khung panel và class header · body · footer chung của lớp nổi toàn màn (Modal · FormModal · Drawer · CommandPalette).
 *
 * Dùng:   MODAL_SLOT_CLASSES.panel / .surface · MODAL_OVERLAY_CLASS cho <Dialog.Overlay> · MODAL_LAYOUT_CLASSES cho header / body / footer
 * Sửa:    vị trí + hiệu ứng → MODAL_PANEL_BASE_CLASSES · nền / viền / bóng → MODAL_SURFACE_CLASSES · layout → MODAL_LAYOUT_CLASSES
 * Lưu ý:  ⛔ MỘT diện mạo cho cả hai theme (sheet macOS): viền mảnh + bóng mềm + `rounded-2xl` (20px), đệm 20px, tiêu đề 18px,
 *         nút dồn phải dạng viên; màu do token tự đảo. Panel `overflow-hidden` (góc bo sạch). Màu var(--color-*) + color-mix(),
 *         KHÔNG rgba/hex; canh giữa `inset-0 m-auto h-fit` KHÔNG translate; cao luôn `dvh` KHÔNG `vh`; body KHÔNG
 *         `[scrollbar-gutter:stable]`. CommandPalette mượn `MODAL_SLOT_CLASSES.surface` — đổi khoá là sửa luôn nó; `texture` ·
 *         `topRail` · `corner` đã vô hiệu (`hidden`, @deprecated). Lý do: notes/components/overlays.md#modal
 */

type ModalCorner = 'tl' | 'tr' | 'bl' | 'br';

/** Class từng phần của khung panel; `texture` · `topRail` · `corner` đã vô hiệu, còn để nơi mượn (CommandPalette) vẫn biên dịch. */
export interface ModalSlotClasses {
  /** Panel canh giữa màn: vị trí + hiệu ứng mở / đóng + `surface`. */
  panel: string;
  /** Chỉ nền · viền · bóng của panel (không vị trí) — cho lớp nổi tự định vị như CommandPalette. */
  surface: string;
  /** @deprecated Đã vô hiệu (luôn `hidden`) — gỡ phần tử ở nơi mượn. */
  topRail: string;
  /** @deprecated Đã vô hiệu (luôn `hidden`) — gỡ phần tử ở nơi mượn. */
  texture: string;
  /** @deprecated Đã vô hiệu (luôn `hidden`) — gỡ phần tử ở nơi mượn. */
  corner: Record<ModalCorner, string>;
}

/** Lớp phủ kính mờ KHÔNG animation — nền chung của mọi lớp phủ toàn màn: màn mực 32% + mờ 6px (nền trang còn hình khối, hộp thoại nổi nhờ bóng). */
export const MODAL_OVERLAY_BASE =
  'fixed inset-0 z-50 bg-neutral-10/32 backdrop-blur-[6px] backdrop-saturate-125';

/** `className` cho `<Dialog.Overlay>` của Modal · FormModal · Drawer · CommandPalette (kính mờ + fade). */
export const MODAL_OVERLAY_CLASS = cn(
  MODAL_OVERLAY_BASE,
  'data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out',
);

const MODAL_PANEL_BASE_CLASSES = cn(
  'fixed inset-0 z-50 m-auto h-fit',
  'flex flex-col outline-none',
  'max-w-[calc(100vw-32px)] max-h-[calc(100dvh-32px)]',
  'max-lg:max-w-[92vw] max-lg:max-h-[92dvh] touch:max-h-[92dvh]',
  'phone:w-[calc(100vw-16px)] phone:max-w-[calc(100vw-16px)]',
  'phone:max-h-[calc(100dvh-16px-var(--safe-t,0px)-var(--safe-b,0px))]',
  'data-[state=open]:animate-pop-in data-[state=closed]:animate-pop-out',
);

/** Góc + tràn nằm ở BỀ MẶT (không ở panel) để CommandPalette mượn `surface` cũng được góc bo sạch như Modal. */
const MODAL_SURFACE_CLASSES = cn(
  'rim-soft squircle rounded-2xl overflow-hidden border border-border-default',
  'bg-linear-to-b from-bg-dialog-raised via-bg-dialog to-bg-dialog',
  'shadow-[0_24px_64px_-16px_var(--color-shadow-popup),0_8px_24px_-12px_var(--color-shadow-popup)]',
);

const MODAL_RETIRED_DECOR_CLASS = 'hidden';

/** Khung hộp thoại — Modal, FormModal; CommandPalette mượn `surface`. */
export const MODAL_SLOT_CLASSES = {
  panel: cn(MODAL_PANEL_BASE_CLASSES, MODAL_SURFACE_CLASSES),
  surface: MODAL_SURFACE_CLASSES,
  topRail: MODAL_RETIRED_DECOR_CLASS,
  texture: MODAL_RETIRED_DECOR_CLASS,
  corner: {
    tl: MODAL_RETIRED_DECOR_CLASS,
    tr: MODAL_RETIRED_DECOR_CLASS,
    bl: MODAL_RETIRED_DECOR_CLASS,
    br: MODAL_RETIRED_DECOR_CLASS,
  },
} satisfies ModalSlotClasses;

/** Class của nút ✕ chung — `ModalCloseButton` ghép `base` + `forced` (khi `showClose={false}`) / `floating` (không header). */
export const MODAL_CLOSE_CLASSES = {
  base: cn(
    'relative z-10 -my-1 flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md',
    "after:absolute after:-inset-1.5 after:content-['']",
    'bg-transparent text-fg-muted outline-none',
    'transition-[color,background-color,box-shadow] duration-150 ease-out',
    'enabled:hover:bg-bg-nav-hover enabled:hover:text-fg-heading enabled:active:bg-bg-nav-active',
    'focus-visible:ring-2 focus-visible:ring-ring-focus',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'max-lg:size-10 max-lg:bg-fg-heading/10 max-lg:text-fg-heading',
    'touch:size-10 touch:bg-fg-heading/10 touch:text-fg-heading',
    'max-lg:[&>svg]:size-5! touch:[&>svg]:size-5!',
  ),
  forced: 'hidden max-lg:flex touch:flex',
  floating: cn(
    'absolute right-2 top-2 z-30 my-0',
    'max-lg:bg-bg-dialog touch:bg-bg-dialog',
    'max-lg:shadow-[0_2px_8px_var(--color-shadow-popup)] touch:shadow-[0_2px_8px_var(--color-shadow-popup)]',
  ),
};

/** Class từng phần header · body · footer; ghép bằng `cn()` ở nơi dùng (Modal, CustomModalLayout, Drawer, ConfirmDialog). */
export const MODAL_LAYOUT_CLASSES = {
  root: 'flex w-full flex-col overflow-hidden',
  header: cn(
    'relative flex shrink-0 items-center justify-between gap-3 px-5',
    'max-lg:items-center touch:items-center',
  ),
  /** Dải header = viền (`headerBand`: vạch đáy 1px `divider-default`) + ruột (`headerBandFill`) phủ hết trừ phần viền. */
  headerBand: 'pointer-events-none absolute inset-0 bg-divider-default',
  headerBandFill: cn(
    'pointer-events-none absolute top-0 right-0 bottom-px left-0',
    'bg-linear-to-b from-bg-dialog-raised to-bg-dialog',
  ),
  /** Dấu tiêu đề (đồng bộ BoxPanel); hàng tiêu đề `items-start` + `mt-1.5` = giữa dòng chữ 28px đầu tiên (chữ 18px). */
  titleBar: cn(HUD_TITLE_MARK, 'mt-1.5'),
  title: cn(
    'overflow-x-clip overflow-y-visible text-ellipsis whitespace-nowrap',
    'text-body-18-semibold text-fg-heading',
    'max-lg:whitespace-normal max-lg:break-words touch:whitespace-normal touch:break-words',
  ),
  body: 'relative min-h-0 flex-1 overflow-auto overscroll-contain',
  footer: cn(
    'relative flex shrink-0 items-center justify-end gap-3 px-5 pt-4 pb-[calc(1.25rem+var(--safe-b,0px))]',
    'bg-linear-to-t from-bg-dialog-raised/50 via-bg-dialog-raised/15 to-transparent',
    "before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:content-['']",
    'before:bg-linear-to-r before:from-transparent before:via-divider-strong before:to-transparent',
  ),
};
