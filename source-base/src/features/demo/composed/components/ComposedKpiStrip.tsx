import { memo } from 'react';

import { CompactKpiCard } from '@/shared/ui';
import { formatMoneyCompactRaw } from '@/shared/utils/format/money.utils';

import type { DemoPackageRow } from '../../shared/constants/packages.constants';

interface ComposedKpiStripProps {
  rows: readonly DemoPackageRow[];
}

/**
 * ComposedKpiStrip — dải 4 thẻ KPI của màn `/demo/ghep` (tổng gói, giá trị hợp đồng, chờ nghiệm thu, chậm),
 * đếm lại theo danh sách ĐÃ LỌC — nơi DUY NHẤT của màn in số đếm / tổng giá trị (header trang không lặp lại).
 * Số đếm có `unit` cố định; tiền đi qua `valueFormat` (đơn vị nằm trong chuỗi). Lý do truyền số thật +
 * `valueFormat`: `notes/code/demo.md`.
 *
 * @param props.rows - Các gói đang hiển thị (sau khi lọc).
 */
const ComposedKpiStrip = memo(function ComposedKpiStrip({ rows }: ComposedKpiStripProps) {
  const totalValue = rows.reduce((a, r) => a + r.value, 0);
  const reviewCount = rows.filter((r) => r.status === 'review').length;
  const lateCount = rows.filter((r) => r.status === 'late').length;

  return (
    <div className="grid shrink-0 gap-2 sm:grid-cols-2 xl:grid-cols-4">
      <CompactKpiCard
        color="blue"
        icon="cube-bold"
        label="Tổng gói thầu"
        size="sm"
        unit="gói"
        value={rows.length}
      />
      <CompactKpiCard
        color="green"
        icon="chart-simple-bold"
        label="Giá trị hợp đồng"
        size="sm"
        value={totalValue}
        valueFormat={(n) => {
          const m = formatMoneyCompactRaw(n, 1);
          return `${m.text} ${m.suffix}`;
        }}
      />
      <CompactKpiCard
        color="yellow"
        icon="clock-bold"
        label="Chờ nghiệm thu"
        size="sm"
        unit="gói"
        value={reviewCount}
      />
      <CompactKpiCard
        color="red"
        icon="triangle-exclamation-bold"
        label="Chậm tiến độ"
        size="sm"
        unit="gói"
        value={lateCount}
      />
    </div>
  );
});

export default ComposedKpiStrip;
