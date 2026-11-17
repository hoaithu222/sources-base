import { memo } from 'react';

import { tokenVar } from '@/shared/charts';

import { formatBillion } from '../../utils/finance-format.utils';

interface ProfitPointLabelProps {
  fontSize: number;
  token: string;
  x?: number | string;
  y?: number | string;
  value?: number | string;
}

/** Bề rộng 1 ký tự ≈ 0.62 × cỡ chữ (chữ số `tabular-nums`, weight 600). */
const CHAR_EM = 0.62;
const PAD_X = 5;
const GAP_Y = 8;

/**
 * ProfitPointLabel — nhãn số trên một điểm của đường lợi nhuận: viên nền `bg-surface` viền màu series (đường chạy cắt
 * qua cột nên chữ cần nền riêng để đọc được), chữ `fg-heading` 1 số lẻ tỷ đồng, đặt phía TRÊN điểm.
 *
 * @param props.fontSize - Cỡ chữ (px) — `m.scale.axis`.
 * @param props.token - Token màu series của đường (viền viên).
 * @param props.x - Hoành độ điểm — Recharts tự bơm.
 * @param props.y - Tung độ điểm — Recharts tự bơm.
 * @param props.value - Giá trị của điểm — Recharts tự bơm.
 *
 * @example
 * <Line label={<ProfitPointLabel fontSize={m.scale.axis} token="blue-6" />} />
 */
const ProfitPointLabel = memo(function ProfitPointLabel({
  fontSize,
  token,
  x,
  y,
  value,
}: ProfitPointLabelProps) {
  if (x == null || y == null || value == null) return <g />;
  const text = formatBillion(Number(value));
  const width = Math.ceil(text.length * fontSize * CHAR_EM) + PAD_X * 2;
  const height = fontSize + 6;
  const top = Number(y) - GAP_Y - height;

  return (
    <g>
      <rect
        fill={tokenVar('bg-surface')}
        height={height}
        rx={height / 2}
        stroke={tokenVar(token)}
        strokeWidth={1}
        width={width}
        x={Number(x) - width / 2}
        y={top}
      />
      <text
        dominantBaseline="central"
        fill={tokenVar('fg-heading')}
        fontSize={fontSize}
        fontWeight={600}
        textAnchor="middle"
        x={Number(x)}
        y={top + height / 2}
      >
        {text}
      </text>
    </g>
  );
});

export default ProfitPointLabel;
