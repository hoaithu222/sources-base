import type { CSSProperties } from 'react';

import { cn } from '@/shared/utils/style/cn';

export interface CellBarSegment {
  value: number;
  /** Giá trị CSS của màu đoạn, vd `var(--color-sky-5)`. */
  color: string;
  /** Tooltip của đoạn. */
  title?: string;
}

export interface CellBarProps {
  segments: readonly CellBarSegment[];
  total?: number;
  className?: string;
}

interface CellBarPart {
  key: string;
  share: number;
  color?: string;
  title?: string;
}

const CELL_BAR_ROOT_CLASSES = 'group/cell-bar relative flex h-2.5 w-full';
const CELL_BAR_PART_CLASSES =
  'relative h-full shrink-0 border-y transition-[width] duration-500 ease-out motion-reduce:transition-none';
const CELL_BAR_PART_GLOW_CLASSES =
  'dark:shadow-[0_0_4px_-1px_color-mix(in_srgb,var(--cell-bar-tone)_55%,transparent)]';
const CELL_BAR_SHINE_WRAP_CLASSES =
  'pointer-events-none absolute inset-0 overflow-hidden rounded-xs';
const CELL_BAR_SHINE_CLASSES = cn(
  'absolute inset-0 motion-reduce:hidden',
  'group-hover/cell-bar:animate-progress-shine group-hover/kpi:animate-progress-shine',
);

const CELL_BAR_TILE =
  'linear-gradient(90deg, transparent 16.667%, black 16.667% 83.333%, transparent 83.333%)';

const CELL_BAR_MASK_STYLE: CSSProperties = {
  WebkitMaskImage: CELL_BAR_TILE,
  maskImage: CELL_BAR_TILE,
  WebkitMaskSize: '6px 100%',
  maskSize: '6px 100%',
  WebkitMaskRepeat: 'round',
  maskRepeat: 'round',
};

const CELL_BAR_SHINE_STYLE: CSSProperties = {
  transform: 'translateX(-100%)',
  backgroundImage:
    'linear-gradient(90deg, transparent 25%, color-mix(in srgb, var(--color-neutral-0) 60%, transparent) 50%, transparent 75%)',
};

const litFill = (color: string): string =>
  `linear-gradient(180deg, color-mix(in srgb, var(--color-neutral-0) 40%, ${color}) 0%, ${color} 55%, color-mix(in srgb, var(--color-neutral-10) 20%, ${color}) 100%)`;

function partStyle({ share, color }: CellBarPart): CSSProperties {
  if (!color) {
    return {
      width: `${share}%`,
      borderColor: 'color-mix(in srgb, var(--color-fg-heading) 14%, transparent)',
    };
  }
  return {
    width: `${share}%`,
    borderColor: `color-mix(in srgb, ${color} 60%, transparent)`,
    backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`,
    ['--cell-bar-tone' as string]: color,
  };
}

const cellsStyle = (color?: string): CSSProperties => ({
  ...CELL_BAR_MASK_STYLE,
  background: color ? litFill(color) : 'var(--color-divider-default)',
});

function toParts(segments: readonly CellBarSegment[], total: number): CellBarPart[] {
  const lit = segments.filter((segment) => segment.value > 0);
  const sum = lit.reduce((acc, segment) => acc + segment.value, 0);
  const scale = Math.max(total, sum);
  if (scale <= 0) return [{ key: 'rest', share: 100 }];

  const parts: CellBarPart[] = lit.map((segment, index) => ({
    key: `seg-${index}`,
    share: (segment.value / scale) * 100,
    color: segment.color,
    title: segment.title,
  }));
  const rest = 100 - (sum / scale) * 100;
  if (rest > 0.01) parts.push({ key: 'rest', share: rest });
  return parts;
}

/**
 * CellBar — thanh "bể %" kiểu big-screen: khung mảnh theo màu đoạn, lòng là dãy ô sáng như đèn LED.
 *
 * Mỗi đoạn là một "bể" riêng (khung + ô cùng màu); ô tự co giãn cho vừa SỐ NGUYÊN ô trong từng đoạn.
 * Vệt sáng quét một lượt khi rê vào thanh, hoặc vào tổ tiên mang `group/kpi` (`HudKpiCard`).
 * Sửa giao diện: hình ô → `CELL_BAR_MASK_STYLE` · khung từng đoạn → `partStyle` · quầng (CHỈ theme tối) →
 * `CELL_BAR_PART_GLOW_CLASSES`.
 * Lưu ý: `color` là giá trị CSS do nơi gọi đưa vào — dùng token `var(--color-*)`, không hex.
 * Lý do thiết kế: docs/notes/components/data-display.md (## StackBar · CellBar · TrendBadge).
 *
 * @param props.segments - Các đoạn `{ value, color, title? }` trái → phải; đoạn `value ≤ 0` bị bỏ.
 * @param props.total - Giá trị ứng với cả thanh: lớn hơn tổng các đoạn thì phần dư là ô TẮT (thanh tiến độ);
 *   nhỏ hơn hoặc `0` ⇒ thanh = tổng các đoạn. Không có đoạn nào ⇒ cả thanh là ô tắt. Mặc định `0`.
 * @param props.className - Class thêm cho khung (cao mặc định `h-2.5`).
 *
 * @example
 * <CellBar segments={[{ value: 68, color: 'var(--color-green-5)' }]} total={100} />
 */
function CellBar({ segments, total = 0, className }: CellBarProps) {
  const parts = toParts(segments, total);

  return (
    <div className={cn(CELL_BAR_ROOT_CLASSES, className)}>
      {parts.map((part, index) => {
        const first = index === 0;
        const last = index === parts.length - 1;
        return (
          <span
            key={part.key}
            className={cn(
              CELL_BAR_PART_CLASSES,
              part.color && CELL_BAR_PART_GLOW_CLASSES,
              first && 'rounded-l-xs border-l',
              last && 'rounded-r-xs border-r',
            )}
            style={partStyle(part)}
            title={part.title}
          >
            <span
              aria-hidden
              className={cn(
                'absolute inset-y-px',
                first ? 'left-0' : 'left-px',
                last ? 'right-0' : 'right-px',
              )}
              style={cellsStyle(part.color)}
            />
          </span>
        );
      })}

      <span aria-hidden className={CELL_BAR_SHINE_WRAP_CLASSES}>
        <span className={CELL_BAR_SHINE_CLASSES} style={CELL_BAR_SHINE_STYLE} />
      </span>
    </div>
  );
}

export default CellBar;
