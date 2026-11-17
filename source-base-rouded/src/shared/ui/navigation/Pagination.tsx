import { useMemo } from 'react';
import { cn } from '@/shared/utils/style/cn';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import { PAGE_SIZE_OPTIONS } from '@/shared/constants/pagination.constants';
import Button from '@/shared/ui/actions/Button';
import Menu from '@/shared/ui/actions/Menu';
import { fieldSurface } from '@/shared/ui/inputs/field.theme';

export interface PaginationProps {
  pageIndex: number;
  pageCount: number;
  pageSize: number;
  total: number;
  onPageChange: (pageIndex: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  pageSizeOptions?: number[];
  countLabel?: string;
  pageSizeSuffix?: string;
  maxPageButtons?: number;
  showDivider?: boolean;
  className?: string;
}

const PAGINATION_ROOT_CLASSES =
  'flex shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2.5 phone:px-3';
const PAGINATION_DIVIDER_CLASSES = 'border-t border-divider-default';
const PAGINATION_SUMMARY_CLASSES = 'flex items-center gap-3 phone:w-full phone:justify-between';
const PAGINATION_PAGES_CLASSES =
  'flex items-center gap-1.5 phone:w-full phone:flex-wrap phone:justify-center phone:gap-1';
const PAGINATION_COUNT_CLASSES = 'text-body-13 whitespace-nowrap text-fg-muted';
const PAGINATION_TOTAL_CLASSES = 'text-body-13-medium text-fg-heading tabular-nums';

const PAGINATION_ARROW_BUTTON_CLASSES = 'w-8 px-0 touch:w-7.5 touch:px-0';
const PAGINATION_PAGE_BUTTON_CLASSES =
  'min-w-8 px-1 text-body-13-medium tabular-nums touch:min-w-7.5 touch:px-1';

/** Nút "N /trang" mở menu = mặt ô chọn (`fieldSurface` trigger) — đổi cùng Dropdown khi field.theme đổi. */
const PAGINATION_SIZE_TRIGGER_CLASSES = cn(
  fieldSurface({ focusMode: 'trigger' }),
  'w-auto text-body-13 [&_svg]:transition-transform [&_svg]:duration-150',
  'data-[state=open]:text-action-base data-[state=open]:[&_svg]:rotate-180',
);
const PAGINATION_ELLIPSIS_CLASSES = cn(
  'inline-flex h-8 min-w-8 items-center justify-center touch:h-7.5 touch:min-w-7.5',
  'text-body-13 text-fg-faint select-none',
);

const DEFAULT_PAGE_SIZE_OPTIONS = [...PAGE_SIZE_OPTIONS];

const ELLIPSIS = '…' as const;
type PageItem = number | typeof ELLIPSIS;

/** Phần tử để render: số trang (từ 0) hoặc `…`; luôn gồm trang đầu, cuối, hiện tại và hai trang kề. */
function getPageItems(pageCount: number, current: number, maxButtons: number): PageItem[] {
  if (pageCount <= maxButtons) {
    return Array.from({ length: pageCount }, (_, idx) => idx);
  }

  const pages = new Set([0, pageCount - 1, current]);
  pages.add(Math.max(0, current - 1));
  pages.add(Math.min(pageCount - 1, current + 1));

  const items: PageItem[] = [];
  let prev = -1;
  for (const page of [...pages].sort((a, b) => a - b)) {
    if (page - prev > 1) items.push(ELLIPSIS);
    items.push(page);
    prev = page;
  }
  return items;
}

/**
 * Pagination — dải phân trang chân bảng (Figma 643:6996): [Kết quả: N] [N /trang ▾] ··· [‹ 1 2 … 5 ›].
 * Controlled hoàn toàn bằng props; `Table` đã gắn sẵn khi bật `pagination` — chỉ dùng trực tiếp cho
 * danh sách không phải bảng (lưới thẻ…). Trang lấy từ URL thì ghép với `useQueryParams`.
 *
 * Sửa giao diện: nút số trang → `PAGINATION_PAGE_BUTTON_CLASSES` · nút ‹ › →
 * `PAGINATION_ARROW_BUTTON_CLASSES` · nút số dòng → `PAGINATION_SIZE_TRIGGER_CLASSES` · khung →
 * `PAGINATION_ROOT_CLASSES`. Mọi nút là Button `secondary` (trang đang xem: `primary`) — màu do Button lo, cùng hình ở
 * hai theme.
 * Điện thoại (`phone:`): hai hàng — [Kết quả · cỡ trang] rồi [‹ trang ›] canh giữa, nút trang gọn lại và tự
 * xuống dòng nếu dư; không bớt trang nào.
 * Lưu ý: dải LUÔN `shrink-0` — nó là con cuối của flex column, thiếu thì trình duyệt bóp chính dải này
 * thay vì vùng cuộn (notes/components/navigation.md#pagination).
 *
 * @param props.pageIndex - Trang hiện tại, tính từ 0.
 * @param props.pageCount - Tổng số trang.
 * @param props.pageSize - Số dòng / trang đang chọn (hiện trên nút menu).
 * @param props.total - Tổng số dòng — hiện ở nhãn "Kết quả".
 * @param props.onPageChange - Gọi với chỉ số trang mới (từ 0) khi bấm số trang hoặc ‹ ›.
 * @param props.onPageSizeChange - Gọi với cỡ trang mới khi chọn trong menu.
 * @param props.pageSizeOptions - Các lựa chọn số dòng / trang. Mặc định `PAGE_SIZE_OPTIONS` (12 · 24 · 48 · 96).
 * @param props.countLabel - Nhãn trước tổng số dòng. Mặc định `'Kết quả:'`.
 * @param props.pageSizeSuffix - Hậu tố sau cỡ trang. Mặc định `'/trang'`.
 * @param props.maxPageButtons - NGƯỠNG thu gọn: `pageCount` ≤ ngưỡng thì hiện hết các trang; vượt thì chỉ
 *   còn đầu · cuối · hiện tại · hai trang kề + `…`. Mặc định `7`.
 * @param props.showDivider - Vạch ngăn mảnh ở mép trên dải. Mặc định `true`.
 * @param props.className - Class thêm cho dải (đứng cuối, ghi đè được vạch ngăn / padding).
 *
 * @example
 * <Pagination
 *   pageIndex={page}
 *   pageCount={Math.ceil(total / pageSize)}
 *   pageSize={pageSize}
 *   total={total}
 *   onPageChange={setPage}
 *   onPageSizeChange={setPageSize}
 * />
 */
function Pagination({
  pageIndex,
  pageCount,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  showDivider = true,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  countLabel = 'Kết quả:',
  pageSizeSuffix = '/trang',
  maxPageButtons = 7,
  className,
}: PaginationProps) {
  const pageItems = useMemo(
    () => getPageItems(pageCount, pageIndex, maxPageButtons),
    [pageCount, pageIndex, maxPageButtons],
  );

  const sizeOptions = useMemo(
    () =>
      pageSizeOptions.map((size) => ({
        key: String(size),
        label: `${size} ${pageSizeSuffix}`.trim(),
      })),
    [pageSizeOptions, pageSizeSuffix],
  );

  const canPrevious = pageIndex > 0;
  const canNext = pageIndex < pageCount - 1;

  const pageButtons = pageItems.map((item, position) => {
    if (item === ELLIPSIS) {
      return (
        <span key={`gap-${position}`} aria-hidden className={PAGINATION_ELLIPSIS_CLASSES}>
          {ELLIPSIS}
        </span>
      );
    }
    const isActive = item === pageIndex;
    return (
      <Button
        key={item}
        aria-current={isActive ? 'page' : undefined}
        className={PAGINATION_PAGE_BUTTON_CLASSES}
        size="sm"
        variant={isActive ? 'primary' : 'secondary'}
        onClick={() => onPageChange(item)}
      >
        {item + 1}
      </Button>
    );
  });

  const paginationClassName = cn(
    PAGINATION_ROOT_CLASSES,
    showDivider && PAGINATION_DIVIDER_CLASSES,
    className,
  );

  return (
    <nav aria-label="Phân trang" className={paginationClassName}>
      <div className={PAGINATION_SUMMARY_CLASSES}>
        <div className={PAGINATION_COUNT_CLASSES}>
          {countLabel} <span className={PAGINATION_TOTAL_CLASSES}>{total}</span>
        </div>
        <Menu
          align="start"
          options={sizeOptions}
          trigger={
            <Button
              className={PAGINATION_SIZE_TRIGGER_CLASSES}
              endIcon={<SystemIcon name="angle-down-outline" size={12} />}
              size="sm"
              variant="secondary"
            >
              <span className="text-body-13-medium tabular-nums">{pageSize}</span>
              {pageSizeSuffix}
            </Button>
          }
          onSelect={(option) => onPageSizeChange(Number(option.key))}
        />
      </div>

      <div className={PAGINATION_PAGES_CLASSES}>
        <Button
          aria-label="Trang trước"
          className={PAGINATION_ARROW_BUTTON_CLASSES}
          disabled={!canPrevious}
          size="sm"
          variant="secondary"
          onClick={() => onPageChange(pageIndex - 1)}
        >
          <SystemIcon aria-hidden name="angle-left-outline" size={14} />
        </Button>

        {pageButtons}

        <Button
          aria-label="Trang sau"
          className={PAGINATION_ARROW_BUTTON_CLASSES}
          disabled={!canNext}
          size="sm"
          variant="secondary"
          onClick={() => onPageChange(pageIndex + 1)}
        >
          <SystemIcon aria-hidden name="angle-right-outline" size={14} />
        </Button>
      </div>
    </nav>
  );
}

export default Pagination;
