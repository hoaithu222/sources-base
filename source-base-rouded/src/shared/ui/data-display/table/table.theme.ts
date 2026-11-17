import { cn } from '@/shared/utils/style/cn';
import type {
  TableActiveState,
  TableAlign,
  TableDivider,
  TableEntryDensity,
  TableHeaderSize,
  TableVerticalAlign,
} from './table.types';

/**
 * Table — bảng class của cả cụm Table (vỏ · header · dòng · ô · dòng tổng · trạng thái rỗng).
 *
 * Sửa:    nền + chữ header → TABLE_HEADER_*_CLASSES
 *         · cỡ header → TABLE_HEADER_SIZE_CLASSES · căn lề → TABLE_ALIGN_CLASSES / TABLE_VALIGN_CLASSES
 *         · vạch dòng/cột → TABLE_DIVIDER_CLASSES · nền + hover dòng → TABLE_ROW_CLASSES
 *         · ô ghim + bóng mép → TABLE_FROZEN_*_CLASSES · vạch header (box-shadow inline) → utils/table.utils.ts
 *         · dòng tổng → TABLE_FOOTER_* · ray header / vạch tổng → biến `--table-rule`
 * Lưu ý:  giữ `touch:` ở TABLE_SCROLLER_CLASSES; KHÔNG thêm `relative` vào TABLE_HEADER_CELL_CLASSES;
 *         nền header + nền / hover dòng phải màu ĐẶC (ô sticky, ô ghim `bg-inherit`);
 *         vùng bắt resize ≤ 10px, nằm trọn trong ô; vạch dọc ô tổng chỉ tô cạnh phải (`border-r-*`).
 *         Ray đáy header ĐỐI XỨNG vạch trên dòng tổng — đổi một bên thì đổi bên kia.
 *         Lý do: docs/notes/components/data-display-table.md
 */

const TABLE_HEADER_SURFACE_CLASSES = 'bg-bg-subtle';

export const TABLE_ROOT_CLASSES = 'flex w-full flex-col';

export const TABLE_SCROLL_NAV_CLASSES = 'group/scroll-edge relative flex min-h-0 flex-1 flex-col';

/**
 * `pb-(--dock-overlap)`: bảng DÀI hơn khung mà Dock ghim đáy đè lên → vỏ app ghi biến, CUỐI vùng cuộn chừa đúng phần bị
 * lấn (dòng cuối cuộn lên được trên Dock); bảng vẫn cao tới đáy. CHỈ bảng KHÔNG có dòng tổng khai `data-dock-aware`: đệm
 * cuối đẩy `<tfoot>` dính đáy lên và lộ dòng dưới nó. `[--dock-overlap:0px]` chặn giá trị KẾ THỪA từ vùng cha.
 */
export const TABLE_SCROLLER_CLASSES =
  'min-h-0 flex-1 overflow-auto touch:overscroll-contain [--dock-overlap:0px] pb-(--dock-overlap)';

/** `--table-rule` = màu vạch 2px của ray header + vạch trên dòng tổng (`border-strong` pha `fg-faint` cho nét). */
export const TABLE_CLASSES = cn(
  'w-full border-collapse',
  '[--table-rule:color-mix(in_srgb,var(--color-border-strong)_50%,var(--color-fg-faint))]',
);

export const TABLE_EMPTY_CELL_CLASSES =
  'h-full px-3 py-8 text-center align-middle text-body-14 text-fg-body bg-bg-surface';

export const TABLE_LOADING_CLASSES = 'inline-flex items-center gap-2 text-body-14 text-fg-muted';

export const TABLE_HEADER_ROW_CLASSES = TABLE_HEADER_SURFACE_CLASSES;

export const TABLE_HEADER_CELL_CLASSES = cn(
  'sticky',
  TABLE_HEADER_SURFACE_CLASSES,
  'px-3 text-body-semibold text-fg-subheading whitespace-nowrap',
);

export const TABLE_HEADER_GROUP_CELL_CLASSES = cn(
  'sticky top-0',
  TABLE_HEADER_SURFACE_CLASSES,
  'px-3 text-center text-body-semibold text-fg-subheading whitespace-nowrap',
);

export const TABLE_HEADER_CELL_SORTABLE_CLASSES =
  'transition-colors duration-150 ease-out hover:bg-bg-pressed';

/** KHÔNG `relative`: lớp phủ `::after` neo vào `<th>` (sticky) để phủ CẢ ô — bấm phần đệm cũng sắp, vòng focus ôm ô. */
export const TABLE_SORT_BUTTON_CLASSES = cn(
  'group/sort inline-flex w-full cursor-pointer items-center gap-1 whitespace-nowrap',
  'after:absolute after:inset-0 after:-z-10',
  'transition-colors duration-150 ease-out hover:text-fg-heading',
  'focus-visible:outline-none',
  'focus-visible:after:ring-2 focus-visible:after:ring-inset focus-visible:after:ring-ring-focus',
);

export const TABLE_SORT_ICON_BOX_CLASSES = 'inline-flex shrink-0 flex-col leading-none';

export const TABLE_RESIZE_HANDLE_CLASSES = cn(
  'group/resize absolute top-0 right-0 flex h-full w-2.5 justify-end',
  'cursor-col-resize touch-none select-none',
);

export const TABLE_RESIZE_INDICATOR_CLASSES = 'h-full w-px transition-colors duration-150 ease-out';

export const TABLE_ROW_CLASSES = cn(
  'group group/row border-b bg-bg-surface transition-colors duration-150 ease-out',
  'hover:bg-[color-mix(in_srgb,var(--color-primary-5)_var(--row-hover-tint),var(--color-bg-surface))]',
);

/**
 * Dòng LẺ khi bật `striped` (dòng thứ 2, 4, 6… theo chỉ số dữ liệu): nền ĐẶC hơi khác nền bảng — đặc để ô ghim (kế thừa nền
 * dòng) không lộ chữ khi cuộn ngang. Rê / chọn (`rowClassName`) vẫn đè lên vì đứng sau trong `cn()`.
 */
export const TABLE_ROW_STRIPED_CLASSES = 'bg-bg-subtle';

export const TABLE_DRAGGING_ROW_CLASSES = cn(
  'relative z-10 opacity-90',
  '[&>td]:bg-[color-mix(in_srgb,var(--color-primary-5)_10%,var(--color-bg-surface))]',
);

export const TABLE_CELL_CLASSES = 'px-3 text-body-14 text-fg-heading';

export const TABLE_FULL_ROW_CELL_CLASSES = cn(
  'px-3 py-2 bg-bg-subtle text-body-14 text-fg-subheading',
  'transition-colors duration-150 ease-out',
  'group-hover/row:bg-[color-mix(in_srgb,var(--color-primary-5)_6%,var(--color-bg-subtle))]',
);

export const TABLE_FOOTER_ROW_CLASSES = 'bg-bg-pressed';

export const TABLE_FOOTER_CELL_CLASSES =
  'sticky bottom-0 px-3 text-body-14-medium tabular-nums text-fg-heading bg-inherit';

/** Vạch trên dòng tổng: 2px `--table-rule` (cùng màu ray đáy header). */
export const TABLE_FOOTER_BORDER_CLASSES = 'border-t-2 border-t-(--table-rule)';

/** Ô của cột đệm (`TABLE_FILLER_COLUMN`): không đệm để co được về 0px khi tổng bề rộng cột vừa khít khung. */
export const TABLE_FILLER_CELL_CLASSES = 'p-0';

/**
 * Ô đệm DỌC (`<tbody>` riêng trước `<tfoot>`): chiều cao do `useTableScrollFit` ghi thẳng vào style. `box-content`:
 * trong `border-collapse` nửa viền kề (dòng trên, vạch tổng) nằm NGOÀI chiều cao ghi vào → bảng cao thêm đúng số đó.
 */
export const TABLE_SPACER_CELL_CLASSES = 'box-content p-0';

export const TABLE_DRAG_HANDLE_CLASSES = cn(
  "relative touch:after:absolute touch:after:-inset-x-2.5 touch:after:-inset-y-4 touch:after:content-['']",
  'inline-flex cursor-grab items-center justify-center p-0.5 text-fg-faint',
  'transition-colors duration-150 ease-out',
  'group-hover/row:text-fg-muted hover:text-fg-heading',
  'active:cursor-grabbing active:text-action-base',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus',
);

/**
 * Mép cột ghim CUỐI (ô thân + ô tổng): vạch 1px `inset` + bóng đổ cùng trong `--tw-shadow` — đi THEO ô sticky khi cuộn
 * ngang (`border-r` trong `border-collapse` vẽ theo lưới nên bị bỏ lại); cộng được với `inset-shadow-*` (dòng chọn / rê).
 */
export const TABLE_FROZEN_EDGE_CLASSES = {
  soft: 'shadow-[inset_-1px_0_0_var(--color-divider-soft),6px_0_6px_-4px_var(--color-shadow-popup)]',
  grid: 'shadow-[inset_-1px_0_0_var(--color-divider-default),6px_0_6px_-4px_var(--color-shadow-popup)]',
} satisfies Record<TableDivider, string>;

export const TABLE_HEADER_SIZE_CLASSES = {
  sm: 'py-1.5',
  md: 'py-2.5',
  lg: 'py-3',
  xl: 'py-3.5',
} satisfies Record<TableHeaderSize, string>;

export const TABLE_ALIGN_CLASSES = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
} satisfies Record<TableAlign, string>;

export const TABLE_VALIGN_CLASSES = {
  top: 'align-top',
  middle: 'align-middle',
  bottom: 'align-bottom',
} satisfies Record<TableVerticalAlign, string>;

export const TABLE_SORT_BUTTON_ALIGN_CLASSES = {
  left: '',
  center: 'justify-center',
  right: 'justify-end',
} satisfies Record<TableAlign, string>;

export const TABLE_SORT_ICON_CLASSES = {
  active: 'text-action-base',
  idle: 'text-fg-faint group-hover/sort:text-fg-muted',
} satisfies Record<TableActiveState, string>;

export const TABLE_RESIZE_INDICATOR_STATE_CLASSES = {
  active: 'bg-primary-5',
  idle: 'bg-transparent group-hover/resize:bg-primary-5/60',
} satisfies Record<TableActiveState, string>;

export const TABLE_DIVIDER_CLASSES = {
  soft: 'border-divider-soft',
  grid: 'border-divider-default',
} satisfies Record<TableDivider, string>;

export const TABLE_CELL_DIVIDER_CLASSES = {
  soft: 'border-r border-divider-soft',
  grid: 'border-r border-divider-default',
} satisfies Record<TableDivider, string>;

/** Ô ghim kế thừa nền ĐẶC của dòng (`bg-inherit`) nên đứng liền mạch với dòng khi rê / sọc / chọn. */
export const TABLE_FROZEN_CELL_CLASSES = {
  soft: 'sticky z-[1] border-b bg-inherit border-divider-soft',
  grid: 'sticky z-[1] border-b bg-inherit border-divider-default',
} satisfies Record<TableDivider, string>;

export const TABLE_FOOTER_CELL_DIVIDER_CLASSES = {
  soft: 'border-r border-r-divider-soft',
  grid: 'border-r border-r-divider-default',
} satisfies Record<TableDivider, string>;

/**
 * Bảng NHẬP LIỆU (docs/rules/display/data-entry-table.md) — chiều cao dòng (px) theo mật độ, MỘT thang cho cả app, truyền
 * vào `<Table rowHeight>`; mặc định màn nhập là `compact`.
 */
export const TABLE_ENTRY_ROW_HEIGHT = {
  compact: 32,
  regular: 40,
  comfortable: 48,
} satisfies Record<TableEntryDensity, number>;

/** Cỡ control trong ô theo mật độ (`FIELD_HEIGHT`: sm 32 · md 36 · lg 40) — control LẤP ô, dòng không giãn khi focus. */
export const TABLE_ENTRY_CONTROL_SIZE = {
  compact: 'sm',
  regular: 'md',
  comfortable: 'lg',
} as const satisfies Record<TableEntryDensity, 'sm' | 'md' | 'lg'>;

/**
 * Ô của bảng nhập: `input` ô chứa control (`px-1`, control lấp ô) · `header` (`px-2` — chữ header thẳng chữ trong control)
 * · `derived` cột TÍNH TOÁN không sửa được (nền chìm + chữ mờ: người nhập biết ngay ô nào bỏ qua).
 */
export const TABLE_ENTRY_CELL_CLASSES = {
  input: 'px-1 py-0',
  header: 'px-2',
  derived: 'bg-bg-subtle tabular-nums text-fg-muted',
} satisfies Record<'input' | 'header' | 'derived', string>;

/**
 * Trạng thái Ô (gắn lên phần tử BỌC control trong ô): `dirty` đã sửa chưa lưu — tam giác vàng kim góc phải trên (kiểu
 * Excel, không đổi nền để không tranh với dòng đang nhập) · `invalid` lỗi ở ô KHÔNG phải ô nhập (ô nhập dùng prop `invalid`).
 */
export const TABLE_ENTRY_CELL_STATE_CLASSES = {
  dirty: cn(
    "relative block after:pointer-events-none after:absolute after:top-0 after:right-0 after:z-[1] after:size-0 after:content-['']",
    'after:border-t-[7px] after:border-l-[7px] after:border-t-accent-6 after:border-l-transparent',
  ),
  invalid:
    'shadow-[inset_0_0_0_2px_var(--color-error)] bg-[color-mix(in_srgb,var(--color-error)_6%,var(--color-bg-surface))]',
} satisfies Record<'dirty' | 'invalid', string>;

/**
 * Trạng thái DÒNG — MỘT hue cho rê / đang nhập / chọn (ngọc 6 · 10 · 14%), không trộn sắc khác: `active` dòng đang có focus
 * · `selected` dòng được tick · `draft` dòng MỚI chưa lưu (vạch vàng kim 3px ở mép trái).
 */
export const TABLE_ENTRY_ROW_CLASSES = {
  active: 'focus-within:bg-[color-mix(in_srgb,var(--color-primary-5)_10%,var(--color-bg-surface))]',
  selected: 'bg-[color-mix(in_srgb,var(--color-primary-5)_14%,var(--color-bg-surface))]',
  draft: '[&>td:first-child]:shadow-[inset_3px_0_0_var(--color-accent-5)]',
} satisfies Record<'active' | 'selected' | 'draft', string>;

/** Class móc trên vỏ bảng: control trong ô PHẲNG tới khi dòng được rê / focus (`styles/overrides/table-inline-edit.css`). */
export const TABLE_INLINE_EDIT_CLASS = 'table-inline-edit';
