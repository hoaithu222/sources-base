import { memo } from 'react';
import type { CSSProperties, ReactNode } from 'react';

import { TEXT_ELLIPSIS_CLASSES } from '@/shared/ui/primitives/text-ellipsis.theme';
import { cn } from '@/shared/utils/style/cn';

export type HudCalloutTone = 'sky' | 'primary' | 'teal' | 'yellow';
export type HudCalloutStatus = 'success' | 'warning' | 'error' | 'info';
export type HudCalloutLine = 'sm' | 'md' | 'lg';

export interface HudCalloutProps {
  title: string;
  subtitle?: ReactNode;
  statusLabel?: string;
  status?: HudCalloutStatus;
  tone?: HudCalloutTone;
  line?: HudCalloutLine;
  x?: number;
  y?: number;
  className?: string;
}

type HudCalloutSlot =
  'root' | 'card' | 'title' | 'subtitle' | 'status' | 'statusText' | 'dot' | 'line' | 'anchor';

const HUD_CALLOUT_CLASSES = {
  root: 'pointer-events-none flex w-max max-w-56 flex-col items-center',
  card: cn(
    'pointer-events-auto relative flex min-w-0 max-w-full flex-col gap-0.5 px-2.5 py-1.5',
    'overflow-hidden rounded-lg',
    'border border-[color-mix(in_srgb,var(--callout-tone)_55%,transparent)] bg-bg-surface/92 backdrop-blur-sm',
    'shadow-[0_4px_14px_var(--color-shadow-popup)]',
    "before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:bg-(--callout-tone) before:content-['']",
  ),
  title: cn(
    TEXT_ELLIPSIS_CLASSES,
    'text-caption-12-bold uppercase tracking-[0.04em] text-fg-heading',
  ),
  subtitle: cn(TEXT_ELLIPSIS_CLASSES, 'text-caption-10-medium text-fg-muted'),
  status: 'flex min-w-0 items-center gap-1.5 text-caption-10-medium',
  statusText: cn(TEXT_ELLIPSIS_CLASSES, 'min-w-0'),
  dot: 'size-1.5 shrink-0 rounded-full bg-current',
  line: 'w-px bg-linear-to-b from-(--callout-tone) to-transparent opacity-80',
  anchor: cn(
    'relative size-2.5 shrink-0 rounded-full border-2 border-(--callout-tone) bg-bg-surface',
    "after:absolute after:-inset-1.5 after:rounded-full after:border after:border-(--callout-tone) after:content-['']",
    'after:opacity-60 motion-safe:after:animate-ping',
  ),
} satisfies Record<HudCalloutSlot, string>;

/** Biến màu khung `--callout-tone` — một class literal mỗi tone. */
const HUD_CALLOUT_TONE_CLASSES = {
  sky: '[--callout-tone:var(--color-sky-5)]',
  primary: '[--callout-tone:var(--color-primary-5)]',
  teal: '[--callout-tone:var(--color-teal-5)]',
  yellow: '[--callout-tone:var(--color-yellow-5)]',
} satisfies Record<HudCalloutTone, string>;

const HUD_CALLOUT_STATUS_CLASSES = {
  success: 'text-success-8 dark:text-success',
  warning: 'text-warning-7 dark:text-warning',
  error: 'text-error-7 dark:text-error',
  info: 'text-info-7 dark:text-info',
} satisfies Record<HudCalloutStatus, string>;

const HUD_CALLOUT_LINE_CLASSES = {
  sm: 'h-4',
  md: 'h-8',
  lg: 'h-14',
} satisfies Record<HudCalloutLine, string>;

/** Đặt ĐIỂM NEO (chấm dưới cùng) đúng toạ độ `x`% · `y`% của khung cha `relative`. */
const placeStyle = (x?: number, y?: number): CSSProperties | undefined =>
  x == null || y == null
    ? undefined
    : { position: 'absolute', left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -100%)' };

/**
 * HudCallout — nhãn ghim lên ảnh nhà xưởng / bản đồ / mô hình 3D: thẻ tên (+ dòng phụ, chấm trạng thái), đường dẫn
 * xuống và điểm neo đúng chỗ thực địa.
 *
 * Đặt trong khung `relative` phủ lên ảnh; truyền `x` · `y` (% của khung) thì chính ĐIỂM NEO nằm đúng toạ độ đó (thẻ
 * nổi phía trên). Không truyền thì component nằm trong luồng — tự định vị bằng `className`.
 * Sửa giao diện: `HUD_CALLOUT_CLASSES` · màu khung → `HUD_CALLOUT_TONE_CLASSES` · màu trạng thái →
 * `HUD_CALLOUT_STATUS_CLASSES` · độ dài đường dẫn → `HUD_CALLOUT_LINE_CLASSES`.
 * Lưu ý: chỉ thẻ nhận chuột (`pointer-events-auto`), đường dẫn và vùng trống xuyên qua — kéo / zoom ảnh bên dưới vẫn
 * được. Vòng "thở" ở điểm neo tắt khi giảm chuyển động. Nhãn dài cắt "…" ở 14rem. Quầng sáng kiểu HUD đã gỡ ở
 * source-base-rouded.
 *
 * @param props.title - Tên khu vực / thiết bị (viết hoa tự động).
 * @param props.subtitle - Dòng phụ dưới tên (vd "Thép cuộn, thép cây").
 * @param props.statusLabel - Câu trạng thái kèm chấm màu (vd "Đang hoạt động"); bỏ trống → không có dòng trạng thái.
 * @param props.status - Màu chấm + câu trạng thái: `success` | `warning` | `error` | `info`. Mặc định `success`.
 * @param props.tone - Màu khung + đường dẫn + điểm neo: `sky` | `primary` | `teal` | `yellow`. Mặc định `sky`.
 * @param props.line - Độ dài đường dẫn: `sm` 16px | `md` 32px | `lg` 56px. Mặc định `md`.
 * @param props.x - Hoành độ điểm neo, % bề ngang khung cha (0–100).
 * @param props.y - Tung độ điểm neo, % chiều cao khung cha (0–100).
 * @param props.className - Class thêm cho khối gốc.
 *
 * @example
 * <div className="relative aspect-video">
 *   <Image name="factory" className="absolute inset-0" />
 *   <HudCallout title="Khu cắt thép" statusLabel="Đang hoạt động" x={32} y={48} />
 * </div>
 */
const HudCallout = memo(function HudCallout({
  title,
  subtitle,
  statusLabel,
  status = 'success',
  tone = 'sky',
  line = 'md',
  x,
  y,
  className,
}: HudCalloutProps) {
  return (
    <div
      className={cn(HUD_CALLOUT_CLASSES.root, HUD_CALLOUT_TONE_CLASSES[tone], className)}
      style={placeStyle(x, y)}
    >
      <div className={HUD_CALLOUT_CLASSES.card}>
        <span className={HUD_CALLOUT_CLASSES.title} title={title}>
          {title}
        </span>
        {subtitle != null && <span className={HUD_CALLOUT_CLASSES.subtitle}>{subtitle}</span>}
        {statusLabel && (
          <span className={cn(HUD_CALLOUT_CLASSES.status, HUD_CALLOUT_STATUS_CLASSES[status])}>
            <span aria-hidden className={HUD_CALLOUT_CLASSES.dot} />
            <span className={HUD_CALLOUT_CLASSES.statusText}>{statusLabel}</span>
          </span>
        )}
      </div>
      <span aria-hidden className={cn(HUD_CALLOUT_CLASSES.line, HUD_CALLOUT_LINE_CLASSES[line])} />
      <span aria-hidden className={HUD_CALLOUT_CLASSES.anchor} />
    </div>
  );
});

export default HudCallout;
