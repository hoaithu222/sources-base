import { HUD_TITLE_MARK } from '@/shared/ui/primitives/hud.theme';
import { cn } from '@/shared/utils/style/cn';
import type { DrawerSectionTone, DrawerSide, DrawerSize } from './drawer.types';

/**
 * drawer.theme — bảng class của Drawer, cùng ngôn ngữ thị giác với modal.theme.
 *
 * Dùng:   cn(DRAWER_CONTENT_BASE_CLASSES, DRAWER_SIDE_CLASSES[side], DRAWER_SIZE_CLASSES[side][size], className)
 * Trục:   side right | left | top | bottom · size sm | md | lg | xl (rộng với left/right, cao với top/bottom)
 * Sửa:    mép / bóng / animation → DRAWER_SIDE_CLASSES · kích thước → DRAWER_SIZE_CLASSES · header/body/footer → DRAWER_CLASSES
 * Lưu ý:  MỘT diện mạo cho cả hai theme: viền 1px + bóng mềm đổ về phía trang (ghi đủ chuỗi ở từng side), KHÔNG ray màu ở
 *         cạnh trong. Lớp phủ MODAL_OVERLAY_CLASS; ✕ = ModalCloseButton. Body KHÔNG `[scrollbar-gutter:stable]`. Lý do: overlays.md#drawer
 *         Góc: chỉ bo CẠNH TRONG `rounded-*-2xl` (20px, cùng hộp thoại) theo `side` (cạnh áp mép màn giữ vuông) + `overflow-hidden`
 *         cho header / chân không lòi khỏi góc.
 */

export const DRAWER_CONTENT_BASE_CLASSES = cn(
  'fixed z-50 flex flex-col overflow-hidden outline-none',
  'bg-linear-to-b from-bg-dialog-raised via-bg-dialog to-bg-dialog',
  'border-border-default',
);

export const DRAWER_SIDE_CLASSES = {
  right: cn(
    'right-0 top-0 h-full max-w-[100vw] rounded-l-2xl border-l max-lg:max-w-[92vw] phone:max-w-[100vw]',
    'shadow-[-16px_0_48px_-12px_var(--color-shadow-popup)]',
    'data-[state=open]:animate-slide-in-right data-[state=closed]:animate-slide-out-right',
  ),
  left: cn(
    'left-0 top-0 h-full max-w-[100vw] rounded-r-2xl border-r max-lg:max-w-[92vw] phone:max-w-[100vw]',
    'shadow-[16px_0_48px_-12px_var(--color-shadow-popup)]',
    'data-[state=open]:animate-slide-in-left data-[state=closed]:animate-slide-out-left',
  ),
  top: cn(
    'left-0 top-0 w-full max-h-dvh rounded-b-2xl border-b max-lg:max-h-[calc(100dvh-16px)]',
    'shadow-[0_16px_48px_-12px_var(--color-shadow-popup)]',
    'data-[state=open]:animate-slide-in-top data-[state=closed]:animate-slide-out-top',
  ),
  bottom: cn(
    'left-0 bottom-0 w-full max-h-dvh rounded-t-2xl border-t max-lg:max-h-[calc(100dvh-var(--safe-t,0px)-1.5rem)]',
    'shadow-[0_-16px_48px_-12px_var(--color-shadow-popup)]',
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
  ),
  /** Hàng tiêu đề: dấu tiêu đề (đồng bộ Modal / BoxPanel) + cột tiêu đề · mô tả — mô tả tự thẳng cột chữ tiêu đề. */
  heading: 'flex min-w-0 flex-1 items-start gap-2.5',
  titleMark: cn(HUD_TITLE_MARK, 'mt-1'),
  headingText: 'min-w-0 flex-1',
  title: 'text-body-16-semibold text-fg-heading',
  description: 'mt-1 text-caption-12 text-fg-muted',
  close: '-mr-1 max-lg:-mr-0.5 max-lg:my-0',
  headerBottom: 'max-lg:pt-1 max-lg:pb-2',
  headerCentered: 'max-lg:items-center touch:items-center',
  grip: 'relative hidden shrink-0 cursor-grab touch-none items-center justify-center py-2 max-lg:flex touch:flex',
  gripBar: 'h-1 w-10 rounded-xs bg-border-strong',
  body: 'min-h-0 flex-1 overflow-auto p-4',
  bodyScroll: 'relative overscroll-contain',
  bodyHeadless: 'max-lg:pt-12 touch:pt-12',
  bodyBottom: 'last:pb-[calc(1rem+var(--safe-b,0px))]',
  footer: cn(
    'relative flex shrink-0 items-center justify-end gap-3 px-4 pt-3 pb-[calc(0.75rem+var(--safe-b,0px))]',
    'border-t border-divider-default',
    'bg-linear-to-t from-bg-dialog-raised/50 via-bg-dialog-raised/15 to-transparent',
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
  neutral: '[--section-tone:var(--color-neutral-5)] [--section-ink:var(--color-fg-subheading)]',
} satisfies Record<DrawerSectionTone, string>;

/**
 * Vùng thông tin trong ngăn kéo: vạch nhấn trái 2px theo tông + viền pha tông. `rounded-lg` + `overflow-hidden` → vạch nằm TRONG
 * viền và bị cắt cong theo góc.
 */
export const DRAWER_SECTION_CLASSES = {
  root: cn(
    'relative flex flex-col overflow-hidden rounded-lg border bg-bg-dialog-raised',
    'border-[color-mix(in_srgb,var(--section-tone)_30%,var(--color-border-default))]',
    "before:pointer-events-none before:absolute before:inset-y-0 before:left-0 before:w-0.5 before:bg-[color:var(--section-tone)] before:content-['']",
  ),
  header: cn(
    'relative flex min-h-9 items-center gap-2 py-2 pr-3 pl-3.5',
    "after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-px after:content-['']",
    'after:bg-[linear-gradient(90deg,color-mix(in_srgb,var(--section-tone)_55%,transparent),transparent_85%)]',
  ),
  icon: 'shrink-0 text-[color:var(--section-ink)]',
  title:
    'min-w-0 flex-1 text-caption-12-semibold uppercase tracking-[0.06em] text-[color:var(--section-ink)]',
  extra: 'flex shrink-0 items-center gap-2',
  body: 'py-2.5 pr-3 pl-3.5',
};
