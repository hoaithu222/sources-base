import type { CSSProperties, ReactNode } from 'react';

import { cn } from '@/shared/utils/style/cn';

import { stackBarDepth } from './stack-bar.utils';

export interface StackBarSegment {
  value: number;
  /** Giá trị CSS của màu đoạn, vd `var(--color-primary-6)`. */
  color: string;
  /** Tooltip của đoạn. */
  title?: string;
  /** Nội dung in TRONG đoạn (nhãn số); tràn thì bị cắt. */
  label?: ReactNode;
}

export interface StackBarProps {
  segments: readonly StackBarSegment[];
  max?: number;
  height?: number;
  /** @deprecated Không còn tác dụng — thanh phẳng như nhau ở hai theme. */
  emphasis?: boolean;
  ticks?: boolean;
  minPercent?: number;
  labelClassName?: string;
  ariaLabel?: string;
  className?: string;
}

const STACK_BAR_TICKS = [25, 50, 75] as const;

/** Hộp cao đúng `height` (thanh phẳng). */
const STACK_BAR_ROOT_CLASSES = 'relative w-full h-(--stack-bar-h)';

/** Rãnh phẳng `bg-track`, bo `lg` (≤ 24px cao là viên thuốc), cắt phần tô theo góc bo. */
const STACK_BAR_TRACK_CLASSES = 'absolute inset-0 overflow-hidden rounded-lg bg-bg-track';
const STACK_BAR_TICK_CLASSES = 'absolute inset-y-0 border-l border-dashed border-divider-default';
const STACK_BAR_FILL_CLASSES = cn(
  'absolute inset-y-0 left-0 flex overflow-hidden rounded-lg',
  'transition-[width] duration-500 ease-out motion-reduce:transition-none',
);

/** Mặt đoạn: màu đặc phẳng. */
const STACK_BAR_SEGMENT_CLASSES = 'relative h-full [background-color:var(--stack-bar-c)]';
/** Chỗ nối hai đoạn là khe 2px màu mặt nền. */
const STACK_BAR_SEAM_CLASSES = 'shadow-[inset_2px_0_0_var(--color-bg-surface)]';

const STACK_BAR_LABEL_CLASSES =
  'absolute inset-0 flex items-center justify-center overflow-hidden text-caption-12-semibold text-neutral-0';

const STACK_BAR_LABEL_STYLE: CSSProperties = {
  textShadow:
    '0 1px 1.5px color-mix(in srgb, var(--color-neutral-10) 80%, transparent), 0 0 2px color-mix(in srgb, var(--color-neutral-10) 45%, transparent)',
};

/** Biến CSS của một đoạn: bề rộng theo tỷ lệ + màu đặc. */
function segmentStyle(color: string, share: number) {
  return { width: `${share}%`, ['--stack-bar-c' as string]: color } as CSSProperties;
}

/**
 * StackBar — thanh CHỒNG: thanh phẳng bo tròn hai đầu trên rãnh `bg-track`, khe 2px giữa các đoạn; giống hệt ở
 * hai theme (chỉ màu token đổi).
 *
 * Các đoạn liền nhau đọc ra MỘT khối. Hộp cao đúng `height` — component tự đặt qua biến `--stack-bar-h`, nơi gọi chỉ
 * cần chừa bề ngang.
 * Sửa giao diện: rãnh → `STACK_BAR_TRACK_CLASSES` · đoạn → `STACK_BAR_SEGMENT_CLASSES` + `STACK_BAR_SEAM_CLASSES`
 * · phần tô → `STACK_BAR_FILL_CLASSES`.
 * Lưu ý: `color` là giá trị CSS do nơi gọi đưa vào — dùng token `var(--color-*)`, không hex. Biến
 * `--stack-bar-depth` (`stackBarDepth`, `stack-bar.utils.ts`) còn được ghi nhưng KHÔNG dùng trong CSS — di sản của
 * khối 3D cũ, giữ tới khi dọn dẹp.
 * Lý do thiết kế: docs/notes/components/data-display.md (## StackBar · CellBar · TrendBadge).
 *
 * @param props.segments - Các đoạn `{ value, color, title?, label? }` trái → phải; đoạn `value ≤ 0` bị bỏ.
 * @param props.max - Giá trị ứng 100% rãnh; lớn hơn tổng các đoạn thì phần dư là rãnh trống (thanh tiến độ).
 *   Bỏ trống ⇒ tổng các đoạn (thanh đầy).
 * @param props.height - Bề dày thanh (px). Mặc định `12`.
 * @param props.emphasis - @deprecated Không còn tác dụng (từng làm sáng mặt trước + quầng ở theme tối cũ). Mặc định
 *   `false`.
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
  ticks = false,
  minPercent = 0,
  labelClassName,
  ariaLabel,
  className,
}: StackBarProps) {
  const parts = segments.filter((segment) => segment.value > 0);
  const total = parts.reduce((sum, segment) => sum + segment.value, 0);
  const scale = Math.max(max ?? 0, total);
  const width = total > 0 ? Math.max(minPercent, Math.min(100, (total / scale) * 100)) : 0;
  const rootStyle = {
    ['--stack-bar-h' as string]: `${height}px`,
    ['--stack-bar-depth' as string]: `${stackBarDepth(height)}px`,
  } as CSSProperties;

  return (
    <div
      aria-label={ariaLabel}
      className={cn(STACK_BAR_ROOT_CLASSES, className)}
      role={ariaLabel ? 'img' : undefined}
      style={rootStyle}
    >
      <div className={STACK_BAR_TRACK_CLASSES}>
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
          <div className={STACK_BAR_FILL_CLASSES} style={{ width: `${width}%` }}>
            {parts.map((part, index) => (
              <div
                key={index}
                className={cn(STACK_BAR_SEGMENT_CLASSES, index > 0 && STACK_BAR_SEAM_CLASSES)}
                style={segmentStyle(part.color, (part.value / total) * 100)}
                title={part.title}
              >
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
