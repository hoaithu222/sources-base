import { memo, useId } from 'react';

import { formatPercent } from '@/shared/utils/format/format.utils';
import { cn } from '@/shared/utils/style/cn';

import { CHART_CHROME, CHART_STATUS } from './constants/chart-palette.constants';
import { tokenVar, tokenVarAlpha } from './utils/chart-color.utils';
import { arcGradientStops } from './utils/chart-gradient.utils';

export interface ProgressDonutChartProps {
  pct: number;
  donePct?: number;
  color: string;
  className?: string;
  labelClassName?: string;
  centerLabel?: string;
  labelDecimals?: number;
}

interface RingGradientProps {
  id: string;
  color: string;
}

interface DonutArcProps {
  from: number;
  to: number;
  stroke: string;
  linecap: 'butt' | 'round';
}

const RING_RADIUS = 42.25;
const RING_WIDTH = 10.5;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

const DONUT_ROOT_CLASSES = '@container/donut relative';
const DONUT_RING_SVG_CLASSES = 'absolute inset-0 size-full';
const DONUT_LAYER_CLASSES = 'pointer-events-none absolute inset-0';
const DONUT_LABEL_LAYER_CLASSES = 'pointer-events-none absolute inset-0 grid place-items-center';
const DONUT_LABEL_CLASSES = 'tabular-nums leading-none text-fg-heading';

const DONE_TOKEN = CHART_STATUS.done;
const DOING_TOKEN = CHART_STATUS.slow;
const TRACK_STROKE = tokenVar(CHART_CHROME.track);
const ARC_STYLE = { transition: 'stroke-dasharray 650ms ease-out' };

/** `72` → `'72%'` · `72.46` → `'72,5%'` (1 số lẻ): bỏ phần lẻ khi đã tròn sau làm tròn. */
function percentLabel(percent: number, decimals: number): string {
  const factor = 10 ** decimals;
  const rounded = Math.round(percent * factor) / factor;
  return formatPercent(rounded, Number.isInteger(rounded) ? 0 : decimals);
}

const RingGradient = memo(function RingGradient({ id, color }: RingGradientProps) {
  return (
    <radialGradient cx="50" cy="50" gradientUnits="userSpaceOnUse" id={id} r="50">
      {arcGradientStops(color).map((stop) => (
        <stop key={stop.offset} offset={stop.offset} stopColor={stop.color} />
      ))}
    </radialGradient>
  );
});

const DonutArc = memo(function DonutArc({ from, to, stroke, linecap }: DonutArcProps) {
  const span = ((to - from) / 100) * RING_LENGTH;
  if (span <= 0) return null;

  return (
    <circle
      cx="50"
      cy="50"
      fill="none"
      r={RING_RADIUS}
      stroke={stroke}
      strokeDasharray={`${span} ${RING_LENGTH}`}
      strokeDashoffset={-((from / 100) * RING_LENGTH)}
      strokeLinecap={linecap}
      strokeWidth={RING_WIDTH}
      style={ARC_STYLE}
    />
  );
});

/**
 * ProgressDonutChart — vòng % tiến độ bằng SVG thuần (không Recharts); KHÔNG kèm nhãn / số đếm — thẻ cha tự hiển thị.
 *
 * Cung tô gradient cùng hue, lõi tối hơn 1 bậc → mép = token (`arcGradientStops`); token chrome (`fg-muted`…) tô phẳng. Vành nền dùng
 * `CHART_CHROME.track`. Sửa bề dày · bán kính vành → `RING_WIDTH` · `RING_RADIUS`; class từng lớp → `DONUT_*_CLASSES`.
 * Chữ ở tâm luôn `fg-heading` (chart-conventions §1.7: không tô chữ bằng màu series — danh tính màu nằm ở cung).
 * Lưu ý: cỡ do nơi gọi quyết định qua `className` (`aspect-square h-full` + trần `max-h-*`) — component KHÔNG tự
 * đặt `size-full`. `color` chỉ tô VÀNH + lõi; chữ ở tâm luôn `text-fg-heading` (chart-conventions.md §1.7).
 *
 * @param props.pct - % tiến độ TỔNG (0–100), cũng là con số hiện ở tâm vòng; ngoài khoảng được kẹp về biên.
 * @param props.donePct - Phần ĐÃ XONG trong `pct` (0–100): truyền vào → tách 2 màu lục = xong, cam = đang làm.
 * @param props.color - TOKEN màu (vd `'success-5'` | `'warning-5'` | `'fg-muted'`), không nhận hex.
 * @param props.className - Class khung gốc — nơi đặt cỡ vòng.
 * @param props.labelClassName - Class nhãn % (mặc định `text-caption-12-bold`); gốc là `@container/donut` nên
 *   dùng được `@<cỡ>/donut:…` để chữ lùi bậc.
 * @param props.centerLabel - Nhãn ở tâm thay cho số % (vd `4/10`).
 * @param props.labelDecimals - Số lẻ của nhãn % (mặc định `1`); `0` khi đứng cạnh `<Progress showValue>`.
 *
 * @example
 * <ProgressDonutChart className="aspect-square h-24" color="success-5" pct={72} />
 * <ProgressDonutChart className="aspect-square h-24" color="warning-5" pct={64} donePct={30} />
 */
const ProgressDonutChart = memo(function ProgressDonutChart({
  pct,
  donePct,
  color,
  className,
  labelClassName = 'text-caption-12-bold',
  centerLabel,
  labelDecimals = 1,
}: ProgressDonutChartProps) {
  const clamped = Math.max(0, Math.min(100, pct));
  const accent = tokenVar(color);
  const uid = useId();
  const fillId = `${uid}-fill`;
  const arcId = `${uid}-arc`;
  const doneId = `${uid}-done`;
  const doingId = `${uid}-doing`;

  const done = donePct == null ? null : Math.max(0, Math.min(clamped, donePct));

  const slices =
    done == null
      ? [{ key: 'arc', from: 0, to: clamped, stroke: `url(#${arcId})` }]
      : [
          { key: 'done', from: 0, to: done, stroke: `url(#${doneId})` },
          { key: 'doing', from: done, to: clamped, stroke: `url(#${doingId})` },
        ];

  const rootClassName = cn(DONUT_ROOT_CLASSES, className);
  const labelTextClassName = cn(DONUT_LABEL_CLASSES, labelClassName);

  return (
    <div className={rootClassName}>
      <svg className={DONUT_RING_SVG_CLASSES} viewBox="0 0 100 100">
        <defs>
          <RingGradient color={color} id={arcId} />
          <RingGradient color={DONE_TOKEN} id={doneId} />
          <RingGradient color={DOING_TOKEN} id={doingId} />
        </defs>

        <circle
          cx="50"
          cy="50"
          fill="none"
          r={RING_RADIUS}
          stroke={TRACK_STROKE}
          strokeWidth={RING_WIDTH}
        />

        <g transform="rotate(-90 50 50)">
          {slices.map((s) => (
            <DonutArc
              key={s.key}
              from={s.from}
              linecap={clamped >= 100 ? 'butt' : 'round'}
              stroke={s.stroke}
              to={s.to}
            />
          ))}
        </g>
      </svg>

      <div className={DONUT_LAYER_CLASSES}>
        <svg className="size-full" viewBox="0 0 100 100">
          <defs>
            <radialGradient cx="50%" cy="50%" id={fillId} r="50%">
              <stop offset="0%" stopColor={accent} stopOpacity={0.2} />
              <stop offset="70%" stopColor={accent} stopOpacity={0.08} />
              <stop offset="100%" stopColor={accent} stopOpacity={0.03} />
            </radialGradient>
          </defs>
          <circle
            cx="50"
            cy="50"
            fill={`url(#${fillId})`}
            r="27"
            stroke={tokenVarAlpha(color, 0.4)}
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>

      <div className={DONUT_LABEL_LAYER_CLASSES}>
        <span className={labelTextClassName}>
          {centerLabel ?? percentLabel(clamped, labelDecimals)}
        </span>
      </div>
    </div>
  );
});

export default ProgressDonutChart;
