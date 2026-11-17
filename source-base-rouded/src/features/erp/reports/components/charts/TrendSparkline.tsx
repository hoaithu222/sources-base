import { memo, useId } from 'react';
import {
  Area,
  AreaChart,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { CHART_CHROME, fmt3, tokenVar, useChartMetrics } from '@/shared/charts';

interface TrendSparklineProps {
  values: readonly number[];
  token: string;
  unit?: string;
  ariaLabel: string;
  className?: string;
}

const AREA_TOP_OPACITY = 0.32;
const PLOT_MARGIN = { top: 6, right: 6, bottom: 2, left: 2 };
const BASELINE_DASH = '2 3';

/**
 * TrendSparkline — xu hướng nhỏ cho ô KPI và cột "Xu hướng" của bảng: đường + vùng tô nhạt, KHÔNG trục / lưới / chú
 * giải (chart-conventions §3.8), thêm CHẤM đặc ở điểm cuối (mốc hiện tại) và vạch đáy đứt rất mờ — kiểu widget macOS,
 * cả hai theme. Con số hiện tại do nơi gọi in cạnh — sparkline chỉ cho hình dạng.
 *
 * @param props.values - Chuỗi giá trị cũ → mới (≥ 2 điểm mới có đường).
 * @param props.token - Token màu series (qua `tokenVar`), lấy từ `@/shared/charts`.
 * @param props.unit - Đơn vị cuối giá trị ở tooltip.
 * @param props.ariaLabel - Văn bản thay thế cho trình đọc màn hình (khung mang `role="img"`).
 * @param props.className - Class của khung ngoài — PHẢI cho chiều cao (`h-10`, `h-6`).
 *
 * @example
 * <TrendSparkline ariaLabel="Doanh thu 8 tuần" className="h-10" token="primary-6" unit="tỷ" values={[27, 29, 33]} />
 */
const TrendSparkline = memo(function TrendSparkline({
  values,
  token,
  unit,
  ariaLabel,
  className,
}: TrendSparklineProps) {
  const [chartRef, m] = useChartMetrics<HTMLDivElement>();
  const gradientId = `${useId().replace(/[^a-zA-Z0-9_-]/g, '')}-spark`;
  const data = values.map((value, index) => ({ index, value }));
  const lastIndex = values.length - 1;
  const floor = values.length > 0 ? Math.min(...values) : 0;
  const formatValue = (value: unknown) => `${fmt3(Number(value))}${unit ? ` ${unit}` : ''}`;

  return (
    <div ref={chartRef} aria-label={ariaLabel} className={className} role="img">
      <ResponsiveContainer {...m.container}>
        <AreaChart {...m.chartProps} data={data} margin={PLOT_MARGIN}>
          <defs>
            <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={tokenVar(token)} stopOpacity={AREA_TOP_OPACITY} />
              <stop offset="100%" stopColor={tokenVar(token)} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="index" hide />
          <YAxis domain={['dataMin', 'dataMax']} hide />
          <Tooltip
            contentStyle={m.tooltip}
            cursor={m.lineCursor}
            formatter={formatValue}
            itemStyle={m.tooltipItem}
            labelFormatter={() => ''}
            labelStyle={{ display: 'none' }}
          />
          <ReferenceLine
            stroke={tokenVar(CHART_CHROME.grid)}
            strokeDasharray={BASELINE_DASH}
            y={floor}
          />
          <Area
            activeDot={m.activeDot}
            dataKey="value"
            fill={`url(#${gradientId})`}
            isAnimationActive={false}
            name="Giá trị"
            stroke={tokenVar(token)}
            strokeWidth={m.scale.lineWidth}
            type="monotone"
          />
          {lastIndex >= 1 ? (
            <ReferenceDot
              fill={tokenVar(token)}
              ifOverflow="visible"
              r={m.scale.dotRadius + 0.5}
              stroke={tokenVar('bg-surface')}
              strokeWidth={2}
              x={lastIndex}
              y={values[lastIndex]}
            />
          ) : null}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
});

export default TrendSparkline;
