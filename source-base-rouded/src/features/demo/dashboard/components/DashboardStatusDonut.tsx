import { memo, useId, useMemo } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import { tokenDarker, tokenVar, useChartMetrics } from '@/shared/charts';
import { cn } from '@/shared/utils/style/cn';

export interface DashboardDonutSlice {
  key: string;
  name: string;
  value: number;
  /** Token màu series (`success-5`…), đi qua `tokenVar`. */
  token: string;
}

interface DashboardStatusDonutProps {
  slices: readonly DashboardDonutSlice[];
  centerValue: string;
  centerCaption: string;
  ariaLabel: string;
  className?: string;
}

const HOLE_RATIO = 0.62;
const OUTER_RATIO = 0.92;
const GRADIENT_INNER_STOP = `${Math.round((HOLE_RATIO / OUTER_RATIO) * 100)}%`;

const TOOLTIP_ABOVE_CENTER_LABEL = { zIndex: 1 };

const CENTER_FONT_STEPS = [
  { minHole: 150, value: 'text-h1-bold', caption: 'text-body-14' },
  { minHole: 120, value: 'text-h2-bold', caption: 'text-caption-12' },
  { minHole: 0, value: 'text-h3-bold', caption: 'text-caption-12' },
] as const;

function packagesFormatter(total: number) {
  return (value: unknown) => {
    const count = Number(value);
    return total > 0 ? `${count} gói · ${Math.round((count / total) * 100)}%` : `${count} gói`;
  };
}

/**
 * DashboardStatusDonut — donut cơ cấu nhiều lát (`chart-conventions.md §3.1`): `stroke="none"`, không
 * `paddingAngle`, lề chart 0 để đường kính lỗ = `HOLE_RATIO × cạnh ngắn`. Mỗi cung tô gradient tâm `-6 → -5`
 * cùng hue (§1.3), neo theo tâm thật của vòng (`userSpaceOnUse`). Nhãn tâm chọn bậc chữ theo lỗ (đã chia
 * `uiScale`: TV chữ to lên nên lỗ "ảo" nhỏ đi); bậc đo cả line-height của token nên không chạm vành. Tooltip
 * in "số gói · tỉ lệ" và nổi trên nhãn tâm. Chú giải do panel cha dựng.
 *
 * @param props.slices - Các lát theo thứ tự vẽ; `token` là token màu series, đi qua `tokenVar`.
 * @param props.centerValue - Con số lớn ở tâm vòng (thường là tổng).
 * @param props.centerCaption - Dòng phụ dưới con số ở tâm (đơn vị).
 * @param props.ariaLabel - Văn bản thay thế cho trình đọc màn hình (khung mang `role="img"`).
 * @param props.className - Class của khung ngoài (kích thước).
 */
const DashboardStatusDonut = memo(function DashboardStatusDonut({
  slices,
  centerValue,
  centerCaption,
  ariaLabel,
  className,
}: DashboardStatusDonutProps) {
  const [chartRef, m] = useChartMetrics<HTMLDivElement>();
  const uid = useId();

  const side = Math.min(m.width, m.height);
  const hole = (side * HOLE_RATIO) / m.uiScale;
  const font = CENTER_FONT_STEPS.find((step) => hole >= step.minHole) ?? CENTER_FONT_STEPS[2];
  const formatSlice = useMemo(
    () => packagesFormatter(slices.reduce((sum, slice) => sum + slice.value, 0)),
    [slices],
  );

  return (
    <div ref={chartRef} aria-label={ariaLabel} className={cn('relative', className)} role="img">
      <ResponsiveContainer {...m.container}>
        <PieChart {...m.chartProps} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <defs>
            {slices.map((slice) => (
              <radialGradient
                key={slice.key}
                cx={m.width / 2}
                cy={m.height / 2}
                gradientUnits="userSpaceOnUse"
                id={`${uid}-${slice.key}`}
                r={(side / 2) * OUTER_RATIO}
              >
                <stop offset={GRADIENT_INNER_STOP} stopColor={tokenVar(tokenDarker(slice.token))} />
                <stop offset="100%" stopColor={tokenVar(slice.token)} />
              </radialGradient>
            ))}
          </defs>
          <Pie
            cx="50%"
            cy="50%"
            data={slices}
            dataKey="value"
            innerRadius={`${HOLE_RATIO * 100}%`}
            nameKey="name"
            outerRadius={`${OUTER_RATIO * 100}%`}
            paddingAngle={0}
            stroke="none"
            strokeWidth={0}
          >
            {slices.map((slice) => (
              <Cell key={slice.key} fill={`url(#${uid}-${slice.key})`} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={m.tooltip}
            formatter={formatSlice}
            itemStyle={m.tooltipItem}
            wrapperStyle={TOOLTIP_ABOVE_CENTER_LABEL}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn('tabular-nums text-fg-heading', font.value)}>{centerValue}</span>
        <span className={cn('text-center text-fg-muted', font.caption)}>{centerCaption}</span>
      </div>
    </div>
  );
});

export default DashboardStatusDonut;
