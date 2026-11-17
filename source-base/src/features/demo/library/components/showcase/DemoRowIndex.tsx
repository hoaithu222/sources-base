import { memo } from 'react';

interface DemoRowIndexProps {
  index: number;
}

/**
 * DemoRowIndex — ô số thứ tự "01", "02"… đầu mỗi dòng của mảng field (mục "Hệ form — mảng & điều kiện"),
 * cao bằng ô nhập cỡ `md` để thẳng hàng.
 *
 * @param props.index - Chỉ số dòng, tính từ 0.
 *
 * @example
 * <DemoRowIndex index={i} />
 */
const DemoRowIndex = memo(function DemoRowIndex({ index }: DemoRowIndexProps) {
  return (
    <span className="inline-flex size-9 shrink-0 items-center justify-center border border-border-default bg-bg-subtle text-caption-12-medium text-fg-muted tabular-nums">
      {String(index + 1).padStart(2, '0')}
    </span>
  );
});

export default DemoRowIndex;
