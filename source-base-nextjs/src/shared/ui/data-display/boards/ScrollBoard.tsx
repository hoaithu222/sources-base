'use client';

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { usePrefersReducedMotion } from '@/shared/hooks';
import { cn } from '@/shared/utils/style/cn';
import { TEXT_ELLIPSIS_CLASSES } from '@/shared/ui/primitives/text-ellipsis.theme';

type ScrollBoardAlign = 'left' | 'center' | 'right';

export interface ScrollBoardColumn<TRow> {
  key: string;
  header?: ReactNode;
  /** Bề ngang cột: số ⇒ px cố định; bỏ trống ⇒ chia đều phần còn lại. */
  width?: number;
  align?: ScrollBoardAlign;
  cell: (row: TRow, index: number) => ReactNode;
}

export interface ScrollBoardProps<TRow> {
  data: readonly TRow[];
  columns: readonly ScrollBoardColumn<TRow>[];
  rowKey: (row: TRow, index: number) => string | number;
  rowCount?: number;
  rowHeight?: number;
  interval?: number;
  hideHeader?: boolean;
  paused?: boolean;
  className?: string;
}

/** Khung `rounded-lg` + bóng nghỉ mềm (`overflow-hidden` cắt header / dòng theo góc). */
const SCROLL_BOARD_CLASSES = cn(
  'flex flex-col overflow-hidden rounded-lg border border-border-default bg-bg-surface tabular-nums',
  'shadow-(--elev-1)',
);

/** Header cùng ngôn ngữ header `Table`: nền `bg-subtle` + vạch đáy `border-default`. */
const SCROLL_BOARD_HEADER_CLASSES = cn(
  'grid shrink-0 items-center gap-2 px-3',
  'border-b border-border-default bg-bg-subtle text-caption-12-semibold text-fg-subheading',
);

/** Dòng: vạch ngăn mảnh, rê = nền `bg-nav-hover`. */
const SCROLL_BOARD_ROW_CLASSES = cn(
  'grid items-center gap-2 border-b border-divider-soft px-3 text-caption-12 text-fg-heading',
  'transition-colors duration-150 ease-out hover:bg-bg-nav-hover',
);

const SCROLL_BOARD_CELL_CLASSES = TEXT_ELLIPSIS_CLASSES;

const SCROLL_BOARD_ALIGN_CLASSES = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
} satisfies Record<ScrollBoardAlign, string>;

function ScrollBoardInner<TRow>({
  data,
  columns,
  rowKey,
  rowCount = 6,
  rowHeight = 40,
  interval = 2500,
  hideHeader = false,
  paused = false,
  className,
}: ScrollBoardProps<TRow>) {
  const reducedMotion = usePrefersReducedMotion();
  const [hovering, setHovering] = useState(false);
  const [offset, setOffset] = useState(0);
  const [shifting, setShifting] = useState(false);

  const overflowing = data.length > rowCount;
  const autoScroll = overflowing && !reducedMotion && !paused && !hovering;

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!autoScroll) return;

    let cancelled = false;
    const tick = () => {
      if (document.hidden) {
        timerRef.current = setTimeout(tick, interval);
        return;
      }
      if (cancelled) return;
      setShifting(true);
    };
    timerRef.current = setTimeout(tick, interval);

    return () => {
      cancelled = true;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [autoScroll, interval, offset]);

  const handleTransitionEnd = useCallback(
    (event: React.TransitionEvent<HTMLDivElement>) => {
      if (event.target !== event.currentTarget || event.propertyName !== 'transform') return;
      setShifting(false);
      setOffset((prev) => (data.length === 0 ? 0 : (prev + 1) % data.length));
    },
    [data.length],
  );

  const visible = useMemo(() => {
    if (!overflowing || reducedMotion) return data.map((row, i) => ({ row, index: i }));
    const take = rowCount + 1;
    return Array.from({ length: Math.min(take, data.length) }, (_, i) => {
      const index = (offset + i) % data.length;
      return { row: data[index], index };
    });
  }, [data, offset, overflowing, reducedMotion, rowCount]);

  const gridTemplate = columns.map((c) => (c.width ? `${c.width}px` : 'minmax(0,1fr)')).join(' ');
  const cellClassNames = columns.map((c) =>
    cn(SCROLL_BOARD_CELL_CLASSES, SCROLL_BOARD_ALIGN_CLASSES[c.align ?? 'left']),
  );

  const boardClassName = cn(SCROLL_BOARD_CLASSES, className);
  const bodyClassName = cn('relative', reducedMotion && overflowing && 'overflow-y-auto');
  const slideClassName = cn(shifting && 'transition-transform duration-500 ease-in-out');

  return (
    <div
      className={boardClassName}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {!hideHeader && (
        <div
          className={SCROLL_BOARD_HEADER_CLASSES}
          style={{ gridTemplateColumns: gridTemplate, height: rowHeight }}
        >
          {columns.map((c, ci) => (
            <div key={c.key} className={cellClassNames[ci]}>
              {c.header}
            </div>
          ))}
        </div>
      )}

      <div className={bodyClassName} style={{ height: rowCount * rowHeight }}>
        <div
          className={slideClassName}
          style={{ transform: shifting ? `translateY(-${rowHeight}px)` : undefined }}
          onTransitionEnd={handleTransitionEnd}
        >
          {visible.map(({ row, index }) => (
            <div
              key={rowKey(row, index)}
              className={SCROLL_BOARD_ROW_CLASSES}
              style={{ gridTemplateColumns: gridTemplate, height: rowHeight }}
            >
              {columns.map((c, ci) => (
                <div key={c.key} className={cellClassNames[ci]}>
                  {c.cell(row, index)}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * ScrollBoard — bảng TỰ CUỘN cho màn hình treo tường (sảnh, phòng điều hành): mỗi nhịp đưa dòng kế tiếp lên.
 *
 * Chỉ để NGẮM: bảng cần thao tác (sắp xếp, chọn dòng, phân trang) → dùng `<Table>`.
 * Đứng yên khi dữ liệu vừa khung (`data.length ≤ rowCount`), khi rê chuột vào, khi `paused`, khi tab ẩn;
 * `prefers-reduced-motion` → tắt tự cuộn, thân bảng thành vùng cuộn tay chứa đủ mọi dòng.
 * Cột: `{ key, header, width (px; bỏ trống ⇒ chia đều phần còn lại), align: left | center | right, cell }`.
 * Sửa giao diện: `SCROLL_BOARD_CLASSES` · `SCROLL_BOARD_HEADER_CLASSES` · `SCROLL_BOARD_ROW_CLASSES`.
 * Lưu ý: `rowHeight` CỐ ĐỊNH — mỗi nhịp dịch đúng một dòng, nội dung dài phải `truncate` (đừng để xuống
 * dòng). Cao cố định `rowCount × rowHeight` (+ header), không tự lấp ô co giãn.
 * Lý do thiết kế: docs/notes/components/data-display.md (## ScrollBoard).
 *
 * @param props.data - Các dòng cần hiện.
 * @param props.columns - Định nghĩa cột `ScrollBoardColumn<TRow>[]`.
 * @param props.rowKey - `(row, index) => key` ổn định của dòng.
 * @param props.rowCount - Số dòng hiện cùng lúc. Mặc định `6`.
 * @param props.rowHeight - Chiều cao mỗi dòng và của header (px). Mặc định `40`.
 * @param props.interval - Nhịp chờ giữa hai lần nhích (ms). Mặc định `2500`.
 * @param props.hideHeader - `true` ⇒ ẩn hàng tiêu đề cột. Mặc định `false`.
 * @param props.paused - `true` ⇒ dừng tự cuộn từ bên ngoài (vd khi mở hộp thoại đè lên). Mặc định `false`.
 * @param props.className - Class thêm cho khung ngoài.
 *
 * @example
 * <ScrollBoard
 *   data={rows}
 *   rowKey={(r) => r.id}
 *   rowCount={8}
 *   columns={[
 *     { key: 'name', header: 'Đơn vị', cell: (r) => r.name },
 *     { key: 'qty', header: 'SL', width: 80, align: 'right', cell: (r) => r.qty },
 *   ]}
 * />
 */
const ScrollBoard = memo(ScrollBoardInner) as typeof ScrollBoardInner;

export default ScrollBoard;
