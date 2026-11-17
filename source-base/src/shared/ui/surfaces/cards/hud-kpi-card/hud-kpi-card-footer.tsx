import CellBar from '@/shared/ui/data-display/bars/CellBar';
import StackBar from '@/shared/ui/data-display/bars/StackBar';
import { cn } from '@/shared/utils/style/cn';

import { TEXT_ELLIPSIS_CLASSES } from '@/shared/ui/primitives/text-ellipsis.theme';
import { HUD_KPI_CARD_BONE_CLASSES } from './hud-kpi-card.theme';
import type {
  HudKpiCardBarSegment,
  HudKpiCardBarVariant,
  HudKpiCardLegendItem,
} from './hud-kpi-card.types';

interface HudKpiCardFooterProps {
  bar: readonly HudKpiCardBarSegment[];
  total: number;
  variant: HudKpiCardBarVariant;
  legend?: readonly HudKpiCardLegendItem[];
  loading: boolean;
}

const FOOTER_ROOT_CLASSES = {
  block: 'mt-auto flex flex-col gap-1',
  cells: 'mt-auto flex flex-col gap-1.5 pt-0.5',
} satisfies Record<HudKpiCardBarVariant, string>;

const FOOTER_LEGEND_CLASSES = cn(
  'flex min-h-4 items-center justify-between gap-2',
  '@max-[259px]:flex-col @max-[259px]:items-stretch @max-[259px]:gap-0.5',
);
const FOOTER_LEGEND_ITEM_CLASSES = 'flex min-w-0 items-center gap-1';
const FOOTER_LEGEND_DOT_CLASSES =
  'size-1.5 shrink-0 rounded-full bg-[var(--legend-c)] dark:shadow-[0_0_6px_color-mix(in_srgb,var(--legend-c)_70%,transparent)]';
const FOOTER_LEGEND_LABEL_CLASSES = cn(
  TEXT_ELLIPSIS_CLASSES,
  'text-caption-12-medium text-fg-subheading @max-[259px]:flex-1',
);
const FOOTER_LEGEND_VALUE_CLASSES =
  'shrink-0 text-caption-12-semibold tabular-nums text-fg-heading';
const FOOTER_BAR_GROW_CLASSES = 'origin-left motion-safe:animate-grow-x';

/**
 * FooterBar — thanh sát đáy của chân thẻ `HudKpiCard`: `StackBar` (`block`) hoặc `CellBar` (`cells`).
 *
 * Lưu ý: `key` đổi theo "đã có số" để hiệu ứng mọc thanh chạy lại khi dữ liệu về sau lúc chờ.
 *
 * @param props.bar - Các đoạn `{ value, color, label? }`.
 * @param props.total - Tổng của thanh; `0` → rãnh trống, không hiệu ứng.
 * @param props.variant - `block` | `cells`.
 *
 * @example
 * <FooterBar bar={bar} total={400} variant="block" />
 */
function FooterBar({
  bar,
  total,
  variant,
}: Pick<HudKpiCardFooterProps, 'bar' | 'total' | 'variant'>) {
  const ready = total > 0;
  const className = ready ? FOOTER_BAR_GROW_CLASSES : undefined;
  const segments = bar.map(({ value, color, label }) => ({ value, color, title: label }));

  if (variant === 'cells') {
    return <CellBar key={String(ready)} className={className} segments={segments} total={total} />;
  }
  return <StackBar key={String(ready)} className={className} max={total} segments={segments} />;
}

/**
 * HudKpiCardFooter — chân thẻ của `HudKpiCard`: hàng chú thích (nhãn + số từng phần) rồi tới thanh sát đáy.
 *
 * Nội bộ của HudKpiCard (truyền qua `bar` / `legend` / `barVariant` của thẻ), không dùng riêng.
 * Sửa giao diện: các bảng `FOOTER_*_CLASSES` phía trên.
 * Lưu ý: đang tải hoặc tổng bằng 0 vẫn GIỮ chân thẻ (rãnh trống) để thanh các thẻ cùng hàng thẳng một đường.
 *
 * @param props.bar - Các đoạn của thanh `{ value, color, label? }[]`.
 * @param props.total - Tổng của thanh (đã tính ở HudKpiCard: max(`barTotal`, tổng các đoạn)).
 * @param props.variant - Kiểu thanh: `block` | `cells`.
 * @param props.legend - Chú thích `{ label, value, color }[]` trên thanh.
 * @param props.loading - `true` → khung chờ thay cho chú thích, thanh trống.
 *
 * @example
 * <HudKpiCardFooter bar={bar} legend={legend} loading={false} total={400} variant="cells" />
 */
function HudKpiCardFooter({ bar, total, variant, legend, loading }: HudKpiCardFooterProps) {
  const waiting = loading || total <= 0;

  return (
    <div aria-hidden={loading || undefined} className={FOOTER_ROOT_CLASSES[variant]}>
      {loading ? (
        <div className={FOOTER_LEGEND_CLASSES}>
          <span className={cn(HUD_KPI_CARD_BONE_CLASSES, 'h-2 w-2/5')} />
          <span className={cn(HUD_KPI_CARD_BONE_CLASSES, 'h-2 w-2/5')} />
        </div>
      ) : (
        legend &&
        legend.length > 0 && (
          <div className={FOOTER_LEGEND_CLASSES}>
            {legend.map((item) => (
              <span
                key={item.label}
                className={FOOTER_LEGEND_ITEM_CLASSES}
                title={`${item.label} ${item.value}`}
              >
                <span
                  aria-hidden
                  className={FOOTER_LEGEND_DOT_CLASSES}
                  style={{ ['--legend-c' as string]: item.color }}
                />
                <span className={FOOTER_LEGEND_LABEL_CLASSES}>{item.label}</span>
                <span className={FOOTER_LEGEND_VALUE_CLASSES}>{item.value}</span>
              </span>
            ))}
          </div>
        )
      )}

      <FooterBar bar={waiting ? [] : bar} total={waiting ? 0 : total} variant={variant} />
    </div>
  );
}

export default HudKpiCardFooter;
