import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/shared/utils/style/cn';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import { formatNumber } from '@/shared/utils/format/format.utils';
import { HUD_BAR_HEAD_AFTER, HUD_TRACK } from '@/shared/ui/primitives/hud.theme';
import { TEXT_ELLIPSIS_CLASSES } from '@/shared/ui/primitives/text-ellipsis.theme';
import HudCorners, { type HudCornerVariant } from '../hud/HudCorners';

export type BoxInfoItemColor =
  'error' | 'accent' | 'warning' | 'success' | 'primary' | 'teal' | 'sky' | 'info';

export interface BoxInfoItem {
  label: string;
  value: number | string;
  /** Phần trăm tô thanh tiến độ, 0–100. */
  percent: number;
  color: BoxInfoItemColor;
}

export interface BoxInfoProps {
  title: string;
  total?: { label: string; value: number | string };
  items?: BoxInfoItem[];
  children?: ReactNode;
  onClose?: () => void;
  corners?: HudCornerVariant;
  className?: string;
}

const BOX_INFO_BASE_CLASSES = cn(
  'relative flex w-full flex-col overflow-hidden',
  'shadow-[0_1px_3px_var(--color-shadow-popup)]',
  'dark:shadow-[0_2px_8px_var(--color-shadow-popup),inset_0_0_20px_color-mix(in_srgb,var(--color-teal-5)_6%,transparent)]',
  '[--hud-c:var(--color-teal-5)]',
  '[--hud-frame-c:color-mix(in_srgb,var(--color-teal-7)_80%,transparent)]',
  'dark:[--hud-frame-c:color-mix(in_srgb,var(--color-teal-5)_55%,transparent)]',
);

const BOX_INFO_DOT_CLASSES =
  'size-1 shrink-0 rounded-full bg-teal-5 dark:shadow-[0_0_6px_var(--color-teal-5)]';

const BOX_INFO_CLOSE_CLASSES = cn(
  '-my-0.5 flex size-6 shrink-0 cursor-pointer items-center justify-center text-fg-muted',
  'transition-[color,background-color] duration-150 ease-out',
  'hover:bg-bg-nav-hover hover:text-fg-heading active:bg-bg-nav-active',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus',
);

const BOX_INFO_FILL_CLASSES = cn(
  'relative h-full shrink-0 rounded-full',
  'dark:shadow-[0_0_4px_color-mix(in_srgb,var(--box-info-tone)_60%,transparent)]',
  HUD_BAR_HEAD_AFTER,
);

const BOX_INFO_ROOT_STYLE: CSSProperties = {
  background:
    'linear-gradient(to bottom, color-mix(in srgb, var(--color-teal-5) 7%, var(--color-bg-surface)), color-mix(in srgb, var(--color-teal-5) 3%, var(--color-bg-subtle)))',
};

const BOX_INFO_HEADER_STYLE: CSSProperties = {
  background:
    'linear-gradient(to left, transparent, color-mix(in srgb, var(--color-teal-5) 18%, transparent))',
};

const BOX_INFO_STRIPE_STYLE: CSSProperties = {
  background:
    'repeating-linear-gradient(-45deg, transparent 0, transparent 50px, color-mix(in srgb, var(--color-teal-5) 8%, transparent) 50px, color-mix(in srgb, var(--color-teal-5) 8%, transparent) 82px)',
};

const BOX_INFO_HAIRLINE_STYLE: CSSProperties = {
  background:
    'linear-gradient(to right, var(--color-teal-5) 0%, color-mix(in srgb, var(--color-teal-5) 10%, transparent) 60%, transparent 100%)',
  opacity: 0.4,
};

/** Màu từng tone: họ token + bậc giữa `step`; gradient thanh tiến độ suy ra ở bậc ± 1. */
const BOX_INFO_TONE_TOKENS = {
  error: { family: 'red', step: 5 },
  accent: { family: 'orange', step: 5 },
  warning: { family: 'yellow', step: 5 },
  success: { family: 'green', step: 5 },
  primary: { family: 'primary', step: 3 },
  teal: { family: 'teal', step: 5 },
  sky: { family: 'sky', step: 5 },
  info: { family: 'blue', step: 5 },
} satisfies Record<BoxInfoItemColor, { family: string; step: number }>;

/** `var(--color-{family}-{step + delta})`, kẹp trong thang 1–10 của hệ token. */
function toneVar(color: BoxInfoItemColor, delta = 0): string {
  const { family, step } = BOX_INFO_TONE_TOKENS[color];
  return `var(--color-${family}-${Math.min(10, Math.max(1, step + delta))})`;
}

/** `percent` là dữ liệu ngoài — kẹp về 0–100 (NaN → 0) trước khi đổ vào width. */
function clampPercent(p: number): number {
  return Number.isFinite(p) ? Math.min(100, Math.max(0, p)) : 0;
}

function formatValue(v: number | string): string {
  return typeof v === 'number' ? formatNumber(v) : v;
}

/** Style của đoạn đã đạt: bề rộng + dốc màu bậc ± 1 + biến tone cho quầng (chỉ theme tối). */
function fillStyle(item: BoxInfoItem): CSSProperties {
  return {
    width: `${clampPercent(item.percent)}%`,
    background: `linear-gradient(to right, ${toneVar(item.color, 1)}, ${toneVar(item.color, -1)})`,
    ['--box-info-tone' as string]: toneVar(item.color),
    ['--hud-bar-tone' as string]: toneVar(item.color),
  };
}

/**
 * BoxInfo — panel trạng thái kiểu HUD: header · dòng tổng · các dòng (chấm màu, số, %, thanh tiến độ).
 *
 * Bỏ `items`, truyền `children` → thành khung HUD bọc nội dung tuỳ ý. Số định dạng vi-VN (`formatNumber`);
 * `percent` ngoài 0–100 / NaN được kẹp khi tô thanh.
 * Sửa giao diện: màu từng tone → `BOX_INFO_TONE_TOKENS` · nền / viền khung → `BOX_INFO_BASE_CLASSES`.
 * Lưu ý: root KHÔNG khai `border-*` — viền do `<HudCorners frame>` vẽ. Thêm tone mới phải cách các tone cũ
 * ΔE ≥ 22. Lý do thiết kế: notes/components/surfaces.md.
 *
 * @param props.title - Tiêu đề header (một dòng).
 * @param props.total - Dòng tổng ở đầu thân: `{ label, value }`.
 * @param props.items - Các dòng: `{ label, value, percent (0–100), color }`; `color` là `error` | `accent`
 *   | `warning` | `success` | `primary` | `teal` | `sky` | `info`. Mặc định `[]`.
 * @param props.children - Nội dung tuỳ ý, render sau `items`.
 * @param props.onClose - Có handler → hiện nút đóng (✕, nhãn đọc "Đóng {title}") ở header.
 * @param props.corners - Kiểu nhấn 4 góc (`HudCorners`): `bracket` | `dot` | `chamfer` | `none` (giữ khung viền).
 *   Mặc định `bracket`.
 * @param props.className - Class thêm cho panel.
 *
 * @example
 * <BoxInfo
 *   title="Tiến độ"
 *   total={{ label: 'Tổng', value: 25 }}
 *   items={[{ label: 'Hoàn thành', value: 18, percent: 72, color: 'success' }]}
 * />
 */
function BoxInfo({
  title,
  total,
  items = [],
  children,
  onClose,
  corners = 'bracket',
  className,
}: BoxInfoProps) {
  return (
    <div className={cn(BOX_INFO_BASE_CLASSES, className)} style={BOX_INFO_ROOT_STYLE}>
      <HudCorners frame frameWidth={1} size={10} thickness={1.5} variant={corners} />

      <div
        className="relative shrink-0 overflow-hidden border-b border-divider-default"
        style={BOX_INFO_HEADER_STYLE}
      >
        <div
          aria-hidden
          className="absolute inset-0 hidden dark:block"
          style={BOX_INFO_STRIPE_STYLE}
        />

        <div className="relative flex items-center justify-between gap-2 px-2 py-1.5">
          <div className="flex min-w-0 items-center gap-2">
            <span aria-hidden className={BOX_INFO_DOT_CLASSES} />
            <p className={cn('text-body-14-semibold text-fg-heading', TEXT_ELLIPSIS_CLASSES)}>
              {title}
            </p>
          </div>
          {onClose && (
            <button
              aria-label={`Đóng ${title}`}
              className={BOX_INFO_CLOSE_CLASSES}
              type="button"
              onClick={onClose}
            >
              <SystemIcon name="xmark-outline" size={16} />
            </button>
          )}
        </div>

        <div aria-hidden className="h-px w-full" style={BOX_INFO_HAIRLINE_STYLE} />
      </div>

      <div className="flex flex-col gap-2 p-2">
        {total && (
          <div className="flex items-center justify-between px-1">
            <p className="text-caption-12 text-fg-subheading">{total.label}</p>
            <p className="text-caption-12-semibold text-fg-heading tabular-nums">
              {formatValue(total.value)}
            </p>
          </div>
        )}

        {items.map((item, i) => (
          <div key={i} className="flex flex-col gap-1">
            <div className="flex items-center gap-3 px-1">
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <div
                  className="size-2 shrink-0 rounded-full"
                  style={{ background: toneVar(item.color) }}
                />
                <p className={cn('text-caption-12 text-fg-subheading', TEXT_ELLIPSIS_CLASSES)}>
                  {item.label}
                </p>
              </div>
              <p className="w-15 text-right text-caption-12-semibold text-fg-heading tabular-nums">
                {formatValue(item.value)}
              </p>
              <p className="w-8 text-right text-caption-12 text-fg-muted tabular-nums">
                {item.percent}%
              </p>
            </div>

            <div
              className={cn(
                'flex h-1.5 w-full items-center overflow-hidden rounded-full bg-bg-track',
                HUD_TRACK,
              )}
            >
              <div className={BOX_INFO_FILL_CLASSES} style={fillStyle(item)} />
            </div>
          </div>
        ))}
        {children}
      </div>
    </div>
  );
}

export default BoxInfo;
