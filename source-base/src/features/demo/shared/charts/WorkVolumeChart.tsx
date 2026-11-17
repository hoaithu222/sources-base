import { memo, useId } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import {
  CHART_STATUS,
  axisTicks,
  barSizeByCount,
  labelInt,
  niceAxisMax,
  tokenDarker,
  tokenVar,
  useChartMetrics,
  xAxisLayout,
} from '@/shared/charts';

import type { WorkVolumePoint } from './chart-data.utils';

interface WorkVolumeChartProps {
  data: readonly WorkVolumePoint[];
  ariaLabel: string;
  className?: string;
}

/**
 * Ba series của cột chồng, thứ tự = đáy → đỉnh cột. Mang nghĩa TRẠNG THÁI nên lấy màu `CHART_STATUS` (cùng
 * tông badge `PACKAGE_STATUS_META`), không lấy dải series phân loại.
 */
const WORK_VOLUME_SERIES = [
  { key: 'done', name: 'Hoàn thành', token: CHART_STATUS.done },
  { key: 'doing', name: 'Đang làm', token: CHART_STATUS.running },
  { key: 'late', name: 'Chậm', token: CHART_STATUS.late },
] as const;

const STACK_KEYS: readonly string[] = WORK_VOLUME_SERIES.map((series) => series.key);

const formatTasks = (value: unknown) => `${value} đầu việc`;
const formatTotal = (value: unknown) => labelInt(Number(value));
const bySeriesOrder = (item: { dataKey?: unknown }) => STACK_KEYS.indexOf(String(item.dataKey));

/**
 * WorkVolumeChart — cột chồng Hoàn thành / Đang làm / Chậm theo hạng mục, kèm nhãn TỔNG trên mỗi cột.
 *
 * Bản mẫu `chart-conventions.md §3.4.1`: nhãn tổng treo trên cột NEO trong suốt (`__anchor`,
 * `minPointSize={1}`) chứ không trên series trên cùng; trục Y tròn theo dữ liệu, `margin.left = 0` để
 * tick 3 chữ số không bị cắt. Thân cột tô gradient token → tối hơn 1 bậc cùng hue (§1.3), cột vuông, bề ngang theo số
 * nhóm (`barSizeByCount`); tooltip liệt kê series đúng thứ tự chồng. Dữ liệu dựng bằng `toWorkVolume` (cộng
 * sẵn `__total`). Cha phải cho khung chiều cao xác định.
 *
 * @param props.data - Các hạng mục theo thứ tự trục X, đơn vị đầu việc.
 * @param props.ariaLabel - Văn bản thay thế cho trình đọc màn hình (khung mang `role="img"`).
 * @param props.className - Class của khung ngoài, thường là chiều cao.
 *
 * @example
 * <WorkVolumeChart ariaLabel="Khối lượng theo hạng mục" className="h-56" data={toWorkVolume(rows)} />
 */
const WorkVolumeChart = memo(function WorkVolumeChart({
  data,
  ariaLabel,
  className,
}: WorkVolumeChartProps) {
  const [chartRef, m] = useChartMetrics<HTMLDivElement>();
  const uid = useId();

  const xLayout = xAxisLayout({
    count: data.length,
    plotWidth: m.plotWidth,
    fontSize: m.scale.axis,
    labelChars: Math.max(...data.map((point) => point.name.length)),
  });
  const yMax = niceAxisMax(Math.max(...data.map((point) => point.__total)));

  return (
    <div ref={chartRef} aria-label={ariaLabel} className={className} role="img">
      <ResponsiveContainer {...m.container}>
        <BarChart
          {...m.chartProps}
          barSize={barSizeByCount(data.length)}
          data={data}
          margin={{ top: 16, right: 8, left: 0, bottom: 0 }}
        >
          <defs>
            {WORK_VOLUME_SERIES.map((series) => (
              <linearGradient
                key={series.key}
                id={`${uid}-${series.key}`}
                x1="0"
                x2="0"
                y1="0"
                y2="1"
              >
                <stop offset="0%" stopColor={tokenVar(series.token)} />
                <stop offset="100%" stopColor={tokenVar(tokenDarker(series.token))} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid {...m.grid} vertical={false} />
          <XAxis
            axisLine={m.axisLine}
            dataKey="name"
            {...xLayout}
            tick={m.axisTick}
            tickLine={false}
          />
          <YAxis
            axisLine={false}
            domain={[0, yMax]}
            tick={m.axisTick}
            tickLine={false}
            ticks={axisTicks(yMax)}
            width={m.scale.yAxisWidth}
          />
          <Tooltip
            contentStyle={m.tooltip}
            cursor={m.barCursor}
            formatter={formatTasks}
            itemSorter={bySeriesOrder}
            itemStyle={m.tooltipItem}
            labelStyle={m.tooltipLabel}
          />
          <Legend
            iconSize={m.scale.legend}
            iconType="square"
            itemSorter={null}
            labelStyle={m.legendLabel}
            wrapperStyle={m.legend}
          />
          {WORK_VOLUME_SERIES.map((series) => (
            <Bar
              key={series.key}
              dataKey={series.key}
              fill={`url(#${uid}-${series.key})`}
              name={series.name}
              stackId="a"
            />
          ))}
          <Bar
            dataKey="__anchor"
            fill="transparent"
            isAnimationActive={false}
            legendType="none"
            minPointSize={1}
            stackId="a"
            tooltipType="none"
          >
            <LabelList
              {...m.barLabel}
              dataKey="__total"
              fill={tokenVar('fg-heading')}
              formatter={formatTotal}
              position="top"
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});

export default WorkVolumeChart;
