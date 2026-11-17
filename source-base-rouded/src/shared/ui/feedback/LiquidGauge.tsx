import { memo, useId } from 'react';
import { cn } from '@/shared/utils/style/cn';

export type LiquidGaugeTone = 'sky' | 'teal' | 'green' | 'yellow' | 'orange' | 'red' | 'purple';
export type LiquidGaugeShape = 'circle' | 'roundRect' | 'rect';

export interface LiquidGaugeProps {
  value: number;
  tone?: LiquidGaugeTone;
  shape?: LiquidGaugeShape;
  size?: number;
  hideValue?: boolean;
  label?: string;
  className?: string;
}

const LIQUID_GAUGE_BASE_CLASSES = 'relative shrink-0';

const LIQUID_GAUGE_VALUE_CLASSES =
  'pointer-events-none absolute inset-0 flex flex-col items-center justify-center';

const LIQUID_GAUGE_WAVE_CLASSES =
  '[animation:liquid-wave_3s_linear_infinite] motion-reduce:animate-none';

const LIQUID_GAUGE_WAVE_REVERSE_CLASSES =
  '[animation:liquid-wave_4.5s_linear_infinite_reverse] motion-reduce:animate-none';

/** Biên độ sóng (px); đừng tăng quá nhiều — sóng cao che mất con số ở giữa. */
const WAVE_AMPLITUDE = 4;

function wavePath(size: number, waterY: number): string {
  const amplitude = WAVE_AMPLITUDE * 2;
  const swell = `c${size / 4},-${amplitude} ${size / 4},${amplitude} ${size / 2},0`;

  return `
    M0,${waterY}
    ${swell}
    ${swell}
    ${swell}
    ${swell}
    L${size * 2},${size} L0,${size} Z
  `;
}

const toneMix = (percent: number, base = 'transparent') =>
  `color-mix(in srgb, var(--liquid-gauge-tone) ${percent}%, ${base})`;

/**
 * LiquidGauge — đồng hồ "mức nước": khối nước dâng tới `value`%, mặt nước gợn sóng chạy ngang; cho
 * màn treo tường / dashboard cần đọc THÔ ("bể còn khoảng 2/3").
 *
 * Gắn `role="meter"` với `aria-valuenow` và nhãn "`label`: N%" (N làm tròn như con số in giữa). Cần đọc
 * ĐÚNG con số thì dùng `Progress` / `ProgressCircle`.
 * Sửa giao diện: khung → `LIQUID_GAUGE_BASE_CLASSES` · biên độ sóng → `WAVE_AMPLITUDE`
 * · tốc độ sóng → `LIQUID_GAUGE_WAVE_CLASSES` / `LIQUID_GAUGE_WAVE_REVERSE_CLASSES` (keyframe ở
 * `theme/animations.css`) · chữ giữa → `LIQUID_GAUGE_VALUE_CLASSES` · độ đậm nước / viền → `toneMix(…)`.
 * Lưu ý: màu tone đi qua biến CSS `--liquid-gauge-tone`; sóng là SVG + CSS animation (tự dừng khi tab ẩn,
 * tắt theo `prefers-reduced-motion`), KHÔNG canvas; đừng tăng `WAVE_AMPLITUDE` — sóng cao che mất con số
 * — docs/notes/components/feedback.md.
 *
 * @param props.value - Mức nước, thang 0–100 (%); ngoài dải bị kẹp, không phải số hữu hạn → 0.
 * @param props.tone - Màu: `sky` | `teal` | `green` | `yellow` | `orange` | `red` | `purple`. Mặc định `sky`.
 * @param props.shape - Khung: `circle` | `roundRect` (bo 10px) | `rect`. Mặc định `circle`.
 * @param props.size - Cạnh của gauge, px. Mặc định `120`.
 * @param props.hideValue - `true` → ẩn con số % và nhãn in giữa. Mặc định `false`.
 * @param props.label - Nhãn nhỏ dưới con số (vd "Bể số 2"); cũng là tiền tố của `aria-label`.
 * @param props.className - Class thêm cho khung ngoài.
 *
 * @example
 * <LiquidGauge value={63} tone="sky" shape="roundRect" size={120} label="Bể số 2" />
 */
const LiquidGauge = memo(function LiquidGauge({
  value,
  tone = 'sky',
  shape = 'circle',
  size = 120,
  hideValue = false,
  label,
  className,
}: LiquidGaugeProps) {
  const clipId = `liquid-gauge-${useId().replace(/[^\w-]/g, '')}`;
  const pct = Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));
  const rounded = Math.round(pct);

  const waterY = size * (1 - pct / 100);
  const radius = shape === 'circle' ? size / 2 : shape === 'roundRect' ? 10 : 0;
  const wave = wavePath(size, waterY);
  const gaugeStyle = {
    width: size,
    height: size,
    ['--liquid-gauge-tone' as string]: `var(--color-${tone}-5)`,
  } as React.CSSProperties;

  const gaugeClassName = cn(LIQUID_GAUGE_BASE_CLASSES, className);

  return (
    <div
      aria-label={label ? `${label}: ${rounded}%` : `${rounded}%`}
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={rounded}
      className={gaugeClassName}
      role="meter"
      style={gaugeStyle}
    >
      <svg aria-hidden="true" height={size} viewBox={`0 0 ${size} ${size}`} width={size}>
        <defs>
          <clipPath id={clipId}>
            <rect height={size} rx={radius} ry={radius} width={size} x={0} y={0} />
          </clipPath>
        </defs>

        <g clipPath={`url(#${clipId})`}>
          <rect fill={toneMix(8)} height={size} width={size} x={0} y={0} />
          <path className={LIQUID_GAUGE_WAVE_CLASSES} d={wave} fill={toneMix(55)} />
          <path className={LIQUID_GAUGE_WAVE_REVERSE_CLASSES} d={wave} fill={toneMix(30)} />
        </g>

        <rect
          fill="none"
          height={size - 2}
          rx={Math.max(0, radius - 1)}
          ry={Math.max(0, radius - 1)}
          stroke={toneMix(80, 'var(--color-fg-heading)')}
          strokeWidth={2}
          width={size - 2}
          x={1}
          y={1}
        />
      </svg>

      {!hideValue && (
        <div className={LIQUID_GAUGE_VALUE_CLASSES}>
          <span className="text-h4-medium tabular-nums text-fg-heading">{rounded}%</span>
          {label && <span className="text-caption-12 text-fg-body">{label}</span>}
        </div>
      )}
    </div>
  );
});

export default LiquidGauge;
