import { cn } from '@/shared/utils/style/cn';

/**
 * Bảng class bố cục của hai màn chuỗi cung ứng (`/mua-hang/don-mua`, `/kho-van/ton-kho`) — MỘT chỗ khai lưới, chiều cao
 * khối và kiểu khung / tiêu đề khối.
 *
 * Dùng:   <div className={cn(SUPPLY_MAIN_GRID_CLASSES, SUPPLY_SIDE_ROWS_CLASSES.even)}>…</div>
 * Lưu ý:  từ `xl` lưới lấp chiều cao còn lại (bảng trái cao trọn, hai khối phải theo `SUPPLY_SIDE_ROWS_CLASSES`) nên trang
 *         không cuộn kể cả 1366×768; dưới `xl` xếp 1 → 2 cột, `<PageBody>` cuộn — bảng + biểu đồ cao cố định (`list` ·
 *         `side`), khối danh sách ngắn cao theo nội dung (`sideAuto`). Dock ghim nổi dưới đáy: `PageBody` chừa đúng độ lấn,
 *         giữa dải đáy bảng (phân trang) để trống.
 */

export type SupplySlot = 'list' | 'side' | 'sideAuto';

/** Chia cao hai khối phải từ `xl`: `even` chia đôi · `fillFirst` khối trên lấp phần dư, khối dưới cao theo nội dung. */
export type SupplySideRows = 'even' | 'fillFirst';

export const SUPPLY_KPI_STRIP_CLASSES =
  'grid shrink-0 grid-cols-2 gap-2 max-[24rem]:grid-cols-1 xl:grid-cols-4';

export const SUPPLY_MAIN_GRID_CLASSES = cn(
  'grid shrink-0 grid-cols-1 gap-2 md:grid-cols-2',
  'xl:min-h-96 xl:flex-1 xl:grid-cols-[minmax(0,1fr)_20rem] wide:grid-cols-[minmax(0,1fr)_26rem]',
);

export const SUPPLY_SLOT_CLASSES = {
  list: 'h-160 min-h-0 min-w-0 md:col-span-2 xl:col-span-1 xl:row-span-2 xl:h-auto',
  side: 'h-88 min-h-0 min-w-0 xl:h-auto',
  sideAuto: 'min-h-0 min-w-0',
} satisfies Record<SupplySlot, string>;

export const SUPPLY_SIDE_ROWS_CLASSES = {
  even: 'xl:grid-rows-2',
  fillFirst: 'xl:grid-rows-[minmax(0,1fr)_auto]',
} satisfies Record<SupplySideRows, string>;

/**
 * Khung khối: `root` góc squircle + chặn kế thừa `--dock-overlap` của `PageBody` (chỉ vùng cuộn THẬT nằm dưới Dock mới
 * nhận độ lấn) · `header` cao bằng nhau ở mọi khối (vạch ngăn thẳng hàng), cụm lọc xuống dòng khi hẹp · `title` /
 * `note` khớp tiêu đề chuỗi của `BoxPanel`.
 */
export const SUPPLY_PANEL_CLASSES = {
  root: 'squircle [--dock-overlap:0px]',
  header: 'min-h-12 flex-wrap',
  title: 'm-0 flex min-w-0 items-baseline gap-1.5 truncate text-body-14-semibold text-fg-heading',
  note: 'truncate text-caption-12 text-fg-muted',
} satisfies Record<string, string>;

/**
 * Cụm bộ lọc cuối hàng tiêu đề khối (từ `lg` luôn một hàng). Dưới `lg`: `scroll` giữ một hàng, cụm vuốt ngang (luồng
 * trạng thái dài) · `wrap` cho các ô xuống dòng trong cụm (ô tìm + công tắc ngắn).
 */
export const SUPPLY_HEADER_FILTERS_CLASSES = {
  scroll: 'flex items-center gap-2',
  wrap: 'flex flex-wrap items-center gap-2',
} satisfies Record<'scroll' | 'wrap', string>;
