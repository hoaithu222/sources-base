'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { closestCenter, DndContext } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import Pagination from '@/shared/ui/navigation/Pagination';
import ScrollEdgeNav from '@/shared/ui/navigation/scroll-edge-nav/ScrollEdgeNav';
import { measureColumnStops } from '@/shared/ui/navigation/scroll-edge-nav';
import { cn } from '@/shared/utils/style/cn';
import { TableBody } from './parts/body/table-body';
import { TableFooter } from './parts/table-footer';
import { TableHead } from './parts/header/table-head';
import { buildHeaderGroups } from './utils/table-header-groups.utils';
import {
  TABLE_CLASSES,
  TABLE_ROOT_CLASSES,
  TABLE_SCROLL_NAV_CLASSES,
  TABLE_SCROLLER_CLASSES,
  TABLE_SPACER_CELL_CLASSES,
} from './table.theme';
import { getFrozenLeft, TABLE_FILLER_COLUMN, warnUnpinnedFrozenColumns } from './utils/table.utils';
import { useColumnResize } from './hooks/useColumnResize';
import { useTableDnd } from './hooks/useTableDnd';
import { useTableGroupRowHeight } from './hooks/useTableGroupRowHeight';
import { useTableScrollFit } from './hooks/useTableScrollFit';
import type { TableColumn, TableProps } from './table.types';

const DEFAULT_PAGE_SIZE_OPTIONS = [12, 24, 48, 96];

/**
 * Table — bảng dữ liệu của UI kit: phân trang server-side, kéo giãn / ghim cột, header 2 tầng, kéo-thả dòng.
 *
 * Khai cột bằng `TableColumn<TData>` (`key` · `header` · `cell` · `width` · `align` · `frozen` · `group`…).
 * Prop chia nhóm: dữ liệu & dòng · phân trang (`Pagination` ở đáy) · giao diện & cột · sắp xếp / kéo-thả ·
 * cuộn (ảo hoá do nơi gọi tự lo qua `onScroll` + `padTop` / `padBottom`). Sắp xếp phía client: `useTableSort`.
 * Bảng chỉ để ngắm, tự cuộn trên màn treo tường → `ScrollBoard`.
 * Sửa giao diện: class → `table.theme.ts` · header → `parts/header/` · dòng → `parts/body/table-body-row.tsx`.
 * Header luôn có ray đáy (vạch header là `box-shadow` inline — `utils/table.utils.ts`), dòng tổng có vạch đối xứng.
 * Dòng tổng dính đáy; vùng cuộn cao hơn nội dung (`fill`) thì nó nằm SÁT đáy, khoảng trống dồn lên trên nó.
 * Kéo giãn cột: chỉ cột được kéo đổi bề rộng — rộng ra thì bảng cuộn ngang, hẹp lại thì cột đệm cuối hút phần dư.
 * Lưu ý: `columns` · `rowKey` · `rowClassName` · `rowStyle` · `onRowClick` · `onRowDoubleClick` ·
 * `renderRowWrapper` · `fullRowCell` · `footerCell` · `isRowDraggable` PHẢI ổn định reference (`useMemo` /
 * `useCallback`), không thì dòng memo mất tác dụng. `sortable` trên CỘT chỉ vẽ mũi tên + bắn `onSortChange`,
 * nơi gọi tự sắp. Cột `frozen` phải liên tiếp từ trái, và cột ghim nào còn cột ghim khác đứng sau thì phải có
 * `width` số (sai → cảnh báo ở DEV). `fill` chỉ ăn khi CHA là flex column.
 * Lý do thiết kế: docs/notes/components/data-display-table.md.
 *
 * @param props.data - Các dòng của trang hiện tại.
 * @param props.columns - Định nghĩa cột `TableColumn<TData>[]`.
 * @param props.rowKey - `(row, index) => key` ổn định; bỏ trống ⇒ chỉ số dòng (kéo-thả cần key thật).
 * @param props.rowClassName - `(row, index) => class` thêm cho `<tr>`.
 * @param props.rowStyle - `(row, index) => style` cho `<tr>`; `color` KHÔNG xuống `<td>` — kèm `rowClassName`
 *   trả `'[&>td]:text-inherit [&>td_*]:text-inherit'`.
 * @param props.onRowClick - `(row, index) => void` khi bấm dòng (dòng có con trỏ tay).
 * @param props.onRowDoubleClick - `(row, index) => void`; `onRowClick` đã bắn 2 lần trước đó nên phải an toàn.
 * @param props.renderRowWrapper - `(tr, row, index) => node` bọc `<tr>` (vd `ContextMenu`).
 * @param props.fullRowCell - `(row, index) => node | null`; trả node ⇒ dòng đó là một ô trải hết ngang.
 * @param props.footerCell - `(column) => node` cho dòng TỔNG dính đáy; bỏ trống / bảng rỗng ⇒ không dựng.
 * @param props.footerClassName - Class thêm cho `<tr>` dòng tổng.
 * @param props.loading - `true` khi `data` rỗng ⇒ hiện spinner + chữ đang tải (theo ngôn ngữ) thay
 *   `emptyMessage`. Mặc định `false`.
 * @param props.emptyMessage - Nội dung khi `data` rỗng: chuỗi ⇒ `EmptyState` có minh hoạ bảng trống; node ⇒
 *   render nguyên. Mặc định theo ngôn ngữ (`ui.common` → `noData`).
 * @param props.pagination - `false` ⇒ ẩn thanh phân trang. Mặc định `true`.
 * @param props.currentPage - Trang hiện tại, đếm từ 1. Mặc định `1`.
 * @param props.pageSize - Số dòng mỗi trang. Mặc định `12`.
 * @param props.total - Tổng số dòng phía server; bỏ trống ⇒ `data.length`.
 * @param props.pageSizeOptions - Các lựa chọn cỡ trang. Mặc định `[12, 24, 48, 96]`.
 * @param props.onPageChange - `(page) => void`, `page` đếm từ 1.
 * @param props.onPageSizeChange - `(pageSize) => void`.
 * @param props.countLabel - Nhãn trước tổng số dòng của `Pagination`. Mặc định `'Kết quả:'`.
 * @param props.pageSizeSuffix - Hậu tố của lựa chọn cỡ trang. Mặc định `'/trang'`.
 * @param props.maxPageButtons - Số nút trang tối đa của `Pagination`. Mặc định `7`.
 * @param props.paginationClassName - Class thêm cho `Pagination`.
 * @param props.className - Class của vỏ ngoài (flex column chứa vùng cuộn + phân trang).
 * @param props.fill - `true` ⇒ giãn hết chiều cao còn lại (cha phải là flex column). Mặc định `false`.
 * @param props.tableClassName - Class của vùng cuộn `div.overflow-auto` bọc `<table>` (không phải `<table>`).
 * @param props.headerClassName - Class thêm cho mọi dòng + ô header.
 * @param props.headerSize - Đệm dọc header: `sm` | `md` | `lg` | `xl`. Mặc định `md`.
 * @param props.columnDividers - `true` ⇒ vạch dọc giữa các cột. Mặc định `false`.
 * @param props.gridBorder - `true` ⇒ vạch dòng / cột đậm hơn (`divider-default`). Mặc định `false`.
 * @param props.striped - `true` ⇒ sọc xen kẽ: dòng thứ 2, 4, 6… (theo chỉ số dữ liệu) nền hơi khác. Mặc định `false`.
 * @param props.layout - `auto` | `fixed`; bỏ trống ⇒ `fixed` khi `resizable`, `auto` khi không.
 *   Truyền tay thì thắng.
 * @param props.resizable - `true` ⇒ kéo mép phải header để giãn cột (từng cột tắt bằng `resizable: false`).
 *   Mặc định `true`.
 * @param props.minColumnWidth - Bề rộng tối thiểu khi kéo giãn (px). Mặc định `60`.
 * @param props.minWidth - Sàn bề rộng `<table>` (px hoặc CSS width): hẹp hơn thì cuộn ngang thay vì bóp cột.
 * @param props.rowHeight - Chiều cao cố định mỗi dòng (px, bỏ đệm dọc của ô); bỏ trống ⇒ cao theo nội dung.
 * @param props.scrollNav - `true` ⇒ nút ‹ › ở hai mép để cuộn ngang từng cột. Mặc định `false`.
 * @param props.scrollNavClassName - Class của cụm nút `scrollNav` (khung không đệm → `'inset-x-0'`).
 * @param props.sortKey - Key cột đang sắp (controlled); `null` ⇒ chưa sắp.
 * @param props.sortDir - Chiều đang sắp: `asc` | `desc` | `null`.
 * @param props.onSortChange - `(key, dir) => void` khi bấm header cột `sortable`; vòng asc → desc → bỏ sắp.
 * @param props.sortable - `true` ⇒ kéo-thả sắp lại DÒNG (cần một cột chứa `<TableDragHandle />`).
 *   Mặc định `false`.
 * @param props.onReorder - `(activeKey, overKey) => void` khi thả dòng; nơi gọi tự đổi thứ tự `data`.
 * @param props.isRowDraggable - `(row, index) => boolean`; `false` ⇒ dòng đó không kéo được.
 * @param props.onScroll - Handler cuộn của vùng cuộn (ảo hoá, tải thêm).
 * @param props.scrollContainerRef - Ref callback nhận phần tử vùng cuộn.
 * @param props.padTop - Chiều cao dòng đệm trước các dòng (px, ảo hoá). Mặc định `0`.
 * @param props.padBottom - Chiều cao dòng đệm sau các dòng (px, ảo hoá). Mặc định `0`.
 *
 * @example
 * <Table columns={columns} data={data?.items ?? []} loading={isLoading} rowKey={(r) => r.id}
 *   currentPage={page} pageSize={size} total={data?.total ?? 0}
 *   onPageChange={setPage} onPageSizeChange={setSize} />
 *
 * <Table fill columnDividers columns={columns} data={rows} pagination={false} footerCell={renderTotal} />
 */
function Table<TData>({
  data,
  columns,
  rowKey,
  rowClassName,
  rowStyle,
  onRowClick,
  onRowDoubleClick,
  renderRowWrapper,
  fullRowCell,
  footerCell,
  footerClassName,
  loading = false,
  pagination = true,
  currentPage = 1,
  pageSize = 12,
  total,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  onPageChange,
  onPageSizeChange,
  emptyMessage,
  className,
  fill = false,
  headerClassName,
  countLabel,
  pageSizeSuffix,
  maxPageButtons,
  headerSize = 'md',
  layout,
  tableClassName,
  paginationClassName,
  columnDividers = false,
  gridBorder = false,
  striped = false,
  resizable = true,
  minColumnWidth = 60,
  minWidth,
  rowHeight,
  scrollNav = false,
  scrollNavClassName,
  sortable = false,
  onReorder,
  isRowDraggable,
  sortKey,
  sortDir,
  onSortChange,
  onScroll,
  padTop = 0,
  padBottom = 0,
  scrollContainerRef,
}: TableProps<TData>) {
  const tCommon = useTranslations('ui.common');
  const resolvedTotal = useMemo(() => total ?? data.length, [total, data.length]);
  const pageCount = useMemo(
    () => Math.max(1, Math.ceil(resolvedTotal / pageSize)),
    [resolvedTotal, pageSize],
  );
  const getRowKey = useCallback(
    (row: TData, index: number) => (rowKey ? rowKey(row, index) : index),
    [rowKey],
  );

  const resize = useColumnResize({ enabled: resizable, minWidth: minColumnWidth });
  const showFooter = !!footerCell && data.length > 0;
  const { attach: attachScrollFit, spacerRef } = useTableScrollFit(showFooter);

  const scrollRef = useRef<HTMLDivElement>(null);
  const setScrollNode = useCallback(
    (node: HTMLDivElement | null) => {
      scrollRef.current = node;
      scrollContainerRef?.(node);
      if (!node) return undefined;
      const detach = attachScrollFit(node);
      return () => {
        detach?.();
        scrollRef.current = null;
        scrollContainerRef?.(null);
      };
    },
    [scrollContainerRef, attachScrollFit],
  );

  const effectiveLayout = useMemo(
    () => layout ?? (resizable ? 'fixed' : 'auto'),
    [layout, resizable],
  );
  const fillerActive =
    effectiveLayout === 'fixed' && columns.every((col) => resize.widths[col.key] != null);
  const layoutColumns = useMemo<TableColumn<TData>[]>(
    () => (fillerActive ? [...columns, TABLE_FILLER_COLUMN] : columns),
    [columns, fillerActive],
  );

  /** So theo GIÁ TRỊ: kéo cột không ghim thì `frozenLeft` giữ reference → dòng memo không render lại mỗi nhịp kéo. */
  const frozenLeftJson = JSON.stringify(getFrozenLeft(columns, resize.widths) ?? null);
  const frozenLeft = useMemo(
    () => (JSON.parse(frozenLeftJson) as Record<string, number> | null) ?? undefined,
    [frozenLeftJson],
  );
  const headerGroups = useMemo(() => buildHeaderGroups(layoutColumns), [layoutColumns]);

  const { groupRowHeight, groupRowRef } = useTableGroupRowHeight();

  const frozenCount = frozenLeft ? Object.keys(frozenLeft).length : 0;
  const getColumnStops = useCallback(
    () => measureColumnStops(scrollRef.current, frozenCount),
    [frozenCount],
  );

  const { accessibility, handleDragEnd, sensors, sortableIds } = useTableDnd({
    data,
    getRowKey,
    isRowDraggable,
    onReorder,
  });

  const handlePageChange = useCallback(
    (index: number) => onPageChange?.(index + 1),
    [onPageChange],
  );
  const handlePageSizeChange = useCallback(
    (size: number) => onPageSizeChange?.(size),
    [onPageSizeChange],
  );

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') warnUnpinnedFrozenColumns(columns);
  }, [columns]);

  const rootClassName = cn(TABLE_ROOT_CLASSES, fill && 'min-h-0 flex-1', className);
  const scrollerClassName = cn(TABLE_SCROLLER_CLASSES, tableClassName);
  const tableElementClassName = cn(
    TABLE_CLASSES,
    effectiveLayout === 'fixed' && 'table-fixed',
    resize.resizingKey && 'select-none',
    data.length === 0 && 'h-full',
  );

  const scroller = (
    <div
      ref={setScrollNode}
      className={scrollerClassName}
      data-dock-aware={showFooter ? undefined : 'scroll'}
      onScroll={onScroll}
    >
      <table className={tableElementClassName} style={minWidth == null ? undefined : { minWidth }}>
        <TableHead
          columnDividers={columnDividers}
          columns={layoutColumns}
          frozenLeft={frozenLeft}
          groupRowHeight={groupRowHeight}
          groupRowRef={groupRowRef}
          groups={headerGroups}
          headerClassName={headerClassName}
          headerSize={headerSize}
          resizable={resizable}
          resize={resize}
          sortDir={sortDir}
          sortKey={sortKey}
          onSortChange={onSortChange}
        />
        <TableBody
          columnDividers={columnDividers}
          columns={layoutColumns}
          data={data}
          emptyMessage={emptyMessage ?? tCommon('noData')}
          frozenLeft={frozenLeft}
          fullRowCell={fullRowCell}
          getRowKey={getRowKey}
          gridBorder={gridBorder}
          isRowDraggable={isRowDraggable}
          loading={loading}
          padBottom={padBottom}
          padTop={padTop}
          renderRowWrapper={renderRowWrapper}
          rowClassName={rowClassName}
          rowHeight={rowHeight}
          rowStyle={rowStyle}
          sortable={sortable}
          striped={striped}
          onRowClick={onRowClick}
          onRowDoubleClick={onRowDoubleClick}
        />
        {showFooter && footerCell && (
          <>
            <tbody aria-hidden>
              <tr>
                <td
                  ref={spacerRef}
                  className={TABLE_SPACER_CELL_CLASSES}
                  colSpan={layoutColumns.length}
                />
              </tr>
            </tbody>
            <TableFooter
              columnDividers={columnDividers}
              columns={layoutColumns}
              footerCell={footerCell}
              footerClassName={footerClassName}
              frozenLeft={frozenLeft}
              gridBorder={gridBorder}
              rowHeight={rowHeight}
            />
          </>
        )}
      </table>
    </div>
  );

  const content = (
    <div className={rootClassName}>
      {scrollNav ? (
        <div className={TABLE_SCROLL_NAV_CLASSES}>
          {scroller}
          <ScrollEdgeNav
            className={scrollNavClassName}
            getStops={getColumnStops}
            targetRef={scrollRef}
          />
        </div>
      ) : (
        scroller
      )}

      {pagination && (
        <Pagination
          className={paginationClassName}
          countLabel={countLabel}
          maxPageButtons={maxPageButtons}
          pageCount={pageCount}
          pageIndex={currentPage - 1}
          pageSize={pageSize}
          pageSizeOptions={pageSizeOptions}
          pageSizeSuffix={pageSizeSuffix}
          total={resolvedTotal}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}
    </div>
  );

  if (!sortable) return content;

  return (
    <DndContext
      accessibility={accessibility}
      collisionDetection={closestCenter}
      sensors={sensors}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
        {content}
      </SortableContext>
    </DndContext>
  );
}

export default Table;
