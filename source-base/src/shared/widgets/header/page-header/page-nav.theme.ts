import { cn } from '@/shared/utils/style/cn';

import type { ChipShape } from './header-skin.theme';

/**
 * page-nav.theme.ts — bảng class của CHIP trên thanh header (tab · action · nút quay lại): khung thấp gọn đứng trên ray
 * đáy, dấu nhấn, vạch sáng đáy. HÌNH khung do `header-skin.theme.ts` chọn; bảng tên ở `page-header.theme.ts`.
 *
 * Dùng:   cn(pageNavItemClassName({ active, iconOnly, compact }), …) · bề mặt: PAGE_NAV_SLOT_CLASSES.surface/edge/face/corner/bar
 *         · thanh khay của họ kiểu khay: `shapes/shelf.theme.ts`
 * Trục:   state active | idle · slant (HƯỚNG NGHIÊNG chip kiểu vát) right | left · placement left | right | octagon | flat.
 * Lưu ý:  ⛔ Chip KHÔNG có `border` (clip-path cắt): viền = `edge` + `face`, quầng = `drop-shadow` (chỉ chip bật, kiểu có khung).
 *         ⛔ `hover:` của chip chỉ ở ô `idle` của PAGE_NAV_STATE_CLASSES (ô chung → hover đè chip mở).
 *         ⛔ Không thêm bậc `touch:` cho cỡ chip / icon, chỉ SIẾT (`ipad-responsive.md §3.0`).
 *         ⛔ Mọi biến hình học (`--chip-cut` · `--chip-notch` · `--chip-gap` · `--nav-pad`) do `<header>` đặt qua
 *            `HEADER_SKIN_SPECS[skin].vars`; chip chỉ ĐỌC. Khe giữa hai chip = khe tới bảng tên — sửa một chỗ là khe lệch.
 *         Lý do thiết kế: docs/notes/code/widgets-header.md
 */

/**
 * HƯỚNG NGHIÊNG của chip hình bình hành (đỉnh trên đổ về phía nào), KHÔNG phải chip nằm bên nào:
 * `right` = `/` (dải bên PHẢI bảng tên) · `left` = `\` (dải bên TRÁI bảng tên, nút quay lại).
 */
export type PageHeaderChipSlant = 'right' | 'left';

/** Vị trí vạch sáng đáy: theo hướng vát (`left` | `right`), bát giác (`octagon`) hoặc đáy phẳng (`flat`). */
type ChipPlacement = PageHeaderChipSlant | 'octagon' | 'flat';

type PageNavState = 'active' | 'idle';
type PageNavItemShape = 'icon' | 'compact' | 'default';

type PageNavSlot =
  | 'root'
  | 'item'
  | 'surface'
  | 'hit'
  | 'edge'
  | 'face'
  | 'corner'
  | 'bar'
  | 'foot'
  | 'ticks'
  | 'tick'
  | 'barIdle'
  | 'label'
  | 'labelFull'
  | 'labelShort';

interface PageNavItemOptions {
  active: boolean;
  iconOnly: boolean;
  compact: boolean;
  /** Kiểu khung `solid`: chip bật tô xanh đậm nên chữ phải sáng (`text-neutral-0`) ở cả hai theme. */
  solid?: boolean;
}

/** Cao chip: 22px → `wide` 26px — thấp hơn `HEADER_CONTROL_HEIGHT`, đứng trên ray đáy của thanh. */
const PAGE_CHIP_HEIGHT = 'h-5.5 wide:h-6.5';

export const PAGE_NAV_SLOT_CLASSES = {
  root: 'relative flex shrink-0 items-end gap-[var(--chip-gap,0px)] [&>*+*]:ms-[var(--chip-overlap,0px)]',
  item: cn(
    'group pointer-events-none relative isolate inline-flex shrink-0 items-center',
    PAGE_CHIP_HEIGHT,
    'gap-0.5 px-2 xl:px-3 wide:gap-1 wide:px-3.5',
    'cursor-pointer select-none whitespace-nowrap outline-none',
    "touch:after:pointer-events-auto touch:after:absolute touch:after:inset-x-0 touch:after:-inset-y-2.5 touch:after:content-['']",
    '[&>svg]:size-3! md:[&>svg]:size-3.5! wide:[&>svg]:size-4!',
    'text-caption-10-semibold uppercase tracking-[0.01em] md:tracking-[0.03em]',
    'wide:text-caption-12-semibold wide:tracking-[0.04em]',
    'transition-[color,scale] duration-200 ease-out',
    'active:scale-[0.97]',
    'focus-visible:ring-2 focus-visible:ring-ring-focus',
  ),
  surface: 'pointer-events-none absolute inset-0 -z-10 transition-opacity duration-200',
  /** Vùng bắt chuột đúng HÌNH chip (clip-path như khung) — chip KHÔNG tự bắt chuột (`item` là `pointer-events-none`). */
  hit: 'pointer-events-auto absolute inset-0',
  edge: 'absolute inset-0',
  face: 'absolute inset-px',
  corner: 'absolute inset-0 transition-colors duration-200',
  bar: cn(
    'absolute bottom-0 h-0.5 bg-primary-6',
    'dark:bg-[linear-gradient(to_right,var(--color-primary-4),color-mix(in_srgb,var(--color-neutral-0)_70%,var(--color-primary-3)),var(--color-primary-4))]',
    'dark:shadow-[0_0_6px_var(--color-primary-4)]',
  ),
  foot: 'absolute inset-x-0 bottom-0 h-0.5 bg-hud-5/70 transition-colors duration-200 group-hover:bg-hud-4',
  ticks: 'absolute bottom-px flex h-0.5 items-end gap-0.5',
  tick: 'h-0.5 w-1.5 wide:w-2 transition-[opacity,background-color] duration-200',
  barIdle: cn(
    'absolute bottom-0 h-0.5 origin-center scale-x-0 bg-hud-5 dark:bg-hud-4',
    'transition-transform duration-200 ease-out group-hover:scale-x-100',
  ),
  label: 'relative min-w-0 truncate',
  labelFull: 'relative min-w-0 truncate max-lg:hidden touch:hidden',
  labelShort: 'relative hidden min-w-0 truncate max-lg:inline touch:inline',
} satisfies Record<PageNavSlot, string>;

/** Vạch sáng đáy chạy theo cạnh đáy của khung: lệch theo hướng vát, giữa hai góc vát (bát giác), hoặc trọn bề ngang. */
export const PAGE_NAV_BAR_CLASSES = {
  right: 'left-0 right-[var(--chip-cut)]',
  left: 'left-[var(--chip-cut)] right-0',
  octagon: 'left-[var(--chip-notch)] right-[var(--chip-notch)]',
  flat: 'inset-x-0',
} satisfies Record<ChipPlacement, string>;

/**
 * Hình khung → cách đặt vạch đáy: kiểu vát theo hướng của dải; mũi tên NGƯỢC hướng (mũi chạm đáy ở phía bảng tên, cạnh đáy
 * ngắn đi `--chip-cut` ở phía đó); bát giác riêng; chữ nhật · nhãn · bậc thang · không khung phẳng.
 */
export function chipPlacement(shape: ChipShape, slant: PageHeaderChipSlant): ChipPlacement {
  if (shape === 'slant' || shape === 'skew') return slant;
  if (shape === 'chevron') return slant === 'left' ? 'right' : 'left';
  return shape === 'octagon' ? shape : 'flat';
}

/** Quầng chip bật (chỉ `dark:`) — nhỏ và nhạt để viền vẫn NÉT; kiểu không khung bỏ hẳn. */
export const PAGE_NAV_ACTIVE_GLOW_CLASS =
  'dark:drop-shadow-[0_0_6px_color-mix(in_srgb,var(--color-primary-4)_45%,transparent)]';

export const PAGE_NAV_STATE_CLASSES = {
  active: {
    item: 'text-fg-on-chrome dark:[text-shadow:0_1px_2px_var(--color-black-5)]',
    corner: 'bg-primary-3',
  },
  idle: {
    item: 'text-fg-on-nav-muted hover:text-fg-on-chrome',
    corner: 'bg-hud-5/80 group-hover:bg-hud-4',
  },
} satisfies Record<PageNavState, Record<'item' | 'corner', string>>;

/** Chữ chip bật khi thân tô đặc (kiểu khung `solid`): trắng trên nền xanh đậm. */
const PAGE_NAV_SOLID_ACTIVE_ITEM_CLASS = 'text-neutral-0';

const PAGE_NAV_ITEM_SHAPE_CLASSES = {
  default: '',
  compact: 'gap-0.5 px-1.5 xl:px-2.5 wide:px-3',
  icon: 'justify-center',
} satisfies Record<PageNavItemShape, string>;

/** Chip icon-only luôn dùng ô `icon` (đệm đã ở sàn) — `compact` chỉ có nghĩa với chip có chữ. */
function pageNavItemShape(iconOnly: boolean, compact: boolean): PageNavItemShape {
  if (iconOnly) return 'icon';
  return compact ? 'compact' : 'default';
}

/** Class của chip (tab · action · quay lại); `disabled` và `className` nối thêm ở nơi dùng. */
export function pageNavItemClassName({
  active,
  iconOnly,
  compact,
  solid = false,
}: PageNavItemOptions): string {
  return cn(
    PAGE_NAV_SLOT_CLASSES.item,
    PAGE_NAV_STATE_CLASSES[active ? 'active' : 'idle'].item,
    active && solid && PAGE_NAV_SOLID_ACTIVE_ITEM_CLASS,
    PAGE_NAV_ITEM_SHAPE_CLASSES[pageNavItemShape(iconOnly, compact)],
  );
}
