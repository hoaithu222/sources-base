import { HUD_TITLE_MARK } from '@/shared/ui/primitives/hud.theme';
import { cn } from '@/shared/utils/style/cn';

/**
 * modal.theme — lớp phủ, khung panel và trang trí chung của mọi lớp nổi toàn màn (Modal · FormModal ·
 * Drawer · CommandPalette).
 *
 * Dùng:   MODAL_SLOT_CLASSES.panel / .surface / .corner.tl … (khung mặc định) · MODAL_HUD_SLOT_CLASSES (HUD)
 *         · MODAL_OVERLAY_CLASS cho <Dialog.Overlay> · MODAL_LAYOUT_CLASSES cho header / body / footer
 * Sửa:    vị trí + hiệu ứng → MODAL_PANEL_BASE_CLASSES · nền / viền / bóng → MODAL_SURFACE_*
 *         · trang trí → MODAL_TEXTURE / TOP_RAIL / CORNER / FRAME_* · layout → MODAL_LAYOUT_CLASSES
 * Lưu ý:  ⛔ light = viền mảnh + bóng mềm; quầng / vân lưới / ray phát sáng CHỈ qua `dark:`. Màu qua var(--color-*)
 *         + color-mix(), KHÔNG rgba/hex; panel `overflow-visible` (ngoặc góc vẽ ra ngoài viền); canh giữa bằng
 *         `inset-0 m-auto h-fit` KHÔNG translate; chiều cao luôn `dvh` KHÔNG `vh`; body KHÔNG `[scrollbar-gutter:stable]`.
 *         `MODAL_SLOT_CLASSES` còn được CommandPalette mượn (surface · texture · corner · topRail) — đổi khoá là sửa
 *         luôn nó. Lý do: notes/components/overlays.md#modal
 */

type ModalCorner = 'tl' | 'tr' | 'bl' | 'br';
type ModalFrameTickEdge = 'top' | 'bottom';

/** Class từng phần trang trí của panel — một bộ cho mỗi kiểu khung (`<Modal frame>` chọn bộ). */
export interface ModalSlotClasses {
  /** Panel canh giữa màn: vị trí + hiệu ứng mở / đóng + `surface`. */
  panel: string;
  /** Chỉ nền · viền · bóng của panel (không vị trí) — cho lớp nổi tự định vị như CommandPalette. */
  surface: string;
  topRail: string;
  texture: string;
  corner: Record<ModalCorner, string>;
  frameEdge: string;
  frameFill: string;
  frameTick: Record<ModalFrameTickEdge, string>;
}

/** Lớp phủ kính mờ KHÔNG animation — nền chung của mọi lớp phủ toàn màn. */
export const MODAL_OVERLAY_BASE =
  'fixed inset-0 z-50 bg-black/45 backdrop-blur-[12px] backdrop-saturate-125';

/** `className` cho `<Dialog.Overlay>` của Modal · FormModal · Drawer · CommandPalette (kính mờ + fade). */
export const MODAL_OVERLAY_CLASS = cn(
  MODAL_OVERLAY_BASE,
  'data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out',
);

const MODAL_PANEL_BASE_CLASSES = cn(
  'fixed inset-0 z-50 m-auto h-fit',
  'flex flex-col overflow-visible outline-none',
  'max-w-[calc(100vw-32px)] max-h-[calc(100dvh-32px)]',
  'max-lg:max-w-[92vw] max-lg:max-h-[92dvh] touch:max-h-[92dvh]',
  'phone:w-[calc(100vw-16px)] phone:max-w-[calc(100vw-16px)]',
  'phone:max-h-[calc(100dvh-16px-var(--safe-t,0px)-var(--safe-b,0px))]',
  'data-[state=open]:animate-pop-in data-[state=closed]:animate-pop-out',
);

const MODAL_SURFACE_BASE_CLASSES = cn(
  'bg-linear-to-b from-bg-dialog-raised via-bg-dialog to-bg-dialog',
  'border-border-default dark:border-hud-5/45',
);

const MODAL_SURFACE_DEFAULT_CLASSES = cn(
  MODAL_SURFACE_BASE_CLASSES,
  'border dark:border-2',
  'shadow-[0_24px_64px_-16px_var(--color-shadow-popup),0_8px_24px_-12px_var(--color-shadow-popup)]',
  'dark:shadow-[0_0_0_1px_color-mix(in_srgb,var(--color-hud-5)_10%,transparent),0_32px_80px_-12px_var(--color-shadow-popup),0_12px_32px_-16px_var(--color-shadow-popup),inset_0_0_36px_-26px_color-mix(in_srgb,var(--color-hud-5)_18%,transparent),inset_0_1px_0_color-mix(in_srgb,var(--color-neutral-0)_8%,transparent)]',
);

const MODAL_SURFACE_HUD_CLASSES = cn(
  MODAL_SURFACE_BASE_CLASSES,
  'border-0',
  '[clip-path:polygon(18px_0,calc(100%-18px)_0,100%_18px,100%_calc(100%-18px),calc(100%-18px)_100%,18px_100%,0_calc(100%-18px),0_18px)]',
  'dark:shadow-[inset_0_0_72px_-34px_color-mix(in_srgb,var(--hud,var(--color-hud-5))_18%,transparent)]',
  '[filter:drop-shadow(0_24px_48px_var(--color-shadow-popup))]',
  'dark:[filter:drop-shadow(0_28px_56px_var(--color-shadow-popup))_drop-shadow(0_0_16px_color-mix(in_srgb,var(--hud,var(--color-hud-5))_26%,transparent))]',
);

const MODAL_TOP_RAIL_BASE_CLASSES = cn(
  'pointer-events-none absolute inset-x-0 top-0 z-10 h-[2px]',
  'bg-linear-to-r from-transparent via-hud-6/60 to-transparent',
  'dark:via-hud-5 dark:shadow-[0_1px_5px_color-mix(in_srgb,var(--color-hud-5)_28%,transparent)]',
);

const MODAL_TEXTURE_CLASSES = cn(
  'pointer-events-none absolute inset-0 hidden text-hud-5 opacity-[0.055] dark:block',
  '[background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)]',
  '[background-size:28px_28px]',
  '[mask-image:linear-gradient(to_bottom,black,transparent_62%)]',
);

const MODAL_CORNER_BASE_CLASSES = 'pointer-events-none absolute z-10';

const MODAL_CORNER_DEFAULT_CLASSES = cn(
  '-m-2 size-6 border-hud-5/60',
  'dark:border-hud-5/70 dark:[filter:drop-shadow(0_0_3px_color-mix(in_srgb,var(--color-hud-5)_20%,transparent))]',
);

const MODAL_CORNER_HUD_CLASSES = cn(
  'm-[7px] size-9',
  'border-[color-mix(in_srgb,var(--hud,var(--color-hud-5))_45%,transparent)]',
);

const MODAL_CORNER_AT_CLASSES = {
  tl: 'left-0 top-0 border-l-2 border-t-2',
  tr: 'right-0 top-0 border-r-2 border-t-2',
  bl: 'bottom-0 left-0 border-b-2 border-l-2',
  br: 'bottom-0 right-0 border-b-2 border-r-2',
} satisfies Record<ModalCorner, string>;

const MODAL_FRAME_EDGE_CLASSES = cn(
  'pointer-events-none absolute inset-0 -z-20',
  '[clip-path:polygon(18px_0,calc(100%-18px)_0,100%_18px,100%_calc(100%-18px),calc(100%-18px)_100%,18px_100%,0_calc(100%-18px),0_18px)]',
  'bg-[linear-gradient(150deg,color-mix(in_srgb,var(--hud,var(--color-hud-5))_55%,transparent),color-mix(in_srgb,var(--hud,var(--color-hud-5))_22%,transparent)_48%,color-mix(in_srgb,var(--hud,var(--color-hud-5))_55%,transparent))]',
  'dark:bg-[linear-gradient(150deg,color-mix(in_srgb,var(--hud,var(--color-hud-5))_95%,transparent),color-mix(in_srgb,var(--hud,var(--color-hud-5))_40%,transparent)_48%,color-mix(in_srgb,var(--hud,var(--color-hud-5))_95%,transparent))]',
);

const MODAL_FRAME_FILL_CLASSES = cn(
  'pointer-events-none absolute inset-0 -z-10',
  '[clip-path:polygon(18.83px_2px,calc(100%-18.83px)_2px,calc(100%-2px)_18.83px,calc(100%-2px)_calc(100%-18.83px),calc(100%-18.83px)_calc(100%-2px),18.83px_calc(100%-2px),2px_calc(100%-18.83px),2px_18.83px)]',
  'bg-linear-to-b from-bg-dialog-raised to-bg-dialog to-45%',
);

const MODAL_FRAME_TICK_BASE_CLASSES = cn(
  'pointer-events-none absolute left-1/2 -z-10 h-[2px] w-24 -translate-x-1/2',
  'bg-linear-to-r from-transparent via-[var(--hud,var(--color-hud-5))] to-transparent',
  'dark:shadow-[0_0_10px_color-mix(in_srgb,var(--hud,var(--color-hud-5))_60%,transparent)]',
);

const MODAL_FRAME_TICK_CLASSES = {
  top: cn(MODAL_FRAME_TICK_BASE_CLASSES, 'top-0'),
  bottom: cn(MODAL_FRAME_TICK_BASE_CLASSES, 'bottom-0'),
} satisfies Record<ModalFrameTickEdge, string>;

const cornerClasses = (frameClasses: string) =>
  ({
    tl: cn(MODAL_CORNER_BASE_CLASSES, MODAL_CORNER_AT_CLASSES.tl, frameClasses),
    tr: cn(MODAL_CORNER_BASE_CLASSES, MODAL_CORNER_AT_CLASSES.tr, frameClasses),
    bl: cn(MODAL_CORNER_BASE_CLASSES, MODAL_CORNER_AT_CLASSES.bl, frameClasses),
    br: cn(MODAL_CORNER_BASE_CLASSES, MODAL_CORNER_AT_CLASSES.br, frameClasses),
  }) satisfies Record<ModalCorner, string>;

/** Khung mặc định (chữ nhật + ngoặc 4 góc) — Modal, FormModal; CommandPalette mượn `surface` / `texture` / `topRail` / `corner`. */
export const MODAL_SLOT_CLASSES = {
  panel: cn(MODAL_PANEL_BASE_CLASSES, MODAL_SURFACE_DEFAULT_CLASSES),
  surface: MODAL_SURFACE_DEFAULT_CLASSES,
  topRail: MODAL_TOP_RAIL_BASE_CLASSES,
  texture: MODAL_TEXTURE_CLASSES,
  corner: cornerClasses(MODAL_CORNER_DEFAULT_CLASSES),
  frameEdge: MODAL_FRAME_EDGE_CLASSES,
  frameFill: MODAL_FRAME_FILL_CLASSES,
  frameTick: MODAL_FRAME_TICK_CLASSES,
} satisfies ModalSlotClasses;

/** Khung HUD (vát 4 góc, viền theo `--hud`, không vạch đỉnh) — `<Modal frame="hud">` của ConfirmDialog. */
export const MODAL_HUD_SLOT_CLASSES = {
  panel: cn(MODAL_PANEL_BASE_CLASSES, MODAL_SURFACE_HUD_CLASSES),
  surface: MODAL_SURFACE_HUD_CLASSES,
  topRail: cn(MODAL_TOP_RAIL_BASE_CLASSES, 'hidden'),
  texture: MODAL_TEXTURE_CLASSES,
  corner: cornerClasses(MODAL_CORNER_HUD_CLASSES),
  frameEdge: MODAL_FRAME_EDGE_CLASSES,
  frameFill: MODAL_FRAME_FILL_CLASSES,
  frameTick: MODAL_FRAME_TICK_CLASSES,
} satisfies ModalSlotClasses;

/** Class của nút ✕ chung — `ModalCloseButton` ghép `base` + `forced` (khi `showClose={false}`) / `floating` (không header). */
export const MODAL_CLOSE_CLASSES = {
  base: cn(
    'relative z-10 -my-1 flex size-8 shrink-0 cursor-pointer items-center justify-center',
    "after:absolute after:-inset-1.5 after:content-['']",
    'bg-transparent text-fg-muted outline-none',
    'transition-[color,background-color,box-shadow] duration-150 ease-out',
    'enabled:hover:bg-bg-nav-hover enabled:hover:text-fg-heading enabled:active:bg-bg-nav-active',
    'dark:enabled:hover:text-primary-3',
    'dark:enabled:hover:shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--color-primary-4)_55%,transparent),inset_0_0_12px_color-mix(in_srgb,var(--color-primary-5)_28%,transparent),0_0_12px_-3px_color-mix(in_srgb,var(--color-primary-5)_60%,transparent)]',
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
  header:
    'relative flex shrink-0 items-center justify-between gap-3 px-4 max-lg:items-center touch:items-center',
  headerBand: cn(
    'pointer-events-none absolute inset-0',
    '[clip-path:polygon(0_0,100%_0,100%_calc(100%-16px),calc(100%-16px)_100%,0_100%)]',
    'bg-linear-to-r from-divider-default via-divider-strong to-hud-6/45',
    'dark:from-hud-5/30 dark:via-hud-5/55 dark:to-hud-4/85',
    'dark:[filter:drop-shadow(0_1px_4px_color-mix(in_srgb,var(--color-hud-5)_16%,transparent))]',
  ),
  headerBandFill: cn(
    'pointer-events-none absolute left-0 top-0 bottom-[1.5px] right-[1.5px]',
    '[clip-path:polygon(0_0,100%_0,100%_calc(100%-15px),calc(100%-15px)_100%,0_100%)]',
    'bg-linear-to-b from-bg-dialog-raised to-bg-dialog',
  ),
  /** Dấu `//` trước tiêu đề (đồng bộ BoxPanel); hàng tiêu đề `items-start` + `mt-1` = giữa dòng chữ 24px đầu tiên. */
  titleBar: cn(HUD_TITLE_MARK, 'mt-1'),
  title: cn(
    'overflow-x-clip overflow-y-visible text-ellipsis whitespace-nowrap',
    'text-body-16-semibold text-fg-heading',
    'max-lg:whitespace-normal max-lg:break-words touch:whitespace-normal touch:break-words',
  ),
  body: 'relative min-h-0 flex-1 overflow-auto overscroll-contain',
  footer: cn(
    'relative flex shrink-0 items-center justify-end gap-3 px-4 pt-3 pb-[calc(0.75rem+var(--safe-b,0px))]',
    'bg-linear-to-t from-bg-dialog-raised/50 via-bg-dialog-raised/15 to-transparent',
    "before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:content-['']",
    'before:bg-linear-to-r before:from-transparent before:via-divider-strong before:to-transparent',
    'dark:before:via-hud-5/40',
  ),
};
