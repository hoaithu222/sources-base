import {
  HUD_BRACKETS_BEFORE,
  HUD_TITLE_MARK,
  HUD_TOP_RAIL_AFTER,
} from '@/shared/ui/primitives/hud.theme';
import { cn } from '@/shared/utils/style/cn';
import type { DrawerSectionTone, DrawerSide, DrawerSize } from './drawer.types';

/**
 * drawer.theme — bảng class của Drawer, cùng ngôn ngữ thị giác với modal.theme.
 *
 * Dùng:   cn(DRAWER_CONTENT_BASE_CLASSES, DRAWER_SIDE_CLASSES[side], DRAWER_SIZE_CLASSES[side][size], className)
 * Trục:   side right | left | top | bottom · size sm | md | lg | xl (rộng với left/right, cao với top/bottom)
 * Sửa:    mép / bóng / animation → DRAWER_SIDE_CLASSES · kích thước → DRAWER_SIZE_CLASSES · header/body/footer → DRAWER_CLASSES
 * Lưu ý:  shadow ghi đủ chuỗi tĩnh ở từng side — đổi shadow chung là sửa 4 ô. Light = viền 1px + ray 2px + bóng mềm
 *         đổ về phía trang; mép 4px + quầng chỉ qua `dark:` (CỐ Ý). Lớp phủ dùng MODAL_OVERLAY_CLASS; nút ✕ =
 *         ModalCloseButton (MODAL_CLOSE_CLASSES). Body KHÔNG `[scrollbar-gutter:stable]`. Lý do: notes/components/overlays.md#drawer
 *         ⛔ Panel đã chiếm `::before` (ngoặc góc) + `::after` (ray đỉnh) — chỉ `dark:`; vân lưới = span `MODAL_SLOT_CLASSES.texture`.
 */

export const DRAWER_CONTENT_BASE_CLASSES = cn(
  'fixed z-50 flex flex-col outline-none',
  'bg-linear-to-b from-bg-dialog-raised via-bg-dialog to-bg-dialog',
  'border-border-default dark:border-hud-5/45',
  HUD_BRACKETS_BEFORE,
  HUD_TOP_RAIL_AFTER,
  'dark:before:z-20 dark:after:z-20',
);

export const DRAWER_SIDE_CLASSES = {
  right: cn(
    'right-0 top-0 h-full max-w-[100vw] border-l dark:border-l-2 max-lg:max-w-[92vw] phone:max-w-[100vw]',
    'shadow-[-16px_0_48px_-12px_var(--color-shadow-popup),inset_2px_0_0_color-mix(in_srgb,var(--color-hud-5)_55%,transparent)]',
    'dark:shadow-[0_0_0_1px_color-mix(in_srgb,var(--color-hud-5)_15%,transparent),0_28px_72px_-8px_var(--color-shadow-popup),0_16px_40px_-12px_var(--color-shadow-popup),inset_0_0_48px_color-mix(in_srgb,var(--color-hud-5)_5%,transparent),inset_0_0_32px_color-mix(in_srgb,var(--color-teal-5)_8%,transparent),inset_2px_0_0_color-mix(in_srgb,var(--color-hud-5)_55%,transparent)]',
    'data-[state=open]:animate-slide-in-right data-[state=closed]:animate-slide-out-right',
  ),
  left: cn(
    'left-0 top-0 h-full max-w-[100vw] border-r dark:border-r-2 max-lg:max-w-[92vw] phone:max-w-[100vw]',
    'shadow-[16px_0_48px_-12px_var(--color-shadow-popup),inset_-2px_0_0_color-mix(in_srgb,var(--color-hud-5)_55%,transparent)]',
    'dark:shadow-[0_0_0_1px_color-mix(in_srgb,var(--color-hud-5)_15%,transparent),0_28px_72px_-8px_var(--color-shadow-popup),0_16px_40px_-12px_var(--color-shadow-popup),inset_0_0_48px_color-mix(in_srgb,var(--color-hud-5)_5%,transparent),inset_0_0_32px_color-mix(in_srgb,var(--color-teal-5)_8%,transparent),inset_-2px_0_0_color-mix(in_srgb,var(--color-hud-5)_55%,transparent)]',
    'data-[state=open]:animate-slide-in-left data-[state=closed]:animate-slide-out-left',
  ),
  top: cn(
    'left-0 top-0 w-full max-h-dvh border-b dark:border-b-2 max-lg:max-h-[calc(100dvh-16px)]',
    'shadow-[0_16px_48px_-12px_var(--color-shadow-popup),inset_0_-2px_0_color-mix(in_srgb,var(--color-hud-5)_55%,transparent)]',
    'dark:shadow-[0_0_0_1px_color-mix(in_srgb,var(--color-hud-5)_15%,transparent),0_28px_72px_-8px_var(--color-shadow-popup),0_16px_40px_-12px_var(--color-shadow-popup),inset_0_0_48px_color-mix(in_srgb,var(--color-hud-5)_5%,transparent),inset_0_0_32px_color-mix(in_srgb,var(--color-teal-5)_8%,transparent),inset_0_-2px_0_color-mix(in_srgb,var(--color-hud-5)_55%,transparent)]',
    'data-[state=open]:animate-slide-in-top data-[state=closed]:animate-slide-out-top',
  ),
  bottom: cn(
    'left-0 bottom-0 w-full max-h-dvh border-t dark:border-t-2 max-lg:max-h-[calc(100dvh-var(--safe-t,0px)-1.5rem)]',
    'shadow-[0_-16px_48px_-12px_var(--color-shadow-popup),inset_0_2px_0_color-mix(in_srgb,var(--color-hud-5)_55%,transparent)]',
    'dark:shadow-[0_0_0_1px_color-mix(in_srgb,var(--color-hud-5)_15%,transparent),0_28px_72px_-8px_var(--color-shadow-popup),0_16px_40px_-12px_var(--color-shadow-popup),inset_0_0_48px_color-mix(in_srgb,var(--color-hud-5)_5%,transparent),inset_0_0_32px_color-mix(in_srgb,var(--color-teal-5)_8%,transparent),inset_0_2px_0_color-mix(in_srgb,var(--color-hud-5)_55%,transparent)]',
    'data-[state=open]:animate-slide-in-bottom data-[state=closed]:animate-slide-out-bottom',
  ),
} satisfies Record<DrawerSide, string>;

export const DRAWER_SIZE_CLASSES = {
  right: { sm: 'w-80', md: 'w-[480px]', lg: 'w-[640px]', xl: 'w-[800px]' },
  left: { sm: 'w-80', md: 'w-[480px]', lg: 'w-[640px]', xl: 'w-[800px]' },
  top: { sm: 'h-64', md: 'h-[360px]', lg: 'h-[480px]', xl: 'h-[600px]' },
  bottom: {
    sm: 'h-64 max-lg:h-auto',
    md: 'h-[360px] max-lg:h-auto',
    lg: 'h-[480px] max-lg:h-auto',
    xl: 'h-[600px] max-lg:h-auto',
  },
} satisfies Record<DrawerSide, Record<DrawerSize, string>>;

export const DRAWER_CLASSES = {
  header: cn(
    'relative flex shrink-0 items-start justify-between gap-3 px-4 pt-3.5 pb-3',
    'bg-linear-to-b from-bg-dialog-raised/60 via-bg-dialog-raised/20 to-transparent',
    "after:content-[''] after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-px",
    'after:bg-divider-default',
    'dark:after:h-[1.5px] dark:after:bg-linear-to-r dark:after:from-transparent dark:after:via-hud-5/55 dark:after:to-transparent',
    'dark:after:shadow-[0_2px_6px_color-mix(in_srgb,var(--color-hud-5)_25%,transparent)]',
  ),
  /** Hàng tiêu đề: dấu `//` (đồng bộ Modal / BoxPanel) + cột tiêu đề · mô tả — mô tả tự thẳng cột chữ tiêu đề. */
  heading: 'flex min-w-0 flex-1 items-start gap-2.5',
  titleMark: cn(HUD_TITLE_MARK, 'mt-1'),
  headingText: 'min-w-0 flex-1',
  title: 'text-body-16-semibold text-fg-heading',
  description: 'mt-1 text-caption-12 text-fg-muted',
  close: '-mr-1 max-lg:-mr-0.5 max-lg:my-0',
  headerBottom: 'max-lg:pt-1 max-lg:pb-2',
  headerCentered: 'max-lg:items-center touch:items-center',
  grip: 'relative hidden shrink-0 cursor-grab touch-none items-center justify-center py-2 max-lg:flex touch:flex',
  gripBar: 'h-1 w-10 bg-border-strong',
  body: 'min-h-0 flex-1 overflow-auto p-4',
  bodyScroll: 'relative overscroll-contain',
  bodyHeadless: 'max-lg:pt-12 touch:pt-12',
  bodyBottom: 'last:pb-[calc(1rem+var(--safe-b,0px))]',
  footer: cn(
    'relative flex shrink-0 items-center justify-end gap-3 px-4 pt-3 pb-[calc(0.75rem+var(--safe-b,0px))]',
    'border-t border-divider-default dark:border-t-transparent',
    'bg-linear-to-t from-bg-dialog-raised/50 via-bg-dialog-raised/15 to-transparent',
    "dark:before:pointer-events-none dark:before:absolute dark:before:inset-x-0 dark:before:-top-px dark:before:h-px dark:before:content-['']",
    'dark:before:bg-linear-to-r dark:before:from-transparent dark:before:via-hud-5/50 dark:before:to-transparent',
  ),
};

/**
 * Tông của `DrawerSection`: `--section-tone` = màu vạch nhấn / viền / dốc nền · `--section-ink` = màu icon + tiêu đề (đậm hơn
 * ở theme sáng, sáng hơn ở theme tối để đọc rõ). Mỗi vùng thông tin một tông → nhìn là tách được vùng.
 */
export const DRAWER_SECTION_TONE_CLASSES = {
  primary:
    '[--section-tone:var(--color-primary-5)] [--section-ink:var(--color-primary-7)] dark:[--section-ink:var(--color-primary-3)]',
  info: '[--section-tone:var(--color-sky-5)] [--section-ink:var(--color-sky-7)] dark:[--section-ink:var(--color-sky-3)]',
  warning:
    '[--section-tone:var(--color-orange-5)] [--section-ink:var(--color-orange-7)] dark:[--section-ink:var(--color-orange-3)]',
  danger:
    '[--section-tone:var(--color-red-5)] [--section-ink:var(--color-red-7)] dark:[--section-ink:var(--color-red-3)]',
  neutral:
    '[--section-tone:var(--color-neutral-5)] [--section-ink:var(--color-fg-subheading)] dark:[--section-ink:var(--color-fg-subheading)]',
} satisfies Record<DrawerSectionTone, string>;

/** Vùng thông tin trong ngăn kéo: vạch nhấn trái 2px theo tông + viền pha tông; tối thêm dốc nền tông + quầng vạch nhấn. */
export const DRAWER_SECTION_CLASSES = {
  root: cn(
    'relative flex flex-col border bg-bg-dialog-raised',
    'border-[color-mix(in_srgb,var(--section-tone)_30%,var(--color-border-default))]',
    "before:pointer-events-none before:absolute before:-inset-y-px before:-left-px before:w-0.5 before:bg-[color:var(--section-tone)] before:content-['']",
    'dark:bg-[linear-gradient(180deg,color-mix(in_srgb,var(--section-tone)_10%,transparent),color-mix(in_srgb,var(--section-tone)_2%,transparent)_70%)]',
    'dark:before:shadow-[0_0_8px_color-mix(in_srgb,var(--section-tone)_70%,transparent)]',
  ),
  header: cn(
    'relative flex min-h-9 items-center gap-2 py-2 pr-3 pl-3.5',
    "after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-px after:content-['']",
    'after:bg-[linear-gradient(90deg,color-mix(in_srgb,var(--section-tone)_55%,transparent),transparent_85%)]',
  ),
  icon: 'shrink-0 text-[color:var(--section-ink)] dark:drop-shadow-[0_0_4px_color-mix(in_srgb,var(--section-tone)_70%,transparent)]',
  title:
    'min-w-0 flex-1 text-caption-12-semibold uppercase tracking-[0.06em] text-[color:var(--section-ink)]',
  extra: 'flex shrink-0 items-center gap-2',
  body: 'py-2.5 pr-3 pl-3.5',
};
