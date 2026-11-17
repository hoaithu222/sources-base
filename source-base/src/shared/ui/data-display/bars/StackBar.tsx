import type { CSSProperties, ReactNode } from 'react';

import { cn } from '@/shared/utils/style/cn';

import { stackBarDepth } from './stack-bar.utils';

export interface StackBarSegment {
  value: number;
  /** Giá trị CSS của màu đoạn, vd `var(--color-sky-5)`. */
  color: string;
  /** Tooltip của đoạn. */
  title?: string;
  /** Nội dung in TRONG mặt trước của đoạn (nhãn số); tràn thì bị cắt. */
  label?: ReactNode;
}

export interface StackBarProps {
  segments: readonly StackBarSegment[];
  max?: number;
  height?: number;
  emphasis?: boolean;
  ticks?: boolean;
  minPercent?: number;
  labelClassName?: string;
  ariaLabel?: string;
  className?: string;
}

const STACK_BAR_TICKS = [25, 50, 75] as const;

const STACK_BAR_ROOT_CLASSES = 'relative w-full';
const STACK_BAR_TRACK_CLASSES = 'absolute bottom-0 left-0 rounded-xs';
const STACK_BAR_TICK_CLASSES = 'absolute inset-y-0 border-l border-dashed border-divider-default';
const STACK_BAR_FILL_CLASSES = cn(
  'absolute inset-y-0 left-0 flex',
  'transition-[width] duration-500 ease-out motion-reduce:transition-none',
  'drop-shadow-[0_2px_2px_var(--color-shadow-popup)]',
);
const STACK_BAR_GLOW_CLASSES =
  'dark:drop-shadow-[0_2px_2px_var(--color-shadow-popup),0_0_6px_var(--stack-bar-glow)]';
const STACK_BAR_TOP_FACE_CLASSES =
  'pointer-events-none absolute inset-x-0 bottom-full origin-bottom-left';
const STACK_BAR_END_FACE_CLASSES =
  'pointer-events-none absolute left-full top-0 h-full origin-bottom-left';
const STACK_BAR_LABEL_CLASSES =
  'absolute inset-0 flex items-center justify-center overflow-hidden text-caption-12-semibold text-neutral-0';

const STACK_BAR_TRACK_STYLE: CSSProperties = {
  background: 'color-mix(in srgb, var(--color-fg-heading) 7%, transparent)',
  boxShadow: 'inset 0 1px 3px var(--color-shadow-popup)',
};

const STACK_BAR_LABEL_STYLE: CSSProperties = {
  textShadow:
    '0 1px 1.5px color-mix(in srgb, var(--color-neutral-10) 80%, transparent), 0 0 2px color-mix(in srgb, var(--color-neutral-10) 45%, transparent)',
};

const STACK_BAR_FRONT_EDGE =
  'inset 0 1px 0 color-mix(in srgb, var(--color-neutral-0) 40%, transparent)';
const STACK_BAR_SEAM = 'inset 1px 0 0 color-mix(in srgb, var(--color-neutral-10) 28%, transparent)';

const frontFace = (color: string, emphasis: boolean): string =>
  `linear-gradient(180deg, color-mix(in srgb, var(--color-neutral-0) ${emphasis ? 34 : 26}%, ${color}) 0%, ${color} 42%, color-mix(in srgb, var(--color-neutral-10) 24%, ${color}) 100%)`;
const topFace = (color: string): string =>
  `color-mix(in srgb, var(--color-neutral-0) 42%, ${color})`;
const endFace = (color: string): string =>
  `color-mix(in srgb, var(--color-neutral-10) 38%, ${color})`;

/**
 * StackBar — thanh CHỒNG dạng khối 3D: rãnh lõm, mặt trước sáng → tối, mặt trên + mặt đầu xiên 45°.
 *
 * Các đoạn liền nhau đọc ra MỘT khối (chỉ đoạn cuối có mặt đầu). Hộp cao `height + stackBarDepth(height)` —
 * component tự đặt, nơi gọi chỉ cần chừa bề ngang.
 * Sửa giao diện: màu các mặt → `frontFace` / `topFace` / `endFace` · bóng / quầng → `STACK_BAR_FILL_CLASSES` /
 * `STACK_BAR_GLOW_CLASSES` · độ sâu → `stackBarDepth` (`stack-bar.utils.ts`).
 * Lưu ý: `color` là giá trị CSS do nơi gọi đưa vào — dùng token `var(--color-*)`, không hex.
 * Lý do thiết kế: docs/notes/components/data-display.md (## StackBar · CellBar · TrendBadge).
 *
 * @param props.segments - Các đoạn `{ value, color, title?, label? }` trái → phải; đoạn `value ≤ 0` bị bỏ.
 * @param props.max - Giá trị ứng 100% rãnh; lớn hơn tổng các đoạn thì phần dư là rãnh trống (thanh tiến độ).
 *   Bỏ trống ⇒ tổng các đoạn (thanh đầy).
 * @param props.height - Bề dày MẶT TRƯỚC (px). Mặc định `12`.
 * @param props.emphasis - `true` ⇒ mặt trước sáng hơn + quầng theo màu đoạn cuối (quầng CHỈ ở theme tối).
 *   Mặc định `false`.
 * @param props.ticks - `true` ⇒ vạch đứt ở 25 / 50 / 75% rãnh. Mặc định `false`.
 * @param props.minPercent - Bề rộng tối thiểu (% rãnh) khi thanh có giá trị — mục rất nhỏ vẫn còn một mẩu.
 *   Mặc định `0`.
 * @param props.labelClassName - Class của ô chữ trong đoạn — chỉ có tác dụng với đoạn có `label`.
 * @param props.ariaLabel - Có ⇒ thanh thành `role="img"` với nhãn này (mô tả số liệu cho trình đọc màn hình).
 * @param props.className - Class thêm cho hộp ngoài.
 *
 * @example
 * <StackBar
 *   ariaLabel="305 xong, 71 đang làm"
 *   segments={[
 *     { value: 305, color: 'var(--color-indigo-5)' },
 *     { value: 71, color: 'var(--color-yellow-5)' },
 *   ]}
 * />
 */
function StackBar({
  segments,
  max,
  height = 12,
  emphasis = false,
  ticks = false,
  minPercent = 0,
  labelClassName,
  ariaLabel,
  className,
}: StackBarProps) {
  const depth = stackBarDepth(height);
  const parts = segments.filter((segment) => segment.value > 0);
  const total = parts.reduce((sum, segment) => sum + segment.value, 0);
  const scale = Math.max(max ?? 0, total);
  const width = total > 0 ? Math.max(minPercent, Math.min(100, (total / scale) * 100)) : 0;
  const lastColor = parts[parts.length - 1]?.color;
  const glowing = emphasis && !!lastColor;
  const fillClassName = cn(STACK_BAR_FILL_CLASSES, glowing && STACK_BAR_GLOW_CLASSES);
  const fillStyle = {
    width: `${width}%`,
    ...(glowing && { ['--stack-bar-glow' as string]: lastColor }),
  } as CSSProperties;

  return (
    <div
      aria-label={ariaLabel}
      className={cn(STACK_BAR_ROOT_CLASSES, className)}
      role={ariaLabel ? 'img' : undefined}
      style={{ height: height + depth }}
    >
      <div
        className={STACK_BAR_TRACK_CLASSES}
        style={{ ...STACK_BAR_TRACK_STYLE, top: depth, right: depth }}
      >
        {ticks &&
          STACK_BAR_TICKS.map((tick) => (
            <span
              key={tick}
              aria-hidden
              className={STACK_BAR_TICK_CLASSES}
              style={{ left: `${tick}%` }}
            />
          ))}

        {width > 0 && (
          <div className={fillClassName} style={fillStyle}>
            {parts.map((part, index) => (
              <div
                key={index}
                className="relative h-full"
                style={{
                  width: `${(part.value / total) * 100}%`,
                  backgroundImage: frontFace(part.color, emphasis),
                  boxShadow:
                    index > 0 ? `${STACK_BAR_FRONT_EDGE}, ${STACK_BAR_SEAM}` : STACK_BAR_FRONT_EDGE,
                }}
                title={part.title}
              >
                <span
                  aria-hidden
                  className={STACK_BAR_TOP_FACE_CLASSES}
                  style={{
                    height: depth,
                    background: topFace(part.color),
                    transform: 'skewX(-45deg)',
                  }}
                />
                {index === parts.length - 1 && (
                  <span
                    aria-hidden
                    className={STACK_BAR_END_FACE_CLASSES}
                    style={{
                      width: depth,
                      background: endFace(part.color),
                      transform: 'skewY(-45deg)',
                    }}
                  />
                )}
                {part.label !== undefined && (
                  <span
                    className={cn(STACK_BAR_LABEL_CLASSES, labelClassName)}
                    style={STACK_BAR_LABEL_STYLE}
                  >
                    {part.label}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default StackBar;
