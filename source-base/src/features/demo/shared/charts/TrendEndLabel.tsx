import { memo } from 'react';

import { tokenVar } from '@/shared/charts';

interface TrendEndLabelProps {
  name: string;
  lastIndex: number;
  fontSize: number;
  /** Recharts tự bơm 3 prop dưới đây khi `<Line label={<TrendEndLabel … />}>`. */
  x?: number | string;
  y?: number | string;
  index?: number;
}

/**
 * TrendEndLabel — nhãn TRỰC TIẾP tên series ở điểm cuối đường: chữ `fg-body` (không tô màu series — màu đã ở nét
 * đường kề bên), chỉ vẽ ở điểm cuối; `index` khác `lastIndex` trả nhóm rỗng.
 *
 * @param props.name - Tên series.
 * @param props.lastIndex - Chỉ số điểm cuối của dữ liệu.
 * @param props.fontSize - Cỡ chữ (px) — `m.scale.legend`.
 * @param props.x - Hoành độ điểm cuối — Recharts tự bơm.
 * @param props.y - Tung độ điểm cuối — Recharts tự bơm.
 * @param props.index - Chỉ số điểm đang vẽ nhãn — Recharts tự bơm.
 *
 * @example
 * <Line label={<TrendEndLabel fontSize={m.scale.legend} lastIndex={rows.length - 1} name="Cơ điện" />} />
 */
const TrendEndLabel = memo(function TrendEndLabel({
  name,
  lastIndex,
  fontSize,
  x,
  y,
  index,
}: TrendEndLabelProps) {
  if (index !== lastIndex) return <g />;
  return (
    <text
      dominantBaseline="central"
      fill={tokenVar('fg-body')}
      fontSize={fontSize}
      fontWeight={600}
      x={Number(x) + 8}
      y={Number(y)}
    >
      {name}
    </text>
  );
});

export default TrendEndLabel;
